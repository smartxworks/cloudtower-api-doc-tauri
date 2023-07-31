---
title: Create VM With Template
sidebar_position: 41
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

## Create Virtual Machine with Template

Create a virtual machine by using a content library template, which is set up through the content library template.

template_name: Specify the name of the content library template to be used.
cluster_name: Specify the name of the cluster where the virtual machine is deployed.
vm_name: Specify the name of the virtual machine.
The return value is the created virtual machine.

<Tabs>

<TabItem value="py" label="Python">

```py
from cloudtower.api import VmApi, ContentLibraryVmTemplateApi, ClusterApi
from cloudtower.utils import login, wait_tasks
from cloudtower.configuration import Configuration
from cloudtower import ApiClient
import os


configuration = Configuration(host=os.getenv("CLOUDTOWER_ENDPOINT"))
client = ApiClient(configuration)

login(client, os.getenv("CLOUDTOWER_USERNAME"), os.getenv("CLOUDTOWER_PASSWORD"))


def create_vm_from_template(template_name, cluster_name, vm_name):
    vm_api = VmApi(client)
    cluster_api = ClusterApi(client)
    template_api = ContentLibraryVmTemplateApi(client)

    cluster = cluster_api.get_clusters({
        "where": {
            "name": cluster_name
        }
    })
    if len(cluster) == 0:
        raise Exception("cluster not found")

    template = template_api.get_content_library_vm_templates({
        "where": {
            "name": template_name
        }
    })
    if len(template) == 0:
        raise Exception("template not found")

    with_task_vms = vm_api.create_vm_from_content_library_template([
        {
            "template_id": template[0].id,
            "cluster_id": cluster[0].id,
            "name": vm_name,
            "is_full_copy": False
        }
    ])
    tasks = [with_task_vm.task_id for with_task_vm in with_task_vms]
    vm_ids = [
        with_task_vm.data.id for with_task_vm in with_task_vms]
    wait_tasks(tasks, client)
    return vm_api.get_vms({
        "where": {
            "id_in": vm_ids
        }
    })[0]
```

</TabItem>

</Tabs>

## Create Virtual Machine with Template and Edit Virtual Machine Disk

Create a virtual machine with a template and configure the virtual machine's disk.

* `template_name`: The name of the template.
* `cluster_name`: The name of the cluster.
* `vm_name`: The name of the virtual machine.
* `disk_operate`: The disk operation.

See the `create_vm_from_template_modify_disk_example` method for details.

The return value is the created virtual machine.

When creating a virtual machine from a template, if you want to modify the existing disk, you can configure it through the `disk_operate` parameter. The `disk_operate` parameter is of type `VmDiskOperate`, which is a dictionary that contains the following fields:
- `remove_disks`: Remove the specified index of the disk.
- `modify_disks`: Modify the configuration of an existing disk. Currently, only modifying the bus is supported. If there are other modifications, delete the original disk.
- `new_disks`: Add a new disk. The type is `VmDiskParams`, which is a dictionary that contains the following fields:
    - `mount_cd_roms`: Mount a CD-ROM.
    - `mount_disks`: Mount an existing disk.
    - `mount_new_create_disks`: Mount a new disk.

<Tabs>
<TabItem value="py" label="Python">

