---
title: Python
---
import Terminology from '@site/terminology.json'

<>The {Terminology['en-US']['PRODUCT']} SDK in Python for versions of 2.7, 3.4 and above.</>

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

> if https connection is required，cert should be installed，or skip verify cert

```python
configuration = Configuration(host="https://192.168.96.133/v2/api")
configuration.verify_ssl = False
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
<blockquote>
The {Terminology['en-US']['PRODUCT']} APIs support setting the language of the returned information by setting the content-language in the header. The optional values are `en-US` and `zh-CN`, and the default is `en-US`.
</blockquote>

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
from cloudtower.api.alert_api import AlertApi

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


## Scenario Examples

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
