import CodeBlock from '@theme/CodeBlock';
import CodeTerminology from '@site/code-terminology.json';

export default function PythonCreateWithNewVolumePython() {
  return (
    <CodeBlock language="python">
{`from ${CodeTerminology["python_from_package"]} import (
    ApiClient,
    Configuration,
    VmApi,
    VmStatus,
    VmFirmware,
    Bus,
    VmVolumeElfStoragePolicyType
)
from ${CodeTerminology["python_from_package"]}.utils import wait_tasks
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
})`}
    </CodeBlock>
  );
}
