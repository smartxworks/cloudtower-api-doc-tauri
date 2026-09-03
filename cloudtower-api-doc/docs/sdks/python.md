---
title: Python
---
import Terminology from '@site/terminology.json'
import CodeTerminology from '@site/code-terminology.json'
import CodeBlock from '@theme/CodeBlock'

<>Python 环境下的 {Terminology['terminology']['zh-CN']['PRODUCT']} SDK，适用于 2.7 和 3.4 及以上版本</>

<h1>{Terminology['terminology']['zh-CN']['PRODUCT']} Python SDK</h1>

<>Python 环境下的 {Terminology['terminology']['zh-CN']['PRODUCT']} SDK，适用于 2.7 与 3.4 以上版本。</>

- <a href={`https://github.com/${CodeTerminology["python_github_address"]}`}>源码地址</a>
- <a href={`https://github.com/${CodeTerminology["python_github_address"]}`}>下载地址</a>

## 安装

- ### whl

  <CodeBlock language="shell">
  {["pip install ", CodeTerminology["python_package_1"], "-2.23.0-py2.py3-none-any.whl\n"].join('')}
  </CodeBlock>

- ### tar.gz

  <CodeBlock language="shell">
  {["tar xvzf ", CodeTerminology["python_package"], "-2.23.0.tar.gz\ncd ", CodeTerminology["python_package"], "-2.23.0\npython setup.py install\n"].join('')}
  </CodeBlock>

- ### git 源码安装

  <CodeBlock>
  {["git clone https://github.com/", CodeTerminology["python_github_address"], ".git\ncd ", CodeTerminology["python_from_package"], "-python-sdk\npython setup.py install\n"].join('')}
  </CodeBlock>

- ### git pip 安装

  <CodeBlock language="shell">
  {["pip install git+https://github.com/", CodeTerminology["python_github_address"], ".git\n"].join('')}
  </CodeBlock>

- ### pypi 安装
  <CodeBlock language="shell">
  {["pip install ", CodeTerminology["python_package"], "\n"].join('')}
  </CodeBlock>

## 使用

### 创建实例

#### 创建 `ApiClient` 实例

<CodeBlock language="python">
{["from ", CodeTerminology["python_from_package"], ".configuration import Configuration\nfrom ", CodeTerminology["python_from_package"], " import ApiClient\n# 配置 operation-api endpoint\nconfiguration = Configuration(host=\"http://tower.example.com/v2/api\")\nclient = ApiClient(configuration)\n"].join('')}
</CodeBlock>

> 如果需要使用 https，可以安装证书，或者忽略证书验证

<CodeBlock language="python">
{"configuration = Configuration(host=\"https://tower.example.com/v2/api\")\nconfiguration.verify_ssl = False\nclient = ApiClient(configuration)\n"}
</CodeBlock>

#### 创建对应的 API 实例

> 根据不同用途的操作创建相关的 API 实例，例如虚拟机相关操作需要创建一个 `VmApi`。

<CodeBlock language="python">
{["from ", CodeTerminology["python_from_package"], ".api.vm_api import VmApi\nvm_api = VmApi(client)\n"].join('')}
</CodeBlock>

### 鉴权

> 可以通过 utils 中封装的登陆方法来鉴权 `ApiClient`

<CodeBlock language="python">
{["from ", CodeTerminology["python_from_package"], ".utils import wait_tasks, login\nconf = Configuration(host=\"http://api-test.dev-", CodeTerminology["python_from_package"], ".smartx.com/v2/api\")\napi_client = ApiClient(conf)\nlogin(api_client, \"<username>\", \"<password>\") # 默认使用 LOCAL 作为 usersource\n"].join('')}
</CodeBlock>

> 也可以直接将 token 应用置 `configuration` 的 `api_key` 中

<CodeBlock language="python">
{["from ", CodeTerminology["python_from_package"], ".api.user_api import UserApi\nfrom ", CodeTerminology["python_from_package"], ".models import UserSource\n# 通过 UserApi 中的 login 方法来获得 token。\nuser_api = UserApi(client)\nlogin_res = user_api.login({\n    \"username\": \"<username>\",\n    \"password\": \"<password>\",\n    \"source\": UserSource.LOCAL\n})\n# 将 token 配置在 configuration.api_key[\"Authorization\"] 中，\n# 这样所有使用当前 client 的 api 都会获得鉴权的 token 信息。\nconfiguration.api_key[\"Authorization\"] = login_res.data.token\n"].join('')}
</CodeBlock>

### 发送请求

#### 获取资源

<CodeBlock language="python">
{"vms = vm_api.get_vms({\n  \"where\": {\n    \"id\": \"vm_id\"\n  },\n  \"first\":1,\n})\n"}
</CodeBlock>

#### 更新资源

> 资源更新会产生相关的异步任务，当异步任务结束时，代表资源操作完成且数据已更新。

<CodeBlock language="python">
{"start_res = vm_api.start_vm({\n  \"where\": {\n    \"id\": \"stopped_vm_id\"\n  },\n})\n"}
</CodeBlock>

> 可以通过提供的工具方法同步等待异步任务结束

<CodeBlock language="python">
{["from ", CodeTerminology["python_from_package"], ".utils import wait_tasks\ntry:\n wait_tasks([res.task_id for res in start_res], api_client)\nexcept ApiException as e:\n # 处理错误\n\n # task完成后的回调\n"].join('')}
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

> <>{Terminology['terminology']['zh-CN']['PRODUCT']} api 支持通过设置 header 中的 content-language 来设置返回信息的语言, 可选值 `en-US`, `zh-CN`。默认为 `en-US`。</>

##### 通过 `ApiClient` 的 `set_default_header` 方法

> 可以通过 `ApiClient` 的 `set_default_header` 方法设置默认的 header 信息。

<CodeBlock language="python">
{"api_client.set_default_header(\"content_language\",\"en-US\")\nalert_api = AlertApi(api_client)\n# 此时得到的 alerts 中的 message, solution, cause, impact 将被转换为英文描述。\nalerts = alert_api.get_alerts(\n  {\n    \"where\": {\n      \"cluster\": {\n        \"id\": \"cluster_id\"\n      }\n    },\n    \"first\": 100\n  },\n)\n"}
</CodeBlock>

##### 通过设置请求的关键字参数

> 也可以通过设置请求的关键字参数 `content_language` 来设置返回信息的语言。

<CodeBlock language="python">
{["from ", CodeTerminology["python_from_package"], ".api.user_api import AlertApi\n\nalert_api = AlertApi(api_client)\n# 此时得到的 alerts 中的 message, solution, cause, impact 将被转换为中文描述。\nalerts = alert_api.get_alerts(\n  {\n    \"where\": {\n      \"cluster\": {\n        \"id\": \"cluster_id\"\n      }\n    },\n    \"first\": 100\n  },\n  content_language=\"zh-CN\"\n)\n"].join('')}
</CodeBlock>

#### 其他

##### 创建 `ActivePassiveApiClient` 实例

<>{Terminology['terminology']['zh-CN']['PRODUCT']} 在 4.9 引入了多管理 IP 主备部署，如果需要访问此类 {Terminology['terminology']['zh-CN']['PRODUCT']}，可以使用 `ActivePassiveApiClient` 配置同一个主备集群的多个 endpoint。同一时间预期最多只有一个 active endpoint，传入顺序不代表主备关系，客户端会通过探测结果选择当前 active endpoint。</>

<CodeBlock language="python">
{["from ", CodeTerminology["python_from_package"], " import ActivePassiveApiClient\n\nclient = ActivePassiveApiClient(\n    endpoints=[\"https://tower-a.example.com\", \"https://tower-b.example.com\"],\n    user_config={\n        \"name\": \"<username>\",\n        \"password\": \"<password>\",\n    },\n)\n"].join('')}
</CodeBlock>

##### 故障切换策略

`ActivePassiveApiClient` 支持以下故障切换策略：

- `AUTO_FAILOVER`：默认的策略，当没有缓存的 active endpoint 时，会尝试探测并缓存当前 active endpoint；请求返回 307 后自动重新探测并重试一次；请求发生网络 I/O 异常后清空缓存，但不会自动重试。
- `MANUAL_FAILOVER`：请求返回 307 后不自动重新探测和重试，清空缓存由调用方处理故障切换，其余业务逻辑和 `AUTO_FAILOVER` 一致。
- `ALWAYS_PROBE`：不缓存 active endpoint，每次请求前都重新探测 active endpoint；请求返回 307 后不自动重试。

如果需要指定故障切换策略，可以在创建实例时传入：

<CodeBlock language="python">
{["from ", CodeTerminology["python_from_package"], " import ActivePassiveApiClient, FailoverStrategy\n\nclient = ActivePassiveApiClient(\n    endpoints=[\"https://tower-a.example.com\", \"https://tower-b.example.com\"],\n    user_config={\n        \"name\": \"<username>\",\n        \"password\": \"<password>\",\n    },\n    failover_strategy=FailoverStrategy.MANUAL_FAILOVER,\n)\n"].join('')}
</CodeBlock>

