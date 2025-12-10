---
title: 常见问题
---
import Terminology from '@site/terminology.json'

## 为何部分资源的 ID 一直在变化

<>在 {Terminology['terminology']['zh-CN']['PRODUCT']}</> 中虚拟盘和虚拟网卡是一种虚拟资源，并没有对应的实体，表示的是两类资源的连接关系，例如虚拟盘就是指的虚拟机和虚拟盘或者虚拟光驱的连接关系。
而这类资源由于无法在更新，同步时判断唯一性，所以每次更新，同步时都会将原有的虚拟资源删除，并重建，继而导致 ID 的不稳定。
此类资源在 query 时请尽量避免使用 ID 的形式进行查询，而是使用一些其他条件来完成对资源的精确查询。
例如对于虚拟卷类型的虚拟盘，可以用虚拟机的 ID 和对应虚拟卷的 ID 来查找，这两个资源的 ID 是稳定的，查找出来的虚拟盘也是稳定的

```json
// VmDiskWhereInput
{
  "where": {
    "vm": {
      "id": "vm_id"
    },
    "vm_volume": {
      "id": "volume_id"
    }
  }
}
```

对于虚拟网卡，可以辅助以 mac 地址

```json
// VmNicWhereInput
{
  "where": {
    "vm": {
      "id": "vm_id"
    },
    "mac_address": "aa:bb:cc:dd:ee:ff"
  }
}
```

## connect_vlan_id

这个参数和 VLAN ID 有歧义，在参数中 connect_vlan_id 并不是指的 0~4095 的 VLAN ID，而是说需要使用的 VLAN 的 CUID

## 配置网络

在创建时配置网络的唯一途径是通过 cloud-init，需要以创建时使用已经预装了 cloud-init 的虚拟机模板创建虚拟机。
这时可以通过 cloud-init 的配置文件来配置网卡的网络，例如配置静态 IP，配置网关，配置 DNS 等等。

```json
// VmCreateVmFromContentLibraryTemplateParams[]
[
  {
    "template_id": "template_id",
    "cluster_id": "cluster_id",
    "name": "vm_name",
    "is_full_copy": false,
    "cloud_init": {
      "nameservers": ["114.114.114.114"],
      "networks": [
        {
          "ip_address": "192.168.20.1", // 静态IP
          "netmask": "255.255.240.0", // 子网
          "nic_index": 0,
          "type": "IPV4",
          "routes": [
            {
              "gateway": "192.168.16.1", // 默认网关
              "network": "0.0.0.0",
              "netmask": "0.0.0.0"
            }
          ]
        }
      ]
    }
  }
]
```

对于运行中的虚拟机，修改静态 IP，子网，网关等需要在虚拟机系统内安装 VmTools，并确保其在运行状态后，调用 `/update-vm-nic-basic-info` 来更新网络的配置。

```json
// VmUpdateNicBasicInfoParams
{
    "where":{
        "vm":{
            "id":"vm_id"
        },
        "mac_address":"aa:bb:cc:dd:ee:ff"
    },
    "data":{
        "ip_address":"192.168.1.2",
        "subnet_mask":"255.255.255.0",
        "gateway":"192.168.1.1"
    }
}
```
## ResourceLockedError

<>虽然 {Terminology['terminology']['zh-CN']['PRODUCT']} API 对外表现的形式是命令式的 API，实际上对集群进行操作的时候，会将命令式的 API 转化为声明式的 API，这样当重复操作一些资源的时候，可能会产生脏数据的冲突。</>

假设有一个请求 A 希望将虚拟机原有的卷由 10GB 扩容为 20GB，另一个请求 B 希望额外为同一个虚拟机挂载一块大小为 10 GB 的新卷。

<>由于 {Terminology['terminology']['zh-CN']['PRODUCT']} API 会需要额外对请求进行处理，就有可能出现 A，B请求读取原数据时获取了一致的数据，分别分封装了自己的请求，此时声明式的数据中并不会包含另一个请求的更改。下发时，如果某个请求先被接收，占用了资源，在没有释放资源前，另一个请求如果被接收到，则会因为资源被抢占而失败。</> 

但是如果当后一个请求在释放资源后才被接收到，先发生的请求的结果会被后发生的请求覆盖，从而产生预料之外的副作用以及脏数据。

<>因此我们在 3.3.0 及以后的 Terminology['zh-CN']['PRODUCT']} API 中实现了一个额外的资源锁的机制，以避免此类情况发生。当接收状态码为 400 的返回值：</>

```json
{
  "path":"/remove-vm-disk",
  "status":400,
  "message":"Resource [VM-clny8ylbd19q0958o3avqavm] locked",
  "props": {
    "locked_resources": [
      {
        "id": "clny8ylbd19q0958o3avqavm",
        "type": "VM"
      }
    ]
  },
  "code":"ResourceLocked"
}
```

可以根据 code 为 `ResourceLocked` 来判断此类错误，此时可以通过 `props.locked_resources` 来获取被锁定的资源的信息， `type` 可以获取被锁定的资源类型，目前包括虚拟机 (VM) 以及虚拟卷 (VM_VOLUME)，ID 则代表对应资源的 ID。

可以通过查询对应资源的 API 对资源进行查询，可以通过查看资源的 `entityAsyncStatus` 来确定资源是否仍被锁定，当 `entityAsyncStatus` 为 null 时则代表资源目前允许被操作，其他值则代表资源正在进行更改，需要等待更改完成后才能进行操作。