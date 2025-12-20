---
title: Python
---

import Terminology from '@site/terminology.json'

<>The {Terminology['terminology']['en-US']['PRODUCT']} SDK for Python supports Python 2.7, 3.4 or later. </>

- [Source repository](https://github.com/smartxworks/cloudtower-python-sdk)
- [Download the SDK](https://github.com/smartxworks/cloudtower-python-sdk/releases)

## Installing the SDK

- ### Installing using the `.whl` file

  ```shell
  pip install cloudtower_sdk-2.21.0-py2.py3-none-any.whl
  ```

- ### Installing using the `.tar.gz` file

  ```shell
  tar xvzf cloudtower-sdk-2.21.0.tar.gz
  cd cloudtower-sdk-2.21.0
  python setup.py install
  ```

- ### Installing using the Git source code

  ```
  git clone https://github.com/smartxworks/cloudtower-python-sdk.git
  cd cloudtower-python-sdk
  python setup.py install
  ```

- ### Installing using pip from Git

  ```shell
  pip install git+https://github.com/smartxworks/cloudtower-python-sdk.git
  ```

- ### Installing using PyPI
  ```shell
  pip install cloudtower-sdk
  ```

## Using the SDK

### Creating an instance

#### Creating an `ApiClient` instance

```python
from cloudtower.configuration import Configuration
from cloudtower import ApiClient
# Configure the operation-api endpoint.
configuration = Configuration(host="http://192.168.96.133/v2/api")
client = ApiClient(configuration)
```

> If you need to use HTTPS, you can either install a certificate or skip certificate verification.

```python
configuration = Configuration(host="https://192.168.96.133/v2/api")
configuration.verify_ssl = False
client = ApiClient(configuration)
```

#### Creating a corresponding API instance

> Create the related API instance based on the type of operation. For example, to perform operations related to virtual machines, create a `VmApi` instance:

```python
from cloudtower.api.vm_api import VmApi
vm_api = VmApi(client)
```

### Authenticating

> The `ApiClient` can be authenticated using the login method encapsulated in `utils`.

```python
from cloudtower.utils import wait_tasks, login
conf = Configuration(host="http://example-cloudtower.com/v2/api")
api_client = ApiClient(conf)
login(api_client, "your_username", "your_password") #By default, LOCAL is used as usersource
```

> Alternatively, you can directly use the token in the `api_key` field of `configuration`.

```python
from cloudtower.api.user_api import UserApi
from cloudtower.models import UserSource
# Obtain a token using the login method of UserApi.
user_api = UserApi(client)
login_res = user_api.login({
    "username": "your_username",
    "password": "your_password",
    "source": UserSource.LOCAL
})
# Configure the token in `configuration.api_key["Authorization"]`.
# All APIs using this client will include the authentication token.
configuration.api_key["Authorization"] = login_res.data.token
```

### Sending requests

#### Retrieving resources

```python
vms = vm_api.get_vms({
  "where": {
    "id": "vm_id"
  },
  "first":1,
})
```

#### Updating resources

> Updating resources will trigger a related asynchronous task. When the task is completed, it indicates that the resource operation has finished and the data has been updated.

```python
start_res = vm_api.start_vm({
  "where": {
    "id": "stopped_vm_id"
  },
})
```

> You can use the provided utility method to synchronously wait for the asynchronous task to complete:

```python
from cloudtower.utils import wait_tasks
try:
 wait_tasks([res.task_id for res in start_res], api_client)
except ApiException as e:
 # Handling errors
else:
 # Callback after the task is completed
```

##### **Method parameters**

| <strong>Parameter</strong> | <strong>Type</strong>                                         | <strong>Required</strong> | <strong>Description</strong>                                                                                                                                                                     |
| -------------------------- | ------------------------------------------------------------- | ------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `ids`                      | list[str] | Yes                       | The list of task IDs to query.                                                                                                                                                   |
| `api_client`               | ApiClient                                                     | Yes                       | The ApiClient instance used for querying.                                                                                                                                        |
| `interval`                 | int                                                           | No                        | The polling interval. Default: 5s.                                                                                                               |
| `timeout`                  | int                                                           | No                        | The timeout period. Default: 300s.                                                                                                               |
| `exit_on_error`            | bool                                                          | No                        | Whether to exit immediately when a singe task fails. Otherwise, wait for all tasks to complete before exiting. Default: `False`. |

##### **Errors**

| <strong>Error code</strong> | <strong>Description</strong>                                 |
| --------------------------- | ------------------------------------------------------------ |
| 408                         | Timeout                                                      |
| 500                         | The internal error of the asynchronous task. |

#### Custom headers

<>

> The {Terminology['terminology']['en-US']['PRODUCT']} API supports setting the `content-language` field in the request header to specify the response language. Available values are `en-US` and `en-US`. The default is `en-US`.
> </>

##### Using the `set_default_header` method of `ApiClient`

> You can use the `set_default_header` method of `ApiClient` to configure default header information.

```python
api_client.set_default_header("content_language","en-US")
alert_api = AlertApi(api_client)
# The message, solution, cause, and impact fields in the returned alerts will be in English.
alerts = alert_api.get_alerts(
  {
    "where": {
      "cluster": {
        "id": "cluster_id"
      }
    },
    "first": 100
  },
)
```

##### Using the request keyword argument

> You can also set the response language by specifying the `content_language` keyword argument in a request.

```python
from cloudtower.api.user_api import AlertApi

alert_api = AlertApi(api_client)
# The message, solution, cause, and impact fields in the returned alerts will be in Chinese.
alerts = alert_api.get_alerts(
  {
    "where": {
      "cluster": {
        "id": "cluster_id"
      }
    },
    "first": 100
  },
  content_language="en-US"
)
```

#### Other notes

##### Sending asynchronous requests

> The requests shown above are synchronous and will block the current process. If you need to send an asynchronous request, add `async_req=True` to the corresponding keyword arguments of the request.
> You can then obtain the result using `ApplyResult.get()` from the returned object.

```python
vms = vm_api.get_vms(
  {
    "where": {
      "id": "vm_id"
    }
  },
  async_req=True
)
print(vms.get()[0].name)
```

### Destroying the ApiClient instance after use

```python
client.close()
```

## Operation example

### Fetching virtual machines

#### Fetching all virtual machines

```python
from cloudtower import ApiClient, Configuration, VmApi

conf = Configuration(host="http://192.168.96.133/v2/api")
conf.api_key["Authorization"] = "token"
api_client = ApiClient(conf)
vm_api = VmApi(api_client)

vms = vm_api.get_vms({})
```

#### Fetching virtual machines with pagination

```python
from cloudtower import ApiClient, Configuration, VmApi

conf = Configuration(host="http://192.168.96.133/v2/api")
conf.api_key["Authorization"] = "token"
api_client = ApiClient(conf)
vm_api = VmApi(api_client)

vms_from_51_to_100 = vm_api.get_vms({
  "first": 50,
  "skip": 50,
})
```

#### Fetching all powered-on virtual machines

```python
from cloudtower import ApiClient, Configuration, VmApi, VmStatus

conf = Configuration(host="http://192.168.96.133/v2/api")
conf.api_key["Authorization"] = "token"
api_client = ApiClient(conf)
vm_api = VmApi(api_client)

running_vms = vm_api.get_vms(
    {
        "where": {
            "status": VmStatus.RUNNING
        }
    },
)
```

#### Fetching virtual machines whose name or description contain a specific string

```python
from cloudtower import ApiClient, Configuration, VmApi

conf = Configuration(host="http://192.168.96.133/v2/api")
conf.api_key["Authorization"] = "token"
api_client = ApiClient(conf)
vm_api = VmApi(api_client)

vms_name_contains = vm_api.get_vms(
    {
        "where": {
            "name_contains": "string"
        }
    },
)
```

#### Fetching all virtual machines with the number of vCPUs greater than `n`

```python
from cloudtower import ApiClient, Configuration, VmApi

conf = Configuration(host="http://192.168.96.133/v2/api")
conf.api_key["Authorization"] = "token"
api_client = ApiClient(conf)
vm_api = VmApi(api_client)

vms_has_4_more_vcpu = vm_api.get_vms(
    {
        "where": {
            "vcpu_gt": 4
        }
    },
)
```

### Creating a virtual machine from a template

#### Specifying IP address only only

```python
from cloudtower.api import VmApi, ContentLibraryVmTemplateApi, ClusterApi
from cloudtower.utils import login, wait_tasks
from cloudtower.configuration import Configuration
from cloudtower import ApiClient
import os


configuration = Configuration(host=os.getenv("CLOUDTOWER_ENDPOINT"))
client = ApiClient(configuration)

login(client, os.getenv("CLOUDTOWER_USERNAME"), os.getenv("CLOUDTOWER_PASSWORD"))


def create_vm_from_template(template_name, cluster_name, vm_name):
    """
    Create  a virtual machine from a template in content library. The virtual machine is configured with the template. 
    :param template_name: Specify the name of the template to use in content library. 
    :param cluster_name: Specify the name of the cluster hosting the virtual machine. 
    :param vm_name: The name of the virtual machine. 
    :return: The created virtual machine.
    """
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

#### Configuring virtual disk parameters that differ from the template

```python
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
    """
    Create a virtual machine from a template in content library and configure the disks on the virtual machine.
    :param template_name: The name of the template.
    :param cluster_name: The name of the cluster.
    :param vm_name: The name of the virtual machine.
    :param disk_operate: Disk operations. For details, refer to the methods in create_vm_from_template_modify_disk_example
    :return: The created virtual machine. 
    """
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
    """
    When creating a virtual machine from a template, any modifications to the original disks can be configured through the disk_operate parameter.
    The disk_operate parameter is of the VmDiskOperate type, which is a dictionary containing the following fields: 
    - remove_disks removes disks by their specified index.
    - modify_disks modifies the configuration of existing disks. Currently, only the bus type can be modified. For other changes, remove the original disk and add a new one.
    - new_disks adds new disks. This field is of type VmDiskParams, which is a dictionary containing the following fields: 
        - mount_cd_roms mounts CD-ROM devices.
        - mount_disks mounts existing disks.
        - mount_new_create_disks mounts newly created disks.
    """
    disk_operate = {
        "remove_disks": {
            "disk_index": [0]  # Indexes of the disks to be removed. Indexing starts from 0. For example, [0] removes the first disk.
        },
        "new_disks": {
            "mount_cd_roms": [
                {
                    "boot": 2,  # Boot order
                    "content_library_image_id": ""  # The ID of the content library image to be mounted 
                    "bus": Bus.VIRTIO,  # Bus type
                    "vm_volume_id": "cljm6x2g1405g0958tp3zkhvh"  # ID of the virtual volume to be mounted.
                }
            ],
            "mount_new_create_disks": [
                {
                    "boot": 4,
                    "bus": Bus.VIRTIO,
                    "vm_volume": {
                        "name": "test",  # Name of the new virtual volume.
                        "size": 10 * 1024 * 1024 * 1024,  # Size of the new virtual volume, in bytes.
                        "elf_storage_policy": VmVolumeElfStoragePolicyType._2_THIN_PROVISION  # Storage policy
                    }
                }
            ]
        }
    }
    create_vm_from_template_modify_disk("template-name", "cluster-name", "vm-name", disk_operate)
```

#### Configuring NIC parameters that differ from the template

```python
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
    """
    Create a virtual machine via a template in content library and configure its NICs
    :param template_name: The name of the template
    :param cluster_name: The name of the cluster
    :param vm_name: The name of the virtual machine
    :param nic_params: Disk operations. For details, see the method for create_vm_from_template_modified_nic_example
    :return: The created virtual machine
    """
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
    """
    When creating a virtual machine using a template in content library, if the vm_nics parameter is not provided, the template's NIC configuration will be used by default. If modification of the NIC configuration is needed, the vm_nics parameter can be passed.
    vm_nics is a list, where each element is a dictionary containing the following keys: 
    - connect_vlan_id is the ID of the VM network corresponding to the NIC, not the vlan_id of the VM network
    - enabled indicates whether the NIC is enabled
    - model is the NIC type, which can be specified using properties of the VmNicModel class, such as VmNicModel.
    When creating a virtual machine, modifying the IP, MAC address, gateway, or subnet mask of the NIC is not supported. If the configuration of IP address, subnet, or gateway is required, it can be achieved through cloud-init, provided the template supports cloud-init. 
    """
    nic_params = [
        {
            "connect_vlan_id": "vlan_id",
            "enabled": True,
            "model": VmNicModel.VIRTIO
        }
    ]
    create_vm_from_template_modified_nic("template_name", "cluster_name", "vm_name", nic_params)
```

### Creating a blank virtual machine

#### Simple creation

```python
from cloudtower import (
    ApiClient,
    Configuration,
    VmApi,
    VmStatus,
    VmFirmware,
    Bus
)
from cloudtower.utils import wait_tasks

conf = Configuration(host="http://192.168.96.133/v2/api")
conf.api_key["Authorization"] = "token"
api_client = ApiClient(conf)
vm_api = VmApi(api_client)
with_task_vm = vm_api.create_vm([
    {
        "cluster_id": "cluster_id",
        "name": "vm_name",
        "ha": True,
        "cpu_cores": 4,
        "cpu_sockets": 4,
        "memory": 4*1024*1024*1024,
        "vcpu": 16,
        "status": VmStatus.STOPPED,
        "firmware": VmFirmware.BIOS,
        "vm_nics": [
            {
                "connect_vlan_id": "vlan_id",
            }
        ],
        "vm_disks": {
            "mount_cd_roms": [{
                "boot": 0,
                "index": 0
            }],
        }
    }
])[0]

wait_tasks([with_task_vm.task_id], api_client)
created_vm = vm_api.get_vms({
    "where": {
        "id": with_task_vm.data.id
    }
})
```

#### Configuring virtual disks during creation

##### Mounting ISOs via CD-ROM

```python
from cloudtower import (
    ApiClient,
    Configuration,
    VmApi,
    VmStatus,
    VmFirmware,
    Bus
)
from cloudtower.utils import wait_tasks

conf = Configuration(host="http://192.168.96.133/v2/api")
conf.api_key["Authorization"] = "token"
api_client = ApiClient(conf)
vm_api = VmApi(api_client)
with_task_vm = vm_api.create_vm([
    {
        "cluster_id": "cluster_id",
        "name": "vm_name",
        "ha": True,
        "cpu_cores": 4,
        "cpu_sockets": 4,
        "memory": 4*1024*1024*1024,
        "vcpu": 16,
        "status": VmStatus.STOPPED,
        "firmware": VmFirmware.BIOS,
        "vm_nics": [
            {
                "connect_vlan_id": "vlan_id",
            }
        ],
        "vm_disks": {
            "mount_cd_roms": [{
                "index": 0,
                "boot": 0,
                "elf_image_id": "elf_image_id"
            }],
        }
    }
])[0]

wait_tasks([with_task_vm.task_id], api_client)
created_vm = vm_api.get_vms({
    "where": {
        "id": with_task_vm.data.id
    }
})
```

##### Mounting virtual volumes as virtual disks

```python
from cloudtower import (
    ApiClient,
    Configuration,
    VmApi,
    VmStatus,
    VmFirmware,
    Bus
)
from cloudtower.utils import wait_tasks

conf = Configuration(host="http://192.168.96.133/v2/api")
conf.api_key["Authorization"] = "token"
api_client = ApiClient(conf)
vm_api = VmApi(api_client)
with_task_vm = vm_api.create_vm([
    {
        "cluster_id": "cluster_id",
        "name": "vm_name",
        "ha": True,
        "cpu_cores": 4,
        "cpu_sockets": 4,
        "memory": 4*1024*1024*1024,
        "vcpu": 16,
        "status": VmStatus.STOPPED,
        "firmware": VmFirmware.BIOS,
        "vm_nics": [
            {
                "connect_vlan_id": "vlan_id",
            }
        ],
        "vm_disks": {
            "mount_disks": [{
                "index": 0,
                "boot": 0,
                "bus": Bus.VIRTIO,
                "vm_volume_id": "vm_volume_id",
                "index": 0,
            }],
        }
    }
])[0]

wait_tasks([with_task_vm.task_id], api_client)
created_vm = vm_api.get_vms({
    "where": {
        "id": with_task_vm.data.id
    }
})
```

##### Adding and mounting a virtual disk

```python
from cloudtower import (
    ApiClient,
    Configuration,
    VmApi,
    VmStatus,
    VmFirmware,
    Bus,
    VmVolumeElfStoragePolicyType
)
from cloudtower.utils import wait_tasks

conf = Configuration(host="http://192.168.96.133/v2/api")
conf.api_key["Authorization"] = "token"
api_client = ApiClient(conf)
vm_api = VmApi(api_client)
with_task_vm = vm_api.create_vm([
    {
        "cluster_id": "cluster_id",
        "name": "vm_name",
        "ha": True,
        "cpu_cores": 4,
        "cpu_sockets": 4,
        "memory": 4 * 1024*1024*1024,
        "vcpu": 16,
        "status": VmStatus.STOPPED,
        "firmware": VmFirmware.BIOS,
        "vm_nics": [
            {
                "connect_vlan_id": "vlan_id",
            }
        ],
        "vm_disks": {
            "mount_new_create_disks": [{
                "boot": 0,
                "bus": Bus.VIRTIO,
                "vm_volume": {
                    "elf_storage_policy": VmVolumeElfStoragePolicyType._2_THIN_PROVISION,
                    "size": 10 * 1024 * 1024 * 1024,
                    "name": "new_volume_name"
                }
            }],
        }
    }
])[0]

wait_tasks([with_task_vm.task_id], api_client)
created_vm = vm_api.get_vms({
    "where": {
        "id": with_task_vm.data.id
    }
})
```

#### Configuring virtual NICs during creation

```python
from cloudtower import (
    ApiClient,
    Configuration,
    VmApi,
    VmStatus,
    VmFirmware,
    Bus,
    VmNicModel,
    VmVolumeElfStoragePolicyType
)
from cloudtower.utils import wait_tasks

conf = Configuration(host="http://192.168.96.133/v2/api")
conf.api_key["Authorization"] = "token"
api_client = ApiClient(conf)
vm_api = VmApi(api_client)
with_task_vm = vm_api.create_vm([
    {
        "cluster_id": "cluster_id",
        "name": "vm_name1",
        "ha": True,
        "cpu_cores": 4,
        "cpu_sockets": 4,
        "memory": 4 * 1024*1024*1024,
        "vcpu": 16,
        "status": VmStatus.STOPPED,
        "firmware": VmFirmware.BIOS,
        "vm_nics": [
            {
                "connect_vlan_id": "vlan_id",
                "mirror": True,
                "model": VmNicModel.VIRTIO
            }
        ],
        "vm_disks": {
            "mount_cd_roms": [{
                "index": 0,
                "boot": 0,
            }],
        }
    }
])[0]

wait_tasks([with_task_vm.task_id], api_client)
created_vm = vm_api.get_vms({
    "where": {
        "id": with_task_vm.data.id
    }
})
```

### Editing a virtual machine

#### Editing basic information

```python
from cloudtower import ApiClient, Configuration, VmApi
from cloudtower.utils import wait_tasks

conf = Configuration(host="http://192.168.96.133/v2/api")
conf.api_key["Authorization"] = "token"
api_client = ApiClient(conf)
vm_api = VmApi(api_client)

with_task_vm = vm_api.update_vm({
    "where": {
        "id": "vm_id"
    },
    "data": {
        "name": "new_name",
        "description": "new_description",
        "ha": False,
        "vcpu": 2 * 2,
        "cpu_cores": 2,
        "cpu_sockets": 2,
        "memory": 1*1024*1024*1024,
    }
})[0]

wait_tasks([with_task_vm.task_id], api_client)

updated_vm = vm_api.get_vms({
    "where": {
        "id": with_task_vm.data.id
    }
})
```

#### Editing CD-ROMs

##### Adding a CD-ROM

```python
from cloudtower import ApiClient, Configuration, VmApi
from cloudtower.utils import wait_tasks

conf = Configuration(host="http://192.168.96.133/v2/api")
conf.api_key["Authorization"] = "token"
api_client = ApiClient(conf)
vm_api = VmApi(api_client)

with_task_vm = vm_api.add_vm_cd_rom({
    "where": {
        "id": "vm_id"
    },
    "data": {
        "vm_cd_roms": [
            {
                "elf_image_id": "elf_image_id",
                "boot": 0,
                "index": 0
            }
        ]
    }
})[0]
wait_tasks([with_task_vm.task_id], api_client)

updated_vm = vm_api.get_vms({
    "where": {
        "id": with_task_vm.data.id
    }
})
```

##### Deleting a CD-ROM

```python
from cloudtower import ApiClient, Configuration, VmApi
from cloudtower.utils import wait_tasks

conf = Configuration(host="http://192.168.96.133/v2/api")
conf.api_key["Authorization"] = "token"
api_client = ApiClient(conf)
vm_api = VmApi(api_client)

with_task_vm = vm_api.remove_vm_cd_rom({
    "where": {
        "id": "vm_id"
    },
    "data": {
        "cd_rom_ids": ["cd_rom_id_1", "cd_rom_id_2"]
    }
})[0]

wait_tasks([with_task_vm.task_id], api_client)

updated_vm = vm_api.get_vms({
    "where": {
        "id": with_task_vm.data.id
    }
})
```

#### Managing virtual volumes

##### Adding a new virtual volume

```python
from cloudtower import ApiClient, Configuration, Bus, VmVolumeElfStoragePolicyType, VmApi
from cloudtower.utils import wait_tasks

conf = Configuration(host="http://192.168.96.133/v2/api")
conf.api_key["Authorization"] = "token"
api_client = ApiClient(conf)
vm_api = VmApi(api_client)

with_task_vm = vm_api.add_vm_disk({
    "where": {
        "id": "vm_id"
    },
    "data": {
        "vm_disks": {
            "mount_new_create_disks": [
                {
                    "vm_volume": {
                        "elf_storage_policy": VmVolumeElfStoragePolicyType._2_THIN_PROVISION,
                        "size": 5*1024*1024*1024,
                        "name": "new_volume_name"
                    },
                    "boot": 1,
                    "bus": Bus.VIRTIO,
                }
            ]
        }
    }
})[0]

wait_tasks([with_task_vm.task_id], api_client)

updated_vm = vm_api.get_vms({
    "where": {
        "id": with_task_vm.data.id
    }
})
```

##### Mounting an existing virtual volume as a virtual disk

```python
from cloudtower import ApiClient, Configuration, Bus, VmApi
from cloudtower.utils import wait_tasks

conf = Configuration(host="http://192.168.96.133/v2/api")
conf.api_key["Authorization"] = "token"
api_client = ApiClient(conf)
vm_api = VmApi(api_client)

with_task_vm = vm_api.add_vm_disk({
    "where": {
        "id": "vm_id"
    },
    "data": {
        "vm_disks": {
            "mount_disks": [
                {
                    "index": 0,
                    "vm_volume_id": "vm_volume_id",
                    "boot": 1,
                    "bus": Bus.VIRTIO,
                }
            ]
        }
    }
})[0]

wait_tasks([with_task_vm.task_id], api_client)

updated_vm = vm_api.get_vms({
    "where": {
        "id": with_task_vm.data.id
    }
})
```

##### Unmounting a virtual disk

```python
from cloudtower import ApiClient, Configuration, VmVolumeElfStoragePolicyType, Bus, VmApi
from cloudtower.utils import wait_tasks

conf = Configuration(host="http://192.168.96.133/v2/api")
conf.api_key["Authorization"] = "token"
api_client = ApiClient(conf)
vm_api = VmApi(api_client)

with_task_vm = vm_api.remove_vm_disk({
    "where": {
        "id": "vm_id"
    },
    "data": {
        "disk_ids": ["vm_disk_id_1", "vm_disk_id_2"]
    }
})[0]

wait_tasks([with_task_vm.task_id], api_client)

updated_vm = vm_api.get_vms({
    "where": {
        "id": with_task_vm.data.id
    }
})
```

#### Managing NICs

##### Adding a NIC

```python
from cloudtower import ApiClient, Configuration, VmApi, VmNicModel
from cloudtower.utils import wait_tasks

conf = Configuration(host="http://192.168.96.133/v2/api")
conf.api_key["Authorization"] = "token"
api_client = ApiClient(conf)

vm_api = VmApi(api_client)

with_task_vm = vm_api.add_vm_nic({
    "where": {
        "id": "vm_id"
    },
    "data": {
        "vm_nics": [
            {
                "connect_vlan_id": "vlan_id",
                "enabled": False,
                "model": VmNicModel.VIRTIO,
            },
            {
                "connect_vlan_id": "vlan_id_2",
                "enabled": True,
                "mirror": True,
                "model": VmNicModel.VIRTIO,
            }
        ]
    }
})[0]

wait_tasks([with_task_vm.task_id], api_client)
updated_vm = vm_api.get_vms({
    "where": {
        "id": with_task_vm.data.id
    }
})
```

##### Editing NICs

```python
from cloudtower import ApiClient, Configuration, VmApi
from cloudtower.utils import wait_tasks

conf = Configuration(host="http://192.168.96.133/v2/api")
conf.api_key["Authorization"] = "token"
api_client = ApiClient(conf)

vm_api = VmApi(api_client)

with_task_vm = vm_api.update_vm_nic({
    "where": {
        "id": "vm_id"
    },
    "data": {
        "nic_index": 0,
        "enabled": False,
        "mirror": False,
        "connect_vlan_id": "vlan_id"
    }
})[0]

wait_tasks([with_task_vm.task_id], api_client)
updated_vm = vm_api.get_vms({
    "where": {
        "id": with_task_vm.data.id
    }
})
```

##### Removing a NIC

```python
from cloudtower import ApiClient, Configuration, VmApi
from cloudtower.utils import wait_tasks

conf = Configuration(host="http://192.168.96.133/v2/api")
conf.api_key["Authorization"] = "token"
api_client = ApiClient(conf)

vm_api = VmApi(api_client)

with_task_vm = vm_api.remove_vm_nic({
    "where": {
        "id": "vm_id"
    },
    "data": {
        "nic_index": [0, 1]
    }
})[0]

wait_tasks([with_task_vm.task_id], api_client)
updated_vm = vm_api.get_vms({
    "where": {
        "id": with_task_vm.data.id
    }
})
```

#### Migrating a virtual machine

##### Migrating a virtual machine to a specific host

```python
from cloudtower import ApiClient, Configuration, VmApi
from cloudtower.utils import wait_tasks

conf = Configuration(host="http://192.168.96.133/v2/api")
conf.api_key["Authorization"] = "token"
api_client = ApiClient(conf)

vm_api = VmApi(api_client)

with_task_vm = vm_api.mig_rate_vm({
    "where": {
        "id": "vm_id"
    },
    "data": {
        "host_id": "host_id"
    }
})[0]

wait_tasks([with_task_vm.task_id], api_client)
```

##### Automatically placing a virtual machine on a proper host

```python
from cloudtower import ApiClient, Configuration, VmApi
from cloudtower.utils import wait_tasks

conf = Configuration(host="http://192.168.96.133/v2/api")
conf.api_key["Authorization"] = "token"
api_client = ApiClient(conf)

vm_api = VmApi(api_client)

with_task_vm = vm_api.mig_rate_vm({
    "where": {
        "id": "vm_id"
    }
})[0]

wait_tasks([with_task_vm.task_id], api_client)
```

### Managing virtual machine power

#### Powering on virtual machines:

##### Powering on a specific virtual machine and automatically scheduling it to a proper host

```python
from cloudtower import ApiClient, Configuration, VmApi
from cloudtower.utils import wait_tasks

conf = Configuration(host="http://192.168.96.133/v2/api")
conf.api_key["Authorization"] = "token"
api_client = ApiClient(conf)

vm_api = VmApi(api_client)
with_task_vm = vm_api.start_vm({
    "where": {
        "id": "vm_id"
    }
})[0]

wait_tasks([with_task_vm.task_id], api_client)

opened_vm = vm_api.get_vms({"where": {"id": with_task_vm.data.id}})[0]
```

##### Powering on virtual machines in batches and automatically scheduling them to a proper host

```python
from cloudtower import ApiClient, Configuration, VmApi
from cloudtower.utils import wait_tasks

conf = Configuration(host="http://192.168.96.133/v2/api")
conf.api_key["Authorization"] = "token"
api_client = ApiClient(conf)

vm_api = VmApi(api_client)
with_task_vms = vm_api.start_vm({
    "where": {
        "id_in": ["vm_id_1", "vm_id_2"]
    }
})

tasks = [with_task_vm.task_id for with_task_vm in with_task_vms]
ids = [with_task_vm.data.id for with_task_vm in with_task_vms]
wait_tasks(tasks, api_client)

opened_vms = vm_api.get_vms({"where": {"id_in": ids}})
```

##### Powering on a virtual machine and placing it on a specified host

```python
from cloudtower import ApiClient, Configuration, VmApi
from cloudtower.utils import wait_tasks

conf = Configuration(host="http://192.168.96.133/v2/api")
conf.api_key["Authorization"] = "token"
api_client = ApiClient(conf)

vm_api = VmApi(api_client)
with_task_vm = vm_api.start_vm({
    "where": {
        "id": "vm_id"
    },
    "data": {
        "host_id": "host_id"
    }
})[0]

wait_tasks([with_task_vm.task_id], api_client)

opened_vm = vm_api.get_vms({"where": {"id": with_task_vm.data.id}})[0]
```

#### Shutting down virtual machines

##### Shutting down a specific virtual machine

```python
from cloudtower import ApiClient, Configuration, VmApi
from cloudtower.utils import wait_tasks

conf = Configuration(host="http://192.168.96.133/v2/api")
conf.api_key["Authorization"] = "token"
api_client = ApiClient(conf)

vm_api = VmApi(api_client)
with_task_vm = vm_api.shut_down_vm({
    "where": {
        "id": "vm_id"
    }
})[0]

wait_tasks([with_task_vm.task_id], api_client)

closed_vm = vm_api.get_vms({"where": {"id": with_task_vm.data.id}})[0]
```

##### Shutting down virtual machines in batches

```python
from cloudtower import ApiClient, Configuration, VmApi
from cloudtower.utils import wait_tasks

conf = Configuration(host="http://192.168.96.133/v2/api")
conf.api_key["Authorization"] = "token"
api_client = ApiClient(conf)

vm_api = VmApi(api_client)
with_task_vms = vm_api.shut_down_vm({
    "where": {
        "id_in": ["vm_id_1", "vm_id_2"]
    }
})

tasks = [with_task_vm.task_id for with_task_vm in with_task_vms]
ids = [with_task_vm.data.id for with_task_vm in with_task_vms]

wait_tasks(tasks, api_client)

closed_vms = vm_api.get_vms({"where": {"id_in": ids}})
```

##### Forcibly powering off a specific virtual machine

```python
from cloudtower import ApiClient, Configuration, VmApi
from cloudtower.utils import wait_tasks

conf = Configuration(host="http://192.168.96.133/v2/api")
conf.api_key["Authorization"] = "token"
api_client = ApiClient(conf)

vm_api = VmApi(api_client)
with_task_vm = vm_api.force_shut_down_vm({
    "where": {
        "id": "vm_id"
    }
})[0]

wait_tasks([with_task_vm.task_id], api_client)

closed_vm = vm_api.get_vms({"where": {"id": with_task_vm.data.id}})[0]
```

##### Forcibly powering off virtual machines in batches

```python
from cloudtower import ApiClient, Configuration, VmApi
from cloudtower.utils import wait_tasks

conf = Configuration(host="http://192.168.96.133/v2/api")
conf.api_key["Authorization"] = "token"
api_client = ApiClient(conf)

vm_api = VmApi(api_client)
with_task_vms = vm_api.force_shut_down_vm({
    "where": {
        "id_in": ["vm_id_1", "vm_id_2"]
    }
})

tasks = [with_task_vm.task_id for with_task_vm in with_task_vms]
ids = [with_task_vm.data.id for with_task_vm in with_task_vms]
wait_tasks(tasks, api_client)

closed_vms = vm_api.get_vms({"where": {"id_in": ids}})
```

#### Restrating virtual machines

##### Restarting a specific virtual machine

```python
from cloudtower import ApiClient, Configuration, VmApi
from cloudtower.utils import wait_tasks

api_client = ApiClient(Configuration(host="http://192.168.96.133/v2/api"))

vm_api = VmApi(api_client)
with_task_vm = vm_api.restart_vm({
    "where": {
        "id": "vm_id"
    }
})[0]

wait_tasks([with_task_vm.task_id], api_client)

restarted_vm = vm_api.get_vms({"where": {"id": with_task_vm.data.id}})[0]
```

##### Restarting virtual machines in batches

```python
from cloudtower import ApiClient, Configuration, VmApi
from cloudtower.utils import wait_tasks

api_client = ApiClient(Configuration(host="http://192.168.96.133/v2/api"))

vm_api = VmApi(api_client)
with_task_vms = vm_api.restart_vm({
    "where": {
        "id_in": ["vm_id_1", "vm_id_2"]
    }
})

tasks = [with_task_vm.task_id for with_task_vm in with_task_vms]
ids = [with_task_vm.data.id for with_task_vm in with_task_vms]

wait_tasks(tasks, api_client)

restarted_vms = vm_api.get_vms({"where": {"id_in": ids}})
```

##### Forcibly restarting a specific virtual machine

```python
from cloudtower import ApiClient, Configuration, VmApi
from cloudtower.utils import wait_tasks

api_client = ApiClient(Configuration(host="http://192.168.96.133/v2/api"))

vm_api = VmApi(api_client)
with_task_vm = vm_api.force_restart_vm({
    "where": {
        "id": "vm_id"
    }
})[0]

wait_tasks([with_task_vm.task_id], api_client)

restarted_vm = vm_api.get_vms({"where": {"id": with_task_vm.data.id}})[0]
```

##### Forcibly restarting virtual machines in batches

```python
from cloudtower import ApiClient, Configuration, VmApi
from cloudtower.utils import wait_tasks

api_client = ApiClient(Configuration(host="http://192.168.96.133/v2/api"))

vm_api = VmApi(api_client)
with_task_vms = vm_api.force_restart_vm({
    "where": {
        "id_in": ["vm_id_1", "vm_id_2"]
    }
})

tasks = [with_task_vm.task_id for with_task_vm in with_task_vms]
ids = [with_task_vm.data.id for with_task_vm in with_task_vms]

wait_tasks(tasks, api_client)

restarted_vms = vm_api.get_vms({"where": {"id_in": ids}})
```

#### Suspending virtual machines

##### Suspending a specific virtual machine

```python
from cloudtower import ApiClient, Configuration, VmApi
from cloudtower.utils import wait_tasks

api_client = ApiClient(Configuration(host="http://192.168.96.133/v2/api"))

vm_api = VmApi(api_client)
with_task_vm = vm_api.suspend_vm({
    "where": {
        "id": "vm_id"
    }
})[0]

wait_tasks([with_task_vm.task_id], api_client)

suspended_vm = vm_api.get_vms({"where": {"id": with_task_vm.data.id}})[0]
```

##### Suspending virtual machines in batches

```python
from cloudtower import ApiClient, Configuration, VmApi
from cloudtower.utils import wait_tasks

api_client = ApiClient(Configuration(host="http://192.168.96.133/v2/api"))

vm_api = VmApi(api_client)
with_task_vms = vm_api.suspend_vm({
    "where": {
        "id_in": ["vm_id_1", "vm_id_2"]
    }
})

tasks = [with_task_vm.task_id for with_task_vm in with_task_vms]
ids = [with_task_vm.data.id for with_task_vm in with_task_vms]

wait_tasks(tasks, api_client)

suspended_vms = vm_api.get_vms({"where": {"id_in": ids}})
```

#### Resuming virtual machines

##### Resuming a specific virtual machine

```python
from cloudtower import ApiClient, Configuration, VmApi
from cloudtower.utils import wait_tasks

api_client = ApiClient(Configuration(host="http://192.168.96.133/v2/api"))

vm_api = VmApi(api_client)
with_task_vm = vm_api.resume_vm({
    "where": {
        "id": "vm_id"
    }
})[0]

wait_tasks([with_task_vm.task_id], api_client)

resumed_vm = vm_api.get_vms({"where": {"id": with_task_vm.data.id}})[0]
```

##### Resuming virtual machines in batches

```python
from cloudtower import ApiClient, Configuration, VmApi
from cloudtower.utils import wait_tasks

api_client = ApiClient(Configuration(host="http://192.168.96.133/v2/api"))

vm_api = VmApi(api_client)
with_task_vms = vm_api.resume_vm({
    "where": {
        "id_in": ["vm_id_1", "vm_id_2"]
    }
})

tasks = [with_task_vm.task_id for with_task_vm in with_task_vms]
ids = [with_task_vm.data.id for with_task_vm in with_task_vms]

wait_tasks(tasks, api_client)

resumed_vms = vm_api.get_vms({"where": {"id_in": ids}})
```

### Deleting a virtual machine

#### Recycle bin

##### Moving virtual machines to the recycle bin

```python
from cloudtower import ApiClient, Configuration, VmApi
from cloudtower.utils import wait_tasks

api_client = ApiClient(Configuration(host="http://192.168.96.133/v2/api"))

vm_api = VmApi(api_client)
with_task_delete_vms = vm_api.move_vm_to_recycle_bin({
    "where": {
        "id_in": ["vm_id_1", "vm_id_2"]
    }
})

tasks = [with_task_delete_vm.task_id for with_task_delete_vm in with_task_delete_vms]
ids = [with_task_vm.data.id for with_task_vm in with_task_vms]

wait_tasks(tasks, api_client)

vm_moved_to_recycle_bin = vm_api.get_vms({"where": {"id_in": ids}})
```

##### Restoring virtual machines from the recycle bin

```python
from cloudtower import ApiClient, Configuration, VmApi
from cloudtower.utils import wait_tasks

api_client = ApiClient(Configuration(host="http://192.168.96.133/v2/api"))

vm_api = VmApi(api_client)
with_task_delete_vms = vm_api.recover_vm_from_recycle_bin({
    "where": {
        "id_in": ["vm_id_1", "vm_id_2"]
    }
})

tasks = [with_task_delete_vm.task_id for with_task_delete_vm in with_task_delete_vms]
ids = [with_task_vm.data.id for with_task_vm in with_task_vms]

wait_tasks(tasks, api_client)

recovered_vms = vm_api.get_vms({"where": {"id_in": ids}})
```

#### Permanently deleting virtual machines

```python
from cloudtower import ApiClient, Configuration, VmApi
from cloudtower.utils import wait_tasks

api_client = ApiClient(Configuration(host="http://192.168.96.133/v2/api"))

vm_api = VmApi(api_client)
with_task_delete_vms = vm_api.delete_vm({
    "where": {
        "id_in": ["vm_id_1", "vm_id_2"]
    }
})

tasks = [with_task_delete_vm.task_id for with_task_delete_vm in with_task_delete_vms]

wait_tasks(tasks, api_client)
```

## Example scenarios

### Backing up a virtual machine

```python
from cloudtower import ApiClient
from cloudtower.api.vm_api import VmApi
from cloudtower.api.vm_snapshot_api import VmSnapshotApi
from cloudtower.api.iscsi_lun_snapshot_api import IscsiLunSnapshotApi
from cloudtower.models import (
    ConsistentType,
    VmToolsStatus
)
from cloudtower.utils import wait_tasks


def create_vm_snapshot(
    api_client: ApiClient,
    target_vm_name: str,
    target_snapshot_name: str,
    consistent_type: ConsistentType
):
    vm_api = VmApi(api_client)
    vm_snapshot_api = VmSnapshotApi(api_client)
    iscsi_lun_snapshot_api = IscsiLunSnapshotApi(api_client)
    # 1. Obtain the virtual machine information for the backup. Here, we use the virtual machine ID to build the parameters for creating a snapshot.
    vm = vm_api.get_vms({
        "where": {
            "name": target_vm_name
        },
        "first": 1
    })
    # When VMTools is installed and is functioning normally, set consistent_type to FILE_SYSTEM_CONSISTENT to create a file-system-consistent snapshot.
    if vm.vm_tools_status != VmToolsStatus.RUNNING and consistent_type == ConsistentType.FILE_SYSTEM_CONSISTENT:
        consistent_type = ConsistentType.CRASH_CONSISTENT

    # 2. Create the virtual machine snapshot.
    snapshots_with_task = vm_snapshot_api.create_vm_snapshot({
        "data": [
            {
                "vm_id": vm.id,
                "name": target_snapshot_name,
                "consistent_type": consistent_type
            }
        ]
    })

    # 3. Wait for the task to complete.
    wait_tasks([snapshots_with_task[0].task_id], api_client)

    # 4. Query the created VM snapshot by the returned ID.
    snapshot = vm_snapshot_api.get_vm_snapshots({
        "where": {
            "id": snapshots_with_task.data.id
        }
    })[0]
    # 5. Extract the virtual disk information from vm_disks in the returned snapshot.
    # The DISK type represents a volume. Each may include a snapshot_local_id, which is the local_id of the corresponding LUN snapshot.
    # The CD-ROM type represents a mounted CD-ROM, which does not generate any LUN snapshots.

    lun_snapshot_ids = []
    for disk in snapshot.vm_disks:
        if disk.type == "DISK":
            lun_snapshot_ids.append(disk.snapshot_local_id)

    lun_snapshots = iscsi_lun_snapshot_api.get_iscsi_lun_snapshots({
        "where": {
            "name_in": lun_snapshot_ids
        }
    })

    return {
        "vm_snapshot": snapshot,
        "lun_snapshots": lun_snapshots
    }
```

### Building dashboard

#### Defining utility methods

```python
from functools import reduce
from datetime import datetime, timedelta
from cloudtower import ApiClient
from cloudtower.configuration import Configuration
from cloudtower.models import SeverityEnum, ClusterType, Hypervisor, DiskType, DiskUsageStatus, DiskHealthStatus
from cloudtower.api import VmApi, ClusterApi, AlertApi, HostApi, DiskApi, ClusterSettingsApi, GlobalSettingsApi

api_client = ApiClient(Configuration(host="http://192.168.96.133/v2/api"))

byte_units = ["B", "KiB", "MiB", "GiB", "TiB", "PiB"]
hz_units = ["Hz", "KHz", "MHz", "GHz", "THz"]


def format_unit(base: int, units, step=1024):
    if not len(units):
        raise Exception("no unit provided")
    if base <= 0:
        return "0" + units[0]
    for unit in units:
        if base < step:
            return "{:.2f}{}".format(base, unit)
        base /= step
    return "{:.2f}{}".format(base, units[-1])
```

#### Building alert information

```python
def build_alerts(api_client: ApiClient, cluster_ids):
    alert_api = AlertApi(api_client)
    alerts = alert_api.get_alerts({
        "where": {
            "ended": False,
            "cluster": {
                "id_in": cluster_ids
            },
        }
    })
    critial_alerts = [
        alert for alert in alerts if alert.severity == SeverityEnum.CRITICAL]
    notice_alerts = [
        alert for alert in alerts if alert.severity == SeverityEnum.NOTICE]
    info_alerts = [
        alert for alert in alerts if alert.severity == SeverityEnum.INFO]
    return {
        "critical": critial_alerts,
        "notice": notice_alerts,
        "info": info_alerts
    }
```

#### Building disk information

> Use mechanical hard drives (HDDs) as an example.

```python
def build_hdd_info(api_client: ApiClient, cluster_ids):
    disk_api = DiskApi(api_client)
    disks = disk_api.get_disks({
        "where": {
            "host": {
                "cluster": {
                    "id_in": cluster_ids
                }
            }
        }
    })
    hdd = {
        "healthy": 0,
        "warning": 0,
        "error": 0,
        "total": 0,
    }
    for disk in disks:
        if disk.type == DiskType.HDD:
            if disk.health_status in [DiskHealthStatus.UNHEALTHY, DiskHealthStatus.SUBHEALTHY, DiskHealthStatus.SMART_FAILED]:
                hdd['error'] += 1
            elif disk.usage_status in [DiskUsageStatus.UNMOUNTED, DiskUsageStatus.PARTIAL_MOUNTED]:
                hdd['warning'] += 1
            else:
                hdd['healthy'] += 1
            hdd['total'] += 1
    return hdd
```

#### Building performance metrics

> Retrieve the number of CPU cores, total CPU frequency, CPU utilization, total memory, used memory, total storage capacity, used storage capacity, failed storage capacity, and available storage capacity of a specified cluster.

```python
def build_metrics(api_client: ApiClient, clusters, cluster_ids):
    result = {}
    host_api = HostApi(api_client)
    hosts = host_api.get_hosts({
        "where": {
            "cluster": {
                "id_in": cluster_ids
            }
        }
    })
    cpu = {
        "total_cpu_cores": 0,
        "total_cpu_hz": 0,
        "used_cpu_hz": 0,
    }
    memory = {
        "total_memory": 0,
        "used_memory": 0,
    }
    storage = {
        "total": 0,
        "used": 0,
        "invalid": 0,
        "available": 0
    }

    for host in hosts:
        cluster = next(
            cluster for cluster in clusters if cluster.id == host.cluster.id)
        if cluster.hypervisor == Hypervisor.ELF:
            memory['total_memory'] += 0 if host.total_memory_bytes is None else host.total_memory_bytes
            memory['used_memory'] += (0 if host.running_pause_vm_memory_bytes is None else host.running_pause_vm_memory_bytes) + \
                (0 if host.os_memory_bytes is None else host.os_memory_bytes)

    for cluster in clusters:
        if cluster.type == ClusterType.SMTX_OS:
            cpu["total_cpu_cores"] += 0 if cluster.total_cpu_cores is None else cluster.total_cpu_cores
            cpu["total_cpu_hz"] += 0 if cluster.total_cpu_hz is None else cluster.total_cpu_hz
            cpu["used_cpu_hz"] += 0 if cluster.used_cpu_hz is None else cluster.used_cpu_hz
            if cluster.hypervisor == Hypervisor.VMWARE:
                memory["total_memory"] += 0 if cluster.total_memory_bytes is None else cluster.total_memory_bytes
                memory["used_memory"] += 0 if cluster.used_memory_bytes is None else cluster.used_memory_bytes
        storage["total"] += 0 if cluster.total_data_capacity is None else cluster.total_data_capacity
        storage["used"] += 0 if cluster.used_data_space is None else cluster.used_data_space
        storage["invalid"] += 0 if cluster.failure_data_space is None else cluster.failure_data_space
    if len([cluster for cluster in clusters if cluster.type != ClusterType.SMTX_ZBS]) > 1:
        cpu["cpu_usage"] = "{:.2f}%".format(
            cpu["used_cpu_hz"] / cpu["total_cpu_hz"])
        cpu["total_cpu_hz"] = format_unit(cpu["total_cpu_hz"], hz_units, 1000)
        cpu["used_cpu_hz"] = format_unit(cpu["used_cpu_hz"], hz_units, 1000)
        result['cpu'] = cpu
        memory["memory_usage"] = "{:.2f}%".format(
            memory["used_memory"] / memory["total_memory"])
        memory["total_memory"] = format_unit(
            memory["total_memory"], byte_units)
        memory["used_memory"] = format_unit(
            memory["used_memory"], byte_units)
        result["memory"] = memory
    storage["available"] = format_unit(
        storage["total"] - storage["used"] - storage["invalid"], byte_units)
    storage["total"] = format_unit(storage["total"], byte_units)
    storage["used"] = format_unit(storage["used"], byte_units)
    storage["invalid"] = format_unit(storage["invalid"], byte_units)
    result["storage"] = storage
    return result
```

#### Building dashboard

```python
def build_dashboard(api_client: ApiClient, datacenter_id: str = None, cluster_id: str = None):
    result = {}
    cluster_api = ClusterApi(api_client)
    clusters = cluster_api.get_clusters({
        "where": {"id": cluster_id} if cluster_id is not None else {"datacenters_some": {"id": datacenter_id}} if datacenter_id is not None else None
    })
    cluster_ids = [cluster.id for cluster in clusters]

    result["alerts"] = build_alerts(api_client, cluster_ids)
    result["hdd"] = build_hdd_info(api_client, cluster_ids)
    metric = build_metrics(api_client, clusters, cluster_ids)
    if "cpu" in metric:
        result["cpu"] = metric["cpu"]
    if "memory" in metric:
        result["memory"] = metric["memory"]
    if "storage" in metric:
        result["storage"] = metric["storage"]
    return result
```