##### 发送异步请求

> 上述请求的发送都是同步的请求，会堵塞当前进程。如果需要使用异步请求，请在对应请求的关键字参数中加上 `async_req=True`。
> 通过返回结果 `ApplyResult.get()` 来获取对应的结果。

<CodeBlock language="python">
{"vms = vm_api.get_vms(\n  {\n    \"where\": {\n      \"id\": \"vm_id\"\n    }\n  },\n  async_req=True\n)\nprint(vms.get()[0].name)\n"}
</CodeBlock>

### 使用完成后销毁 ApiClient 实例

<CodeBlock language="python">
{"client.close()\n"}
</CodeBlock>

## 操作示例

### 获取虚拟机

#### 获取所有虚拟机

<CodeBlock language="python">
{["from ", CodeTerminology["python_from_package"], " import ApiClient, Configuration, VmApi\n\nconf = Configuration(host=\"http://tower.example.com/v2/api\")\nconf.api_key[\"Authorization\"] = \"token\"\napi_client = ApiClient(conf)\nvm_api = VmApi(api_client)\n\nvms = vm_api.get_vms({})\n"].join('')}
</CodeBlock>

#### 分页获取虚拟机

<CodeBlock language="python">
{["from ", CodeTerminology["python_from_package"], " import ApiClient, Configuration, VmApi\n\nconf = Configuration(host=\"http://tower.example.com/v2/api\")\nconf.api_key[\"Authorization\"] = \"token\"\napi_client = ApiClient(conf)\nvm_api = VmApi(api_client)\n\nvms_from_51_to_100 = vm_api.get_vms({\n  \"first\": 50,\n  \"skip\": 50,\n})\n"].join('')}
</CodeBlock>

#### 获取所有已开机虚拟机

<CodeBlock language="python">
{["from ", CodeTerminology["python_from_package"], " import ApiClient, Configuration, VmApi, VmStatus\n\nconf = Configuration(host=\"http://tower.example.com/v2/api\")\nconf.api_key[\"Authorization\"] = \"token\"\napi_client = ApiClient(conf)\nvm_api = VmApi(api_client)\n\nrunning_vms = vm_api.get_vms(\n    {\n        \"where\": {\n            \"status\": VmStatus.RUNNING\n        }\n    },\n)\n"].join('')}
</CodeBlock>

#### 获取名称或描述中包含特定字符串的虚拟机

<CodeBlock language="python">
{["from ", CodeTerminology["python_from_package"], " import ApiClient, Configuration, VmApi\n\nconf = Configuration(host=\"http://tower.example.com/v2/api\")\nconf.api_key[\"Authorization\"] = \"token\"\napi_client = ApiClient(conf)\nvm_api = VmApi(api_client)\n\nvms_name_contains = vm_api.get_vms(\n    {\n        \"where\": {\n            \"name_contains\": \"string\"\n        }\n    },\n)\n"].join('')}
</CodeBlock>

#### 获取所有 vcpu > n 的虚拟机

<CodeBlock language="python">
{["from ", CodeTerminology["python_from_package"], " import ApiClient, Configuration, VmApi\n\nconf = Configuration(host=\"http://tower.example.com/v2/api\")\nconf.api_key[\"Authorization\"] = \"token\"\napi_client = ApiClient(conf)\nvm_api = VmApi(api_client)\n\nvms_has_4_more_vcpu = vm_api.get_vms(\n    {\n        \"where\": {\n            \"vcpu_gt\": 4\n        }\n    },\n)\n"].join('')}
</CodeBlock>

### 从模版创建虚拟机

#### 仅指定 id

<CodeBlock language="python">
{["from ", CodeTerminology["python_from_package"], ".api import VmApi, ContentLibraryVmTemplateApi, ClusterApi\nfrom ", CodeTerminology["python_from_package"], ".utils import login, wait_tasks\nfrom ", CodeTerminology["python_from_package"], ".configuration import Configuration\nfrom ", CodeTerminology["python_from_package"], " import ApiClient\nimport os\n\n\nconfiguration = Configuration(host=os.getenv(\"", CodeTerminology["endpoint_placeholder"], "\"))\nclient = ApiClient(configuration)\n\nlogin(client, os.getenv(\"", CodeTerminology["username_placeholder"], "\"), os.getenv(\"", CodeTerminology["password_placeholder"], "\"))\n\n\ndef create_vm_from_template(template_name, cluster_name, vm_name):\n    \"\"\"\n    通过内容库模板创建一台虚拟机，内容通过内容库模板设置\n    :param template_name: 指定所需使用的内容库模板名称\n    :param cluster_name: 指定虚拟机被部署的集群的集群名称\n    :param vm_name: 虚拟机名称\n    :return: 被创建的虚拟机\n    \"\"\"\n    vm_api = VmApi(client)\n    cluster_api = ClusterApi(client)\n    template_api = ContentLibraryVmTemplateApi(client)\n\n    cluster = cluster_api.get_clusters({\n        \"where\": {\n            \"name\": cluster_name\n        }\n    })\n    if len(cluster) == 0:\n        raise Exception(\"cluster not found\")\n\n    template = template_api.get_content_library_vm_templates({\n        \"where\": {\n            \"name\": template_name\n        }\n    })\n    if len(template) == 0:\n        raise Exception(\"template not found\")\n\n    with_task_vms = vm_api.create_vm_from_content_library_template([\n        {\n            \"template_id\": template[0].id,\n            \"cluster_id\": cluster[0].id,\n            \"name\": vm_name,\n            \"is_full_copy\": False\n        }\n    ])\n    tasks = [with_task_vm.task_id for with_task_vm in with_task_vms]\n    vm_ids = [\n        with_task_vm.data.id for with_task_vm in with_task_vms]\n    wait_tasks(tasks, client)\n    return vm_api.get_vms({\n        \"where\": {\n            \"id_in\": vm_ids\n        }\n    })[0]\n"].join('')}
</CodeBlock>

#### 配置与模板不同的虚拟盘参数

<CodeBlock language="python">
{["from ", CodeTerminology["python_from_package"], ".api import VmApi, ContentLibraryVmTemplateApi, ClusterApi\nfrom ", CodeTerminology["python_from_package"], ".utils import login, wait_tasks\nfrom ", CodeTerminology["python_from_package"], ".configuration import Configuration\nfrom ", CodeTerminology["python_from_package"], ".models import Bus, VmVolumeElfStoragePolicyType\nfrom ", CodeTerminology["python_from_package"], " import ApiClient\nimport os\n\n\nconfiguration = Configuration(host=os.getenv(\"", CodeTerminology["endpoint_placeholder"], "\"))\nclient = ApiClient(configuration)\n\nlogin(client, os.getenv(\"", CodeTerminology["username_placeholder"], "\"), os.getenv(\"", CodeTerminology["password_placeholder"], "\"))\n\n\ndef create_vm_from_template_modify_disk(template_name, cluster_name, vm_name, disk_operate):\n    \"\"\"\n    通过内容库模板创建一台虚拟机，配置虚拟机的磁盘\n    :param template_name: 模板名称\n    :param cluster_name: 集群名称\n    :param vm_name: 虚拟机名称\n    :param disk_operate: 磁盘操作，使用详见 create_vm_from_template_modify_disk_example 方法\n    :return: 被创建的虚拟机\n    \"\"\"\n    vm_api = VmApi(client)\n    cluster_api = ClusterApi(client)\n    template_api = ContentLibraryVmTemplateApi(client)\n\n    cluster = cluster_api.get_clusters({\n        \"where\": {\n            \"name\": cluster_name\n        }\n    })\n    if len(cluster) == 0:\n        raise Exception(\"cluster not found\")\n\n    template = template_api.get_content_library_vm_templates({\n        \"where\": {\n            \"name\": template_name\n        }\n    })\n    if len(template) == 0:\n        raise Exception(\"template not found\")\n\n    with_task_vms = vm_api.create_vm_from_content_library_template([\n        {\n            \"template_id\": template[0].id,\n            \"cluster_id\": cluster[0].id,\n            \"name\": vm_name,\n            \"is_full_copy\": False,\n            \"disk_operate\": disk_operate\n        }\n    ])\n    tasks = [with_task_vm.task_id for with_task_vm in with_task_vms]\n    vm_ids = [\n        with_task_vm.data.id for with_task_vm in with_task_vms]\n    wait_tasks(tasks, client)\n    return vm_api.get_vms({\n        \"where\": {\n            \"id_in\": vm_ids\n        }\n    })[0]\n\n\ndef create_vm_from_template_modify_disk_example():\n    \"\"\"\n    通过模板创建虚拟机时，如果希望对原有的磁盘进行任何修改，可以通过 disk_operate 参数进行配置\n    disk_operate 参数的类型是 VmDiskOperate，它是一个字典，包含以下字段：\n    - remove_disks 由于删除指定index的磁盘\n    - modify_disks 修改现有磁盘的配置，目前仅支持修改总线，如果有其他修改可以通过，删除原有盘\n    - new_disks 新增磁盘，类型是 VmDiskParams，它是一个字典，包含以下字段：\n        - mount_cd_roms 挂载 cd-rom\n        - mount_disks 挂载已有磁盘\n        - mount_new_create_disks 挂载新磁盘\n    \"\"\"\n    disk_operate = {\n        \"remove_disks\": {\n            \"disk_index\": [0]  # 用于删除指定 index 的磁盘，index 从 0 开始计算，这里既是删除第一块磁盘\n        },\n        \"new_disks\": {\n            \"mount_cd_roms\": [\n                {\n                    \"boot\": 2,  # 启动顺序\n                    \"content_library_image_id\": \"\"  # 指定挂载内容库镜像的 id\n                }\n            ],\n            \"mount_disks\": [\n                {\n                    \"boot\": 3,  # 启动顺序\n                    \"bus\": Bus.VIRTIO,  # 总线类型\n                    \"vm_volume_id\": \"cljm6x2g1405g0958tp3zkhvh\"  # 被挂载虚拟卷的 id\n                }\n            ],\n            \"mount_new_create_disks\": [\n                {\n                    \"boot\": 4,\n                    \"bus\": Bus.VIRTIO,\n                    \"vm_volume\": {\n                        \"name\": \"test\",  # 新建虚拟卷的名称\n                        \"size\": 10 * 1024 * 1024 * 1024,  # 新建虚拟卷的大小，单位是字节\n                        \"elf_storage_policy\": VmVolumeElfStoragePolicyType._2_THIN_PROVISION  # 存储策略\n                    }\n                }\n            ]\n        }\n    }\n    create_vm_from_template_modify_disk(\"template-name\", \"cluster-name\", \"vm-name\", disk_operate)\n"].join('')}
</CodeBlock>

