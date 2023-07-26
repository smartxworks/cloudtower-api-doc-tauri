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
