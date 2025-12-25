import CodeBlock from '@theme/CodeBlock';
import CodeTerminology from '@site/code-terminology.json';

export default function PythonSuspendPython() {
  return (
    <CodeBlock language="python">
{`from ${CodeTerminology["python_from_package"]} import ApiClient, Configuration, VmApi
from ${CodeTerminology["python_from_package"]}.utils import wait_tasks
api_client = ApiClient(Configuration(host="http://192.168.96.133/v2/api"))
vm_api = VmApi(api_client)
with_task_vm = vm_api.suspend_vm({
    "where": {
        "id": "vm_id"
    }
})[0]
wait_tasks([with_task_vm.task_id], api_client)
suspended_vm = vm_api.get_vms({"where": {"id": with_task_vm.data.id}})[0]`}
    </CodeBlock>
  );
}