#### 配置与模版不同的网卡参数

<CodeBlock language="python">
{["from ", CodeTerminology["python_from_package"], ".api import VmApi, ContentLibraryVmTemplateApi, ClusterApi\nfrom ", CodeTerminology["python_from_package"], ".utils import login, wait_tasks\nfrom ", CodeTerminology["python_from_package"], ".configuration import Configuration\nfrom ", CodeTerminology["python_from_package"], ".models import Bus, VmNicModel\nfrom ", CodeTerminology["python_from_package"], " import ApiClient\nimport os\n\n\nconfiguration = Configuration(host=os.getenv(\"", CodeTerminology["endpoint_placeholder"], "\"))\nclient = ApiClient(configuration)\n\nlogin(client, os.getenv(\"", CodeTerminology["username_placeholder"], "\"), os.getenv(\"", CodeTerminology["password_placeholder"], "\"))\n\n\ndef create_vm_from_template_modified_nic(template_name, cluster_name, vm_name, nic_params):\n    \"\"\"\n    通过内容库模板创建一台虚拟机，配置虚拟机的网卡\n    :param template_name: 模板名称\n    :param cluster_name: 集群名称\n    :param vm_name: 虚拟机名称\n    :param nic_params: 磁盘操作，使用详见 create_vm_from_template_modified_nic_example 方法\n    :return: 被创建的虚拟机\n    \"\"\"\n    vm_api = VmApi(client)\n    cluster_api = ClusterApi(client)\n    template_api = ContentLibraryVmTemplateApi(client)\n\n    cluster = cluster_api.get_clusters({\n        \"where\": {\n            \"name\": cluster_name\n        }\n    })\n    if len(cluster) == 0:\n        raise Exception(\"cluster not found\")\n\n    template = template_api.get_content_library_vm_templates({\n        \"where\": {\n            \"name\": template_name\n        }\n    })\n    if len(template) == 0:\n        raise Exception(\"template not found\")\n\n    with_task_vms = vm_api.create_vm_from_content_library_template([\n        {\n            \"template_id\": template[0].id,\n            \"cluster_id\": cluster[0].id,\n            \"name\": vm_name,\n            \"is_full_copy\": False,\n            \"vm_nics\": nic_params\n        }\n    ])\n    tasks = [with_task_vm.task_id for with_task_vm in with_task_vms]\n    vm_ids = [\n        with_task_vm.data.id for with_task_vm in with_task_vms]\n    wait_tasks(tasks, client)\n    return vm_api.get_vms({\n        \"where\": {\n            \"id_in\": vm_ids\n        }\n    })[0]\n\n\ndef create_vm_from_template_modified_nic_example():\n    \"\"\"\n    通过内容库模板创建虚拟机时，如果不传递 vm_nics 参数，会默认使用模板的网卡配置，如果需要修改网卡配置，可以传递 vm_nics 参数，\n    vm_nics 参数是一个列表，列表中的每个元素都是一个字典：\n    - connect_vlan_id 网卡对应虚拟机网络的 id，并非虚拟机网络的 vlan_id\n    - enabled 是否启用网卡\n    - model 网卡类型，可以使用 VmNicModel 类的属性，如 VmNicModel.VIRTIO\n    创建虚拟机时并不支持修改网卡的 ip，mac，gateway，subnet mask，如果需要配置ip，子网，网关，可以通过 cloudinit 来实现，需要模板支持 cloudinit\n    \"\"\"\n    nic_params = [\n        {\n            \"connect_vlan_id\": \"vlan_id\",\n            \"enabled\": True,\n            \"model\": VmNicModel.VIRTIO\n        }\n    ]\n    create_vm_from_template_modified_nic(\"template_name\", \"cluster_name\", \"vm_name\", nic_params)\n"].join('')}
</CodeBlock>

### 创建空白虚拟机

#### 简单创建

<CodeBlock language="python">
{["from ", CodeTerminology["python_from_package"], " import (\n    ApiClient,\n    Configuration,\n    VmApi,\n    VmStatus,\n    VmFirmware,\n    Bus\n)\nfrom ", CodeTerminology["python_from_package"], ".utils import wait_tasks\n\nconf = Configuration(host=\"http://tower.example.com/v2/api\")\nconf.api_key[\"Authorization\"] = \"token\"\napi_client = ApiClient(conf)\nvm_api = VmApi(api_client)\nwith_task_vm = vm_api.create_vm([\n    {\n        \"cluster_id\": \"cluster_id\",\n        \"name\": \"vm_name\",\n        \"ha\": True,\n        \"cpu_cores\": 4,\n        \"cpu_sockets\": 4,\n        \"memory\": 4*1024*1024*1024,\n        \"vcpu\": 16,\n        \"status\": VmStatus.STOPPED,\n        \"firmware\": VmFirmware.BIOS,\n        \"vm_nics\": [\n            {\n                \"connect_vlan_id\": \"vlan_id\",\n            }\n        ],\n        \"vm_disks\": {\n            \"mount_cd_roms\": [{\n                \"boot\": 0,\n                \"index\": 0\n            }],\n        }\n    }\n])[0]\n\nwait_tasks([with_task_vm.task_id], api_client)\ncreated_vm = vm_api.get_vms({\n    \"where\": {\n        \"id\": with_task_vm.data.id\n    }\n})\n"].join('')}
</CodeBlock>

#### 创建时配置虚拟盘

##### CD-ROM 加载 ISO

<CodeBlock language="python">
{["from ", CodeTerminology["python_from_package"], " import (\n    ApiClient,\n    Configuration,\n    VmApi,\n    VmStatus,\n    VmFirmware,\n    Bus\n)\nfrom ", CodeTerminology["python_from_package"], ".utils import wait_tasks\n\nconf = Configuration(host=\"http://tower.example.com/v2/api\")\nconf.api_key[\"Authorization\"] = \"token\"\napi_client = ApiClient(conf)\nvm_api = VmApi(api_client)\nwith_task_vm = vm_api.create_vm([\n    {\n        \"cluster_id\": \"cluster_id\",\n        \"name\": \"vm_name\",\n        \"ha\": True,\n        \"cpu_cores\": 4,\n        \"cpu_sockets\": 4,\n        \"memory\": 4*1024*1024*1024,\n        \"vcpu\": 16,\n        \"status\": VmStatus.STOPPED,\n        \"firmware\": VmFirmware.BIOS,\n        \"vm_nics\": [\n            {\n                \"connect_vlan_id\": \"vlan_id\",\n            }\n        ],\n        \"vm_disks\": {\n            \"mount_cd_roms\": [{\n                \"index\": 0,\n                \"boot\": 0,\n                \"elf_image_id\": \"elf_image_id\"\n            }],\n        }\n    }\n])[0]\n\nwait_tasks([with_task_vm.task_id], api_client)\ncreated_vm = vm_api.get_vms({\n    \"where\": {\n        \"id\": with_task_vm.data.id\n    }\n})\n"].join('')}
</CodeBlock>

