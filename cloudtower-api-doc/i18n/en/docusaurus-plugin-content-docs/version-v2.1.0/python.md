---
id: python-sdk
slug: /python-sdk
---

# Cloudtower Python SDK

The Cloudtower SDK in Python for versions of 2.7, 3.4 and above.

- [Source Address](https://github.com/smartxworks/cloudtower-python-sdk)
- [Download Links](https://github.com/smartxworks/cloudtower-python-sdk/releases)

## Install

- ### whl

  ```shell
  pip install cloudtower_sdk-1.9.0-py2.py3-none-any.whl
  ```

- ### tar.gz

  ```shell
  tar xvzf cloudtower-sdk-1.9.0.tar.gz
  cd cloudtower-sdk-1.90.tar.gz
  python setup.py install
  ```

- ### git source installation

  ```
  git clone https://github.com/smartxworks/cloudtower-python-sdk.git
  cd clodtower-python-sdk
  python setup.py install
  ```

- ### git pip installation

  ```shell
  pip install git+https://github.com/smartxworks/cloudtower-python-sdk.git
  ```

- ### pypi installation
  ```shell
  pip install cloudtower-sdk
  ```

## The Use of SDK

### Create an instance

#### Create an `ApiClient` instance

```python
from cloudtower.configuration import Configuration
from cloudtower import ApiClient
# Configure operation-api endpoint
configuration = Configuration(host="http://192.168.96.133/v2/api")
client = ApiClient(configuration)
```

#### Create a corresponding API instance

> Create a relevant API instance based on operations for different purposes, e.g., a `VmApi` needs to be created for the operations related to virtual machines.

```python
from cloudtower.api.vm_api import VmApi
vm_api = VmApi(client)
```

### Authentication

```python
from cloudtower.api.user_api import UserApi
from cloudtower.models import UserSource
# Obtain a token through the login method in UserApi.
user_api = UserApi(client)
login_res = user_api.login({
    "username": "your_username",
    "password": "your_password",
    "source": UserSource.LOCAL
})
# Configure the token in configuration.api_key["Authorization"],
# so that all the APIs using the current client will get the token information of authentication.
configuration.api_key["Authorization"] = login_res.data.token
```

### Send a request

#### Get resources

```python
vms = vm_api.get_vms({
  "where": {
    "id": "vm_id"
  },
  "first":1,
})
```

#### Update resources

> Resource updates will generate relevant asynchronous tasks. When an asynchronous task finishes, the resource operations are completed and the data has been updated.

```python
start_res = vm_api.start_vm({
  "where": {
    "id": "stopped_vm_id"
  },
})
```

> Users can synchronously wait for the asynchronous task to finish through the provided tool method.

```python
from cloudtower.utils import wait_tasks
try:
 wait_tasks([res.task_id for res in start_res], api_client)
except ApiException as e:
 # Handle errors
else:
 # Callback after the task finishes
```

##### Description of Method Parameters

| Parameter name | Type      | Required | Description                                                                                                                                      |
| -------------- | --------- | -------- | ------------------------------------------------------------------------------------------------------------------------------------------------ |
| ids            | list[str] | Yes      | The id list of the tasks to be queried.                                                                                                          |
| api_client     | ApiClient | Yes      | The ApiClient instance used by the query.                                                                                                        |
| interval       | int       | No       | The polling interval with the default value of 5s.                                                                                               |
| timeout        | int       | No       | The timeout with the default value of 300s.                                                                                                      |
| exit_on_error  | bool      | No       | Whether to exit immediately when a single task fails, otherwise wait for all the tasks to finish before exiting, and the default value is False. |

##### Error Description

| Error code | Description                            |
| ---------- | -------------------------------------- |
| 408        | Timeout                                |
| 500        | An internal error of asynchronous task |

#### Custom header

> The cloudtower APIs support setting the language of the returned information by setting the content-language in the header. The optional values are `en-US` and `zh-CN`, and the default is `en-US`.

##### By using the `set_default_header` method of `ApiClient`

> The default header information can be set using the `set_default_header` method of `ApiClient`.

```python
api_client.set_default_header("content_language","en-US")
alert_api = AlertApi(api_client)
# The message, solution, cause, impact in the alerts obtained at this time will be converted into English descriptions.
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

##### By setting the keyword parameter of the request

> The language of the returned information can also be set by setting the keyword parameter `content_language` of the request.

```python
from cloudtower.api.user_api import AlertApi

alert_api = AlertApi(api_client)
# The message, solution, cause, impact in the alerts obtained at this time will be converted into Chinese descriptions.
alerts = alert_api.get_alerts(
  {
    "where": {
      "cluster": {
        "id": "cluster_id"
      }
    },
    "first": 100
  },
  content_language="zh-CN"
)
```

#### Others

##### Send an asynchronous request

> The sending of the above requests are all synchronous and will block the current process. If users need to use an asynchronous request, please add `async_req=True` to the keyword parameter of the corresponding request.
> And obtain the corresponding result from the returned value of `ApplyResult.get()`.

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

### Destroy an ApiClient instance after use

```python
client.close()
```

## Operation Examples

### Get a virtual machine

#### Get all virtual machines

```python
from cloudtower import ApiClient, Configuration, VmApi

conf = Configuration(host="http://192.168.96.133/v2/api")
conf.api_key["Authorization"] = "token"
api_client = ApiClient(conf)
vm_api = VmApi(api_client)

vms = vm_api.get_vms({})
```

#### Get virtual machines by page

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

#### Get all powered-on virtual machines

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

#### Get virtual machines with a specific string in their names or descriptions

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

#### Get all virtual machines with vcpu > n

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

### Create a virtual machine from a template

#### Specify ids only

```python
from cloudtower import ApiClient, Configuration, VmApi
from cloudtower.utils import wait_tasks

conf = Configuration(host="http://192.168.96.133/v2/api")
conf.api_key["Authorization"] = "token"
api_client = ApiClient(conf)
vm_api = VmApi(api_client)

with_task_vms = vm_api.create_vm_from_template([
    {
        "template_id": "template_id",
        "cluster_id": "cluster_id",
        "name": "vm_name",
        "is_full_copy": False
    }
])
tasks = [with_task_vm.task_id for with_task_vm in with_task_vms]
vm_ids = [
    with_task_vm.data.id for with_task_vm in with_task_vms]
wait_tasks(tasks, api_client)
created_vms = vm_api.get_vms({
    "where": {
        "id_in": vm_ids
    }
})
```

#### Configure the NIC parameters which are different from those of the template

```python
from cloudtower import ApiClient, Configuration, VmApi, VmNicModel
from cloudtower.utils import wait_tasks

conf = Configuration(host="http://192.168.96.133/v2/api")
conf.api_key["Authorization"] = "token"
api_client = ApiClient(conf)
vm_api = VmApi(api_client)
with_task_vms = vm_api.create_vm_from_template([
    {
        "template_id": "template_id",
        "cluster_id": "cluster_id",
        "name": "vm_name",
        "is_full_copy": False,
        "vm_nics": [
            {
                "connect_vlan_id": "vlan_id",
                "enabled": True,
                "model": VmNicModel.E1000
            }
        ]
    }
])
tasks = [with_task_vm.task_id for with_task_vm in with_task_vms]
vm_ids = [
    with_task_vm.data.id for with_task_vm in with_task_vms]
wait_tasks(tasks, api_client)
created_vms = vm_api.get_vms({
    "where": {
        "id_in": vm_ids
    }
})
```

### Create a blank virtual machine

#### Create a virtual machine simply

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

#### Configure a virtual disk during creation

##### Load an ISO from CD-ROM

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

##### Mount a virtual volume as a virtual disk

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

##### Add and mount a virtual disk

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

#### Configure a virtual NIC during creation

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

### Edit a virtual machine

#### Edit basic information

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

#### Edit a CD-ROM

##### Add a CD-ROM

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

##### Delete a CD-ROM

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

#### Virtual volume operations

##### Add a new virtual volume

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

##### Mount an existing virtual volume as a virtual disk

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

##### Unmount a virtual disk

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

#### NIC operations

##### Add a NIC

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

##### Edit a NIC

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

##### Delete a NIC

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

#### Virtual machine migration

##### Migrate to a specified host

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

##### Schedule to an appropriate host automatically

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

### Virtual machine power operations

#### Power on a virtual machine

##### The specified virtual machine is powered on and scheduled to an appropriate virtual machine automatically

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

##### The virtual machines are powered on in batch and scheduled to appropriate virtual machines automatically

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

##### The virtual machine is powered on to a specified host

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

#### Power off a virtual machine

##### Shut down the specified virtual machine

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

##### Shut down the virtual machines in batch

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

##### Power off the specified virtual machine

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

##### Power off virtual machines in batch

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

#### Reboot a virtual machine

##### Reboot the specified virtual machine

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

##### Reboot the virtual machines in batch

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

##### Force reboot the specified virtual machine

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

##### Force reboot the virtual machines in batch

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

#### Suspend a virtual machine

##### Suspend the specified virtual machine

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

##### Suspend the virtual machines in batch

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

#### Resume a virtual machine

##### Resume the specified virtual machine

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

##### Resume the virtual machines in batch

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

### Delete a virtual machine

#### Recycle bin

##### Move to recycle bin

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

##### Recover from recycle bin

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

#### Delete permanently

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

## A scenario example

### Backup a virtual machine

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
    # 1. Get the information of the virtual machine to be backed up, here we need the id of the virtual machine to construct the parameters for creating a snapshot.
    vm = vm_api.get_vms({
        "where": {
            "name": target_vm_name
        },
        "first": 1
    })
    # When the VMTools has been installed and started in the virtual machine, the consistent_type can use FILE_SYSTEM_CONSISTENT to represent a file system consistency snapshot.
    if vm.vm_tools_status != VmToolsStatus.RUNNING and consistent_type == ConsistentType.FILE_SYSTEM_CONSISTENT:
        consistent_type = ConsistentType.CRASH_CONSISTENT

    # 2. Create a snapshot of the virtual machine.
    snapshots_with_task = vm_snapshot_api.create_vm_snapshot({
        "data": [
            {
                "vm_id": vm.id,
                "name": target_snapshot_name,
                "consistent_type": consistent_type
            }
        ]
    })

    # 3. Wait for the task to finish.
    wait_tasks([snapshots_with_task[0].task_id], api_client)

    # 4. Query the generated virtual machine snapshot according to the returned id.
    snapshot = vm_snapshot_api.get_vm_snapshots({
        "where": {
            "id": snapshots_with_task.data.id
        }
    })[0]
    # 5. The vm_disks in the returned snapshot includes the virtual disk information of the snapshot.
    # If the type is DISK, it indicates a corresponding volume, which contains a snapshot_local_id, indicating the local_id of the lun snapshot corresponding to the virtual volume.
    # If the type is CD-ROM, it indicates a mounted CD-ROM, and no lun snapshot has been generated.
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

### Build Dashboard

#### Define utility methods

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

#### Build alart information

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

#### Build hard disk information

> Here is an example of a mechanical hard disk

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

#### Build performance metrics

> Get total CPU cores, total CPU frequency, used CPU frequency, total memory, used memory, total storage, used storage, invalid storage, and available storage of the specified cluster.

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

#### Build Dashboard

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
