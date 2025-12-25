import CodeBlock from '@theme/CodeBlock'
import CodeTerminology from '@site/code-terminology.json'

<CodeBlock language="python">
{`from ${CodeTerminology["python_from_package"]}.api import VmApi, ContentLibraryVmTemplateApi, ClusterApi
from ${CodeTerminology["python_from_package"]}.utils import login, wait_tasks
from ${CodeTerminology["python_from_package"]}.configuration import Configuration
from ${CodeTerminology["python_from_package"]}.models import Bus, VmVolumeElfStoragePolicyType
from ${CodeTerminology["python_from_package"]} import ApiClient
import os
configuration = Configuration(host=os.getenv("${CodeTerminology["endpoint_placeholder"]}"))
client = ApiClient(configuration)
login(client, os.getenv("${CodeTerminology["username_placeholder"]}"), os.getenv("${CodeTerminology["password_placeholder"]}"))
def create_vm_from_template_modify_disk(template_name, cluster_name, vm_name, disk_operate):
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
            "disk_operate": disk_operate
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
def create_vm_from_template_modify_disk_example():
    disk_operate = {
        "remove_disks": {
            "disk_index": [0]  # 用于删除指定 index 的磁盘，index 从 0 开始计算，这里既是删除第一块磁盘
        },
        "new_disks": {
            "mount_cd_roms": [
                {
                    "boot": 2,  # 启动顺序
                    "content_library_image_id": ""  # 指定挂载内容库镜像的 id
                }
            ],
            "mount_disks": [
                {
                    "boot": 3,  # 启动顺序
                    "bus": Bus.VIRTIO,  # 总线类型
                    "vm_volume_id": "cljm6x2g1405g0958tp3zkhvh"  # 被挂载虚拟卷的 id
                }
            ],
            "mount_new_create_disks": [
                {
                    "boot": 4,
                    "bus": Bus.VIRTIO,
                    "vm_volume": {
                        "name": "test",  # 新建虚拟卷的名称
                        "size": 10 * 1024 * 1024 * 1024,  # 新建虚拟卷的大小，单位是字节
                        "elf_storage_policy": VmVolumeElfStoragePolicyType._2_THIN_PROVISION  # 存储策略
                    }
                }
            ]
        }
    }
    create_vm_from_template_modify_disk("template-name", "cluster-name", "vm-name", disk_operate)`}
</CodeBlock>