##### 挂载虚拟卷为虚拟盘

<CodeBlock language="python">
{["from ", CodeTerminology["python_from_package"], " import (\n    ApiClient,\n    Configuration,\n    VmApi,\n    VmStatus,\n    VmFirmware,\n    Bus\n)\nfrom ", CodeTerminology["python_from_package"], ".utils import wait_tasks\n\nconf = Configuration(host=\"http://tower.example.com/v2/api\")\nconf.api_key[\"Authorization\"] = \"token\"\napi_client = ApiClient(conf)\nvm_api = VmApi(api_client)\nwith_task_vm = vm_api.create_vm([\n    {\n        \"cluster_id\": \"cluster_id\",\n        \"name\": \"vm_name\",\n        \"ha\": True,\n        \"cpu_cores\": 4,\n        \"cpu_sockets\": 4,\n        \"memory\": 4*1024*1024*1024,\n        \"vcpu\": 16,\n        \"status\": VmStatus.STOPPED,\n        \"firmware\": VmFirmware.BIOS,\n        \"vm_nics\": [\n            {\n                \"connect_vlan_id\": \"vlan_id\",\n            }\n        ],\n        \"vm_disks\": {\n            \"mount_disks\": [{\n                \"index\": 0,\n                \"boot\": 0,\n                \"bus\": Bus.VIRTIO,\n                \"vm_volume_id\": \"vm_volume_id\",\n                \"index\": 0,\n            }],\n        }\n    }\n])[0]\n\nwait_tasks([with_task_vm.task_id], api_client)\ncreated_vm = vm_api.get_vms({\n    \"where\": {\n        \"id\": with_task_vm.data.id\n    }\n})\n"].join('')}
</CodeBlock>

##### 新增并挂载虚拟盘

<CodeBlock language="python">
{["from ", CodeTerminology["python_from_package"], " import (\n    ApiClient,\n    Configuration,\n    VmApi,\n    VmStatus,\n    VmFirmware,\n    Bus,\n    VmVolumeElfStoragePolicyType\n)\nfrom ", CodeTerminology["python_from_package"], ".utils import wait_tasks\n\nconf = Configuration(host=\"http://tower.example.com/v2/api\")\nconf.api_key[\"Authorization\"] = \"token\"\napi_client = ApiClient(conf)\nvm_api = VmApi(api_client)\nwith_task_vm = vm_api.create_vm([\n    {\n        \"cluster_id\": \"cluster_id\",\n        \"name\": \"vm_name\",\n        \"ha\": True,\n        \"cpu_cores\": 4,\n        \"cpu_sockets\": 4,\n        \"memory\": 4 * 1024*1024*1024,\n        \"vcpu\": 16,\n        \"status\": VmStatus.STOPPED,\n        \"firmware\": VmFirmware.BIOS,\n        \"vm_nics\": [\n            {\n                \"connect_vlan_id\": \"vlan_id\",\n            }\n        ],\n        \"vm_disks\": {\n            \"mount_new_create_disks\": [{\n                \"boot\": 0,\n                \"bus\": Bus.VIRTIO,\n                \"vm_volume\": {\n                    \"elf_storage_policy\": VmVolumeElfStoragePolicyType._2_THIN_PROVISION,\n                    \"size\": 10 * 1024 * 1024 * 1024,\n                    \"name\": \"new_volume_name\"\n                }\n            }],\n        }\n    }\n])[0]\n\nwait_tasks([with_task_vm.task_id], api_client)\ncreated_vm = vm_api.get_vms({\n    \"where\": {\n        \"id\": with_task_vm.data.id\n    }\n})\n"].join('')}
</CodeBlock>

#### 创建时配置虚拟网卡

<CodeBlock language="python">
{["from ", CodeTerminology["python_from_package"], " import (\n    ApiClient,\n    Configuration,\n    VmApi,\n    VmStatus,\n    VmFirmware,\n    Bus,\n    VmNicModel,\n    VmVolumeElfStoragePolicyType\n)\nfrom ", CodeTerminology["python_from_package"], ".utils import wait_tasks\n\nconf = Configuration(host=\"http://tower.example.com/v2/api\")\nconf.api_key[\"Authorization\"] = \"token\"\napi_client = ApiClient(conf)\nvm_api = VmApi(api_client)\nwith_task_vm = vm_api.create_vm([\n    {\n        \"cluster_id\": \"cluster_id\",\n        \"name\": \"vm_name1\",\n        \"ha\": True,\n        \"cpu_cores\": 4,\n        \"cpu_sockets\": 4,\n        \"memory\": 4 * 1024*1024*1024,\n        \"vcpu\": 16,\n        \"status\": VmStatus.STOPPED,\n        \"firmware\": VmFirmware.BIOS,\n        \"vm_nics\": [\n            {\n                \"connect_vlan_id\": \"vlan_id\",\n                \"mirror\": True,\n                \"model\": VmNicModel.VIRTIO\n            }\n        ],\n        \"vm_disks\": {\n            \"mount_cd_roms\": [{\n                \"index\": 0,\n                \"boot\": 0,\n            }],\n        }\n    }\n])[0]\n\nwait_tasks([with_task_vm.task_id], api_client)\ncreated_vm = vm_api.get_vms({\n    \"where\": {\n        \"id\": with_task_vm.data.id\n    }\n})\n"].join('')}
</CodeBlock>

### 编辑虚拟机

#### 编辑基本信息

<CodeBlock language="python">
{["from ", CodeTerminology["python_from_package"], " import ApiClient, Configuration, VmApi\nfrom ", CodeTerminology["python_from_package"], ".utils import wait_tasks\n\nconf = Configuration(host=\"http://tower.example.com/v2/api\")\nconf.api_key[\"Authorization\"] = \"token\"\napi_client = ApiClient(conf)\nvm_api = VmApi(api_client)\n\nwith_task_vm = vm_api.update_vm({\n    \"where\": {\n        \"id\": \"vm_id\"\n    },\n    \"data\": {\n        \"name\": \"new_name\",\n        \"description\": \"new_description\",\n        \"ha\": False,\n        \"vcpu\": 2 * 2,\n        \"cpu_cores\": 2,\n        \"cpu_sockets\": 2,\n        \"memory\": 1*1024*1024*1024,\n    }\n})[0]\n\nwait_tasks([with_task_vm.task_id], api_client)\n\nupdated_vm = vm_api.get_vms({\n    \"where\": {\n        \"id\": with_task_vm.data.id\n    }\n})\n"].join('')}
</CodeBlock>

#### CD-ROM 编辑

##### 添加 CD-ROM

<CodeBlock language="python">
{["from ", CodeTerminology["python_from_package"], " import ApiClient, Configuration, VmApi\nfrom ", CodeTerminology["python_from_package"], ".utils import wait_tasks\n\nconf = Configuration(host=\"http://tower.example.com/v2/api\")\nconf.api_key[\"Authorization\"] = \"token\"\napi_client = ApiClient(conf)\nvm_api = VmApi(api_client)\n\nwith_task_vm = vm_api.add_vm_cd_rom({\n    \"where\": {\n        \"id\": \"vm_id\"\n    },\n    \"data\": {\n        \"vm_cd_roms\": [\n            {\n                \"elf_image_id\": \"elf_image_id\",\n                \"boot\": 0,\n                \"index\": 0\n            }\n        ]\n    }\n})[0]\nwait_tasks([with_task_vm.task_id], api_client)\n\nupdated_vm = vm_api.get_vms({\n    \"where\": {\n        \"id\": with_task_vm.data.id\n    }\n})\n"].join('')}
</CodeBlock>

##### 删除 CD-ROM

<CodeBlock language="python">
{["from ", CodeTerminology["python_from_package"], " import ApiClient, Configuration, VmApi\nfrom ", CodeTerminology["python_from_package"], ".utils import wait_tasks\n\nconf = Configuration(host=\"http://tower.example.com/v2/api\")\nconf.api_key[\"Authorization\"] = \"token\"\napi_client = ApiClient(conf)\nvm_api = VmApi(api_client)\n\nwith_task_vm = vm_api.remove_vm_cd_rom({\n    \"where\": {\n        \"id\": \"vm_id\"\n    },\n    \"data\": {\n        \"cd_rom_ids\": [\"cd_rom_id_1\", \"cd_rom_id_2\"]\n    }\n})[0]\n\nwait_tasks([with_task_vm.task_id], api_client)\n\nupdated_vm = vm_api.get_vms({\n    \"where\": {\n        \"id\": with_task_vm.data.id\n    }\n})\n"].join('')}
</CodeBlock>

#### 虚拟卷操作

##### 添加新虚拟卷

