---
title: Python
---
import Terminology from '@site/terminology.json'
import CodeTerminology from '@site/code-terminology.json'
import CodeBlock from '@theme/CodeBlock'

<>Python 环境下的 {Terminology['terminology']['zh-CN']['PRODUCT']} SDK，适用于 2.7 和 3.4 及以上版本</>

- <a href={`https://github.com/${CodeTerminology["python_github_address"]}`}>源码地址</a>
- <a href={`https://github.com/${CodeTerminology["python_github_address"]}/releases`}>下载地址</a>

## 安装

- ### whl

  <CodeBlock language="shell">
{`  pip install ${CodeTerminology["python_package_1"]}-2.21.0-py2.py3-none-any.whl`}
</CodeBlock>

- ### tar.gz

  <CodeBlock language="shell">
{`  tar xvzf ${CodeTerminology["python_package"]}-2.21.0.tar.gz
  cd ${CodeTerminology["python_package"]}-2.21.0
  python setup.py install`}
</CodeBlock>

- ### git 源码安装

  <CodeBlock>
  {`git clone https://github.com/${CodeTerminology["python_github_address"]}.git
  cd ${CodeTerminology["python_sdk"]}
  python setup.py install
  `}
  </CodeBlock>

- ### git pip 安装

  <CodeBlock language="shell">
{`pip install git+https://github.com/${CodeTerminology["python_github_address"]}.git`}
</CodeBlock>

- ### pypi 安装
  <CodeBlock language="shell">
{`  pip install ${CodeTerminology["python_package"]}`}
</CodeBlock>

## 使用

### 创建实例

#### 创建 `ApiClient` 实例

<CodeBlock language="python">
{`from ${CodeTerminology["python_from_package"]}.configuration import Configuration
from ${CodeTerminology["python_from_package"]} import ApiClient
# 配置 operation-api endpoint
configuration = Configuration(host="http://192.168.96.133/v2/api")
client = ApiClient(configuration)`}
</CodeBlock>

> 如果需要使用 https，可以安装证书，或者忽略证书验证

<CodeBlock language="python">
{`configuration = Configuration(host="https://192.168.96.133/v2/api")
configuration.verify_ssl = False
client = ApiClient(configuration)`}
</CodeBlock>

#### 创建对应的 API 实例

> 根据不同用途的操作创建相关的 API 实例，例如虚拟机相关操作需要创建一个 `VmApi`。

<CodeBlock language="python">
{`from ${CodeTerminology["python_from_package"]}.api.vm_api import VmApi
vm_api = VmApi(client)`}
</CodeBlock>

### 鉴权

> 可以通过 utils 中封装的登陆方法来鉴权 `ApiClient`

<CodeBlock language="python">
{`from ${CodeTerminology["python_from_package"]}.utils import wait_tasks, login
conf = Configuration(host="http://${CodeTerminology["endpoint_placeholder"]}.com/v2/api")
api_client = ApiClient(conf)
login(api_client, "your_username", "your_password") # 默认使用 LOCAL 作为 usersource`}
</CodeBlock>

> 也可以直接将 token 应用置 `configuration` 的 `api_key` 中

<CodeBlock language="python">
{`from ${CodeTerminology["python_from_package"]}.api.user_api import UserApi
from ${CodeTerminology["python_from_package"]}.models import UserSource
# 通过 UserApi 中的 login 方法来获得 token。
user_api = UserApi(client)
login_res = user_api.login({
    "username": "your_username",
    "password": "your_password",
    "source": UserSource.LOCAL
})
# 将 token 配置在 configuration.api_key["Authorization"] 中，
# 这样所有使用当前 client 的 api 都会获得鉴权的 token 信息。
configuration.api_key["Authorization"] = login_res.data.token`}
</CodeBlock>

### 发送请求

#### 获取资源

<CodeBlock language="python">
{`vms = vm_api.get_vms({
  "where": {
    "id": "vm_id"
  },
  "first":1,
})`}
</CodeBlock>

#### 更新资源

> 资源更新会产生相关的异步任务，当异步任务结束时，代表资源操作完成且数据已更新。

<CodeBlock language="python">
{`start_res = vm_api.start_vm({
  "where": {
    "id": "stopped_vm_id"
  },
})`}
</CodeBlock>

> 可以通过提供的工具方法同步等待异步任务结束

<CodeBlock language="python">
{`from ${CodeTerminology["python_from_package"]}.utils import wait_tasks
try:
 wait_tasks([res.task_id for res in start_res], api_client)
except ApiException as e:
 # 处理错误
else:
 # task完成后的回调`}
</CodeBlock>

##### 方法参数说明

| 参数名        | 类型      | 是否必须 | 说明                                                                                 |
| ------------- | --------- | -------- | ------------------------------------------------------------------------------------ |
| ids           | list[str] | 是       | 需查询的 task 的 id 列表                                                             |
| api_client    | ApiClient | 是       | 查询所使用的 ApiClient 实例                                                          |
| interval      | int       | 否       | 轮询的间隔时间，默认为 5s                                                            |
| timeout       | int       | 否       | 超时时间，默认为 300s                                                                |
| exit_on_error | bool      | 否       | 是否在单个 Task 出错时立即退出，否则则会等待全部 Task 都完成后再退出，默认为 False。 |

