import CodeBlock from '@theme/CodeBlock';
import CodeTerminology from '@site/code-terminology.json';

export default function PythonStartToPython() {
  return (
    <CodeBlock language="python">
{`from ${CodeTerminology["python_from_package"]} import ApiClient, Configuration, VmApi
from ${CodeTerminology["python_from_package"]}.utils import wait_tasks
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
opened_vm = vm_api.get_vms({"where": {"id": with_task_vm.data.id}})[0]`}
    </CodeBlock>
  );
}