<CodeBlock language="python">
{["from ", CodeTerminology["python_from_package"], " import ApiClient, Configuration, Bus, VmVolumeElfStoragePolicyType, VmApi\nfrom ", CodeTerminology["python_from_package"], ".utils import wait_tasks\n\nconf = Configuration(host=\"http://tower.example.com/v2/api\")\nconf.api_key[\"Authorization\"] = \"token\"\napi_client = ApiClient(conf)\nvm_api = VmApi(api_client)\n\nwith_task_vm = vm_api.add_vm_disk({\n    \"where\": {\n        \"id\": \"vm_id\"\n    },\n    \"data\": {\n        \"vm_disks\": {\n            \"mount_new_create_disks\": [\n                {\n                    \"vm_volume\": {\n                        \"elf_storage_policy\": VmVolumeElfStoragePolicyType._2_THIN_PROVISION,\n                        \"size\": 5*1024*1024*1024,\n                        \"name\": \"new_volume_name\"\n                    },\n                    \"boot\": 1,\n                    \"bus\": Bus.VIRTIO,\n                }\n            ]\n        }\n    }\n})[0]\n\nwait_tasks([with_task_vm.task_id], api_client)\n\nupdated_vm = vm_api.get_vms({\n    \"where\": {\n        \"id\": with_task_vm.data.id\n    }\n})\n"].join('')}
</CodeBlock>

##### 挂载已存在虚拟卷为虚拟盘

<CodeBlock language="python">
{["from ", CodeTerminology["python_from_package"], " import ApiClient, Configuration, Bus, VmApi\nfrom ", CodeTerminology["python_from_package"], ".utils import wait_tasks\n\nconf = Configuration(host=\"http://tower.example.com/v2/api\")\nconf.api_key[\"Authorization\"] = \"token\"\napi_client = ApiClient(conf)\nvm_api = VmApi(api_client)\n\nwith_task_vm = vm_api.add_vm_disk({\n    \"where\": {\n        \"id\": \"vm_id\"\n    },\n    \"data\": {\n        \"vm_disks\": {\n            \"mount_disks\": [\n                {\n                    \"index\": 0,\n                    \"vm_volume_id\": \"vm_volume_id\",\n                    \"boot\": 1,\n                    \"bus\": Bus.VIRTIO,\n                }\n            ]\n        }\n    }\n})[0]\n\nwait_tasks([with_task_vm.task_id], api_client)\n\nupdated_vm = vm_api.get_vms({\n    \"where\": {\n        \"id\": with_task_vm.data.id\n    }\n})\n"].join('')}
</CodeBlock>

##### 卸载虚拟盘

<CodeBlock language="python">
{["from ", CodeTerminology["python_from_package"], " import ApiClient, Configuration, VmVolumeElfStoragePolicyType, Bus, VmApi\nfrom ", CodeTerminology["python_from_package"], ".utils import wait_tasks\n\nconf = Configuration(host=\"http://tower.example.com/v2/api\")\nconf.api_key[\"Authorization\"] = \"token\"\napi_client = ApiClient(conf)\nvm_api = VmApi(api_client)\n\nwith_task_vm = vm_api.remove_vm_disk({\n    \"where\": {\n        \"id\": \"vm_id\"\n    },\n    \"data\": {\n        \"disk_ids\": [\"vm_disk_id_1\", \"vm_disk_id_2\"]\n    }\n})[0]\n\nwait_tasks([with_task_vm.task_id], api_client)\n\nupdated_vm = vm_api.get_vms({\n    \"where\": {\n        \"id\": with_task_vm.data.id\n    }\n})\n"].join('')}
</CodeBlock>

#### 网卡操作

##### 添加网卡

<CodeBlock language="python">
{["from ", CodeTerminology["python_from_package"], " import ApiClient, Configuration, VmApi, VmNicModel\nfrom ", CodeTerminology["python_from_package"], ".utils import wait_tasks\n\nconf = Configuration(host=\"http://tower.example.com/v2/api\")\nconf.api_key[\"Authorization\"] = \"token\"\napi_client = ApiClient(conf)\n\nvm_api = VmApi(api_client)\n\nwith_task_vm = vm_api.add_vm_nic({\n    \"where\": {\n        \"id\": \"vm_id\"\n    },\n    \"data\": {\n        \"vm_nics\": [\n            {\n                \"connect_vlan_id\": \"vlan_id\",\n                \"enabled\": False,\n                \"model\": VmNicModel.VIRTIO,\n            },\n            {\n                \"connect_vlan_id\": \"vlan_id_2\",\n                \"enabled\": True,\n                \"mirror\": True,\n                \"model\": VmNicModel.VIRTIO,\n            }\n        ]\n    }\n})[0]\n\nwait_tasks([with_task_vm.task_id], api_client)\nupdated_vm = vm_api.get_vms({\n    \"where\": {\n        \"id\": with_task_vm.data.id\n    }\n})\n"].join('')}
</CodeBlock>

##### 编辑网卡

<CodeBlock language="python">
{["from ", CodeTerminology["python_from_package"], " import ApiClient, Configuration, VmApi\nfrom ", CodeTerminology["python_from_package"], ".utils import wait_tasks\n\nconf = Configuration(host=\"http://tower.example.com/v2/api\")\nconf.api_key[\"Authorization\"] = \"token\"\napi_client = ApiClient(conf)\n\nvm_api = VmApi(api_client)\n\nwith_task_vm = vm_api.update_vm_nic({\n    \"where\": {\n        \"id\": \"vm_id\"\n    },\n    \"data\": {\n        \"nic_index\": 0,\n        \"enabled\": False,\n        \"mirror\": False,\n        \"connect_vlan_id\": \"vlan_id\"\n    }\n})[0]\n\nwait_tasks([with_task_vm.task_id], api_client)\nupdated_vm = vm_api.get_vms({\n    \"where\": {\n        \"id\": with_task_vm.data.id\n    }\n})\n"].join('')}
</CodeBlock>

##### 移除网卡

<CodeBlock language="python">
{["from ", CodeTerminology["python_from_package"], " import ApiClient, Configuration, VmApi\nfrom ", CodeTerminology["python_from_package"], ".utils import wait_tasks\n\nconf = Configuration(host=\"http://tower.example.com/v2/api\")\nconf.api_key[\"Authorization\"] = \"token\"\napi_client = ApiClient(conf)\n\nvm_api = VmApi(api_client)\n\nwith_task_vm = vm_api.remove_vm_nic({\n    \"where\": {\n        \"id\": \"vm_id\"\n    },\n    \"data\": {\n        \"nic_index\": [0, 1]\n    }\n})[0]\n\nwait_tasks([with_task_vm.task_id], api_client)\nupdated_vm = vm_api.get_vms({\n    \"where\": {\n        \"id\": with_task_vm.data.id\n    }\n})\n"].join('')}
</CodeBlock>

#### 虚拟机迁移

##### 迁移至指定主机

<CodeBlock language="python">
{["from ", CodeTerminology["python_from_package"], " import ApiClient, Configuration, VmApi\nfrom ", CodeTerminology["python_from_package"], ".utils import wait_tasks\n\nconf = Configuration(host=\"http://tower.example.com/v2/api\")\nconf.api_key[\"Authorization\"] = \"token\"\napi_client = ApiClient(conf)\n\nvm_api = VmApi(api_client)\n\nwith_task_vm = vm_api.mig_rate_vm({\n    \"where\": {\n        \"id\": \"vm_id\"\n    },\n    \"data\": {\n        \"host_id\": \"host_id\"\n    }\n})[0]\n\nwait_tasks([with_task_vm.task_id], api_client)\n"].join('')}
</CodeBlock>

##### 自动调度到合适的主机

<CodeBlock language="python">
{["from ", CodeTerminology["python_from_package"], " import ApiClient, Configuration, VmApi\nfrom ", CodeTerminology["python_from_package"], ".utils import wait_tasks\n\nconf = Configuration(host=\"http://tower.example.com/v2/api\")\nconf.api_key[\"Authorization\"] = \"token\"\napi_client = ApiClient(conf)\n\nvm_api = VmApi(api_client)\n\nwith_task_vm = vm_api.mig_rate_vm({\n    \"where\": {\n        \"id\": \"vm_id\"\n    }\n})[0]\n\nwait_tasks([with_task_vm.task_id], api_client)\n"].join('')}
</CodeBlock>

### 虚拟机电源操作

#### 虚拟机开机:

##### 指定虚拟机开机，自动调度到合适的虚拟机

<CodeBlock language="python">
{["from ", CodeTerminology["python_from_package"], " import ApiClient, Configuration, VmApi\nfrom ", CodeTerminology["python_from_package"], ".utils import wait_tasks\n\nconf = Configuration(host=\"http://tower.example.com/v2/api\")\nconf.api_key[\"Authorization\"] = \"token\"\napi_client = ApiClient(conf)\n\nvm_api = VmApi(api_client)\nwith_task_vm = vm_api.start_vm({\n    \"where\": {\n        \"id\": \"vm_id\"\n    }\n})[0]\n\nwait_tasks([with_task_vm.task_id], api_client)\n\nopened_vm = vm_api.get_vms({\"where\": {\"id\": with_task_vm.data.id}})[0]\n"].join('')}
</CodeBlock>

