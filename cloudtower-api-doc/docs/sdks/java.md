---
title: Java
---
import Terminology from '@site/terminology.json'
import CodeTerminology from '@site/code-terminology.json'
import CodeBlock from '@theme/CodeBlock'

Java 环境下的 {Terminology['terminology']['zh-CN']['PRODUCT']} SDK，适用于 Java 1.8 及以上版本

# {Terminology['terminology']['zh-CN']['PRODUCT']} Java SDK

Java 环境下的 {Terminology['terminology']['zh-CN']['PRODUCT']} SDK，适用于 Java 1.8 及以上版本

- <a href={`https://github.com/${CodeTerminology["java_github_address"]}`}>源码地址</a>
- <a href={`https://github.com/${CodeTerminology["java_github_address"]}/releases`}>下载地址</a>
- <a href={`https://code.${'s' + 'martx'}.com`}>文档链接</a>

## 安装

- ### 源码安装

  <CodeBlock language="shell">
  {["git clone https://github.com/", CodeTerminology["java_github_address"], ".git\nmvn clean install\n"].join('')}
  </CodeBlock>

- ### jar 包安装

  <CodeBlock language="shell">
  {"# download jar and pom from release page\nmvn install:install-file -D\"file=<path/to/jar>\" -D\"pomFile=<path/to/pom>\"\n"}
  </CodeBlock>

- ### 中央仓库
  > 暂无

## 使用

### 创建实例

#### 创建 `ApiClient` 实例

<CodeBlock language="java">
{"ApiClient client = new ApiClient();\nclient.setBasePath(\"http://tower.example.com/v2/api\");\n"}
</CodeBlock>

> 如果需要使用 https，可以选择忽略证书验证

<CodeBlock language="java">
{"ApiClient client = new ApiClient();\nclient.setBasePath(\"https://tower.example.com/v2/api\");\nclient.setVerifyingSsl(false);\n"}
</CodeBlock>

#### 创建对应的 API 实例

> 根据不同用途的操作创建相关的 API 实例，例如虚拟机相关操作需要创建一个 `VmApi`。

<CodeBlock language="java">
{"VmApi vmApi = new VmApi(client);\n"}
</CodeBlock>

### 鉴权

<CodeBlock language="java">
{"// 通过 UserApi 中的 login 方法来获得 token。\nUserApi userApi = new UserApi(client);\nLoginInput loginInput = new LoginInput()\n    .username(\"<username>\")\n    .password(\"<password>\").source(UserSource.LOCAL);\nWithTaskLoginResponse token = userApi.login(loginInput);\n((ApiKeyAuth) client.getAuthentication(\"Authorization\")).setApiKey(token.getData().getToken());\n"}
</CodeBlock>

### 发送请求

#### 获取资源

<CodeBlock language="java">
{"List<Vm> vms = vmApi.getVms(new GetVmsRequestBody().first(1));\n"}
</CodeBlock>

#### 更新资源

> 资源更新会产生相关的异步任务，当异步任务结束时，代表资源操作完成且数据已更新。

<CodeBlock language="java">
{"WithTaskVm withTaskVm = vmApi.startVm(\n    new VmStartParams()\n        .where(new VmWhereInput()\n            .id(vm.getId()))).get(0);\n"}
</CodeBlock>

> 可以通过提供的工具方法 `WaitTask` 同步等待异步任务结束
>
> - 方法参数说明
>
> | 参数名    | 类型      | 是否必须 | 说明                        |
> | --------- | --------- | -------- | --------------------------- |
> | id        | string    | 是       | 需查询的 task 的 id         |
> | apiClient | ApiClient | 是       | 查询所使用的 ApiClient 实例 |
> | interval  | int       | 否       | 轮询的间隔时间，默认为 5s   |
> | timeout   | int       | 否       | 超时时间，默认为 300s       |
>
> - 错误说明
>
> | 错误码 | 说明             |
> | ------ | ---------------- |
> | 408    | 超时             |
> | 500    | 异步任务内部错误 |

<CodeBlock language="java">
{"WithTaskVm withTaskVm = vmApi.startVm(\n    new VmStartParams()\n        .where(new VmWhereInput()\n            .id(vm.getId()))).get(0);\nTaskUtil.WaitTask(withTaskVm.getTaskId(), client);\n"}
</CodeBlock>

> 如果是复数任务则可以通过 `WaitTasks`
>
> - 方法参数说明
>
> | 参数名      | 类型           | 是否必须 | 说明                                                                               |
> | ----------- | -------------- | -------- | ---------------------------------------------------------------------------------- |
> | ids         | List\<String\> | 是       | 需查询的 task 的 id 列表                                                           |
> | apiClient   | ApiClient      | 是       | 查询所使用的 ApiClient 实例                                                        |
> | exitOnError | boolean        | 否       | 是否在单个 Task 出错时立即退出，否则则会等待全部 Task 都完成后再退出，默认为 False |
> | interval    | int            | 否       | 轮询的间隔时间，默认为 5s                                                          |
> | timeout     | int            | 否       | 超时时间，默认为 300s                                                              |
>
> - 错误说明
>
> | 错误码 | 说明             |
> | ------ | ---------------- |
> | 408    | 超时             |
> | 500    | 异步任务内部错误 |

<CodeBlock language="java">
{"VmStartParams startParams = new VmStartParams()\n    .where(new VmWhereInput()\n        .addIdInItem(\"vm_id_1\")\n        .addIdInItem(\"vm_id_2\"));\nList<WithTaskVm> startedVms = vmApi.startVm(startParams);\nList<String> tasks = startedVms.stream().map(startedVm -> startedVm.getTaskId()).collect(Collectors.toList());\nTaskUtil.WaitTasks(tasks, client);\n"}
</CodeBlock>

#### 其他

##### 创建 `ActivePassiveApiClient` 实例

{Terminology['terminology']['zh-CN']['PRODUCT']} 在 4.9.0 引入了多管理 IP 主备部署，如果需要访问此类 {Terminology['terminology']['zh-CN']['PRODUCT']}，可以使用 `ActivePassiveApiClient` 配置同一个主备集群的多个 endpoint。同一时间预期最多只有一个 active endpoint，传入顺序不代表主备关系，客户端会通过探测结果选择当前 active endpoint。

<CodeBlock language="java">
{"ActivePassiveApiClient client = new ActivePassiveApiClient(\n    \"https://tower-a.example.com\",\n    \"https://tower-b.example.com\");\n\nLoginInput loginInput = new LoginInput()\n    .username(\"<username>\")\n    .password(\"<password>\")\n    .source(UserSource.LOCAL);\nWithTaskLoginResponse token = new UserApi(client).login(loginInput);\nClientUtil.login(token.getData().getToken(), client);\n\nVmApi vmApi = new VmApi(client);\n"}
</CodeBlock>

##### 故障切换策略

`ActivePassiveApiClient` 支持以下故障切换策略：

- `AUTO_FAILOVER`：默认的策略，当没有缓存的 active endpoint 时，会尝试探测并缓存当前 active endpoint；请求返回 307 后自动重新探测并重试一次；请求发生网络 I/O 异常后清空缓存，但不会自动重试。
- `MANUAL_FAILOVER`：请求返回 307 后不自动重新探测和重试，清空缓存由调用方处理故障切换，其余业务逻辑和 `AUTO_FAILOVER` 一致。
- `ALWAYS_PROBE`：不缓存 active endpoint，每次请求前都重新探测 active endpoint；请求返回 307 后不自动重试。

如果需要指定故障切换策略，可以在创建实例时传入：

<CodeBlock language="java">
{"ActivePassiveApiClient client = new ActivePassiveApiClient(\n    ActivePassiveFailoverStrategy.MANUAL_FAILOVER,\n    \"https://tower-a.example.com\",\n    \"https://tower-b.example.com\");\n"}
</CodeBlock>

##### 发送异步请求

> 上述请求的发送都是同步的请求，会堵塞当前进程。如果需要使用异步请求，可以使用 `${Api}Async` 配合 `ApiCallback` 来发送异步请求。

<CodeBlock language="java">
{"vmApi.getVmsAsync(\n    new GetVmsRequestBody().first(1),\n    new ApiCallback<List<Alert>>() {\n      @Override\n      public void onFailure(ApiException e, int statusCode, Map responseHeaders) {\n        // error callback\n      }\n      @Override\n      public void onUploadProgress(long bytesWritten, long contentLength, boolean done) {\n        // upload progress callback\n      }\n      @Override\n      public void onDownloadProgress(long bytesRead, long contentLength, boolean done) {\n        // download progress callback\n      }\n      @Override\n      public void onSuccess(List<Alert> vms, int statusCode, Map<String, List<String>> responseHeaders) {\n        // success callback\n      }\n    });\n"}
</CodeBlock>

##### 设置返回信息的语言

> 可以通过设置/清除默认请求头来设定返回值的语言，可选值为 `["en-US", "zh-CN"]`，不在可选值范围内的语言会返回一个 HTTP 400 错误

<CodeBlock language="java">
{"AlertApi alertApi = new AlertApi(client);\n// 此时得到的 alerts 中的 message, solution, cause, impact 字段将被为英文描述\nList<Alert> alerts = alertApi.getAlerts(new GetAlertsRequestBody().first(1));\n// 此时得到的 alerts 中的 message, solution, cause, impact 字段将被为中文描述\nclient.addDefaultHeader(\"content-language\", \"zh-CN\");\nalerts = alertApi.getAlerts(new GetAlertsRequestBody().first(1));\nclient.removeDefaultHeader(\"content-language\");\n// 此时得到的 alerts 中的 message, solution, cause, impact 字段将为英文描述\nalerts = alertApi.getAlerts(new GetAlertsRequestBody().first(1));\nclient.addDefaultHeader(\"content-language\", \"fr-CA\");\n// 此时将返回一个HTTP 400 错误\nalerts = alertApi.getAlerts(new GetAlertsRequestBody().first(1));\n"}
</CodeBlock>

## 操作示例

### 获取虚拟机

#### 获取所有虚拟机

<CodeBlock language="java">
{"public class App {\n\n  public static void main(String[] args) throws ApiException {\n    ApiClient client = new ApiClient();\n    client.setBasePath(\"http://tower.example.com/v2/api\");\n    client.setApiKey(\"token\");\n    List<Vm> vms = getAllVms(client);\n  }\n\n  public static List<Vm> getAllVms(ApiClient client) throws ApiException {\n    VmApi vmApi = new VmApi(client);\n    return vmApi.getVms(new GetVmsRequestBody());\n  }\n}\n"}
</CodeBlock>

#### 分页获取虚拟机

<CodeBlock language="java">
{"public class App {\n\n  public static void main(String[] args) throws ApiException {\n    ApiClient client = new ApiClient();\n    client.setBasePath(\"http://tower.example.com/v2/api\");\n    client.setApiKey(\"token\");\n    List<Vm> vms = getVmsByPagination(client, 50, 100);\n  }\n\n  public static List<Vm> getVmsByPagination(ApiClient client, int from, int to) throws ApiException {\n    VmApi vmApi = new VmApi(client);\n    GetVmsRequestBody body = new GetVmsRequestBody().skip(from - 1).first(to - from);\n    return vmApi.getVms(body);\n  }\n}\n"}
</CodeBlock>

