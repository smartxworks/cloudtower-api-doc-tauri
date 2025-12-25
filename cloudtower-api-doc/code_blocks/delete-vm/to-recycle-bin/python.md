import CodeBlock from '@theme/CodeBlock';
import CodeTerminology from '@site/code-terminology.json';

export default function PythonToRecycleBinPython() {
  return (
    <CodeBlock language="python">
{`from ${CodeTerminology["python_from_package"]} import ApiClient, Configuration, VmApi
from ${CodeTerminology["python_from_package"]}.utils import wait_tasks
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
vm_moved_to_recycle_bin = vm_api.get_vms({"where": {"id_in": ids}})`}
    </CodeBlock>
  );
}
