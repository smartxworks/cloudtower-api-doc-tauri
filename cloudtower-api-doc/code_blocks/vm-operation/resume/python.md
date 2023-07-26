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