#### 获取所有已开机虚拟机

<CodeBlock language="java">
{"public class App {\n\n  public static void main(String[] args) throws ApiException {\n    ApiClient client = new ApiClient();\n    client.setBasePath(\"http://tower.example.com/v2/api\");\n    client.setApiKey(\"token\");\n    List<Vm> vms = getAllRunningVms(client);\n  }\n\n  public static List<Vm> getAllRunningVms(ApiClient client) throws ApiException {\n    VmApi vmApi = new VmApi(client);\n    VmWhereInput where = new VmWhereInput().status(VmStatus.RUNNING);\n    GetVmsRequestBody body = new GetVmsRequestBody().where(where);\n    return vmApi.getVms(body);\n  }\n}\n"}
</CodeBlock>

#### 获取名称或描述中包含特定字符串的虚拟机

<CodeBlock language="java">
{"public class App {\n\n  public static void main(String[] args) throws ApiException {\n    ApiClient client = new ApiClient();\n    client.setBasePath(\"http://tower.example.com/v2/api\");\n    client.setApiKey(\"token\");\n    List<Vm> vms = getVmsByNameMatching(client, \"yinsw\");\n  }\n\n  public static List<Vm> getVmsByNameMatching(ApiClient client, String matching) throws ApiException {\n    VmApi vmApi = new VmApi(client);\n    VmWhereInput where = new VmWhereInput().nameContains(matching);\n    GetVmsRequestBody body = new GetVmsRequestBody().where(where);\n    return vmApi.getVms(body);\n  }\n}\n"}
</CodeBlock>

#### 获取所有 vcpu > n 的虚拟机

<CodeBlock language="java">
{"public class App {\n\n  public static void main(String[] args) throws ApiException {\n    ApiClient client = new ApiClient();\n    client.setBasePath(\"http://tower.example.com/v2/api\");\n    client.setApiKey(\"token\");\n    List<Vm> vms = getVmsHasNMoreCpuCore(client, 4);\n  }\n\n  public static List<Vm> getVmsHasNMoreCpuCore(ApiClient client, int n) throws ApiException {\n    VmApi vmApi = new VmApi(client);\n    VmWhereInput where = new VmWhereInput().vcpuGt(n);\n    GetVmsRequestBody body = new GetVmsRequestBody().where(where);\n    return vmApi.getVms(body);\n  }\n}\n"}
</CodeBlock>

### 从模版创建虚拟机

#### 仅指定 id

<CodeBlock language="java">
{"public class App {\n\n  public static void main(String[] args) throws ApiException {\n    ApiClient client = new ApiClient();\n\n    client.setBasePath(\"http://tower.example.com/v2/api\");\n    ClientUtil.login(\"<username>\", \"<password>\", client);\n    List<Vm> vms = createVmFromTemplate(client, new VmCreateVmFromContentLibraryTemplateParams()\n        .clusterId(\"cluster_id\")\n        .templateId(\"template_id\")\n        .name(\"vm_name\")\n        .isFullCopy(false));\n  }\n\n  public static List<Vm> createVmFromTemplate(ApiClient client, VmCreateVmFromContentLibraryTemplateParams param)\n      throws ApiException {\n    VmApi vmApi = new VmApi(client);\n    List<VmCreateVmFromContentLibraryTemplateParams> params = new ArrayList<VmCreateVmFromContentLibraryTemplateParams>(\n        1);\n    params.add(param);\n    List<WithTaskVm> withTaskVms = vmApi.createVmFromContentLibraryTemplate(params);\n    List<String> tasks = withTaskVms.stream().map(vms -> vms.getTaskId()).collect(Collectors.toList());\n    List<String> ids = withTaskVms.stream().map(vms -> vms.getData().getId()).collect(Collectors.toList());\n    TaskUtil.WaitTasks(tasks, client);\n    List<Vm> vms = vmApi\n        .getVms(\n            new GetVmsRequestBody()\n                .where(new VmWhereInput()\n                    .idIn(ids)));\n    return vms;\n  }\n}\n"}
</CodeBlock>

#### 配置与模板不同的虚拟盘参数

<CodeBlock language="java">
{"public class App {\n\n  public static void main(String[] args) throws ApiException, IOException {\n    ApiClient client = new ApiClient();\n\n    client.setBasePath(\"http://tower.example.com/v2/api\");\n    ClientUtil.login(\"<username>\", \"<password>\", client);\n    VmDiskOperate diskOperate = new VmDiskOperate()\n        .removeDisks(\n            new VmDiskOperateRemoveDisks()\n                .addDiskIndexItem(1))\n        .newDisks(\n            new VmDiskParams()\n                .addMountCdRomsItem(\n                    new VmCdRomParams()\n                        .boot(3))\n                .addMountDisksItem(\n                    new MountDisksParams()\n                        .boot(1)\n                        .bus(Bus.VIRTIO)\n                        .vmVolumeId(\"vm_volume_id\"))\n                .addMountNewCreateDisksItem(\n                    new MountNewCreateDisksParams()\n                        .vmVolume(\n                            new MountNewCreateDisksParamsVmVolume()\n                                .elfStoragePolicy(VmVolumeElfStoragePolicyType._2_THIN_PROVISION)\n                                .size(4L * 1024 * 1024 * 1024)\n                                .name(\"disk_name\"))\n                        .boot(3)\n                        .bus(Bus.VIRTIO)));\n\n    List<Vm> vms = createVmFromTemplate(client, new VmCreateVmFromContentLibraryTemplateParams()\n        .clusterId(\"cluster_id\")\n        .templateId(\"template_id\")\n        .name(\"vm_name\")\n        .isFullCopy(false)\n        .diskOperate(diskOperate));\n    // 处理 vms\n    System.out.println(vms);\n  }\n\n  public static List<Vm> createVmFromTemplate(ApiClient client, VmCreateVmFromContentLibraryTemplateParams param)\n      throws ApiException {\n    VmApi vmApi = new VmApi(client);\n    List<VmCreateVmFromContentLibraryTemplateParams> params = new ArrayList<VmCreateVmFromContentLibraryTemplateParams>(\n        1);\n    params.add(param);\n    List<WithTaskVm> withTaskVms = vmApi.createVmFromContentLibraryTemplate(params);\n    List<String> tasks = withTaskVms.stream().map(vms -> vms.getTaskId()).collect(Collectors.toList());\n    List<String> ids = withTaskVms.stream().map(vms -> vms.getData().getId()).collect(Collectors.toList());\n    TaskUtil.WaitTasks(tasks, client);\n    List<Vm> vms = vmApi\n        .getVms(\n            new GetVmsRequestBody()\n                .where(new VmWhereInput()\n                    .idIn(ids)));\n    return vms;\n  }\n}\n"}
</CodeBlock>

#### 配置与模版不同的网卡参数

<CodeBlock language="java">
{"public class App {\n\n  public static void main(String[] args) throws ApiException {\n    ApiClient client = new ApiClient();\n    client.setBasePath(\"http://tower.example.com/v2/api\");\n    ClientUtil.login(\"<username>\", \"<password>\", client);\n    VmNicParams nicParams = new VmNicParams()\n        .connectVlanId(\"nic_vlan_id\") // 并非 vlan 的 vlan_id（0-4095） 而是 vlan 的 id（uuid）\n        .enabled(true)\n        .model(VmNicModel.E1000);\n    List<Vm> vms = createVmFromTemplate(client, new VmCreateVmFromContentLibraryTemplateParams()\n        .clusterId(\"cl2k0mpoy026d0822xq6ctsim\")\n        .templateId(\"cl2k0tvpw04y608222h8so9ov\")\n        .name(\"createFromVmTemplate\")\n        .isFullCopy(false)\n        .addVmNicsItem(nicParams));\n  }\n\n  public static List<Vm> createVmFromTemplate(ApiClient client, VmCreateVmFromContentLibraryTemplateParams param)\n      throws ApiException {\n    VmApi vmApi = new VmApi(client);\n    List<VmCreateVmFromContentLibraryTemplateParams> params = new ArrayList<VmCreateVmFromContentLibraryTemplateParams>(\n        1);\n    params.add(param);\n    List<WithTaskVm> withTaskVms = vmApi.createVmFromContentLibraryTemplate(params);\n    List<String> tasks = withTaskVms.stream().map(vms -> vms.getTaskId()).collect(Collectors.toList());\n    List<String> ids = withTaskVms.stream().map(vms -> vms.getData().getId()).collect(Collectors.toList());\n    TaskUtil.WaitTasks(tasks, client);\n    List<Vm> vms = vmApi\n        .getVms(\n            new GetVmsRequestBody()\n                .where(new VmWhereInput()\n                    .idIn(ids)));\n    return vms;\n  }\n}\n"}
</CodeBlock>

### 创建空白虚拟机

#### 简单创建

<CodeBlock language="java">
{"public class App {\n\n  public static void main(String[] args) throws ApiException {\n    ApiClient client = new ApiClient();\n    client.setBasePath(\"http://tower.example.com/v2/api\");\n    client.setApiKey(\"token\");\n    VmCreationParams param = new VmCreationParams()\n        .clusterId(\"cl2k0mpoy026d0822xq6ctsim\")\n        .name(\"vm_name_2\")\n        .ha(true)\n        .cpuCores(4)\n        .cpuSockets(4)\n        .memory(4L * 1024 * 1024 * 1024)\n        .vcpu(16)\n        .status(VmStatus.STOPPED)\n        .firmware(VmFirmware.BIOS)\n        .addVmNicsItem(new VmNicParams().connectVlanId(\"cl2k0msiz02wc08220d6m3bz5\"))\n        .vmDisks(new VmDiskParams().addMountCdRomsItem(new VmCdRomParams().boot(0).index(0)));\n\n    List<Vm> vms = createVm(client, param);\n  }\n\n  public static List<Vm> createVm(ApiClient client, VmCreationParams param)\n      throws ApiException {\n    VmApi vmApi = new VmApi(client);\n    List<VmCreationParams> params = new ArrayList<VmCreationParams>(1);\n    params.add(param);\n    List<WithTaskVm> withTaskVms = vmApi.createVm(params);\n    List<String> tasks = withTaskVms.stream().map(vms -> vms.getTaskId()).collect(Collectors.toList());\n    List<String> ids = withTaskVms.stream().map(vms -> vms.getData().getId()).collect(Collectors.toList());\n    TaskUtil.WaitTasks(tasks, client);\n    List<Vm> vms = vmApi\n        .getVms(\n            new GetVmsRequestBody()\n                .where(new VmWhereInput()\n                    .idIn(ids)));\n    return vms;\n  }\n}\n"}
</CodeBlock>