##### 批量虚拟机开机，自动调度到合适的虚拟机

<CodeBlock language="python">
{["from ", CodeTerminology["python_from_package"], " import ApiClient, Configuration, VmApi\nfrom ", CodeTerminology["python_from_package"], ".utils import wait_tasks\n\nconf = Configuration(host=\"http://tower.example.com/v2/api\")\nconf.api_key[\"Authorization\"] = \"token\"\napi_client = ApiClient(conf)\n\nvm_api = VmApi(api_client)\nwith_task_vms = vm_api.start_vm({\n    \"where\": {\n        \"id_in\": [\"vm_id_1\", \"vm_id_2\"]\n    }\n})\n\ntasks = [with_task_vm.task_id for with_task_vm in with_task_vms]\nids = [with_task_vm.data.id for with_task_vm in with_task_vms]\nwait_tasks(tasks, api_client)\n\nopened_vms = vm_api.get_vms({\"where\": {\"id_in\": ids}})\n"].join('')}
</CodeBlock>

##### 开机至指定主机

<CodeBlock language="python">
{["from ", CodeTerminology["python_from_package"], " import ApiClient, Configuration, VmApi\nfrom ", CodeTerminology["python_from_package"], ".utils import wait_tasks\n\nconf = Configuration(host=\"http://tower.example.com/v2/api\")\nconf.api_key[\"Authorization\"] = \"token\"\napi_client = ApiClient(conf)\n\nvm_api = VmApi(api_client)\nwith_task_vm = vm_api.start_vm({\n    \"where\": {\n        \"id\": \"vm_id\"\n    },\n    \"data\": {\n        \"host_id\": \"host_id\"\n    }\n})[0]\n\nwait_tasks([with_task_vm.task_id], api_client)\n\nopened_vm = vm_api.get_vms({\"where\": {\"id\": with_task_vm.data.id}})[0]\n"].join('')}
</CodeBlock>

#### 虚拟机关机

##### 指定虚拟机关机

<CodeBlock language="python">
{["from ", CodeTerminology["python_from_package"], " import ApiClient, Configuration, VmApi\nfrom ", CodeTerminology["python_from_package"], ".utils import wait_tasks\n\nconf = Configuration(host=\"http://tower.example.com/v2/api\")\nconf.api_key[\"Authorization\"] = \"token\"\napi_client = ApiClient(conf)\n\nvm_api = VmApi(api_client)\nwith_task_vm = vm_api.shut_down_vm({\n    \"where\": {\n        \"id\": \"vm_id\"\n    }\n})[0]\n\nwait_tasks([with_task_vm.task_id], api_client)\n\nclosed_vm = vm_api.get_vms({\"where\": {\"id\": with_task_vm.data.id}})[0]\n"].join('')}
</CodeBlock>

##### 批量虚拟机关机

<CodeBlock language="python">
{["from ", CodeTerminology["python_from_package"], " import ApiClient, Configuration, VmApi\nfrom ", CodeTerminology["python_from_package"], ".utils import wait_tasks\n\nconf = Configuration(host=\"http://tower.example.com/v2/api\")\nconf.api_key[\"Authorization\"] = \"token\"\napi_client = ApiClient(conf)\n\nvm_api = VmApi(api_client)\nwith_task_vms = vm_api.shut_down_vm({\n    \"where\": {\n        \"id_in\": [\"vm_id_1\", \"vm_id_2\"]\n    }\n})\n\ntasks = [with_task_vm.task_id for with_task_vm in with_task_vms]\nids = [with_task_vm.data.id for with_task_vm in with_task_vms]\n\nwait_tasks(tasks, api_client)\n\nclosed_vms = vm_api.get_vms({\"where\": {\"id_in\": ids}})\n"].join('')}
</CodeBlock>

##### 强制关机指定虚拟机

<CodeBlock language="python">
{["from ", CodeTerminology["python_from_package"], " import ApiClient, Configuration, VmApi\nfrom ", CodeTerminology["python_from_package"], ".utils import wait_tasks\n\nconf = Configuration(host=\"http://tower.example.com/v2/api\")\nconf.api_key[\"Authorization\"] = \"token\"\napi_client = ApiClient(conf)\n\nvm_api = VmApi(api_client)\nwith_task_vm = vm_api.force_shut_down_vm({\n    \"where\": {\n        \"id\": \"vm_id\"\n    }\n})[0]\n\nwait_tasks([with_task_vm.task_id], api_client)\n\nclosed_vm = vm_api.get_vms({\"where\": {\"id\": with_task_vm.data.id}})[0]\n"].join('')}
</CodeBlock>

##### 强制关机批量虚拟机

<CodeBlock language="python">
{["from ", CodeTerminology["python_from_package"], " import ApiClient, Configuration, VmApi\nfrom ", CodeTerminology["python_from_package"], ".utils import wait_tasks\n\nconf = Configuration(host=\"http://tower.example.com/v2/api\")\nconf.api_key[\"Authorization\"] = \"token\"\napi_client = ApiClient(conf)\n\nvm_api = VmApi(api_client)\nwith_task_vms = vm_api.force_shut_down_vm({\n    \"where\": {\n        \"id_in\": [\"vm_id_1\", \"vm_id_2\"]\n    }\n})\n\ntasks = [with_task_vm.task_id for with_task_vm in with_task_vms]\nids = [with_task_vm.data.id for with_task_vm in with_task_vms]\nwait_tasks(tasks, api_client)\n\nclosed_vms = vm_api.get_vms({\"where\": {\"id_in\": ids}})\n"].join('')}
</CodeBlock>

#### 虚拟机重启

##### 重启指定虚拟机

<CodeBlock language="python">
{["from ", CodeTerminology["python_from_package"], " import ApiClient, Configuration, VmApi\nfrom ", CodeTerminology["python_from_package"], ".utils import wait_tasks\n\napi_client = ApiClient(Configuration(host=\"http://tower.example.com/v2/api\"))\n\nvm_api = VmApi(api_client)\nwith_task_vm = vm_api.restart_vm({\n    \"where\": {\n        \"id\": \"vm_id\"\n    }\n})[0]\n\nwait_tasks([with_task_vm.task_id], api_client)\n\nrestarted_vm = vm_api.get_vms({\"where\": {\"id\": with_task_vm.data.id}})[0]\n"].join('')}
</CodeBlock>

##### 重启批量虚拟机

<CodeBlock language="python">
{["from ", CodeTerminology["python_from_package"], " import ApiClient, Configuration, VmApi\nfrom ", CodeTerminology["python_from_package"], ".utils import wait_tasks\n\napi_client = ApiClient(Configuration(host=\"http://tower.example.com/v2/api\"))\n\nvm_api = VmApi(api_client)\nwith_task_vms = vm_api.restart_vm({\n    \"where\": {\n        \"id_in\": [\"vm_id_1\", \"vm_id_2\"]\n    }\n})\n\ntasks = [with_task_vm.task_id for with_task_vm in with_task_vms]\nids = [with_task_vm.data.id for with_task_vm in with_task_vms]\n\nwait_tasks(tasks, api_client)\n\nrestarted_vms = vm_api.get_vms({\"where\": {\"id_in\": ids}})\n"].join('')}
</CodeBlock>

##### 强制重启指定虚拟机

<CodeBlock language="python">
{["from ", CodeTerminology["python_from_package"], " import ApiClient, Configuration, VmApi\nfrom ", CodeTerminology["python_from_package"], ".utils import wait_tasks\n\napi_client = ApiClient(Configuration(host=\"http://tower.example.com/v2/api\"))\n\nvm_api = VmApi(api_client)\nwith_task_vm = vm_api.force_restart_vm({\n    \"where\": {\n        \"id\": \"vm_id\"\n    }\n})[0]\n\nwait_tasks([with_task_vm.task_id], api_client)\n\nrestarted_vm = vm_api.get_vms({\"where\": {\"id\": with_task_vm.data.id}})[0]\n"].join('')}
</CodeBlock>

##### 强制重启批量虚拟机

<CodeBlock language="python">
{["from ", CodeTerminology["python_from_package"], " import ApiClient, Configuration, VmApi\nfrom ", CodeTerminology["python_from_package"], ".utils import wait_tasks\n\napi_client = ApiClient(Configuration(host=\"http://tower.example.com/v2/api\"))\n\nvm_api = VmApi(api_client)\nwith_task_vms = vm_api.force_restart_vm({\n    \"where\": {\n        \"id_in\": [\"vm_id_1\", \"vm_id_2\"]\n    }\n})\n\ntasks = [with_task_vm.task_id for with_task_vm in with_task_vms]\nids = [with_task_vm.data.id for with_task_vm in with_task_vms]\n\nwait_tasks(tasks, api_client)\n\nrestarted_vms = vm_api.get_vms({\"where\": {\"id_in\": ids}})\n"].join('')}
</CodeBlock>

