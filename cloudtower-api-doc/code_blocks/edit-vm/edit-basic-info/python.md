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