```py
from cloudtower.api import VmApi, ContentLibraryVmTemplateApi, ClusterApi
from cloudtower.utils import login, wait_tasks
from cloudtower.configuration import Configuration
from cloudtower.models import Bus, VmVolumeElfStoragePolicyType
from cloudtower import ApiClient
import os


configuration = Configuration(host=os.getenv("CLOUDTOWER_ENDPOINT"))
client = ApiClient(configuration)

login(client, os.getenv("CLOUDTOWER_USERNAME"), os.getenv("CLOUDTOWER_PASSWORD"))


def create_vm_from_template_modify_disk(template_name, cluster_name, vm_name, disk_operate):

    vm_api = VmApi(client)
    cluster_api = ClusterApi(client)
    template_api = ContentLibraryVmTemplateApi(client)

    cluster = cluster_api.get_clusters({
        "where": {
            "name": cluster_name
        }
    })
    if len(cluster) == 0:
        raise Exception("cluster not found")

    template = template_api.get_content_library_vm_templates({
        "where": {
            "name": template_name
        }
    })
    if len(template) == 0:
        raise Exception("template not found")

    with_task_vms = vm_api.create_vm_from_content_library_template([
        {
            "template_id": template[0].id,
            "cluster_id": cluster[0].id,
            "name": vm_name,
            "is_full_copy": False,
            "disk_operate": disk_operate
        }
    ])
    tasks = [with_task_vm.task_id for with_task_vm in with_task_vms]
    vm_ids = [
        with_task_vm.data.id for with_task_vm in with_task_vms]
    wait_tasks(tasks, client)
    return vm_api.get_vms({
        "where": {
            "id_in": vm_ids
        }
    })[0]


def create_vm_from_template_modify_disk_example():
    disk_operate = {
        "remove_disks": {
            "disk_index": [0]  # To delete a disk with a specific index, where the index starts at 0
        },
        "new_disks": {
            "mount_cd_roms": [
                {
                    "boot": 2,  # boot order
                    "content_library_image_id": ""  # Specify the ID of the content library image to be mounted.
                }
            ],
            "mount_disks": [
                {
                    "boot": 3,  # boot order
                    "bus": Bus.VIRTIO,  # bus type
                    "vm_volume_id": "cljm6x2g1405g0958tp3zkhvh"  # Specify the ID of the VM volume to be mounted.
                }
            ],
            "mount_new_create_disks": [
                {
                    "boot": 4,
                    "bus": Bus.VIRTIO,
                    "vm_volume": {
                        "name": "test",  # name of new VM volume
                        "size": 10 * 1024 * 1024 * 1024,  # size of the new VM volume, the unit is byte
                        "elf_storage_policy": VmVolumeElfStoragePolicyType._2_THIN_PROVISION  # storage policy
                    }
                }
            ]
        }
    }
    create_vm_from_template_modify_disk("template-name", "cluster-name", "vm-name", disk_operate)
```
</TabItem>
</Tabs>

## Create and Edit Virtual NIC with Template

Create a virtual machine by using a content library template, and configure the virtual machine's NIC.

* `template_name`: The name of the content library template to be used.
* `cluster_name`: The name of the cluster where the virtual machine is deployed.
* `vm_name`: The name of the virtual machine.
* `nic_params`: The NIC operation.

See the `create_vm_from_template_modified_nic_example` method for details.

The return value is the created virtual machine.

When creating a virtual machine from a template, if you do not pass the `vm_nics` parameter, the template's NIC configuration will be used by default. If you need to modify the NIC configuration, you can pass the `vm_nics` parameter. The `vm_nics` parameter is a list, and each element in the list is a dictionary:
- `connect_vlan_id`: The ID of the virtual machine network that the NIC corresponds to, not the VLAN ID of the virtual machine network.
- `enabled`: Whether to enable the NIC.
- `model`: The type of the NIC, which can use the properties of the `VmNicModel` class, such as `VmNicModel.VIRTIO`.

When creating a virtual machine, modifying the NIC's IP address, MAC address, gateway, and subnet mask is not supported. If you need to configure IP address, subnet, and gateway, you can use cloudinit to achieve it, which requires template support for cloudinit.

<Tabs>
<TabItem value="py" label="Python">

```py
from cloudtower.api import VmApi, ContentLibraryVmTemplateApi, ClusterApi
from cloudtower.utils import login, wait_tasks
from cloudtower.configuration import Configuration
from cloudtower.models import Bus, VmNicModel
from cloudtower import ApiClient
import os


configuration = Configuration(host=os.getenv("CLOUDTOWER_ENDPOINT"))
client = ApiClient(configuration)

login(client, os.getenv("CLOUDTOWER_USERNAME"), os.getenv("CLOUDTOWER_PASSWORD"))


def create_vm_from_template_modified_nic(template_name, cluster_name, vm_name, nic_params):
    vm_api = VmApi(client)
    cluster_api = ClusterApi(client)
    template_api = ContentLibraryVmTemplateApi(client)

    cluster = cluster_api.get_clusters({
        "where": {
            "name": cluster_name
        }
    })
    if len(cluster) == 0:
        raise Exception("cluster not found")

    template = template_api.get_content_library_vm_templates({
        "where": {
            "name": template_name
        }
    })
    if len(template) == 0:
        raise Exception("template not found")

    with_task_vms = vm_api.create_vm_from_content_library_template([
        {
            "template_id": template[0].id,
            "cluster_id": cluster[0].id,
            "name": vm_name,
            "is_full_copy": False,
            "vm_nics": nic_params
        }
    ])
    tasks = [with_task_vm.task_id for with_task_vm in with_task_vms]
    vm_ids = [
        with_task_vm.data.id for with_task_vm in with_task_vms]
    wait_tasks(tasks, client)
    return vm_api.get_vms({
        "where": {
            "id_in": vm_ids
        }
    })[0]


def create_vm_from_template_modified_nic_example():
    nic_params = [
        {
            "connect_vlan_id": "vlan_id",
            "enabled": True,
            "model": VmNicModel.VIRTIO
        }
    ]
    create_vm_from_template_modified_nic("template_name", "cluster_name", "vm_name", nic_params)
```
</TabItem>
</Tabs>