##### 错误说明

| 错误码 | 说明             |
| ------ | ---------------- |
| 408    | 超时             |
| 500    | 异步任务内部错误 |

#### 自定义 header

<>
> {Terminology['terminology']['zh-CN']['PRODUCT']} api 支持通过设置 header 中的 content-language 来设置返回信息的语言, 可选值 `en-US`, `zh-CN`。默认为 `en-US`。
</>

##### 通过 `ApiClient` 的 `set_default_header` 方法

> 可以通过 `ApiClient` 的 `set_default_header` 方法设置默认的 header 信息。

<CodeBlock language="python">
{`api_client.set_default_header("content_language","en-US")
alert_api = AlertApi(api_client)
# 此时得到的 alerts 中的 message, solution, cause, impact 将被转换为英文描述。
alerts = alert_api.get_alerts(
  {
    "where": {
      "cluster": {
        "id": "cluster_id"
      }
    },
    "first": 100
  },
)`}
</CodeBlock>

##### 通过设置请求的关键字参数

> 也可以通过设置请求的关键字参数 `content_language` 来设置返回信息的语言。

<CodeBlock language="python">
{`from ${CodeTerminology["python_from_package"]}.api.user_api import AlertApi
alert_api = AlertApi(api_client)
# 此时得到的 alerts 中的 message, solution, cause, impact 将被转换为中文描述。
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
)`}
</CodeBlock>

#### 其他

##### 发送异步请求

> 上述请求的发送都是同步的请求，会堵塞当前进程。如果需要使用异步请求，请在对应请求的关键字参数中加上 `async_req=True`。
> 通过返回结果 `ApplyResult.get()` 来获取对应的结果。

<CodeBlock language="python">
{`vms = vm_api.get_vms(
  {
    "where": {
      "id": "vm_id"
    }
  },
  async_req=True
)
print(vms.get()[0].name)`}
</CodeBlock>

### 使用完成后销毁 ApiClient 实例

<CodeBlock language="python">
{`client.close()`}
</CodeBlock>

## 操作示例

### 获取虚拟机

#### 获取所有虚拟机

<CodeBlock language="python">
{`from ${CodeTerminology["python_from_package"]} import ApiClient, Configuration, VmApi
conf = Configuration(host="http://192.168.96.133/v2/api")
conf.api_key["Authorization"] = "token"
api_client = ApiClient(conf)
vm_api = VmApi(api_client)
vms = vm_api.get_vms({})`}
</CodeBlock>

#### 分页获取虚拟机

<CodeBlock language="python">
{`from ${CodeTerminology["python_from_package"]} import ApiClient, Configuration, VmApi
conf = Configuration(host="http://192.168.96.133/v2/api")
conf.api_key["Authorization"] = "token"
api_client = ApiClient(conf)
vm_api = VmApi(api_client)
vms_from_51_to_100 = vm_api.get_vms({
  "first": 50,
  "skip": 50,
})`}
</CodeBlock>

#### 获取所有已开机虚拟机

<CodeBlock language="python">
{`from ${CodeTerminology["python_from_package"]} import ApiClient, Configuration, VmApi, VmStatus
conf = Configuration(host="http://192.168.96.133/v2/api")
conf.api_key["Authorization"] = "token"
api_client = ApiClient(conf)
vm_api = VmApi(api_client)
running_vms = vm_api.get_vms(
    {
        "where": {
            "status": VmStatus.RUNNING
        }
    },
)`}
</CodeBlock>

#### 获取名称或描述中包含特定字符串的虚拟机

<CodeBlock language="python">
{`from ${CodeTerminology["python_from_package"]} import ApiClient, Configuration, VmApi
conf = Configuration(host="http://192.168.96.133/v2/api")
conf.api_key["Authorization"] = "token"
api_client = ApiClient(conf)
vm_api = VmApi(api_client)
vms_name_contains = vm_api.get_vms(
    {
        "where": {
            "name_contains": "string"
        }
    },
)`}
</CodeBlock>

#### 获取所有 vcpu > n 的虚拟机

<CodeBlock language="python">
{`from ${CodeTerminology["python_from_package"]} import ApiClient, Configuration, VmApi
conf = Configuration(host="http://192.168.96.133/v2/api")
conf.api_key["Authorization"] = "token"
api_client = ApiClient(conf)
vm_api = VmApi(api_client)
vms_has_4_more_vcpu = vm_api.get_vms(
    {
        "where": {
            "vcpu_gt": 4
        }
    },
)`}
</CodeBlock>

### 从模版创建虚拟机

#### 仅指定 id