#### 创建时配置虚拟盘

##### CD-ROM 加载 ISO

<CodeBlock language="java">
{"public class App {\n\n  public static void main(String[] args) throws ApiException {\n    ApiClient client = new ApiClient();\n    client.setBasePath(\"http://tower.example.com/v2/api\");\n    client.setApiKey(\"token\");\n    VmCreationParams param = new VmCreationParams()\n        .clusterId(\"cl2k0mpoy026d0822xq6ctsim\")\n        .name(\"vm_name\")\n        .ha(true)\n        .cpuCores(4)\n        .cpuSockets(4)\n        .memory(4L * 1024 * 1024 * 1024)\n        .vcpu(16)\n        .status(VmStatus.STOPPED)\n        .firmware(VmFirmware.BIOS)\n        .addVmNicsItem(new VmNicParams().connectVlanId(\"cl2k0msiz02wc08220d6m3bz5\"))\n        .vmDisks(new VmDiskParams()\n            .addMountCdRomsItem(new VmCdRomParams()\n                .boot(0)\n                .index(0)\n                .elfImageId(\"cl2k1yswo0csh0822299yalwn\")));\n\n    List<Vm> vms = createVm(client, param);\n  }\n\n  public static List<Vm> createVm(ApiClient client, VmCreationParams param)\n      throws ApiException {\n    VmApi vmApi = new VmApi(client);\n    List<VmCreationParams> params = new ArrayList<VmCreationParams>(1);\n    params.add(param);\n    List<WithTaskVm> withTaskVms = vmApi.createVm(params);\n    List<String> tasks = withTaskVms.stream().map(vms -> vms.getTaskId()).collect(Collectors.toList());\n    List<String> ids = withTaskVms.stream().map(vms -> vms.getData().getId()).collect(Collectors.toList());\n    TaskUtil.WaitTasks(tasks, client);\n    List<Vm> vms = vmApi\n        .getVms(\n            new GetVmsRequestBody()\n                .where(new VmWhereInput()\n                    .idIn(ids)));\n    return vms;\n  }\n}\n"}
</CodeBlock>

##### 挂载虚拟卷为虚拟盘

<CodeBlock language="java">
{"public class App {\n\n  public static void main(String[] args) throws ApiException {\n    ApiClient client = new ApiClient();\n    client.setBasePath(\"http://tower.example.com/v2/api\");\n    client.setApiKey(\"token\");\n    VmCreationParams param = new VmCreationParams()\n        .clusterId(\"cl2k0mpoy026d0822xq6ctsim\")\n        .name(\"vm_name\")\n        .ha(true)\n        .cpuCores(4)\n        .cpuSockets(4)\n        .memory(4L * 1024 * 1024 * 1024)\n        .vcpu(16)\n        .status(VmStatus.STOPPED)\n        .firmware(VmFirmware.BIOS)\n        .addVmNicsItem(new VmNicParams().connectVlanId(\"cl2k0msiz02wc08220d6m3bz5\"))\n        .vmDisks(new VmDiskParams()\n            .addMountDisksItem(new MountDisksParams()\n                .boot(0)\n                .index(0)\n                .bus(Bus.SCSI)\n                .vmVolumeId(\"cl2k1kohp08up08225yjgfpdz\")));\n\n    List<Vm> vms = createVm(client, param);\n  }\n\n  public static List<Vm> createVm(ApiClient client, VmCreationParams param)\n      throws ApiException {\n    VmApi vmApi = new VmApi(client);\n    List<VmCreationParams> params = new ArrayList<VmCreationParams>(1);\n    params.add(param);\n    List<WithTaskVm> withTaskVms = vmApi.createVm(params);\n    List<String> tasks = withTaskVms.stream().map(vms -> vms.getTaskId()).collect(Collectors.toList());\n    List<String> ids = withTaskVms.stream().map(vms -> vms.getData().getId()).collect(Collectors.toList());\n    TaskUtil.WaitTasks(tasks, client);\n    List<Vm> vms = vmApi\n        .getVms(\n            new GetVmsRequestBody()\n                .where(new VmWhereInput()\n                    .idIn(ids)));\n    return vms;\n  }\n}\n"}
</CodeBlock>

##### 挂载新增虚拟盘

<CodeBlock language="java">
{"public class App {\n\n  public static void main(String[] args) throws ApiException {\n    ApiClient client = new ApiClient();\n    client.setBasePath(\"http://tower.example.com/v2/api\");\n    client.setApiKey(\"token\");\n    VmCreationParams param = new VmCreationParams()\n        .clusterId(\"cl2k0mpoy026d0822xq6ctsim\")\n        .name(\"vm_name\")\n        .ha(true)\n        .cpuCores(4)\n        .cpuSockets(4)\n        .memory(4L * 1024 * 1024 * 1024)\n        .vcpu(16)\n        .status(VmStatus.STOPPED)\n        .firmware(VmFirmware.BIOS)\n        .addVmNicsItem(new VmNicParams().connectVlanId(\"cl2k0msiz02wc08220d6m3bz5\"))\n        .vmDisks(new VmDiskParams()\n            .addMountNewCreateDisksItem(new MountNewCreateDisksParams()\n                .index(0)\n                .boot(0)\n                .bus(Bus.VIRTIO)\n                .vmVolume(new MountNewCreateDisksParamsVmVolume()\n                    .elfStoragePolicy(VmVolumeElfStoragePolicyType._2_THIN_PROVISION)\n                    .name(\"new_disk\")\n                    .size(4L * 1024 * 1024 * 1024))));\n\n    List<Vm> vms = createVm(client, param);\n  }\n\n  public static List<Vm> createVm(ApiClient client, VmCreationParams param)\n      throws ApiException {\n    VmApi vmApi = new VmApi(client);\n    List<VmCreationParams> params = new ArrayList<VmCreationParams>(1);\n    params.add(param);\n    List<WithTaskVm> withTaskVms = vmApi.createVm(params);\n    List<String> tasks = withTaskVms.stream().map(vms -> vms.getTaskId()).collect(Collectors.toList());\n    List<String> ids = withTaskVms.stream().map(vms -> vms.getData().getId()).collect(Collectors.toList());\n    TaskUtil.WaitTasks(tasks, client);\n    List<Vm> vms = vmApi\n        .getVms(\n            new GetVmsRequestBody()\n                .where(new VmWhereInput()\n                    .idIn(ids)));\n    return vms;\n  }\n}\n"}
</CodeBlock>

#### 创建时配置虚拟网卡

<CodeBlock language="java">
{"public class App {\n\n  public static void main(String[] args) throws ApiException {\n    ApiClient client = new ApiClient();\n    client.setBasePath(\"http://tower.example.com/v2/api\");\n    client.setApiKey(\"token\");\n    VmCreationParams param = new VmCreationParams()\n        .clusterId(\"cl2k0mpoy026d0822xq6ctsim\")\n        .name(\"vm_name\")\n        .ha(true)\n        .cpuCores(4)\n        .cpuSockets(4)\n        .memory(4L * 1024 * 1024 * 1024)\n        .vcpu(16)\n        .status(VmStatus.STOPPED)\n        .firmware(VmFirmware.BIOS)\n        .addVmNicsItem(new VmNicParams()\n            .connectVlanId(\"cl2k0msiz02wc08220d6m3bz5\")\n            .macAddress(\"00:0C:29:B7:D8:E0\")\n            .model(VmNicModel.E1000))\n        .vmDisks(new VmDiskParams()\n            .addMountCdRomsItem(new VmCdRomParams().boot(0).index(0)));\n\n    List<Vm> vms = createVm(client, param);\n  }\n\n  public static List<Vm> createVm(ApiClient client, VmCreationParams param)\n      throws ApiException {\n    VmApi vmApi = new VmApi(client);\n    List<VmCreationParams> params = new ArrayList<VmCreationParams>(1);\n    params.add(param);\n    List<WithTaskVm> withTaskVms = vmApi.createVm(params);\n    List<String> tasks = withTaskVms.stream().map(vms -> vms.getTaskId()).collect(Collectors.toList());\n    List<String> ids = withTaskVms.stream().map(vms -> vms.getData().getId()).collect(Collectors.toList());\n    TaskUtil.WaitTasks(tasks, client);\n    List<Vm> vms = vmApi\n        .getVms(\n            new GetVmsRequestBody()\n                .where(new VmWhereInput()\n                    .idIn(ids)));\n    return vms;\n  }\n}\n"}
</CodeBlock>

### 编辑虚拟机

#### 编辑基本信息

<CodeBlock language="java">
{"public class App {\n\n  public static void main(String[] args) throws ApiException {\n    ApiClient client = new ApiClient();\n    client.setBasePath(\"http://tower.example.com/v2/api\");\n    client.setApiKey(\"token\");\n\n    VmWhereInput where = new VmWhereInput().id(\"cl2k0njfl04480822fxjq5nns\");\n    VmUpdateParamsData data = new VmUpdateParamsData()\n        .cpuSockets(2)\n        .cpuCores(2)\n        .vcpu(4)\n        .memory(8L * 1024 * 1024 * 1024)\n        .name(\"new_name\")\n        .description(\"new_description\");\n    List<Vm> vms = updateVm(client, where, data);\n  }\n\n  public static List<Vm> updateVm(ApiClient client, VmWhereInput where, VmUpdateParamsData data)\n      throws ApiException {\n    VmApi vmApi = new VmApi(client);\n    List<WithTaskVm> withTaskVms = vmApi.updateVm(new VmUpdateParams().where(where).data(data));\n    List<String> tasks = withTaskVms.stream().map(vms -> vms.getTaskId()).collect(Collectors.toList());\n    List<String> ids = withTaskVms.stream().map(vms -> vms.getData().getId()).collect(Collectors.toList());\n    TaskUtil.WaitTasks(tasks, client);\n    List<Vm> vms = vmApi\n        .getVms(\n            new GetVmsRequestBody()\n                .where(new VmWhereInput()\n                    .idIn(ids)));\n    return vms;\n  }\n}\n"}
</CodeBlock>

### 编辑高级信息

<CodeBlock language="java">
{"public class App {\n\n  public static void main(String[] args) throws ApiException {\n    ApiClient client = new ApiClient();\n    client.setBasePath(\"http://tower.example.com/v2/api\");\n    client.setApiKey(\"token\");\n\n    VmWhereInput where = new VmWhereInput().id(\"cl2k0njfl04480822fxjq5nns\");\n    VmUpdateAdvancedOptionsParamsData data = new VmUpdateAdvancedOptionsParamsData()\n        .clockOffset(VmClockOffset.LOCALTIME)\n        .cpuModel(\"Skylake-Server-IBRS\")\n        .videoType(VmVideoType.VGA)\n        .windowsOptimize(true);\n    List<Vm> vms = updateVm(client, where, data);\n  }\n\n  public static List<Vm> updateVm(ApiClient client, VmWhereInput where, VmUpdateAdvancedOptionsParamsData data)\n      throws ApiException {\n    VmApi vmApi = new VmApi(client);\n    List<WithTaskVm> withTaskVms = vmApi\n        .updateVmAdvancedOptions(new VmUpdateAdvancedOptionsParams().where(where).data(data));\n    List<String> tasks = withTaskVms.stream().map(vms -> vms.getTaskId()).collect(Collectors.toList());\n    List<String> ids = withTaskVms.stream().map(vms -> vms.getData().getId()).collect(Collectors.toList());\n    TaskUtil.WaitTasks(tasks, client);\n    List<Vm> vms = vmApi\n        .getVms(\n            new GetVmsRequestBody()\n                .where(new VmWhereInput()\n                    .idIn(ids)));\n    return vms;\n  }\n}\n"}
</CodeBlock>