## Create and Edit Cloud-init with Template

Create a virtual machine by using a content library template, and configure the virtual machine's cloud-init. The template needs to be enabled.

* `template_name`: The name of the content library template to be used.
* `cluster_name`: The name of the cluster where the virtual machine is deployed.
* `vm_name`: The name of the virtual machine.
* `cloud_init`: The cloud-init configuration.

See the `create_vm_from_template_with_cloudinit_example` method for details.

The return value is the created virtual machine.

Cloud-init can be used to configure the initialization of the virtual machine, such as configuring the network, configuring the default account password, etc. The template needs to have the cloud-init or cloudbase-init service installed to work properly.

The `cloud_init` configuration item is of type `TemplateCloudInit`, which is a dictionary that contains the following fields:
- `default_user_password`: Configure the default user password.
- `nameservers`: DNS service address, which is a list of strings, and supports up to 3 configurations.
- `networks`: Network configuration, a list of dictionaries.
    - `ip_address`: IP address, required when configuring a static address.
    - `net_mask`: Subnet, required when configuring a static address.
    - `nic_index`: The order in which to configure the NIC, starting with 0.
    - `routes`: Static route configuration, a list of dictionaries.
        - `gateway`: Gateway address.
        - `network`: Destination network.
        - `netmask`: Destination subnet.
- `hostname`: Hostname.
- `public_keys`: Public keys for login.
- `user_data`: User data configuration.

<Tabs>
<TabItem value="py" label="Python">

```py
from cloudtower.api import VmApi, ContentLibraryVmTemplateApi, ClusterApi
from cloudtower.utils import login, wait_tasks
from cloudtower.configuration import Configuration
from cloudtower import ApiClient
import os


configuration = Configuration(host=os.getenv("CLOUDTOWER_ENDPOINT"))
client = ApiClient(configuration)

login(client, os.getenv("CLOUDTOWER_USERNAME"), os.getenv("CLOUDTOWER_PASSWORD"))


def create_vm_from_template_with_cloudinit(template_name, cluster_name, vm_name, cloud_init):
    vm_api = VmApi(client)
    cluster_api = ClusterApi(client)
    template_api = ContentLibraryVmTemplateApi(client)

    cluster = cluster_api.get_clusters({
        "where": {
            "name": cluster_name
        }
    })
    if len(cluster) == 0:
        raise Exception("cluster not found")

    template = template_api.get_content_library_vm_templates({
        "where": {
            "name": template_name
        }
    })
    if len(template) == 0:
        raise Exception("template not found")

    with_task_vms = vm_api.create_vm_from_content_library_template([
        {
            "template_id": template[0].id,
            "cluster_id": cluster[0].id,
            "name": vm_name,
            "is_full_copy": False,
            "cloud_init": cloud_init
        }
    ])
    tasks = [with_task_vm.task_id for with_task_vm in with_task_vms]
    vm_ids = [
        with_task_vm.data.id for with_task_vm in with_task_vms]
    wait_tasks(tasks, client)
    return vm_api.get_vms({
        "where": {
            "id_in": vm_ids
        }
    })[0]


def create_vm_from_template_with_cloudinit_example():
    cloud_init = {
        "default_user_password": "password",
        "nameservers": [
            "114.114.114.114"
        ],
        "networks": [
            {
                "ip_address": "192.168.20.1",
                "net_mask": "255.255.240.0",
                "nic_index": 0,
                "routes": [
                    {
                        "gateway": "192.168.16.1", # default gateway config
                        "network": "0.0.0.0",
                        "netmask": "0.0.0.0",
                    },
                ]
            }
        ],
        "hostname": "test",
        "public_keys": [
            "key_content"
        ],
        "user_data": "user_data"
    }
    create_vm_from_template_with_cloudinit("template_name", "cluster_name", "vm_name", cloud_init)
```
</TabItem>
</Tabs>