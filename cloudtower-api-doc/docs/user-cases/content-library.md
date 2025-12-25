---
title: 内容库模板创建虚拟机
sidebar_position: 41
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';
import CodeBlock from '@theme/CodeBlock';
import CodeTerminology from '@site/code-terminology.json';
import ContentLibrarySimpleCreateGo from '@site/code_blocks/user-cases/content-library/simple-create/go.md';
import ContentLibraryModifyDiskGo from '@site/code_blocks/user-cases/content-library/modify-disk/go.md';
import ContentLibraryModifyNicGo from '@site/code_blocks/user-cases/content-library/modify-nic/go.md';
import ContentLibraryCloudInitGo from '@site/code_blocks/user-cases/content-library/cloud-init/go.md';
import ContentLibrarySimpleCreatePython from '@site/code_blocks/user-cases/content-library/simple-create/python.md';
import ContentLibraryModifyDiskPython from '@site/code_blocks/user-cases/content-library/modify-disk/python.md';
import ContentLibraryModifyNicPython from '@site/code_blocks/user-cases/content-library/modify-nic/python.md';
import ContentLibraryCloudInitPython from '@site/code_blocks/user-cases/content-library/cloud-init/python.md';
import ContentLibrarySimpleCreateJava from '@site/code_blocks/user-cases/content-library/simple-create/java.md';
import ContentLibraryModifyDiskJava from '@site/code_blocks/user-cases/content-library/modify-disk/java.md';
import ContentLibraryModifyNicJava from '@site/code_blocks/user-cases/content-library/modify-nic/java.md';
import ContentLibraryCloudInitJava from '@site/code_blocks/user-cases/content-library/cloud-init/java.md';

## 内容库模板创建虚拟机

通过内容库模板创建一台虚拟机，内容通过内容库模板设置。

* template_name: 指定所需使用的内容库模板名称
* cluster_name: 指定虚拟机被部署的集群的集群名称
* vm_name: 虚拟机名称。

返回值为被创建的虚拟机
<Tabs>

<TabItem value="py" label="Python">
<ContentLibrarySimpleCreatePython/>
</TabItem>

<TabItem value="java" label="Java">
<ContentLibrarySimpleCreateJava/>
</TabItem>

<TabItem value="go" label="Go">
<ContentLibrarySimpleCreateGo/>
</TabItem>

</Tabs>

## 内容库模板创建虚拟机并编辑虚拟机盘

通过内容库模板创建一台虚拟机，配置虚拟机的磁盘。

* template_name 为模板名称
* cluster_name 为集群名称
* vm_name 为虚拟机名称
* disk_operate 为磁盘操作

使用详见 create_vm_from_template_modify_disk_example 方法。

返回值为被创建的虚拟机

通过内容库模板创建虚拟机时，如果希望对原有的磁盘进行任何修改，可以通过 disk_operate 参数进行配置
disk_operate 参数的类型是 VmDiskOperate，它是一个字典，包含以下字段：
- remove_disks 用于删除指定index的磁盘
- modify_disks 修改现有磁盘的配置，目前仅支持修改总线，如果有其他修改可以通过，删除原有盘
- new_disks 新增磁盘，类型是 VmDiskParams，它是一个字典，包含以下字段：
    - mount_cd_roms 挂载 cd-rom
    - mount_disks 挂载已有磁盘
    - mount_new_create_disks 挂载新磁盘

<Tabs>
<TabItem value="py" label="Python">
<ContentLibraryModifyDiskPython/>
</TabItem>
<TabItem value="java" label="Java">
<ContentLibraryModifyDiskJava/>
</TabItem>

<TabItem value="go" label="Go">
<ContentLibraryModifyDiskGo/>
</TabItem>
</Tabs>

## 通过内容库模板创建并编辑虚拟网卡

通过内容库模板创建一台虚拟机，配置虚拟机的网卡

* template_name 为模板名称
* cluster_name 为集群名称
* vm_name 为虚拟机名称
* nic_params 为磁盘操作

使用详见 create_vm_from_template_modified_nic_example 方法。

返回值为被创建的虚拟机。

通过内容库模板创建虚拟机时，如果不传递 vm_nics 参数，会默认使用模板的网卡配置，如果需要修改网卡配置，可以传递 vm_nics 参数，
vm_nics 参数是一个列表，列表中的每个元素都是一个字典：
- connect_vlan_id 网卡对应虚拟机网络的 id，并非虚拟机网络的 vlan_id
- enabled 是否启用网卡
- model 网卡类型，可以使用 VmNicModel 类的属性，如 VmNicModel.VIRTIO
创建虚拟机时并不支持修改网卡的 ip，mac，gateway，subnet mask，如果需要配置ip，子网，网关，可以通过 cloudinit 来实现，需要模板支持 cloudinit

<Tabs>
<TabItem value="py" label="Python">
<ContentLibraryModifyNicPython/>
</TabItem>
<TabItem label="Java" value="java">
<ContentLibraryModifyNicJava/>
</TabItem>

<TabItem value="go" label="Go">

<ContentLibraryModifyNicGo/>
</TabItem>

</Tabs>


## 通过内容库模板创建并编辑 cloud-init

通过内容库模板创建一台虚拟机，配置虚拟机的 cloud-init，需要模板启用
* template_name: 模板名称
*  cluster_name: 集群名称
* vm_name: 虚拟机名称
* cloud_init: cloud-init 配置，使用详见 create_vm_from_template_with_cloudinit_example 方法

返回值为被创建的虚拟机。

cloudinit 可以用于配置虚拟机的初始化，例如配置网络、配置默认账户密码等，需要模板创建时已经安装 cloud-init 或者 cloudbase-init 服务才能正常工作

cloud_init 配置项是 TemplateCloudInit 类型，是一个字典，包含以下字段
- default_user_password: 配置默认用户密码
- nameservers: dns 服务地址，是一个字符串列表，最多支持配置3个
- networks: 网络配置，一个字典列表
    - ip_address: ip 地址，配置静态地址后必填
    - netmask: 子网，配置静态地址后必填
    - nic_index: 配置网卡的顺序，以 0 为起始
    - routes: 静态路由配置，一个字典列表
        - gateway: 网关地址
        - network: 目标网络
        - netmask: 目标子网
- hostname: 主机名
- public_keys: 登陆用的公钥
- user_data: 用户数据配置

<Tabs>
<TabItem value="py" label="Python">
<ContentLibraryCloudInitPython/>
</TabItem>
<TabItem value="java" label="Java">
<ContentLibraryCloudInitJava/>
</TabItem>
<TabItem value="go" label="Go">

<ContentLibraryCloudInitGo/>
</TabItem>
</Tabs>