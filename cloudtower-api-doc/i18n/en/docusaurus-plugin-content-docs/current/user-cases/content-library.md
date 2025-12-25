---
title: Creating a virtual machine from a template in content library
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

## Creating a virtual machine from a template in content library

You can create a virtual machine from a template in content library and configure its settings using the template.

- `template_name`: Select the name of the VM template to use.
- `cluster_name`: Select the name of the cluster where the virtual machine will reside.
- `vm_name`: Enter the name of the virtual machine.

The return value is the created virtual machine. 
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

## Creating a virtual machine from a template in content library and editing its disks

You can create a virtual machine from a template in content library and configure its disks.

- `template_name`: The name of the VM template in content library.
- `cluster_name`: The name of the cluster.
- `vm_name`: The name of the virtual machine.
- `disk_operate`: The disk operations.

For details, see the method for `create_vm_from_template_modify_disk_example`.

The return value is the created virtual machine.

When creating a virtual machine from a template in content library, you can modify the source disks by configuring the `disk_operate` parameter. The `disk_operate` parameter is of the `VmDiskOperate` type, which is a dictionary containing the following fields:

- `remove_disks`: Delete disks by specifying their index.
- `modify_disks`: Modify existing disk configurations. Currently, only changing the bus type is supported. For other modifications, delete the original disk first.
- `new_disks`: Add new disks. The parameter type is `VmDiskParams`, which is a dictionary containing the following fields:
  - `mount_cd_roms`: Mount CD-ROMs.
  - `mount_disks`: Mount existing disks.
  - `mount_new_create_disks`: Mount newly created disks.

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

## Creating and editing virtual NICs via a VM template in content library

You can create a virtual machine from a template in content library and configure its NICs.

- `template_name`: The name of the template in content library.
- `cluster_name`: The name of the cluster.
- `vm_name`: The name of the virtual machine.
- `nic_params`: The NIC parameters.

For details, see the method for `create_vm_from_template_modified_nic_example`.

The return value is the created virtual machine.

When creating a virtual machine from a template in content library, if you do not provide the `vm_nics` parameter, the virtual machine will use the NIC configuration from the template by default. To modify the NIC configuration, you can pass the `vm_nics` parameter, which is a list with each element being a dictionary:

- `connect_vlan_id`: The ID of the VM network to which the NIC corresponds. It is not the `vlan_id` of the VM network.
- `enabled`: Specifies whether to enable the NIC.
- `model`: The NIC type. You can use the attributes of the `VmNicModel` class, such as `VmNicModel.VIRTIO`. When creating a virtual machine, you cannot modify the NIC's IP address, MAC address, gateway, or subnet mask. To configure IP, subnet, and gateway settings, use cloud-init. The template must support cloud-init.

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

## Creating and editing cloud-init using a template in content library

You can create a virtual machine from a template in content library and configure its cloud-init settings. The template must have cloud-init enabled.

- `template_name`: The name of the template in content library.
- `cluster_name`: The name of the cluster.
- `vm_name`: Enter the name of the virtual machine.
- `cloud_init`: The cloud-init configuration. For details, see the method for `create_vm_from_template_with_cloudinit_example`.

The return value is the created virtual machine.

You can use cloud-init to initialize a virtual machine, such as configuring the network and the default user password. To work properly, the template must have the cloud-init or cloudbase-init service installed during its creation.

The `cloud_init` parameter is of the `TemplateCloudInit` type and is a dictionary containing the following fields:

- `default_user_password`: Configure the default user password.
- `nameservers`: DNS server addresses. This is a list of strings, supporting up to three entries.
- `networks`: The network configuration, which is a list of dictionaries containing:
  - `ip_address`: The IP address, required after configuring a static address.
  - `netmask`: The subnet mask, required after configuring a static address.
  - `nic_index`: The NIC index, starting from 0.
  - `routes`: The static route configuration. A list of dictionaries containing:
    - `gateway`: The gateway address.
    - `network`: The target network.
    - `netmask`: The target subnet.
- `hostname`: The host name.
- `public_keys`: Public keys for login.
- `user_data`: The user data configuration.

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