#### CD-ROM 编辑

##### 添加 CD-ROM

<CodeBlock language="java">
{"public class App {\n\n  public static void main(String[] args) throws ApiException {\n    ApiClient client = new ApiClient();\n    client.setBasePath(\"http://tower.example.com/v2/api\");\n    client.setApiKey(\"token\");\n\n    VmWhereInput where = new VmWhereInput().id(\"cl2k0njfl04480822fxjq5nns\");\n    VmAddCdRomParamsData data = new VmAddCdRomParamsData()\n        .addVmCdRomsItem(new VmCdRomParams()\n        .boot(0)\n        .index(0)\n        .elfImageId(\"cl2k1yswo0csh0822299yalwn\"));\n    List<Vm> vms = addCdRom(client, where, data);\n  }\n\n  public static List<Vm> addCdRom(ApiClient client, VmWhereInput where, VmAddCdRomParamsData data)\n      throws ApiException {\n    VmApi vmApi = new VmApi(client);\n    List<WithTaskVm> withTaskVms = vmApi\n        .addVmCdRom(new VmAddCdRomParams().where(where).data(data));\n    List<String> tasks = withTaskVms.stream().map(vms -> vms.getTaskId()).collect(Collectors.toList());\n    List<String> ids = withTaskVms.stream().map(vms -> vms.getData().getId()).collect(Collectors.toList());\n    TaskUtil.WaitTasks(tasks, client);\n    List<Vm> vms = vmApi\n        .getVms(\n            new GetVmsRequestBody()\n                .where(new VmWhereInput()\n                    .idIn(ids)));\n    return vms;\n  }\n}\n"}
</CodeBlock>

##### 删除 CD-ROM

<CodeBlock language="java">
{"public class App {\n\n  public static void main(String[] args) throws ApiException {\n    ApiClient client = new ApiClient();\n    client.setBasePath(\"http://tower.example.com/v2/api\");\n    client.setApiKey(\"token\");\n\n    VmWhereInput where = new VmWhereInput().id(\"cl2k0njfl04480822fxjq5nns\");\n    VmRemoveCdRomParamsData data = new VmRemoveCdRomParamsData().addCdRomIdsItem(\"cl2k2v1fv0jvo0822dr73hd1n\");\n    List<Vm> vms = deleteCdRom(client, where, data);\n  }\n\n  public static List<Vm> deleteCdRom(ApiClient client, VmWhereInput where, VmRemoveCdRomParamsData data)\n      throws ApiException {\n    VmApi vmApi = new VmApi(client);\n    List<WithTaskVm> withTaskVms = vmApi\n        .removeVmCdRom(new VmRemoveCdRomParams().where(where).data(data));\n    List<String> tasks = withTaskVms.stream().map(vms -> vms.getTaskId()).collect(Collectors.toList());\n    List<String> ids = withTaskVms.stream().map(vms -> vms.getData().getId()).collect(Collectors.toList());\n    TaskUtil.WaitTasks(tasks, client);\n    List<Vm> vms = vmApi\n        .getVms(\n            new GetVmsRequestBody()\n                .where(new VmWhereInput()\n                    .idIn(ids)));\n    return vms;\n  }\n}\n"}
</CodeBlock>

#### 虚拟卷操作

##### 添加新虚拟卷

<CodeBlock language="java">
{"public class App {\n\n  public static void main(String[] args) throws ApiException {\n    ApiClient client = new ApiClient();\n    client.setBasePath(\"http://tower.example.com/v2/api\");\n    client.setApiKey(\"token\");\n\n    VmWhereInput where = new VmWhereInput().id(\"cl2k0njfl04480822fxjq5nns\");\n    VmAddDiskParamsData data = new VmAddDiskParamsData().vmDisks(new VmAddDiskParamsDataVmDisks()\n        .addMountNewCreateDisksItem(new MountNewCreateDisksParams()\n            .boot(0)\n            .index(0)\n            .bus(Bus.VIRTIO)\n            .vmVolume(\n                new MountNewCreateDisksParamsVmVolume()\n                    .elfStoragePolicy(VmVolumeElfStoragePolicyType._2_THIN_PROVISION)\n                    .name(\"new_mount_disk\")\n                    .size(10L * 1024 * 1024 * 1024))));\n    List<Vm> vms = addDisk(client, where, data);\n  }\n\n  public static List<Vm> addDisk(ApiClient client, VmWhereInput where, VmAddDiskParamsData data)\n      throws ApiException {\n    VmApi vmApi = new VmApi(client);\n    List<WithTaskVm> withTaskVms = vmApi\n        .addVmDisk(new VmAddDiskParams().where(where).data(data));\n    List<String> tasks = withTaskVms.stream().map(vms -> vms.getTaskId()).collect(Collectors.toList());\n    List<String> ids = withTaskVms.stream().map(vms -> vms.getData().getId()).collect(Collectors.toList());\n    TaskUtil.WaitTasks(tasks, client);\n    List<Vm> vms = vmApi\n        .getVms(\n            new GetVmsRequestBody()\n                .where(new VmWhereInput()\n                    .idIn(ids)));\n    return vms;\n  }\n}\n"}
</CodeBlock>

##### 挂载已存在虚拟卷为虚拟盘

<CodeBlock language="java">
{"public class App {\n\n  public static void main(String[] args) throws ApiException {\n    ApiClient client = new ApiClient();\n    client.setBasePath(\"http://tower.example.com/v2/api\");\n    client.setApiKey(\"token\");\n\n    VmWhereInput where = new VmWhereInput().id(\"cl2k0njfl04480822fxjq5nns\");\n    VmAddDiskParamsData data = new VmAddDiskParamsData().vmDisks(new VmAddDiskParamsDataVmDisks()\n        .addMountDisksItem(new MountDisksParams()\n            .boot(0)\n            .index(0)\n            .bus(Bus.VIRTIO)\n            .vmVolumeId(\"cl2k37rex0maa0822ivcy2s9l\")));\n    List<Vm> vms = mountDisk(client, where, data);\n  }\n\n  public static List<Vm> mountDisk(ApiClient client, VmWhereInput where, VmAddDiskParamsData data)\n      throws ApiException {\n    VmApi vmApi = new VmApi(client);\n    List<WithTaskVm> withTaskVms = vmApi\n        .addVmDisk(new VmAddDiskParams().where(where).data(data));\n    List<String> tasks = withTaskVms.stream().map(vms -> vms.getTaskId()).collect(Collectors.toList());\n    List<String> ids = withTaskVms.stream().map(vms -> vms.getData().getId()).collect(Collectors.toList());\n    TaskUtil.WaitTasks(tasks, client);\n    List<Vm> vms = vmApi\n        .getVms(\n            new GetVmsRequestBody()\n                .where(new VmWhereInput()\n                    .idIn(ids)));\n    return vms;\n  }\n}\n"}
</CodeBlock>

##### 卸载虚拟盘

<CodeBlock language="java">
{"public class App {\n\n  public static void main(String[] args) throws ApiException {\n    ApiClient client = new ApiClient();\n    client.setBasePath(\"http://tower.example.com/v2/api\");\n    client.setApiKey(\"token\");\n\n    VmWhereInput where = new VmWhereInput().id(\"cl2k0njfl04480822fxjq5nns\");\n    VmRemoveDiskParamsData data = new VmRemoveDiskParamsData().addDiskIdsItem(\"cl2k38qv70mna082283l646jl\");\n    List<Vm> vms = removeDisk(client, where, data);\n  }\n\n  public static List<Vm> removeDisk(ApiClient client, VmWhereInput where, VmRemoveDiskParamsData data)\n      throws ApiException {\n    VmApi vmApi = new VmApi(client);\n    List<WithTaskVm> withTaskVms = vmApi\n        .removeVmDisk(new VmRemoveDiskParams().where(where).data(data));\n    List<String> tasks = withTaskVms.stream().map(vms -> vms.getTaskId()).collect(Collectors.toList());\n    List<String> ids = withTaskVms.stream().map(vms -> vms.getData().getId()).collect(Collectors.toList());\n    TaskUtil.WaitTasks(tasks, client);\n    List<Vm> vms = vmApi\n        .getVms(\n            new GetVmsRequestBody()\n                .where(new VmWhereInput()\n                    .idIn(ids)));\n    return vms;\n  }\n}\n"}
</CodeBlock>

#### 网卡操作

##### 添加网卡

<CodeBlock language="java">
{"public class App {\n\n  public static void main(String[] args) throws ApiException {\n    ApiClient client = new ApiClient();\n    client.setBasePath(\"http://tower.example.com/v2/api\");\n    client.setApiKey(\"token\");\n\n    VmWhereInput where = new VmWhereInput().id(\"cl2k0njfl04480822fxjq5nns\");\n    VmAddNicParamsData data = new VmAddNicParamsData()\n        .addVmNicsItem(new VmNicParams().connectVlanId(\"cl2k1ohoq09si0822q648n9v8\"));\n    List<Vm> vms = addVmNic(client, where, data);\n  }\n\n  public static List<Vm> addVmNic(ApiClient client, VmWhereInput where, VmAddNicParamsData data)\n      throws ApiException {\n    VmApi vmApi = new VmApi(client);\n    List<WithTaskVm> withTaskVms = vmApi\n        .addVmNic(new VmAddNicParams().where(where).data(data));\n    List<String> tasks = withTaskVms.stream().map(vms -> vms.getTaskId()).collect(Collectors.toList());\n    List<String> ids = withTaskVms.stream().map(vms -> vms.getData().getId()).collect(Collectors.toList());\n    TaskUtil.WaitTasks(tasks, client);\n    List<Vm> vms = vmApi\n        .getVms(\n            new GetVmsRequestBody()\n                .where(new VmWhereInput()\n                    .idIn(ids)));\n    return vms;\n  }\n}\n"}
</CodeBlock>

##### 编辑网卡基本信息

