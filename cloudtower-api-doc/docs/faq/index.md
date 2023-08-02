---
title:  常见问题
---
## 为何部分资源的 id 一直在变化

在 CloudTower 中虚拟盘和虚拟网卡是一种虚拟资源，并没有对应的实体，表示的是两类资源的连接关系，例如虚拟盘就是指的虚拟机和虚拟盘或者虚拟光驱的连接关系。
而这类资源由于无法在更新，同步时判断唯一性，所以每次更新，同步时都会将原有的虚拟资源删除，并重建，继而导致 id 的不稳定。
此类资源在 query 时请尽量避免使用 id 的形式进行查询，而是使用一些其他条件来完成对资源的精确查询。
例如对于虚拟卷类型的虚拟盘，可以用虚拟机的id和对应虚拟卷的id来查找，这两个资源的id是稳定的，查找出来的虚拟盘也是稳定的

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
    "where":{
        "vm":{
            "id":"vm_id"
        },
        "mac_address":"aa:bb:cc:dd:ee:ff"
    }
}
```

## connect_vlan_id

这个参数和 vlan id 有歧义，在参数中 connect_vlan_id 并不是指的 0~4095 的vlan id，而是说需要使用的 vlan 的 cuid

## 配置网络

在创建时配置网络的唯一途径是通过 cloudinit，需要以创建时使用已经预装了 cloudinit 的虚拟机模板创建虚拟机。
这时可以通过 cloudinit 的配置文件来配置网卡的网络，例如配置静态 ip，配置网关，配置 dns 等等。
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
对于运行中的虚拟机，修改静态IP，子网，网关等需要在虚拟机系统内安装 VmTools，并确保其在运行状态后，调用 `/update-vm-nic-basic-info` 来更新网络的配置。
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