#### 虚拟机暂停

##### 暂停指定虚拟机

<CodeBlock language="python">
{["from ", CodeTerminology["python_from_package"], " import ApiClient, Configuration, VmApi\nfrom ", CodeTerminology["python_from_package"], ".utils import wait_tasks\n\napi_client = ApiClient(Configuration(host=\"http://tower.example.com/v2/api\"))\n\nvm_api = VmApi(api_client)\nwith_task_vm = vm_api.suspend_vm({\n    \"where\": {\n        \"id\": \"vm_id\"\n    }\n})[0]\n\nwait_tasks([with_task_vm.task_id], api_client)\n\nsuspended_vm = vm_api.get_vms({\"where\": {\"id\": with_task_vm.data.id}})[0]\n"].join('')}
</CodeBlock>

##### 暂停批量虚拟机

<CodeBlock language="python">
{["from ", CodeTerminology["python_from_package"], " import ApiClient, Configuration, VmApi\nfrom ", CodeTerminology["python_from_package"], ".utils import wait_tasks\n\napi_client = ApiClient(Configuration(host=\"http://tower.example.com/v2/api\"))\n\nvm_api = VmApi(api_client)\nwith_task_vms = vm_api.suspend_vm({\n    \"where\": {\n        \"id_in\": [\"vm_id_1\", \"vm_id_2\"]\n    }\n})\n\ntasks = [with_task_vm.task_id for with_task_vm in with_task_vms]\nids = [with_task_vm.data.id for with_task_vm in with_task_vms]\n\nwait_tasks(tasks, api_client)\n\nsuspended_vms = vm_api.get_vms({\"where\": {\"id_in\": ids}})\n"].join('')}
</CodeBlock>

#### 虚拟机恢复

##### 恢复指定虚拟机

<CodeBlock language="python">
{["from ", CodeTerminology["python_from_package"], " import ApiClient, Configuration, VmApi\nfrom ", CodeTerminology["python_from_package"], ".utils import wait_tasks\n\napi_client = ApiClient(Configuration(host=\"http://tower.example.com/v2/api\"))\n\nvm_api = VmApi(api_client)\nwith_task_vm = vm_api.resume_vm({\n    \"where\": {\n        \"id\": \"vm_id\"\n    }\n})[0]\n\nwait_tasks([with_task_vm.task_id], api_client)\n\nresumed_vm = vm_api.get_vms({\"where\": {\"id\": with_task_vm.data.id}})[0]\n"].join('')}
</CodeBlock>

##### 恢复批量虚拟机

<CodeBlock language="python">
{["from ", CodeTerminology["python_from_package"], " import ApiClient, Configuration, VmApi\nfrom ", CodeTerminology["python_from_package"], ".utils import wait_tasks\n\napi_client = ApiClient(Configuration(host=\"http://tower.example.com/v2/api\"))\n\nvm_api = VmApi(api_client)\nwith_task_vms = vm_api.resume_vm({\n    \"where\": {\n        \"id_in\": [\"vm_id_1\", \"vm_id_2\"]\n    }\n})\n\ntasks = [with_task_vm.task_id for with_task_vm in with_task_vms]\nids = [with_task_vm.data.id for with_task_vm in with_task_vms]\n\nwait_tasks(tasks, api_client)\n\nresumed_vms = vm_api.get_vms({\"where\": {\"id_in\": ids}})\n"].join('')}
</CodeBlock>

### 删除虚拟机

#### 回收站

##### 移入回收站

<CodeBlock language="python">
{["from ", CodeTerminology["python_from_package"], " import ApiClient, Configuration, VmApi\nfrom ", CodeTerminology["python_from_package"], ".utils import wait_tasks\n\napi_client = ApiClient(Configuration(host=\"http://tower.example.com/v2/api\"))\n\nvm_api = VmApi(api_client)\nwith_task_delete_vms = vm_api.move_vm_to_recycle_bin({\n    \"where\": {\n        \"id_in\": [\"vm_id_1\", \"vm_id_2\"]\n    }\n})\n\ntasks = [with_task_delete_vm.task_id for with_task_delete_vm in with_task_delete_vms]\nids = [with_task_vm.data.id for with_task_vm in with_task_vms]\n\nwait_tasks(tasks, api_client)\n\nvm_moved_to_recycle_bin = vm_api.get_vms({\"where\": {\"id_in\": ids}})\n"].join('')}
</CodeBlock>

##### 从回收站恢复

<CodeBlock language="python">
{["from ", CodeTerminology["python_from_package"], " import ApiClient, Configuration, VmApi\nfrom ", CodeTerminology["python_from_package"], ".utils import wait_tasks\n\napi_client = ApiClient(Configuration(host=\"http://tower.example.com/v2/api\"))\n\nvm_api = VmApi(api_client)\nwith_task_delete_vms = vm_api.recover_vm_from_recycle_bin({\n    \"where\": {\n        \"id_in\": [\"vm_id_1\", \"vm_id_2\"]\n    }\n})\n\ntasks = [with_task_delete_vm.task_id for with_task_delete_vm in with_task_delete_vms]\nids = [with_task_vm.data.id for with_task_vm in with_task_vms]\n\nwait_tasks(tasks, api_client)\n\nrecovered_vms = vm_api.get_vms({\"where\": {\"id_in\": ids}})\n"].join('')}
</CodeBlock>

#### 永久删除

<CodeBlock language="python">
{["from ", CodeTerminology["python_from_package"], " import ApiClient, Configuration, VmApi\nfrom ", CodeTerminology["python_from_package"], ".utils import wait_tasks\n\napi_client = ApiClient(Configuration(host=\"http://tower.example.com/v2/api\"))\n\nvm_api = VmApi(api_client)\nwith_task_delete_vms = vm_api.delete_vm({\n    \"where\": {\n        \"id_in\": [\"vm_id_1\", \"vm_id_2\"]\n    }\n})\n\ntasks = [with_task_delete_vm.task_id for with_task_delete_vm in with_task_delete_vms]\n\nwait_tasks(tasks, api_client)\n"].join('')}
</CodeBlock>

## 场景示例

### 虚拟机备份

<CodeBlock language="python">
{["from ", CodeTerminology["python_from_package"], " import ApiClient\nfrom ", CodeTerminology["python_from_package"], ".api.vm_api import VmApi\nfrom ", CodeTerminology["python_from_package"], ".api.vm_snapshot_api import VmSnapshotApi\nfrom ", CodeTerminology["python_from_package"], ".api.iscsi_lun_snapshot_api import IscsiLunSnapshotApi\nfrom ", CodeTerminology["python_from_package"], ".models import (\n    ConsistentType,\n    VmToolsStatus\n)\nfrom ", CodeTerminology["python_from_package"], ".utils import wait_tasks\n\n\ndef create_vm_snapshot(\n    api_client: ApiClient,\n    target_vm_name: str,\n    target_snapshot_name: str,\n    consistent_type: ConsistentType\n):\n    vm_api = VmApi(api_client)\n    vm_snapshot_api = VmSnapshotApi(api_client)\n    iscsi_lun_snapshot_api = IscsiLunSnapshotApi(api_client)\n    # 1. 获取所需备份的虚拟机的信息，这里我们需要vm的id来构建创建snapshot的参数\n    vm = vm_api.get_vms({\n        \"where\": {\n            \"name\": target_vm_name\n        },\n        \"first\": 1\n    })\n    # vm 已安装并启动 VMTools 时，consistent_type 可以使用 FILE_SYSTEM_CONSISTENT 代表文件系统一致性快照\n    if vm.vm_tools_status != VmToolsStatus.RUNNING and consistent_type == ConsistentType.FILE_SYSTEM_CONSISTENT:\n        consistent_type = ConsistentType.CRASH_CONSISTENT\n\n    # 2. 创建虚拟机快照\n    snapshots_with_task = vm_snapshot_api.create_vm_snapshot({\n        \"data\": [\n            {\n                \"vm_id\": vm.id,\n                \"name\": target_snapshot_name,\n                \"consistent_type\": consistent_type\n            }\n        ]\n    })\n\n    # 3. 等待Task完成\n    wait_tasks([snapshots_with_task[0].task_id], api_client)\n\n    # 4. 根据返回的id查询生成的虚拟机快照\n    snapshot = vm_snapshot_api.get_vm_snapshots({\n        \"where\": {\n            \"id\": snapshots_with_task.data.id\n        }\n    })[0]\n    # 5. 根据返回的snapshot中的vm_disks包含了快照的虚拟盘信息\n    # type 为 DISK 表示对应一个卷，其中会包含一个 snapshot_local_id 则表示该虚拟卷对应的lun快照的 local_id\n    # type 为 CD-ROM则代表为被挂载的CD-ROM，不会产生lun快照\n    lun_snapshot_ids = []\n    for disk in snapshot.vm_disks:\n        if disk.type == \"DISK\":\n            lun_snapshot_ids.append(disk.snapshot_local_id)\n\n    lun_snapshots = iscsi_lun_snapshot_api.get_iscsi_lun_snapshots({\n        \"where\": {\n            \"name_in\": lun_snapshot_ids\n        }\n    })\n\n    return {\n        \"vm_snapshot\": snapshot,\n        \"lun_snapshots\": lun_snapshots\n    }\n\n"].join('')}
</CodeBlock>