<CodeBlock language="java">
{"public class App {\n\n  public static void main(String[] args) throws ApiException {\n    ApiClient client = new ApiClient();\n    client.setBasePath(\"http://tower.example.com/v2/api\");\n    client.setApiKey(\"token\");\n\n    VmNicWhereInput where = new VmNicWhereInput().id(\"cl2k3coie0ngx0822oz5wgubx\");\n    VmUpdateNicBasicInfoParamsData data = new VmUpdateNicBasicInfoParamsData()\n        .subnetMask(\"255.255.240.0\")\n        .ipAddress(\"192.168.10.114\")\n        .gateway(\"192.168.31.215\");\n    List<Vm> vms = updateVmNic(client, where, data);\n  }\n\n  public static List<Vm> updateVmNic(ApiClient client, VmNicWhereInput where, VmUpdateNicBasicInfoParamsData data)\n      throws ApiException {\n    VmApi vmApi = new VmApi(client);\n    List<WithTaskVm> withTaskVms = vmApi\n        .updateVmNicBasicInfo(new VmUpdateNicBasicInfoParams().where(where).data(data));\n    List<String> tasks = withTaskVms.stream().map(vms -> vms.getTaskId()).collect(Collectors.toList());\n    List<String> ids = withTaskVms.stream().map(vms -> vms.getData().getId()).collect(Collectors.toList());\n    TaskUtil.WaitTasks(tasks, client);\n    List<Vm> vms = vmApi\n        .getVms(\n            new GetVmsRequestBody()\n                .where(new VmWhereInput()\n                    .idIn(ids)));\n    return vms;\n  }\n}\n"}
</CodeBlock>

##### 编辑网卡高级信息

<CodeBlock language="java">
{"public class App {\n\n  public static void main(String[] args) throws ApiException {\n    ApiClient client = new ApiClient();\n    client.setBasePath(\"http://tower.example.com/v2/api\");\n    client.setApiKey(\"token\");\n\n    VmNicWhereInput where = new VmNicWhereInput().id(\"cl2k3ill50oes0822f09n8ml6\");\n    VmUpdateNicAdvanceInfoParamsData data = new VmUpdateNicAdvanceInfoParamsData()\n        .connectVlanId(\"cl2k0msiz02wc08220d6m3bz5\")\n        .enabled(false)\n        .macAddress(\"00:0C:29:B7:D8:E0\")\n        .mirror(true);\n    List<Vm> vms = updateVmNic(client, where, data);\n  }\n\n  public static List<Vm> updateVmNic(ApiClient client, VmNicWhereInput where, VmUpdateNicAdvanceInfoParamsData data)\n      throws ApiException {\n    VmApi vmApi = new VmApi(client);\n    List<WithTaskVm> withTaskVms = vmApi\n        .updateVmNicAdvanceInfo(new VmUpdateNicAdvanceInfoParams().where(where).data(data));\n    List<String> tasks = withTaskVms.stream().map(vms -> vms.getTaskId()).collect(Collectors.toList());\n    List<String> ids = withTaskVms.stream().map(vms -> vms.getData().getId()).collect(Collectors.toList());\n    TaskUtil.WaitTasks(tasks, client);\n    List<Vm> vms = vmApi\n        .getVms(\n            new GetVmsRequestBody()\n                .where(new VmWhereInput()\n                    .idIn(ids)));\n    return vms;\n  }\n}\n"}
</CodeBlock>

##### 移除网卡

<CodeBlock language="java">
{"\npublic class App {\n\n  public static void main(String[] args) throws ApiException {\n    ApiClient client = new ApiClient();\n    client.setBasePath(\"http://tower.example.com/v2/api\");\n    client.setApiKey(\"token\");\n\n    VmWhereInput where = new VmWhereInput().id(\"cl2k0njfl04480822fxjq5nns\");\n    VmRemoveNicParamsData data = new VmRemoveNicParamsData()\n        .addNicIndexItem(1);\n    List<Vm> vms = removeVmNic(client, where, data);\n  }\n\n  public static List<Vm> removeVmNic(ApiClient client, VmWhereInput where, VmRemoveNicParamsData data)\n      throws ApiException {\n    VmApi vmApi = new VmApi(client);\n    List<WithTaskVm> withTaskVms = vmApi\n        .removeVmNic(new VmRemoveNicParams().where(where).data(data));\n    List<String> tasks = withTaskVms.stream().map(vms -> vms.getTaskId()).collect(Collectors.toList());\n    List<String> ids = withTaskVms.stream().map(vms -> vms.getData().getId()).collect(Collectors.toList());\n    TaskUtil.WaitTasks(tasks, client);\n    List<Vm> vms = vmApi\n        .getVms(\n            new GetVmsRequestBody()\n                .where(new VmWhereInput()\n                    .idIn(ids)));\n    return vms;\n  }\n}\n"}
</CodeBlock>

#### 虚拟机迁移

##### 迁移至指定主机

<CodeBlock language="java">
{"public class App {\n\n  public static void main(String[] args) throws ApiException {\n    ApiClient client = new ApiClient();\n    client.setBasePath(\"http://tower.example.com/v2/api\");\n    client.setApiKey(\"token\");\n\n    VmWhereInput where = new VmWhereInput().id(\"cl2k0njfl04480822fxjq5nns\");\n    VmStartParamsData data = new VmStartParamsData().hostId(\"cl2k0mq69027u0822q69zct7z\");\n    List<Vm> vms = migrateVm(client, where, data);\n  }\n\n  public static List<Vm> migrateVm(ApiClient client, VmWhereInput where, VmStartParamsDatadata)\n      throws ApiException {\n    VmApi vmApi = new VmApi(client);\n    List<WithTaskVm> withTaskVms = vmApi\n        .migRateVm(new VmMigrateParams().where(where).data(data));\n    List<String> tasks = withTaskVms.stream().map(vms -> vms.getTaskId()).collect(Collectors.toList());\n    List<String> ids = withTaskVms.stream().map(vms -> vms.getData().getId()).collect(Collectors.toList());\n    TaskUtil.WaitTasks(tasks, client);\n    List<Vm> vms = vmApi\n        .getVms(\n            new GetVmsRequestBody()\n                .where(new VmWhereInput()\n                    .idIn(ids)));\n    return vms;\n  }\n}\n"}
</CodeBlock>

##### 自动调度到合适的主机

<CodeBlock language="java">
{"public class App {\n\n  public static void main(String[] args) throws ApiException {\n    ApiClient client = new ApiClient();\n    client.setBasePath(\"http://tower.example.com/v2/api\");\n    client.setApiKey(\"token\");\n\n    VmWhereInput where = new VmWhereInput().id(\"cl2k0njfl04480822fxjq5nns\");\n    VmStartParamsData data = null;\n    List<Vm> vms = migrateVm(client, where, data);\n  }\n\n  public static List<Vm> migrateVm(ApiClient client, VmWhereInput where, VmStartParamsDatadata)\n      throws ApiException {\n    VmApi vmApi = new VmApi(client);\n    List<WithTaskVm> withTaskVms = vmApi\n        .migRateVm(new VmMigrateParams().where(where).data(data));\n    List<String> tasks = withTaskVms.stream().map(vms -> vms.getTaskId()).collect(Collectors.toList());\n    List<String> ids = withTaskVms.stream().map(vms -> vms.getData().getId()).collect(Collectors.toList());\n    TaskUtil.WaitTasks(tasks, client);\n    List<Vm> vms = vmApi\n        .getVms(\n            new GetVmsRequestBody()\n                .where(new VmWhereInput()\n                    .idIn(ids)));\n    return vms;\n  }\n}\n"}
</CodeBlock>

### 虚拟机电源操作

#### 虚拟机开机:

##### 指定虚拟机开机，自动调度到合适的虚拟机

<CodeBlock language="java">
{"public class App {\n\n  public static void main(String[] args) throws ApiException {\n    ApiClient client = new ApiClient();\n    client.setBasePath(\"http://tower.example.com/v2/api\");\n    client.setApiKey(\"token\");\n\n    VmWhereInput where = new VmWhereInput().id(\"cl2k0njfl04480822fxjq5nns\");\n    VmStartParamsData data = null;\n    List<Vm> vms = startVm(client, where, data);\n  }\n\n  public static List<Vm> startVm(ApiClient client, VmWhereInput where, VmStartParamsData data)\n      throws ApiException {\n    VmApi vmApi = new VmApi(client);\n    List<WithTaskVm> withTaskVms = vmApi\n        .startVm(new VmStartParams().where(where).data(data));\n    List<String> tasks = withTaskVms.stream().map(vms -> vms.getTaskId()).collect(Collectors.toList());\n    List<String> ids = withTaskVms.stream().map(vms -> vms.getData().getId()).collect(Collectors.toList());\n    TaskUtil.WaitTasks(tasks, client);\n    List<Vm> vms = vmApi\n        .getVms(\n            new GetVmsRequestBody()\n                .where(new VmWhereInput()\n                    .idIn(ids)));\n    return vms;\n  }\n}\n"}
</CodeBlock>

##### 批量虚拟机开机，自动调度到合适的虚拟机

<CodeBlock language="java">
{"public class App {\n\n  public static void main(String[] args) throws ApiException {\n    ApiClient client = new ApiClient();\n    client.setBasePath(\"http://tower.example.com/v2/api\");\n    client.setApiKey(\"token\");\n\n    VmWhereInput where = new VmWhereInput().nameStartsWith(\"prefix\");\n    VmStartParamsData data = null;\n    List<Vm> vms = startVm(client, where, data);\n  }\n\n  public static List<Vm> startVm(ApiClient client, VmWhereInput where, VmStartParamsData data)\n      throws ApiException {\n    VmApi vmApi = new VmApi(client);\n    List<WithTaskVm> withTaskVms = vmApi\n        .startVm(new VmStartParams().where(where).data(data));\n    List<String> tasks = withTaskVms.stream().map(vms -> vms.getTaskId()).collect(Collectors.toList());\n    List<String> ids = withTaskVms.stream().map(vms -> vms.getData().getId()).collect(Collectors.toList());\n    TaskUtil.WaitTasks(tasks, client);\n    List<Vm> vms = vmApi\n        .getVms(\n            new GetVmsRequestBody()\n                .where(new VmWhereInput()\n                    .idIn(ids)));\n    return vms;\n  }\n}\n"}
</CodeBlock>

##### 开机至指定主机

<CodeBlock language="java">
{"public class App {\n\n  public static void main(String[] args) throws ApiException {\n    ApiClient client = new ApiClient();\n    client.setBasePath(\"http://tower.example.com/v2/api\");\n    client.setApiKey(\"token\");\n\n    VmWhereInput where = new VmWhereInput().id(\"cl2k0njfl04480822fxjq5nns\");\n    VmStartParamsData data = new VmStartParamsData().hostId(\"cl2k0mq69027u0822q69zct7z\");\n    List<Vm> vms = startVm(client, where, data);\n  }\n\n  public static List<Vm> startVm(ApiClient client, VmWhereInput where, VmStartParamsData data)\n      throws ApiException {\n    VmApi vmApi = new VmApi(client);\n    List<WithTaskVm> withTaskVms = vmApi\n        .startVm(new VmStartParams().where(where).data(data));\n    List<String> tasks = withTaskVms.stream().map(vms -> vms.getTaskId()).collect(Collectors.toList());\n    List<String> ids = withTaskVms.stream().map(vms -> vms.getData().getId()).collect(Collectors.toList());\n    TaskUtil.WaitTasks(tasks, client);\n    List<Vm> vms = vmApi\n        .getVms(\n            new GetVmsRequestBody()\n                .where(new VmWhereInput()\n                    .idIn(ids)));\n    return vms;\n  }\n}\n"}
</CodeBlock>

