import CodeBlock from '@theme/CodeBlock'
import CodeTerminology from '@site/code-terminology.json'

<CodeBlock language="python">
{`from ${CodeTerminology["python_from_package"]}.api import VmApi, ContentLibraryVmTemplateApi, ClusterApi
from ${CodeTerminology["python_from_package"]}.utils import login, wait_tasks
from ${CodeTerminology["python_from_package"]}.configuration import Configuration
from ${CodeTerminology["python_from_package"]}.models import Bus, VmNicModel
from ${CodeTerminology["python_from_package"]} import ApiClient
import os
configuration = Configuration(host=os.getenv("${CodeTerminology["endpoint_placeholder"]}"))
client = ApiClient(configuration)
login(client, os.getenv("${CodeTerminology["username_placeholder"]}"), os.getenv("${CodeTerminology["password_placeholder"]}"))
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
    create_vm_from_template_modified_nic("template_name", "cluster_name", "vm_name", nic_params)`}
</CodeBlock>