<CodeBlock language="python">
{`from ${CodeTerminology["python_from_package"]}.api import VmApi, ContentLibraryVmTemplateApi, ClusterApi
from ${CodeTerminology["python_from_package"]}.utils import login, wait_tasks
from ${CodeTerminology["python_from_package"]}.configuration import Configuration
from ${CodeTerminology["python_from_package"]} import ApiClient
import os
configuration = Configuration(host=os.getenv("${CodeTerminology["endpoint_placeholder"]}"))
client = ApiClient(configuration)
login(client, os.getenv("${CodeTerminology["username_placeholder"]}"), os.getenv("${CodeTerminology["password_placeholder"]}"))
def create_vm_from_template(template_name, cluster_name, vm_name):
    """
    通过内容库模板创建一台虚拟机，内容通过内容库模板设置
    :param template_name: 指定所需使用的内容库模板名称
    :param cluster_name: 指定虚拟机被部署的集群的集群名称
    :param vm_name: 虚拟机名称
    :return: 被创建的虚拟机
    """
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
            "is_full_copy": False
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
    })[0]`}
</CodeBlock>

#### 配置与模板不同的虚拟盘参数

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
    """
    通过内容库模板创建一台虚拟机，配置虚拟机的磁盘
    :param template_name: 模板名称
    :param cluster_name: 集群名称
    :param vm_name: 虚拟机名称
    :param disk_operate: 磁盘操作，使用详见 create_vm_from_template_modify_disk_example 方法
    :return: 被创建的虚拟机
    """
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
    """
    通过模板创建虚拟机时，如果希望对原有的磁盘进行任何修改，可以通过 disk_operate 参数进行配置
    disk_operate 参数的类型是 VmDiskOperate，它是一个字典，包含以下字段：
    - remove_disks 由于删除指定index的磁盘
    - modify_disks 修改现有磁盘的配置，目前仅支持修改总线，如果有其他修改可以通过，删除原有盘
    - new_disks 新增磁盘，类型是 VmDiskParams，它是一个字典，包含以下字段：
        - mount_cd_roms 挂载 cd-rom
        - mount_disks 挂载已有磁盘
        - mount_new_create_disks 挂载新磁盘
    """
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