#### 虚拟机关机

##### 指定虚拟机关机

<CodeBlock language="java">
{"public class App {\n\n  public static void main(String[] args) throws ApiException {\n    ApiClient client = new ApiClient();\n    client.setBasePath(\"http://tower.example.com/v2/api\");\n    client.setApiKey(\"token\");\n\n    VmWhereInput where = new VmWhereInput().id(\"cl2k0njfl04480822fxjq5nns\");\n    List<Vm> vms = shutdownVm(client, where);\n  }\n\n  public static List<Vm> shutdownVm(ApiClient client, VmWhereInput where)\n      throws ApiException {\n    VmApi vmApi = new VmApi(client);\n    List<WithTaskVm> withTaskVms = vmApi\n        .shutDownVm(new VmOperateParams().where(where));\n    List<String> tasks = withTaskVms.stream().map(vms -> vms.getTaskId()).collect(Collectors.toList());\n    List<String> ids = withTaskVms.stream().map(vms -> vms.getData().getId()).collect(Collectors.toList());\n    TaskUtil.WaitTasks(tasks, client);\n    List<Vm> vms = vmApi\n        .getVms(\n            new GetVmsRequestBody()\n                .where(new VmWhereInput()\n                    .idIn(ids)));\n    return vms;\n  }\n}\n"}
</CodeBlock>

##### 批量虚拟机关机

<CodeBlock language="java">
{"public class App {\n\n  public static void main(String[] args) throws ApiException {\n    ApiClient client = new ApiClient();\n    client.setBasePath(\"http://tower.example.com/v2/api\");\n    client.setApiKey(\"token\");\n\n    VmWhereInput where = new VmWhereInput().nameStartsWith(\"prefix\");\n    List<Vm> vms = shutdownVm(client, where);\n  }\n\n  public static List<Vm> shutdownVm(ApiClient client, VmWhereInput where)\n      throws ApiException {\n    VmApi vmApi = new VmApi(client);\n    List<WithTaskVm> withTaskVms = vmApi\n        .shutDownVm(new VmOperateParams().where(where));\n    List<String> tasks = withTaskVms.stream().map(vms -> vms.getTaskId()).collect(Collectors.toList());\n    List<String> ids = withTaskVms.stream().map(vms -> vms.getData().getId()).collect(Collectors.toList());\n    TaskUtil.WaitTasks(tasks, client);\n    List<Vm> vms = vmApi\n        .getVms(\n            new GetVmsRequestBody()\n                .where(new VmWhereInput()\n                    .idIn(ids)));\n    return vms;\n  }\n}\n"}
</CodeBlock>

##### 强制关机指定虚拟机

<CodeBlock language="java">
{"public class App {\n\n  public static void main(String[] args) throws ApiException {\n    ApiClient client = new ApiClient();\n    client.setBasePath(\"http://tower.example.com/v2/api\");\n    client.setApiKey(\"token\");\n\n    VmWhereInput where = new VmWhereInput().id(\"cl2k0njfl04480822fxjq5nns\");\n    List<Vm> vms = powerOffVm(client, where);\n  }\n\n  public static List<Vm> powerOffVm(ApiClient client, VmWhereInput where)\n      throws ApiException {\n    VmApi vmApi = new VmApi(client);\n    List<WithTaskVm> withTaskVms = vmApi\n        .poweroffVm(new VmOperateParams().where(where));\n    List<String> tasks = withTaskVms.stream().map(vms -> vms.getTaskId()).collect(Collectors.toList());\n    List<String> ids = withTaskVms.stream().map(vms -> vms.getData().getId()).collect(Collectors.toList());\n    TaskUtil.WaitTasks(tasks, client);\n    List<Vm> vms = vmApi\n        .getVms(\n            new GetVmsRequestBody()\n                .where(new VmWhereInput()\n                    .idIn(ids)));\n    return vms;\n  }\n}\n"}
</CodeBlock>

##### 强制关机批量虚拟机

<CodeBlock language="java">
{"public class App {\n\n  public static void main(String[] args) throws ApiException {\n    ApiClient client = new ApiClient();\n    client.setBasePath(\"http://tower.example.com/v2/api\");\n    client.setApiKey(\"token\");\n\n    VmWhereInput where = new VmWhereInput().nameStartsWith(\"prefix\");\n    List<Vm> vms = powerOffVm(client, where);\n  }\n\n  public static List<Vm> powerOffVm(ApiClient client, VmWhereInput where)\n      throws ApiException {\n    VmApi vmApi = new VmApi(client);\n    List<WithTaskVm> withTaskVms = vmApi\n        .poweroffVm(new VmOperateParams().where(where));\n    List<String> tasks = withTaskVms.stream().map(vms -> vms.getTaskId()).collect(Collectors.toList());\n    List<String> ids = withTaskVms.stream().map(vms -> vms.getData().getId()).collect(Collectors.toList());\n    TaskUtil.WaitTasks(tasks, client);\n    List<Vm> vms = vmApi\n        .getVms(\n            new GetVmsRequestBody()\n                .where(new VmWhereInput()\n                    .idIn(ids)));\n    return vms;\n  }\n}\n"}
</CodeBlock>

#### 虚拟机重启

##### 重启指定虚拟机

<CodeBlock language="java">
{"public class App {\n\n  public static void main(String[] args) throws ApiException {\n    ApiClient client = new ApiClient();\n    client.setBasePath(\"http://tower.example.com/v2/api\");\n    client.setApiKey(\"token\");\n\n    VmWhereInput where = new VmWhereInput().id(\"cl2k0njfl04480822fxjq5nns\");\n    List<Vm> vms = restartVm(client, where);\n  }\n\n  public static List<Vm> restartVm(ApiClient client, VmWhereInput where)\n      throws ApiException {\n    VmApi vmApi = new VmApi(client);\n    List<WithTaskVm> withTaskVms = vmApi\n        .restartVm(new VmOperateParams().where(where));\n    List<String> tasks = withTaskVms.stream().map(vms -> vms.getTaskId()).collect(Collectors.toList());\n    List<String> ids = withTaskVms.stream().map(vms -> vms.getData().getId()).collect(Collectors.toList());\n    TaskUtil.WaitTasks(tasks, client);\n    List<Vm> vms = vmApi\n        .getVms(\n            new GetVmsRequestBody()\n                .where(new VmWhereInput()\n                    .idIn(ids)));\n    return vms;\n  }\n}\n"}
</CodeBlock>

##### 重启批量虚拟机

<CodeBlock language="java">
{"public class App {\n\n  public static void main(String[] args) throws ApiException {\n    ApiClient client = new ApiClient();\n    client.setBasePath(\"http://tower.example.com/v2/api\");\n    client.setApiKey(\"token\");\n\n    VmWhereInput where = new VmWhereInput().nameStartsWith(\"prefix\");\n    List<Vm> vms = restartVm(client, where);\n  }\n\n  public static List<Vm> restartVm(ApiClient client, VmWhereInput where)\n      throws ApiException {\n    VmApi vmApi = new VmApi(client);\n    List<WithTaskVm> withTaskVms = vmApi\n        .restartVm(new VmOperateParams().where(where));\n    List<String> tasks = withTaskVms.stream().map(vms -> vms.getTaskId()).collect(Collectors.toList());\n    List<String> ids = withTaskVms.stream().map(vms -> vms.getData().getId()).collect(Collectors.toList());\n    TaskUtil.WaitTasks(tasks, client);\n    List<Vm> vms = vmApi\n        .getVms(\n            new GetVmsRequestBody()\n                .where(new VmWhereInput()\n                    .idIn(ids)));\n    return vms;\n  }\n}\n"}
</CodeBlock>

##### 强制重启指定虚拟机

<CodeBlock language="java">
{"public class App {\n\n  public static void main(String[] args) throws ApiException {\n    ApiClient client = new ApiClient();\n    client.setBasePath(\"http://tower.example.com/v2/api\");\n    client.setApiKey(\"token\");\n\n    VmWhereInput where = new VmWhereInput().id(\"cl2k0njfl04480822fxjq5nns\");\n    List<Vm> vms = forceRestartVm(client, where);\n  }\n\n  public static List<Vm> forceRestartVm(ApiClient client, VmWhereInput where)\n      throws ApiException {\n    VmApi vmApi = new VmApi(client);\n    List<WithTaskVm> withTaskVms = vmApi\n        .forceRestartVm(new VmOperateParams().where(where));\n    List<String> tasks = withTaskVms.stream().map(vms -> vms.getTaskId()).collect(Collectors.toList());\n    List<String> ids = withTaskVms.stream().map(vms -> vms.getData().getId()).collect(Collectors.toList());\n    TaskUtil.WaitTasks(tasks, client);\n    List<Vm> vms = vmApi\n        .getVms(\n            new GetVmsRequestBody()\n                .where(new VmWhereInput()\n                    .idIn(ids)));\n    return vms;\n  }\n}\n"}
</CodeBlock>

##### 强制重启批量虚拟机

<CodeBlock language="java">
{"public class App {\n\n  public static void main(String[] args) throws ApiException {\n    ApiClient client = new ApiClient();\n    client.setBasePath(\"http://tower.example.com/v2/api\");\n    client.setApiKey(\"token\");\n\n    VmWhereInput where = new VmWhereInput().nameStartsWith(\"prefix\");\n    List<Vm> vms = forceRestartVm(client, where);\n  }\n\n  public static List<Vm> forceRestartVm(ApiClient client, VmWhereInput where)\n      throws ApiException {\n    VmApi vmApi = new VmApi(client);\n    List<WithTaskVm> withTaskVms = vmApi\n        .forceRestartVm(new VmOperateParams().where(where));\n    List<String> tasks = withTaskVms.stream().map(vms -> vms.getTaskId()).collect(Collectors.toList());\n    List<String> ids = withTaskVms.stream().map(vms -> vms.getData().getId()).collect(Collectors.toList());\n    TaskUtil.WaitTasks(tasks, client);\n    List<Vm> vms = vmApi\n        .getVms(\n            new GetVmsRequestBody()\n                .where(new VmWhereInput()\n                    .idIn(ids)));\n    return vms;\n  }\n}\n"}
</CodeBlock>

#### 虚拟机暂停

##### 暂停指定虚拟机