### Dashboard 构建

#### 定义工具方法

<CodeBlock language="python">
{["from functools import reduce\nfrom datetime import datetime, timedelta\nfrom ", CodeTerminology["python_from_package"], " import ApiClient\nfrom ", CodeTerminology["python_from_package"], ".configuration import Configuration\nfrom ", CodeTerminology["python_from_package"], ".models import SeverityEnum, ClusterType, Hypervisor, DiskType, DiskUsageStatus, DiskHealthStatus\nfrom ", CodeTerminology["python_from_package"], ".api import VmApi, ClusterApi, AlertApi, HostApi, DiskApi, ClusterSettingsApi, GlobalSettingsApi\n\napi_client = ApiClient(Configuration(host=\"http://tower.example.com/v2/api\"))\n\nbyte_units = [\"B\", \"KiB\", \"MiB\", \"GiB\", \"TiB\", \"PiB\"]\nhz_units = [\"Hz\", \"KHz\", \"MHz\", \"GHz\", \"THz\"]\n\n\ndef format_unit(base: int, units, step=1024):\n    if not len(units):\n        raise Exception(\"no unit provided\")\n    if base <= 0:\n        return \"0\" + units[0]\n    for unit in units:\n        if base < step:\n            return \"{:.2f}{}\".format(base, unit)\n        base /= step\n    return \"{:.2f}{}\".format(base, units[-1])\n"].join('')}
</CodeBlock>

#### 构建报警信息

<CodeBlock language="python">
{"def build_alerts(api_client: ApiClient, cluster_ids):\n    alert_api = AlertApi(api_client)\n    alerts = alert_api.get_alerts({\n        \"where\": {\n            \"ended\": False,\n            \"cluster\": {\n                \"id_in\": cluster_ids\n            },\n        }\n    })\n    critial_alerts = [\n        alert for alert in alerts if alert.severity == SeverityEnum.CRITICAL]\n    notice_alerts = [\n        alert for alert in alerts if alert.severity == SeverityEnum.NOTICE]\n    info_alerts = [\n        alert for alert in alerts if alert.severity == SeverityEnum.INFO]\n    return {\n        \"critical\": critial_alerts,\n        \"notice\": notice_alerts,\n        \"info\": info_alerts\n    }\n"}
</CodeBlock>

#### 构建硬盘信息

> 这里以机械硬盘为例

<CodeBlock language="python">
{"def build_hdd_info(api_client: ApiClient, cluster_ids):\n    disk_api = DiskApi(api_client)\n    disks = disk_api.get_disks({\n        \"where\": {\n            \"host\": {\n                \"cluster\": {\n                    \"id_in\": cluster_ids\n                }\n            }\n        }\n    })\n    hdd = {\n        \"healthy\": 0,\n        \"warning\": 0,\n        \"error\": 0,\n        \"total\": 0,\n    }\n    for disk in disks:\n        if disk.type == DiskType.HDD:\n            if disk.health_status in [DiskHealthStatus.UNHEALTHY, DiskHealthStatus.SUBHEALTHY, DiskHealthStatus.SMART_FAILED]:\n                hdd['error'] += 1\n            elif disk.usage_status in [DiskUsageStatus.UNMOUNTED, DiskUsageStatus.PARTIAL_MOUNTED]:\n                hdd['warning'] += 1\n            else:\n                hdd['healthy'] += 1\n            hdd['total'] += 1\n    return hdd\n"}
</CodeBlock>

#### 构建性能指标

> 获取指定集群的 CPU 核数，CPU 频率总数，CPU 使用率，内存总量，内存使用量，存储资源总量，存储资源已使用量，存储资源失效量与存储资源可用量。

<CodeBlock language="python">
{"def build_metrics(api_client: ApiClient, clusters, cluster_ids):\n    result = {}\n    host_api = HostApi(api_client)\n    hosts = host_api.get_hosts({\n        \"where\": {\n            \"cluster\": {\n                \"id_in\": cluster_ids\n            }\n        }\n    })\n    cpu = {\n        \"total_cpu_cores\": 0,\n        \"total_cpu_hz\": 0,\n        \"used_cpu_hz\": 0,\n    }\n    memory = {\n        \"total_memory\": 0,\n        \"used_memory\": 0,\n    }\n    storage = {\n        \"total\": 0,\n        \"used\": 0,\n        \"invalid\": 0,\n        \"available\": 0\n    }\n\n    for host in hosts:\n        cluster = next(\n            cluster for cluster in clusters if cluster.id == host.cluster.id)\n        if cluster.hypervisor == Hypervisor.ELF:\n            memory['total_memory'] += 0 if host.total_memory_bytes is None else host.total_memory_bytes\n            memory['used_memory'] += (0 if host.running_pause_vm_memory_bytes is None else host.running_pause_vm_memory_bytes) + \\\n                (0 if host.os_memory_bytes is None else host.os_memory_bytes)\n\n    for cluster in clusters:\n        if cluster.type == ClusterType.SMTX_OS:\n            cpu[\"total_cpu_cores\"] += 0 if cluster.total_cpu_cores is None else cluster.total_cpu_cores\n            cpu[\"total_cpu_hz\"] += 0 if cluster.total_cpu_hz is None else cluster.total_cpu_hz\n            cpu[\"used_cpu_hz\"] += 0 if cluster.used_cpu_hz is None else cluster.used_cpu_hz\n            if cluster.hypervisor == Hypervisor.VMWARE:\n                memory[\"total_memory\"] += 0 if cluster.total_memory_bytes is None else cluster.total_memory_bytes\n                memory[\"used_memory\"] += 0 if cluster.used_memory_bytes is None else cluster.used_memory_bytes\n        storage[\"total\"] += 0 if cluster.total_data_capacity is None else cluster.total_data_capacity\n        storage[\"used\"] += 0 if cluster.used_data_space is None else cluster.used_data_space\n        storage[\"invalid\"] += 0 if cluster.failure_data_space is None else cluster.failure_data_space\n    if len([cluster for cluster in clusters if cluster.type != ClusterType.SMTX_ZBS]) > 1:\n        cpu[\"cpu_usage\"] = \"{:.2f}%\".format(\n            cpu[\"used_cpu_hz\"] / cpu[\"total_cpu_hz\"])\n        cpu[\"total_cpu_hz\"] = format_unit(cpu[\"total_cpu_hz\"], hz_units, 1000)\n        cpu[\"used_cpu_hz\"] = format_unit(cpu[\"used_cpu_hz\"], hz_units, 1000)\n        result['cpu'] = cpu\n        memory[\"memory_usage\"] = \"{:.2f}%\".format(\n            memory[\"used_memory\"] / memory[\"total_memory\"])\n        memory[\"total_memory\"] = format_unit(\n            memory[\"total_memory\"], byte_units)\n        memory[\"used_memory\"] = format_unit(\n            memory[\"used_memory\"], byte_units)\n        result[\"memory\"] = memory\n    storage[\"available\"] = format_unit(\n        storage[\"total\"] - storage[\"used\"] - storage[\"invalid\"], byte_units)\n    storage[\"total\"] = format_unit(storage[\"total\"], byte_units)\n    storage[\"used\"] = format_unit(storage[\"used\"], byte_units)\n    storage[\"invalid\"] = format_unit(storage[\"invalid\"], byte_units)\n    result[\"storage\"] = storage\n    return result\n"}
</CodeBlock>

#### 构建 Dashboard

<CodeBlock language="python">
{"def build_dashboard(api_client: ApiClient, datacenter_id: str = None, cluster_id: str = None):\n    result = {}\n    cluster_api = ClusterApi(api_client)\n    clusters = cluster_api.get_clusters({\n        \"where\": {\"id\": cluster_id} if cluster_id is not None else {\"datacenters_some\": {\"id\": datacenter_id}} if datacenter_id is not None else None\n    })\n    cluster_ids = [cluster.id for cluster in clusters]\n\n    result[\"alerts\"] = build_alerts(api_client, cluster_ids)\n    result[\"hdd\"] = build_hdd_info(api_client, cluster_ids)\n    metric = build_metrics(api_client, clusters, cluster_ids)\n    if \"cpu\" in metric:\n        result[\"cpu\"] = metric[\"cpu\"]\n    if \"memory\" in metric:\n        result[\"memory\"] = metric[\"memory\"]\n    if \"storage\" in metric:\n        result[\"storage\"] = metric[\"storage\"]\n    return result\n"}
</CodeBlock>