#### 配置与模版不同的网卡参数

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
    """
    通过内容库模板创建一台虚拟机，配置虚拟机的网卡
    :param template_name: 模板名称
    :param cluster_name: 集群名称
    :param vm_name: 虚拟机名称
    :param nic_params: 磁盘操作，使用详见 create_vm_from_template_modified_nic_example 方法
    :return: 被创建的虚拟机
    """
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
    """
    通过内容库模板创建虚拟机时，如果不传递 vm_nics 参数，会默认使用模板的网卡配置，如果需要修改网卡配置，可以传递 vm_nics 参数，
    vm_nics 参数是一个列表，列表中的每个元素都是一个字典：
    - connect_vlan_id 网卡对应虚拟机网络的 id，并非虚拟机网络的 vlan_id
    - enabled 是否启用网卡
    - model 网卡类型，可以使用 VmNicModel 类的属性，如 VmNicModel.VIRTIO
    创建虚拟机时并不支持修改网卡的 ip，mac，gateway，subnet mask，如果需要配置ip，子网，网关，可以通过 cloudinit 来实现，需要模板支持 cloudinit
    """
    nic_params = [
        {
            "connect_vlan_id": "vlan_id",
            "enabled": True,
            "model": VmNicModel.VIRTIO
        }
    ]
    create_vm_from_template_modified_nic("template_name", "cluster_name", "vm_name", nic_params)`}
</CodeBlock>

### 创建空白虚拟机

#### 简单创建

<CodeBlock language="python">
{`from ${CodeTerminology["python_from_package"]} import (
    ApiClient,
    Configuration,
    VmApi,
    VmStatus,
    VmFirmware,
    Bus
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
        "memory": 4*1024*1024*1024,
        "vcpu": 16,
        "status": VmStatus.STOPPED,
        "firmware": VmFirmware.BIOS,
        "vm_nics": [
            {
                "connect_vlan_id": "vlan_id",
            }
        ],
        "vm_disks": {
            "mount_cd_roms": [{
                "boot": 0,
                "index": 0
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

#### 创建时配置虚拟盘

##### CD-ROM 加载 ISO

<CodeBlock language="python">
{`from ${CodeTerminology["python_from_package"]} import (
    ApiClient,
    Configuration,
    VmApi,
    VmStatus,
    VmFirmware,
    Bus
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
        "memory": 4*1024*1024*1024,
        "vcpu": 16,
        "status": VmStatus.STOPPED,
        "firmware": VmFirmware.BIOS,
        "vm_nics": [
            {
                "connect_vlan_id": "vlan_id",
            }
        ],
        "vm_disks": {
            "mount_cd_roms": [{
                "index": 0,
                "boot": 0,
                "elf_image_id": "elf_image_id"
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

##### 挂载虚拟卷为虚拟盘

<CodeBlock language="python">
{`from ${CodeTerminology["python_from_package"]} import (
    ApiClient,
    Configuration,
    VmApi,
    VmStatus,
    VmFirmware,
    Bus
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
        "memory": 4*1024*1024*1024,
        "vcpu": 16,
        "status": VmStatus.STOPPED,
        "firmware": VmFirmware.BIOS,
        "vm_nics": [
            {
                "connect_vlan_id": "vlan_id",
            }
        ],
        "vm_disks": {
            "mount_disks": [{
                "index": 0,
                "boot": 0,
                "bus": Bus.VIRTIO,
                "vm_volume_id": "vm_volume_id",
                "index": 0,
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

##### 新增并挂载虚拟盘

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

#### 创建时配置虚拟网卡

<CodeBlock language="python">
{`from ${CodeTerminology["python_from_package"]} import (
    ApiClient,
    Configuration,
    VmApi,
    VmStatus,
    VmFirmware,
    Bus,
    VmNicModel,
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
        "name": "vm_name1",
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
                "mirror": True,
                "model": VmNicModel.VIRTIO
            }
        ],
        "vm_disks": {
            "mount_cd_roms": [{
                "index": 0,
                "boot": 0,
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

### 编辑虚拟机

#### 编辑基本信息

<CodeBlock language="python">
{`from ${CodeTerminology["python_from_package"]} import ApiClient, Configuration, VmApi
from ${CodeTerminology["python_from_package"]}.utils import wait_tasks
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
})`}
</CodeBlock>

#### CD-ROM 编辑

##### 添加 CD-ROM

<CodeBlock language="python">
{`from ${CodeTerminology["python_from_package"]} import ApiClient, Configuration, VmApi
from ${CodeTerminology["python_from_package"]}.utils import wait_tasks
conf = Configuration(host="http://192.168.96.133/v2/api")
conf.api_key["Authorization"] = "token"
api_client = ApiClient(conf)
vm_api = VmApi(api_client)
with_task_vm = vm_api.add_vm_cd_rom({
    "where": {
        "id": "vm_id"
    },
    "data": {
        "vm_cd_roms": [
            {
                "elf_image_id": "elf_image_id",
                "boot": 0,
                "index": 0
            }
        ]
    }
})[0]
wait_tasks([with_task_vm.task_id], api_client)
updated_vm = vm_api.get_vms({
    "where": {
        "id": with_task_vm.data.id
    }
})`}
</CodeBlock>

##### 删除 CD-ROM

<CodeBlock language="python">
{`from ${CodeTerminology["python_from_package"]} import ApiClient, Configuration, VmApi
from ${CodeTerminology["python_from_package"]}.utils import wait_tasks
conf = Configuration(host="http://192.168.96.133/v2/api")
conf.api_key["Authorization"] = "token"
api_client = ApiClient(conf)
vm_api = VmApi(api_client)
with_task_vm = vm_api.remove_vm_cd_rom({
    "where": {
        "id": "vm_id"
    },
    "data": {
        "cd_rom_ids": ["cd_rom_id_1", "cd_rom_id_2"]
    }
})[0]
wait_tasks([with_task_vm.task_id], api_client)
updated_vm = vm_api.get_vms({
    "where": {
        "id": with_task_vm.data.id
    }
})`}
</CodeBlock>

#### 虚拟卷操作

##### 添加新虚拟卷

<CodeBlock language="python">
{`from ${CodeTerminology["python_from_package"]} import ApiClient, Configuration, Bus, VmVolumeElfStoragePolicyType, VmApi
from ${CodeTerminology["python_from_package"]}.utils import wait_tasks
conf = Configuration(host="http://192.168.96.133/v2/api")
conf.api_key["Authorization"] = "token"
api_client = ApiClient(conf)
vm_api = VmApi(api_client)
with_task_vm = vm_api.add_vm_disk({
    "where": {
        "id": "vm_id"
    },
    "data": {
        "vm_disks": {
            "mount_new_create_disks": [
                {
                    "vm_volume": {
                        "elf_storage_policy": VmVolumeElfStoragePolicyType._2_THIN_PROVISION,
                        "size": 5*1024*1024*1024,
                        "name": "new_volume_name"
                    },
                    "boot": 1,
                    "bus": Bus.VIRTIO,
                }
            ]
        }
    }
})[0]
wait_tasks([with_task_vm.task_id], api_client)
updated_vm = vm_api.get_vms({
    "where": {
        "id": with_task_vm.data.id
    }
})`}
</CodeBlock>

##### 挂载已存在虚拟卷为虚拟盘

<CodeBlock language="python">
{`from ${CodeTerminology["python_from_package"]} import ApiClient, Configuration, Bus, VmApi
from ${CodeTerminology["python_from_package"]}.utils import wait_tasks
conf = Configuration(host="http://192.168.96.133/v2/api")
conf.api_key["Authorization"] = "token"
api_client = ApiClient(conf)
vm_api = VmApi(api_client)
with_task_vm = vm_api.add_vm_disk({
    "where": {
        "id": "vm_id"
    },
    "data": {
        "vm_disks": {
            "mount_disks": [
                {
                    "index": 0,
                    "vm_volume_id": "vm_volume_id",
                    "boot": 1,
                    "bus": Bus.VIRTIO,
                }
            ]
        }
    }
})[0]
wait_tasks([with_task_vm.task_id], api_client)
updated_vm = vm_api.get_vms({
    "where": {
        "id": with_task_vm.data.id
    }
})`}
</CodeBlock>

##### 卸载虚拟盘

<CodeBlock language="python">
{`from ${CodeTerminology["python_from_package"]} import ApiClient, Configuration, VmVolumeElfStoragePolicyType, Bus, VmApi
from ${CodeTerminology["python_from_package"]}.utils import wait_tasks
conf = Configuration(host="http://192.168.96.133/v2/api")
conf.api_key["Authorization"] = "token"
api_client = ApiClient(conf)
vm_api = VmApi(api_client)
with_task_vm = vm_api.remove_vm_disk({
    "where": {
        "id": "vm_id"
    },
    "data": {
        "disk_ids": ["vm_disk_id_1", "vm_disk_id_2"]
    }
})[0]
wait_tasks([with_task_vm.task_id], api_client)
updated_vm = vm_api.get_vms({
    "where": {
        "id": with_task_vm.data.id
    }
})`}
</CodeBlock>

#### 网卡操作

##### 添加网卡

<CodeBlock language="python">
{`from ${CodeTerminology["python_from_package"]} import ApiClient, Configuration, VmApi, VmNicModel
from ${CodeTerminology["python_from_package"]}.utils import wait_tasks
conf = Configuration(host="http://192.168.96.133/v2/api")
conf.api_key["Authorization"] = "token"
api_client = ApiClient(conf)
vm_api = VmApi(api_client)
with_task_vm = vm_api.add_vm_nic({
    "where": {
        "id": "vm_id"
    },
    "data": {
        "vm_nics": [
            {
                "connect_vlan_id": "vlan_id",
                "enabled": False,
                "model": VmNicModel.VIRTIO,
            },
            {
                "connect_vlan_id": "vlan_id_2",
                "enabled": True,
                "mirror": True,
                "model": VmNicModel.VIRTIO,
            }
        ]
    }
})[0]
wait_tasks([with_task_vm.task_id], api_client)
updated_vm = vm_api.get_vms({
    "where": {
        "id": with_task_vm.data.id
    }
})`}
</CodeBlock>

##### 编辑网卡

<CodeBlock language="python">
{`from ${CodeTerminology["python_from_package"]} import ApiClient, Configuration, VmApi
from ${CodeTerminology["python_from_package"]}.utils import wait_tasks
conf = Configuration(host="http://192.168.96.133/v2/api")
conf.api_key["Authorization"] = "token"
api_client = ApiClient(conf)
vm_api = VmApi(api_client)
with_task_vm = vm_api.update_vm_nic({
    "where": {
        "id": "vm_id"
    },
    "data": {
        "nic_index": 0,
        "enabled": False,
        "mirror": False,
        "connect_vlan_id": "vlan_id"
    }
})[0]
wait_tasks([with_task_vm.task_id], api_client)
updated_vm = vm_api.get_vms({
    "where": {
        "id": with_task_vm.data.id
    }
})`}
</CodeBlock>

##### 移除网卡

<CodeBlock language="python">
{`from ${CodeTerminology["python_from_package"]} import ApiClient, Configuration, VmApi
from ${CodeTerminology["python_from_package"]}.utils import wait_tasks
conf = Configuration(host="http://192.168.96.133/v2/api")
conf.api_key["Authorization"] = "token"
api_client = ApiClient(conf)
vm_api = VmApi(api_client)
with_task_vm = vm_api.remove_vm_nic({
    "where": {
        "id": "vm_id"
    },
    "data": {
        "nic_index": [0, 1]
    }
})[0]
wait_tasks([with_task_vm.task_id], api_client)
updated_vm = vm_api.get_vms({
    "where": {
        "id": with_task_vm.data.id
    }
})`}
</CodeBlock>

#### 虚拟机迁移

##### 迁移至指定主机

<CodeBlock language="python">
{`from ${CodeTerminology["python_from_package"]} import ApiClient, Configuration, VmApi
from ${CodeTerminology["python_from_package"]}.utils import wait_tasks
conf = Configuration(host="http://192.168.96.133/v2/api")
conf.api_key["Authorization"] = "token"
api_client = ApiClient(conf)
vm_api = VmApi(api_client)
with_task_vm = vm_api.mig_rate_vm({
    "where": {
        "id": "vm_id"
    },
    "data": {
        "host_id": "host_id"
    }
})[0]
wait_tasks([with_task_vm.task_id], api_client)`}
</CodeBlock>

##### 自动调度到合适的主机

<CodeBlock language="python">
{`from ${CodeTerminology["python_from_package"]} import ApiClient, Configuration, VmApi
from ${CodeTerminology["python_from_package"]}.utils import wait_tasks
conf = Configuration(host="http://192.168.96.133/v2/api")
conf.api_key["Authorization"] = "token"
api_client = ApiClient(conf)
vm_api = VmApi(api_client)
with_task_vm = vm_api.mig_rate_vm({
    "where": {
        "id": "vm_id"
    }
})[0]
wait_tasks([with_task_vm.task_id], api_client)`}
</CodeBlock>

### 虚拟机电源操作

#### 虚拟机开机:

##### 指定虚拟机开机，自动调度到合适的虚拟机

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
    }
})[0]
wait_tasks([with_task_vm.task_id], api_client)
opened_vm = vm_api.get_vms({"where": {"id": with_task_vm.data.id}})[0]`}
</CodeBlock>

##### 批量虚拟机开机，自动调度到合适的虚拟机

<CodeBlock language="python">
{`from ${CodeTerminology["python_from_package"]} import ApiClient, Configuration, VmApi
from ${CodeTerminology["python_from_package"]}.utils import wait_tasks
conf = Configuration(host="http://192.168.96.133/v2/api")
conf.api_key["Authorization"] = "token"
api_client = ApiClient(conf)
vm_api = VmApi(api_client)
with_task_vms = vm_api.start_vm({
    "where": {
        "id_in": ["vm_id_1", "vm_id_2"]
    }
})
tasks = [with_task_vm.task_id for with_task_vm in with_task_vms]
ids = [with_task_vm.data.id for with_task_vm in with_task_vms]
wait_tasks(tasks, api_client)
opened_vms = vm_api.get_vms({"where": {"id_in": ids}})`}
</CodeBlock>

##### 开机至指定主机

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

#### 虚拟机关机

##### 指定虚拟机关机

<CodeBlock language="python">
{`from ${CodeTerminology["python_from_package"]} import ApiClient, Configuration, VmApi
from ${CodeTerminology["python_from_package"]}.utils import wait_tasks
conf = Configuration(host="http://192.168.96.133/v2/api")
conf.api_key["Authorization"] = "token"
api_client = ApiClient(conf)
vm_api = VmApi(api_client)
with_task_vm = vm_api.shut_down_vm({
    "where": {
        "id": "vm_id"
    }
})[0]
wait_tasks([with_task_vm.task_id], api_client)
closed_vm = vm_api.get_vms({"where": {"id": with_task_vm.data.id}})[0]`}
</CodeBlock>

##### 批量虚拟机关机

<CodeBlock language="python">
{`from ${CodeTerminology["python_from_package"]} import ApiClient, Configuration, VmApi
from ${CodeTerminology["python_from_package"]}.utils import wait_tasks
conf = Configuration(host="http://192.168.96.133/v2/api")
conf.api_key["Authorization"] = "token"
api_client = ApiClient(conf)
vm_api = VmApi(api_client)
with_task_vms = vm_api.shut_down_vm({
    "where": {
        "id_in": ["vm_id_1", "vm_id_2"]
    }
})
tasks = [with_task_vm.task_id for with_task_vm in with_task_vms]
ids = [with_task_vm.data.id for with_task_vm in with_task_vms]
wait_tasks(tasks, api_client)
closed_vms = vm_api.get_vms({"where": {"id_in": ids}})`}
</CodeBlock>

##### 强制关机指定虚拟机

<CodeBlock language="python">
{`from ${CodeTerminology["python_from_package"]} import ApiClient, Configuration, VmApi
from ${CodeTerminology["python_from_package"]}.utils import wait_tasks
conf = Configuration(host="http://192.168.96.133/v2/api")
conf.api_key["Authorization"] = "token"
api_client = ApiClient(conf)
vm_api = VmApi(api_client)
with_task_vm = vm_api.force_shut_down_vm({
    "where": {
        "id": "vm_id"
    }
})[0]
wait_tasks([with_task_vm.task_id], api_client)
closed_vm = vm_api.get_vms({"where": {"id": with_task_vm.data.id}})[0]`}
</CodeBlock>

##### 强制关机批量虚拟机

<CodeBlock language="python">
{`from ${CodeTerminology["python_from_package"]} import ApiClient, Configuration, VmApi
from ${CodeTerminology["python_from_package"]}.utils import wait_tasks
conf = Configuration(host="http://192.168.96.133/v2/api")
conf.api_key["Authorization"] = "token"
api_client = ApiClient(conf)
vm_api = VmApi(api_client)
with_task_vms = vm_api.force_shut_down_vm({
    "where": {
        "id_in": ["vm_id_1", "vm_id_2"]
    }
})
tasks = [with_task_vm.task_id for with_task_vm in with_task_vms]
ids = [with_task_vm.data.id for with_task_vm in with_task_vms]
wait_tasks(tasks, api_client)
closed_vms = vm_api.get_vms({"where": {"id_in": ids}})`}
</CodeBlock>

#### 虚拟机重启

##### 重启指定虚拟机

<CodeBlock language="python">
{`from ${CodeTerminology["python_from_package"]} import ApiClient, Configuration, VmApi
from ${CodeTerminology["python_from_package"]}.utils import wait_tasks
api_client = ApiClient(Configuration(host="http://192.168.96.133/v2/api"))
vm_api = VmApi(api_client)
with_task_vm = vm_api.restart_vm({
    "where": {
        "id": "vm_id"
    }
})[0]
wait_tasks([with_task_vm.task_id], api_client)
restarted_vm = vm_api.get_vms({"where": {"id": with_task_vm.data.id}})[0]`}
</CodeBlock>

##### 重启批量虚拟机

<CodeBlock language="python">
{`from ${CodeTerminology["python_from_package"]} import ApiClient, Configuration, VmApi
from ${CodeTerminology["python_from_package"]}.utils import wait_tasks
api_client = ApiClient(Configuration(host="http://192.168.96.133/v2/api"))
vm_api = VmApi(api_client)
with_task_vms = vm_api.restart_vm({
    "where": {
        "id_in": ["vm_id_1", "vm_id_2"]
    }
})
tasks = [with_task_vm.task_id for with_task_vm in with_task_vms]
ids = [with_task_vm.data.id for with_task_vm in with_task_vms]
wait_tasks(tasks, api_client)
restarted_vms = vm_api.get_vms({"where": {"id_in": ids}})`}
</CodeBlock>

##### 强制重启指定虚拟机

<CodeBlock language="python">
{`from ${CodeTerminology["python_from_package"]} import ApiClient, Configuration, VmApi
from ${CodeTerminology["python_from_package"]}.utils import wait_tasks
api_client = ApiClient(Configuration(host="http://192.168.96.133/v2/api"))
vm_api = VmApi(api_client)
with_task_vm = vm_api.force_restart_vm({
    "where": {
        "id": "vm_id"
    }
})[0]
wait_tasks([with_task_vm.task_id], api_client)
restarted_vm = vm_api.get_vms({"where": {"id": with_task_vm.data.id}})[0]`}
</CodeBlock>

##### 强制重启批量虚拟机

<CodeBlock language="python">
{`from ${CodeTerminology["python_from_package"]} import ApiClient, Configuration, VmApi
from ${CodeTerminology["python_from_package"]}.utils import wait_tasks
api_client = ApiClient(Configuration(host="http://192.168.96.133/v2/api"))
vm_api = VmApi(api_client)
with_task_vms = vm_api.force_restart_vm({
    "where": {
        "id_in": ["vm_id_1", "vm_id_2"]
    }
})
tasks = [with_task_vm.task_id for with_task_vm in with_task_vms]
ids = [with_task_vm.data.id for with_task_vm in with_task_vms]
wait_tasks(tasks, api_client)
restarted_vms = vm_api.get_vms({"where": {"id_in": ids}})`}
</CodeBlock>

#### 虚拟机暂停

##### 暂停指定虚拟机

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

##### 暂停批量虚拟机

<CodeBlock language="python">
{`from ${CodeTerminology["python_from_package"]} import ApiClient, Configuration, VmApi
from ${CodeTerminology["python_from_package"]}.utils import wait_tasks
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
suspended_vms = vm_api.get_vms({"where": {"id_in": ids}})`}
</CodeBlock>

#### 虚拟机恢复

##### 恢复指定虚拟机

<CodeBlock language="python">
{`from ${CodeTerminology["python_from_package"]} import ApiClient, Configuration, VmApi
from ${CodeTerminology["python_from_package"]}.utils import wait_tasks
api_client = ApiClient(Configuration(host="http://192.168.96.133/v2/api"))
vm_api = VmApi(api_client)
with_task_vm = vm_api.resume_vm({
    "where": {
        "id": "vm_id"
    }
})[0]
wait_tasks([with_task_vm.task_id], api_client)
resumed_vm = vm_api.get_vms({"where": {"id": with_task_vm.data.id}})[0]`}
</CodeBlock>

##### 恢复批量虚拟机

<CodeBlock language="python">
{`from ${CodeTerminology["python_from_package"]} import ApiClient, Configuration, VmApi
from ${CodeTerminology["python_from_package"]}.utils import wait_tasks
api_client = ApiClient(Configuration(host="http://192.168.96.133/v2/api"))
vm_api = VmApi(api_client)
with_task_vms = vm_api.resume_vm({
    "where": {
        "id_in": ["vm_id_1", "vm_id_2"]
    }
})
tasks = [with_task_vm.task_id for with_task_vm in with_task_vms]
ids = [with_task_vm.data.id for with_task_vm in with_task_vms]
wait_tasks(tasks, api_client)
resumed_vms = vm_api.get_vms({"where": {"id_in": ids}})`}
</CodeBlock>

### 删除虚拟机

#### 回收站

##### 移入回收站

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

##### 从回收站恢复

<CodeBlock language="python">
{`from ${CodeTerminology["python_from_package"]} import ApiClient, Configuration, VmApi
from ${CodeTerminology["python_from_package"]}.utils import wait_tasks
api_client = ApiClient(Configuration(host="http://192.168.96.133/v2/api"))
vm_api = VmApi(api_client)
with_task_delete_vms = vm_api.recover_vm_from_recycle_bin({
    "where": {
        "id_in": ["vm_id_1", "vm_id_2"]
    }
})
tasks = [with_task_delete_vm.task_id for with_task_delete_vm in with_task_delete_vms]
ids = [with_task_vm.data.id for with_task_vm in with_task_vms]
wait_tasks(tasks, api_client)
recovered_vms = vm_api.get_vms({"where": {"id_in": ids}})`}
</CodeBlock>

#### 永久删除

<CodeBlock language="python">
{`from ${CodeTerminology["python_from_package"]} import ApiClient, Configuration, VmApi
from ${CodeTerminology["python_from_package"]}.utils import wait_tasks
api_client = ApiClient(Configuration(host="http://192.168.96.133/v2/api"))
vm_api = VmApi(api_client)
with_task_delete_vms = vm_api.delete_vm({
    "where": {
        "id_in": ["vm_id_1", "vm_id_2"]
    }
})
tasks = [with_task_delete_vm.task_id for with_task_delete_vm in with_task_delete_vms]
wait_tasks(tasks, api_client)`}
</CodeBlock>

## 场景示例

### 虚拟机备份

<CodeBlock language="python">
{`from ${CodeTerminology["python_from_package"]} import ApiClient
from ${CodeTerminology["python_from_package"]}.api.vm_api import VmApi
from ${CodeTerminology["python_from_package"]}.api.vm_snapshot_api import VmSnapshotApi
from ${CodeTerminology["python_from_package"]}.api.iscsi_lun_snapshot_api import IscsiLunSnapshotApi
from ${CodeTerminology["python_from_package"]}.models import (
    ConsistentType,
    VmToolsStatus
)
from ${CodeTerminology["python_from_package"]}.utils import wait_tasks
def create_vm_snapshot(
    api_client: ApiClient,
    target_vm_name: str,
    target_snapshot_name: str,
    consistent_type: ConsistentType
):
    vm_api = VmApi(api_client)
    vm_snapshot_api = VmSnapshotApi(api_client)
    iscsi_lun_snapshot_api = IscsiLunSnapshotApi(api_client)
    # 1. 获取所需备份的虚拟机的信息，这里我们需要vm的id来构建创建snapshot的参数
    vm = vm_api.get_vms({
        "where": {
            "name": target_vm_name
        },
        "first": 1
    })
    # vm 已安装并启动 VMTools 时，consistent_type 可以使用 FILE_SYSTEM_CONSISTENT 代表文件系统一致性快照
    if vm.vm_tools_status != VmToolsStatus.RUNNING and consistent_type == ConsistentType.FILE_SYSTEM_CONSISTENT:
        consistent_type = ConsistentType.CRASH_CONSISTENT
    # 2. 创建虚拟机快照
    snapshots_with_task = vm_snapshot_api.create_vm_snapshot({
        "data": [
            {
                "vm_id": vm.id,
                "name": target_snapshot_name,
                "consistent_type": consistent_type
            }
        ]
    })
    # 3. 等待Task完成
    wait_tasks([snapshots_with_task[0].task_id], api_client)
    # 4. 根据返回的id查询生成的虚拟机快照
    snapshot = vm_snapshot_api.get_vm_snapshots({
        "where": {
            "id": snapshots_with_task.data.id
        }
    })[0]
    # 5. 根据返回的snapshot中的vm_disks包含了快照的虚拟盘信息
    # type 为 DISK 表示对应一个卷，其中会包含一个 snapshot_local_id 则表示该虚拟卷对应的lun快照的 local_id
    # type 为 CD-ROM则代表为被挂载的CD-ROM，不会产生lun快照
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
    }`}
</CodeBlock>

### Dashboard 构建

#### 定义工具方法

<CodeBlock language="python">
{`from functools import reduce
from datetime import datetime, timedelta
from ${CodeTerminology["python_from_package"]} import ApiClient
from ${CodeTerminology["python_from_package"]}.configuration import Configuration
from ${CodeTerminology["python_from_package"]}.models import SeverityEnum, ClusterType, Hypervisor, DiskType, DiskUsageStatus, DiskHealthStatus
from ${CodeTerminology["python_from_package"]}.api import VmApi, ClusterApi, AlertApi, HostApi, DiskApi, ClusterSettingsApi, GlobalSettingsApi
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
    return "{:.2f}{}".format(base, units[-1])`}
</CodeBlock>

#### 构建报警信息

<CodeBlock language="python">
{`def build_alerts(api_client: ApiClient, cluster_ids):
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
    }`}
</CodeBlock>

#### 构建硬盘信息

> 这里以机械硬盘为例

<CodeBlock language="python">
{`def build_hdd_info(api_client: ApiClient, cluster_ids):
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
    return hdd`}
</CodeBlock>

#### 构建性能指标

> 获取指定集群的 CPU 核数，CPU 频率总数，CPU 使用率，内存总量，内存使用量，存储资源总量，存储资源已使用量，存储资源失效量与存储资源可用量。

<CodeBlock language="python">
{`def build_metrics(api_client: ApiClient, clusters, cluster_ids):
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
    return result`}
</CodeBlock>

#### 构建 Dashboard

<CodeBlock language="python">
{`def build_dashboard(api_client: ApiClient, datacenter_id: str = None, cluster_id: str = None):
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
    return result`}
</CodeBlock>