<CodeBlock language="java">
{"public class App {\n\n  public static void main(String[] args) throws ApiException {\n    ApiClient client = new ApiClient();\n    client.setBasePath(\"http://tower.example.com/v2/api\");\n    client.setApiKey(\"token\");\n\n    VmWhereInput where = new VmWhereInput().id(\"cl2k0njfl04480822fxjq5nns\");\n    List<Vm> vms = suspendVm(client, where);\n  }\n\n  public static List<Vm> suspendVm(ApiClient client, VmWhereInput where)\n      throws ApiException {\n    VmApi vmApi = new VmApi(client);\n    List<WithTaskVm> withTaskVms = vmApi\n        .suspendVm(new VmOperateParams().where(where));\n    List<String> tasks = withTaskVms.stream().map(vms -> vms.getTaskId()).collect(Collectors.toList());\n    List<String> ids = withTaskVms.stream().map(vms -> vms.getData().getId()).collect(Collectors.toList());\n    TaskUtil.WaitTasks(tasks, client);\n    List<Vm> vms = vmApi\n        .getVms(\n            new GetVmsRequestBody()\n                .where(new VmWhereInput()\n                    .idIn(ids)));\n    return vms;\n  }\n}\n"}
</CodeBlock>

##### 暂停批量虚拟机

<CodeBlock language="java">
{"public class App {\n\n  public static void main(String[] args) throws ApiException {\n    ApiClient client = new ApiClient();\n    client.setBasePath(\"http://tower.example.com/v2/api\");\n    client.setApiKey(\"token\");\n\n    VmWhereInput where = new VmWhereInput().nameStartsWith(\"prefix\");\n    List<Vm> vms = suspendVm(client, where);\n  }\n\n  public static List<Vm> suspendVm(ApiClient client, VmWhereInput where)\n      throws ApiException {\n    VmApi vmApi = new VmApi(client);\n    List<WithTaskVm> withTaskVms = vmApi\n        .suspendVm(new VmOperateParams().where(where));\n    List<String> tasks = withTaskVms.stream().map(vms -> vms.getTaskId()).collect(Collectors.toList());\n    List<String> ids = withTaskVms.stream().map(vms -> vms.getData().getId()).collect(Collectors.toList());\n    TaskUtil.WaitTasks(tasks, client);\n    List<Vm> vms = vmApi\n        .getVms(\n            new GetVmsRequestBody()\n                .where(new VmWhereInput()\n                    .idIn(ids)));\n    return vms;\n  }\n}\n"}
</CodeBlock>

#### 虚拟机恢复

##### 恢复指定虚拟机

<CodeBlock language="java">
{"public class App {\n\n  public static void main(String[] args) throws ApiException {\n    ApiClient client = new ApiClient();\n    client.setBasePath(\"http://tower.example.com/v2/api\");\n    client.setApiKey(\"token\");\n\n    VmWhereInput where = new VmWhereInput().id(\"cl2k0njfl04480822fxjq5nns\");\n    List<Vm> vms = resumeVm(client, where);\n  }\n\n  public static List<Vm> resumeVm(ApiClient client, VmWhereInput where)\n      throws ApiException {\n    VmApi vmApi = new VmApi(client);\n    List<WithTaskVm> withTaskVms = vmApi\n        .resumeVm(new VmOperateParams().where(where));\n    List<String> tasks = withTaskVms.stream().map(vms -> vms.getTaskId()).collect(Collectors.toList());\n    List<String> ids = withTaskVms.stream().map(vms -> vms.getData().getId()).collect(Collectors.toList());\n    TaskUtil.WaitTasks(tasks, client);\n    List<Vm> vms = vmApi\n        .getVms(\n            new GetVmsRequestBody()\n                .where(new VmWhereInput()\n                    .idIn(ids)));\n    return vms;\n  }\n}\n"}
</CodeBlock>

##### 恢复批量虚拟机

<CodeBlock language="java">
{"public class App {\n\n  public static void main(String[] args) throws ApiException {\n    ApiClient client = new ApiClient();\n    client.setBasePath(\"http://tower.example.com/v2/api\");\n    client.setApiKey(\"token\");\n\n    VmWhereInput where = new VmWhereInput().nameStartsWith(\"prefix\");\n    List<Vm> vms = resumeVm(client, where);\n  }\n\n  public static List<Vm> resumeVm(ApiClient client, VmWhereInput where)\n      throws ApiException {\n    VmApi vmApi = new VmApi(client);\n    List<WithTaskVm> withTaskVms = vmApi\n        .resumeVm(new VmOperateParams().where(where));\n    List<String> tasks = withTaskVms.stream().map(vms -> vms.getTaskId()).collect(Collectors.toList());\n    List<String> ids = withTaskVms.stream().map(vms -> vms.getData().getId()).collect(Collectors.toList());\n    TaskUtil.WaitTasks(tasks, client);\n    List<Vm> vms = vmApi\n        .getVms(\n            new GetVmsRequestBody()\n                .where(new VmWhereInput()\n                    .idIn(ids)));\n    return vms;\n  }\n}\n"}
</CodeBlock>

### 删除虚拟机

#### 回收站

##### 移入回收站

<CodeBlock language="java">
{"public class App {\n\n  public static void main(String[] args) throws ApiException {\n    ApiClient client = new ApiClient();\n    client.setBasePath(\"http://tower.example.com/v2/api\");\n    client.setApiKey(\"token\");\n\n    VmWhereInput where = new VmWhereInput().id(\"cl2k0njfl04480822fxjq5nns\");\n    List<Vm> vms = moveVmToRecycleBin(client, where);\n    System.out.print(vms);\n  }\n\n  public static List<Vm> moveVmToRecycleBin(ApiClient client, VmWhereInput where)\n      throws ApiException {\n    VmApi vmApi = new VmApi(client);\n    List<WithTaskDeleteVm> withTaskVms = vmApi\n        .moveVmToRecycleBin(new VmOperateParams().where(where));\n    List<String> tasks = withTaskVms.stream().map(vms -> vms.getTaskId()).collect(Collectors.toList());\n    List<String> ids = withTaskVms.stream().map(vms -> vms.getData().getId()).collect(Collectors.toList());\n    TaskUtil.WaitTasks(tasks, client);\n    List<Vm> vms = vmApi\n        .getVms(\n            new GetVmsRequestBody()\n                .where(new VmWhereInput()\n                    .idIn(ids)));\n    return vms;\n  }\n}\n"}
</CodeBlock>

##### 从回收站恢复

<CodeBlock language="java">
{"public class App {\n\n  public static void main(String[] args) throws ApiException {\n    ApiClient client = new ApiClient();\n    client.setBasePath(\"http://tower.example.com/v2/api\");\n    client.setApiKey(\"token\");\n\n    VmWhereInput where = new VmWhereInput().id(\"cl2k0njfl04480822fxjq5nns\");\n    List<Vm> vms = moveVmToRecycleBin(client, where);\n    System.out.print(vms);\n  }\n\n  public static List<Vm> moveVmToRecycleBin(ApiClient client, VmWhereInput where)\n      throws ApiException {\n    VmApi vmApi = new VmApi(client);\n    List<WithTaskDeleteVm> withTaskVms = vmApi\n        .recoverVmFromRecycleBin(new VmOperateParams().where(where));\n    List<String> tasks = withTaskVms.stream().map(vms -> vms.getTaskId()).collect(Collectors.toList());\n    List<String> ids = withTaskVms.stream().map(vms -> vms.getData().getId()).collect(Collectors.toList());\n    TaskUtil.WaitTasks(tasks, client);\n    List<Vm> vms = vmApi\n        .getVms(\n            new GetVmsRequestBody()\n                .where(new VmWhereInput()\n                    .idIn(ids)));\n    return vms;\n  }\n}\n"}
</CodeBlock>

#### 永久删除

<CodeBlock language="java">
{"public class App {\n\n  public static void main(String[] args) throws ApiException {\n    ApiClient client = new ApiClient();\n    client.setBasePath(\"http://tower.example.com/v2/api\");\n    client.setApiKey(\"token\");\n\n    VmWhereInput where = new VmWhereInput().id(\"cl2k0njfl04480822fxjq5nns\");\n    deleteVm(client, where);\n  }\n\n  public static void deleteVm(ApiClient client, VmWhereInput where)\n      throws ApiException {\n    VmApi vmApi = new VmApi(client);\n    List<WithTaskDeleteVm> withTaskVms = vmApi\n        .deleteVm(new VmOperateParams().where(where));\n    List<String> tasks = withTaskVms.stream().map(vms -> vms.getTaskId()).collect(Collectors.toList());\n    List<String> ids = withTaskVms.stream().map(vms -> vms.getData().getId()).collect(Collectors.toList());\n    TaskUtil.WaitTasks(tasks, client);\n  }\n}\n"}
</CodeBlock>

## 场景示例

### 虚拟机备份

<CodeBlock language="java">
{"\npublic class BackupResult {\n  public List<IscsiLunSnapshot> lunSnapshots;\n  public VmSnapshot vmSnapshot = null;\n\n  public BackupResult(VmSnapshot vmSnapshot, List<IscsiLunSnapshot> lunSnapshots) {\n    this.lunSnapshots = lunSnapshots;\n    this.vmSnapshot = vmSnapshot;\n  }\n}\n\npublic BackupResult vmBackup(ApiClient client, String vmId, String snapshotName,\n    ConsistentType consistentType) throws ApiException {\n  VmApi vmApi = new VmApi(client);\n  VmSnapshotApi vmSnapshotApi = new VmSnapshotApi(client);\n  IscsiLunSnapshotApi iscsiLunSnapshotApi = new IscsiLunSnapshotApi(client);\n  // 1. 获取所需备份的虚拟机的信息，这里我们需要vm的id来构建创建snapshot的参数，以及虚拟机工具的状态来确定是否允许创建文件系统一致性快照\n  Vm target = vmApi.getVms(new GetVmsRequestBody().where(new VmWhereInput().id(vmId)).first(1))\n      .get(0);\n  if (target.getVmToolsStatus() != VmToolsStatus.RUNNING && consistentType == ConsistentType.FILE_SYSTEM_CONSISTENT) {\n    consistentType = ConsistentType.CRASH_CONSISTENT;\n  }\n  WithTaskVmSnapshot snapshot_with_task = vmSnapshotApi.createVmSnapshot(\n      new VmSnapshotCreationParams()\n          .addDataItem(\n              new VmSnapshotCreationParamsData()\n                  .consistentType(consistentType)\n                  .name(snapshotName)\n                  .vmId(vmId)))\n      .get(0);\n  // 2. 等待Task完成\n  TaskUtil.WaitTask(snapshot_with_task.getTaskId(), client);\n  // 3. 查询创建完成的虚拟机快照\n  VmSnapshot snapshot = vmSnapshotApi.getVmSnapshots(\n      new GetVmSnapshotsRequestBody()\n          .where(new VmSnapshotWhereInput()\n              .id(snapshot_with_task.getData().getId()))).get(0);\n  // 4. 查询生成的Iscsi Lun快照\n  List<String> lunSnapshotIds = snapshot.getVmDisks().stream().filter(disk -> disk.getType() == VmDiskType.DISK)\n      .map(disk -> disk.getSnapshotLocalId()).collect(Collectors.toList());\n  List<IscsiLunSnapshot> lunSnapshots = null;\n  if (lunSnapshotIds.size() > 0) {\n    lunSnapshots = iscsiLunSnapshotApi.getIscsiLunSnapshots(\n        new GetIscsiLunSnapshotsRequestBody()\n            .where(new IscsiLunSnapshotWhereInput()\n                .nameIn(lunSnapshotIds)));\n  }\n  return new BackupResult(snapshot, lunSnapshots);\n}\n"}
</CodeBlock>

### Dashboard 构建

#### 定义工具方法

<CodeBlock language="java">
{"private static String[] byteUnits = new String[] { \"B\", \"KiB\", \"MiB\", \"GiB\", \"TiB\", \"PiB\" };\nprivate static String[] hzUnits = new String[] { \"Hz\", \"KHz\", \"MHz\", \"GHz\", \"THz\" };\n\npublic static String formatUnit(double base, String[] units, int step) {\n  if (units.length == 0) {\n    throw new InvalidParameterException();\n  }\n  if (base < 0) {\n    return String.format(\"0%s\", units[0]);\n  }\n  for (int i = 0; i < units.length; i++) {\n    if (base < step || i == units.length - 1) {\n      return String.format(\"%.2f%s\", base, units[i]);\n    }\n    base /= step;\n  }\n  return String.format(\"%.2f%s\", base, units[units.length - 1]);\n}\n"}
</CodeBlock>

#### 构建报警信息

<CodeBlock language="java">
{"public class AlertInfo {\n  ArrayList<Alert> critialAlerts;\n  ArrayList<Alert> noticeAlerts;\n  ArrayList<Alert> infoAlerts;\n\n  public AlertInfo(ArrayList<Alert> critialAlerts, ArrayList<Alert> noticeAlerts, ArrayList<Alert> infoAlerts) {\n    this.critialAlerts = critialAlerts;\n    this.noticeAlerts = noticeAlerts;\n    this.infoAlerts = infoAlerts;\n  }\n}\n\npublic AlertInfo buildAlerts(ApiClient client, List<String> clusterIds) throws ApiException {\n  AlertApi api = new AlertApi(client);\n  List<Alert> alerts = api.getAlerts(new GetAlertsRequestBody()\n      .where(new AlertWhereInput()\n          .ended(false)\n          .cluster(new ClusterWhereInput()\n              .idIn(clusterIds))));\n  ArrayList<Alert> critialAlerts = new ArrayList<>(alerts.size());\n  ArrayList<Alert> noticeAlerts = new ArrayList<>(alerts.size());\n  ArrayList<Alert> infoAlerts = new ArrayList<>(alerts.size());\n  alerts.forEach(alert -> {\n    switch (alert.getSeverity()) {\n      case \"CRITICAL\":\n        critialAlerts.add(alert);\n        break;\n      case \"NOTICE\":\n        noticeAlerts.add(alert);\n        break;\n      case \"INFO\":\n        infoAlerts.add(alert);\n        break;\n    }\n  });\n  return new AlertInfo(critialAlerts, noticeAlerts, infoAlerts);\n}\n"}
</CodeBlock>

#### 构建硬盘信息

> 这里以机械硬盘为例

<CodeBlock language="java">
{"public class DiskInfo {\n  public int healthyCount;\n  public int warningCount;\n  public int errorCount;\n  public int total;\n\n  public DiskInfo(int healthy, int warning, int error, int total) {\n    this.healthyCount = healthy;\n    this.warningCount = warning;\n    this.errorCount = error;\n    this.total = total;\n  }\n}\npublic DiskInfo buildHddDiskInfo(ApiClient client, List<String> clusterIds) throws ApiException {\n  DiskApi diskApi = new DiskApi(client);\n  List<Disk> disks = diskApi.getDisks(\n      new GetDisksRequestBody()\n          .where(new DiskWhereInput()\n              .host(new HostWhereInput()\n                  .cluster(new ClusterWhereInput()\n                      .idIn(clusterIds)))));\n  DiskInfo hddInfo = new DiskInfo(0, 0, 0, 0);\n  disks.forEach(disk -> {\n    if (disk.getType() == DiskType.HDD) {\n      hddInfo.total++;\n      DiskHealthStatus healthStatus = disk.getHealthStatus();\n      DiskUsageStatus usageStatus = disk.getUsageStatus();\n      if (healthStatus == DiskHealthStatus.UNHEALTHY || healthStatus == DiskHealthStatus.SUBHEALTHY\n          || healthStatus == DiskHealthStatus.SMART_FAILED) {\n        hddInfo.errorCount++;\n      } else if (usageStatus == DiskUsageStatus.UNMOUNTED || usageStatus == DiskUsageStatus.PARTIAL_MOUNTED) {\n        hddInfo.warningCount++;\n      } else {\n        hddInfo.healthyCount++;\n      }\n    }\n  });\n  return hddInfo;\n}\n"}
</CodeBlock>

#### 构建性能指标

> 获取指定集群的 CPU 核数，CPU 频率总数，CPU 使用率，内存总量，内存使用量，存储资源总量，存储资源已使用量，存储资源失效量与存储资源可用量。

<CodeBlock language="java">
{"public class CpuInfo {\n  public int totalCore;\n  public long totalHz;\n  public String totalHzWithUnit;\n  public long usedHz;\n  public String usedHzWithUnit;\n  public String usage;\n\n  public CpuInfo(int totalCore, long totalHz, long usedHz) {\n    this.totalCore = totalCore;\n    this.totalHz = totalHz;\n    this.usedHz = usedHz;\n  }\n\n  public CpuInfo compute() {\n    if (this.totalCore > 0) {\n      this.usage = String.format(\"%.2f%%\", (double) usedHz / totalHz * 100);\n      this.totalHzWithUnit = formatUnit(totalHz, hzUnits, 1000);\n      this.usedHzWithUnit = formatUnit(usedHz, hzUnits, 1000);\n    }\n    return this;\n  }\n}\n\npublic class MemoryInfo {\n  public long total;\n  public String totalWithUnit;\n  public long used;\n  public String usedWithUnit;\n  public String usage;\n\n  public MemoryInfo(long total, long used) {\n    this.total = total;\n    this.used = used;\n  }\n\n  public MemoryInfo compute() {\n    this.usage = String.format(\"%.2f%%\", (double) used / total * 100);\n    this.totalWithUnit = formatUnit(total, byteUnits, 1024);\n    this.usedWithUnit = formatUnit(used, byteUnits, 1024);\n    return this;\n  }\n}\n\npublic class StorageInfo {\n  public long total;\n  public String totalWithUnit;\n  public long used;\n  public String usedWithUnit;\n  public long invalid;\n  public String invalidWithUnit;\n  public long available;\n  public String availableWithUnit;\n\n  public StorageInfo(long total, long used, long invalid) {\n    this.total = total;\n    this.used = used;\n    this.invalid = invalid;\n  }\n\n  public StorageInfo compute() {\n    this.available = total - used - invalid;\n    this.totalWithUnit = formatUnit(total, byteUnits, 1024);\n    this.usedWithUnit = formatUnit(used, byteUnits, 1024);\n    this.invalidWithUnit = formatUnit(invalid, byteUnits, 1024);\n    this.availableWithUnit = formatUnit(available, byteUnits, 1024);\n    return this;\n  }\n}\n\npublic class MetricInfo {\n  public CpuInfo cpu;\n  public MemoryInfo memory;\n  public StorageInfo storage;\n\n  public MetricInfo(CpuInfo cpu, MemoryInfo memory, StorageInfo storage) {\n    this.cpu = cpu;\n    this.memory = memory;\n    this.storage = storage;\n  }\n}\n\npublic static MetricInfo buildMetricInfo(ApiClient client, List<Cluster> clusters, List<String> clusterIds)\n  throws ApiException {\n  CpuInfo cpu = new CpuInfo(0, 0, 0);\n  MemoryInfo memory = new MemoryInfo(0, 0);\n  StorageInfo storage = new StorageInfo(0, 0, 0);\n  HostApi hostApi = new HostApi(client);\n  List<Host> hosts = hostApi.getHosts(\n      new GetHostsRequestBody()\n          .where(new HostWhereInput()\n              .cluster(new ClusterWhereInput()\n                  .idIn(clusterIds))));\n  HashMap<String, Cluster> clusterIdMap = new HashMap<String, Cluster>();\n  clusters.forEach(cluster -> {\n    clusterIdMap.put(cluster.getId(), cluster);\n\n    if (cluster.getType() == ClusterType.SMTX_OS) {\n      cpu.totalCore += cluster.getTotalCpuCores();\n      cpu.totalHz += cluster.getTotalCpuHz();\n      cpu.usedHz += cluster.getUsedCpuHz();\n      if (cluster.getHypervisor() == Hypervisor.VMWARE) {\n        memory.total += cluster.getTotalMemoryBytes();\n        memory.used += cluster.getUsedMemoryBytes();\n      }\n    }\n    storage.total += cluster.getTotalDataCapacity();\n    storage.used += cluster.getUsedDataSpace();\n    storage.invalid += cluster.getFailureDataSpace();\n  });\n\n  hosts.forEach(host -> {\n    Cluster cluster = clusterIdMap.get(host.getCluster().getId());\n    if (cluster != null && cluster.getHypervisor() == Hypervisor.ELF) {\n      memory.total += host.getTotalMemoryBytes();\n      memory.used += host.getRunningPauseVmMemoryBytes() + host.getOsMemoryBytes();\n    }\n  });\n\n  return new MetricInfo(cpu.compute(), memory.compute(), storage.compute());\n}\n"}
</CodeBlock>

#### 构建 Dashboard

<CodeBlock language="java">
{"public class DashboardInfo {\n  public MetricInfo metrics;\n  public DiskInfo hdd;\n  public AlertInfo alert;\n\n  public DashboardInfo(MetricInfo metrics, DiskInfo hdd, AlertInfo alert) {\n    this.metrics = metrics;\n    this.hdd = hdd;\n    this.alert = alert;\n  }\n}\npublic static DashboardInfo buildDashboardInfo(ApiClient client, String datacenterId, String clusterId)\n  throws ApiException {\n  ClusterApi clusterApi = new ClusterApi(client);\n  GetClustersRequestBody request = new GetClustersRequestBody();\n  if (clusterId != null) {\n  request.where(new ClusterWhereInput().id(clusterId));\n  } else if (datacenterId != null) {\n  request.where(new ClusterWhereInput()\n      .datacentersSome(new DatacenterWhereInput()\n          .id(datacenterId)));\n  }\n  List<Cluster> clusters = clusterApi.getClusters(request);\n  List<String> clusterIds = clusters.stream().map(cluster -> cluster.getId()).collect(Collectors.toList());\n  return new DashboardInfo(\n    buildMetricInfo(client, clusters, clusterIds),\n    buildHddDiskInfo(client, clusterIds),\n    buildAlertInfo(client, clusterIds));\n}\n"}
</CodeBlock>
