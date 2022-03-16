---
id: java-sdk
slug: /java-sdk
---
# Cloudtower Java SDK

Java 环境下的 Cloudtower SDK，适用于 Java 1.8 及以上版本

- [源码地址](https://github.com/smartxworks/cloudtower-java-sdk)
- [下载地址](https://github.com/smartxworks/cloudtower-java-sdk/releases)

## 安装

- ### git 源码安装

  ```shell
  git clone https://github.com/smartxworks/cloudtower-java-sdk.git
  mvn clean install
  ```

- ### jar 包安装

  ```shell
  # download jar and pom from release page
  mvn install:install-file -D"file=<path/to/jar>" -D"pomFile=<path/to/pom>"
  ```

- ### 中央仓库
  > 暂无

## 使用

### 创建实例

#### 创建 `ApiClient` 实例

```java
ApiClient client = new ApiClient();
client.setBasePath("http://192.168.96.133/v2/api");
```

#### 创建对应的 API 实例

> 根据不同用途的操作创建相关的 API 实例，例如虚拟机相关操作需要创建一个 `VmApi`。

```java
VmApi vmApi = new VmApi(client);
```

### 鉴权

```java
// 通过 UserApi 中的 login 方法来获得 token。
UserApi userApi = new UserApi(client);
LoginInput loginInput = new LoginInput()
    .username("root")
    .password("!QAZ2wsx").source(UserSource.LOCAL);
WithTaskTokenString token = userApi.login(loginInput);
((ApiKeyAuth) client.getAuthentication("Authorization")).setApiKey(token.getData().getToken());
```

### 发送请求

#### 获取资源

```java
List<Vm> vms = vmApi.getVms(new GetVmsRequestBody().first(1));
```

#### 更新资源

> 资源更新会产生相关的异步任务，当异步任务结束时，代表资源操作完成且数据已更新。

```java
WithTaskVm withTaskVm = vmApi.startVm(
    new VmStartParams()
        .where(new VmWhereInput()
            .id(vm.getId()))).get(0);
```

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

```java
WithTaskVm withTaskVm = vmApi.startVm(
    new VmStartParams()
        .where(new VmWhereInput()
            .id(vm.getId()))).get(0);
TaskUtil.WaitTask(withTaskVm.getTaskId(), client);
```

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

```java
VmStartParams startParams = new VmStartParams()
    .where(new VmWhereInput()
        .addIdInItem("vm_id_1")
        .addIdInItem("vm_id_2"));
List<WithTaskVm> startedVms = vmApi.startVm(startParams);
List<String> tasks = startedVms.stream().map(startedVm -> startedVm.getTaskId()).collect(Collectors.toList());
TaskUtil.WaitTasks(tasks, client);
```

#### 其他

##### 发送异步请求

> 上述请求的发送都是同步的请求，会堵塞当前进程。如果需要使用异步请求，可以使用 `${Api}Async` 配合 `ApiCallback` 来发送异步请求。

```java
vmApi.getVmsAsync(
    new GetVmsRequestBody().first(1),
    new ApiCallback<List<Alert>>() {
      @Override
      public void onFailure(ApiException e, int statusCode, Map responseHeaders) {
        // error callback
      }
      @Override
      public void onUploadProgress(long bytesWritten, long contentLength, boolean done) {
        // upload progress callback
      }
      @Override
      public void onDownloadProgress(long bytesRead, long contentLength, boolean done) {
        // download progress callback
      }
      @Override
      public void onSuccess(List<Alert> vms, int statusCode, Map<String, List<String>> responseHeaders) {
        // success callback
      }
    });
```

##### 设置返回信息的语言

> 可以通过设置/清除默认请求头来设定返回值的语言，可选值为 `["en-US", "zh-CN"]`，不在可选值范围内的语言会返回一个 HTTP 400 错误

```java
AlertApi alertApi = new AlertApi(client);
// 此时得到的 alerts 中的 message, solution, cause, impact 字段将被为英文描述
List<Alert> alerts = alertApi.getAlerts(new GetAlertsRequestBody().first(1));
// 此时得到的 alerts 中的 message, solution, cause, impact 字段将被为中文描述
client.addDefaultHeader("content-language", "zh-CN");
alerts = alertApi.getAlerts(new GetAlertsRequestBody().first(1));
client.removeDefaultHeader("content-language");
// 此时得到的 alerts 中的 message, solution, cause, impact 字段将为英文描述
alerts = alertApi.getAlerts(new GetAlertsRequestBody().first(1));
client.addDefaultHeader("content-language", "fr-CA");
// 此时将返回一个HTTP 400 错误
alerts = alertApi.getAlerts(new GetAlertsRequestBody().first(1));
```

## 操作示例

### 获取虚拟机

#### 获取所有虚拟机

```java
VmApi vmApi = new VmApi(client);
List<Vm> vms = vmApi.getVms(new GetVmsRequestBody());
```

#### 分页获取虚拟机

```java
VmApi vmApi = new VmApi(client);
GetVmsRequestBody body = new GetVmsRequestBody().skip(50).first(50);
List<Vm> vmsFrom51To100 = vmApi.getVms(body);
```

#### 获取所有已开机虚拟机

```java
VmApi vmApi = new VmApi(client);
VmWhereInput where = new VmWhereInput().status(VmStatus.RUNNING);
GetVmsRequestBody body = new GetVmsRequestBody().where(where);
List<Vm> runningVms = vmApi.getVms(body);
```

#### 获取名称或描述中包含特定字符串的虚拟机

```java
VmApi vmApi = new VmApi(client);
VmWhereInput where = new VmWhereInput().nameContains("matching_word");
GetVmsRequestBody body = new GetVmsRequestBody().where(where);
List<Vm> matchedVms = vmApi.getVms(body);
```

#### 获取所有 vcpu > n 的虚拟机

```java
VmApi vmApi = new VmApi(client);
VmWhereInput where = new VmWhereInput().vcpuGt(n);
GetVmsRequestBody body = new GetVmsRequestBody().where(where);
List<Vm> vmCpuGtN = vmApi.getVms(body);
```

### 从模版创建虚拟机

#### 仅指定 id

```java
VmApi vmApi = new VmApi(client);
List<VmCreateVmFromTemplateParams> params = new ArrayList<VmCreateVmFromTemplateParams>(2);
VmCreateVmFromTemplateParams param1 = new VmCreateVmFromTemplateParams()
    .templateId("templateId")
    .name("vm_name")
    .isFullCopy(false);
VmCreateVmFromTemplateParams param2 = new VmCreateVmFromTemplateParams()
    .templateId("templateId")
    .name("vm_name2")
    .isFullCopy(false);
params.add(param1);
params.add(param2);
List<WithTaskVm> withTaskVms = vmApi.createVmFromTemplate(params);
List<String> tasks = withTaskVms.stream().map(vms -> vms.getTaskId()).collect(Collectors.toList());
List<String> ids = withTaskVms.stream().map(vms -> vms.getData().getId()).collect(Collectors.toList());
TaskUtil.WaitTasks(tasks, client);
List<Vm> createdVms = vmApi
    .getVms(
        new GetVmsRequestBody()
            .where(new VmWhereInput()
                .idIn(ids)));
```

#### 配置与模板不同的虚拟盘参数

```java
VmApi vmApi = new VmApi(client);
List<VmCreateVmFromTemplateParams> params = new ArrayList<VmCreateVmFromTemplateParams>(1);
VmCreateVmFromTemplateParamsDiskOperate diskOperate = new VmCreateVmFromTemplateParamsDiskOperate()
    .addModifyDisksItem(
        new VmCreateVmFromTemplateParamsDiskOperateModifyDisks()
            .diskIndex(2)
            .vmVolumeId("vm_volume_id"))
    .removeDisks(
        new VmCreateVmFromTemplateParamsDiskOperateRemoveDisks()
            .addDiskIndexItem(0)
            .addDiskIndexItem(1))
    .newDisks(
        new VmDiskParams()
            .addMountCdRomsItem(
                new VmCdRomParams()
                    .index(0)
                    .boot(0)
                    .elfImageId("elf_image_id"))
            .addMountDisksItem(
                new MountDisksParams()
                    .index(1)
                    .boot(1)
                    .bus(Bus.VIRTIO)
                    .vmVolumeId("vm_volume_id_1"))
            .addMountNewCreateDisksItem(
                new MountNewCreateDisksParams()
                    .vmVolume(
                        new MountNewCreateDisksParamsVmVolume()
                            .elfStoragePolicy(VmVolumeElfStoragePolicyType._2_THIN_PROVISION)
                            .size((double) 4 * 1024 * 1024 * 1024)
                            .name("disk_name"))
                    .boot(3)
                    .index(3)
                    .bus(Bus.VIRTIO)));
VmCreateVmFromTemplateParams createParam = new VmCreateVmFromTemplateParams()
    .templateId("templateId")
    .name("vm_name")
    .isFullCopy(false)
    .diskOperate(diskOperate);
params.add(createParam);
WithTaskVm withTaskVm = vmApi.createVmFromTemplate(params).get(0);
TaskUtil.WaitTask(withTaskVm.getTaskId(), client);
Vm createdVm = vmApi
    .getVms(
        new GetVmsRequestBody()
            .where(new VmWhereInput()
                .id(withTaskVm.getData().getId())))
    .get(0);
```

#### 配置与模版不同的网卡参数

```java
VmApi vmApi = new VmApi(client);
List<VmCreateVmFromTemplateParams> params = new ArrayList<VmCreateVmFromTemplateParams>(1);

VmCreateVmFromTemplateParams createParam = new VmCreateVmFromTemplateParams()
    .templateId("templateId")
    .name("vm_name")
    .isFullCopy(false)
    .addVmNicsItem(
        new VmNicParams()
            .connectVlanId("vlan_id")
            .enabled(true)
            .model(VmNicModel.SRIOV));

params.add(createParam);
WithTaskVm withTaskVm = vmApi.createVmFromTemplate(params).get(0);
TaskUtil.WaitTask(withTaskVm.getTaskId(), client);
Vm createdVm = vmApi
    .getVms(
        new GetVmsRequestBody()
            .where(new VmWhereInput()
                .id(withTaskVm.getData().getId())))
    .get(0);
```

### 创建空白虚拟机

#### 简单创建

```java
VmApi vmApi = new VmApi(client);
VmCreationParams param1 = new VmCreationParams()
    .clusterId("cluster_id")
    .name("vm_name_1")
    .ha(true)
    .cpuCores(4)
    .cpuSockets(4)
    .memory((double) 4 * 1024 * 1024 * 1024)
    .vcpu(16)
    .status(VmStatus.STOPPED)
    .firmware(VmFirmware.BIOS)
    .addVmNicsItem(new VmNicParams().connectVlanId("vlan_id"))
    .vmDisks(
        new VmDiskParams()
            .addMountCdRomsItem(
                new VmCdRomParams()
                    .boot(1)
                    .index(1))
            .addMountDisksItem(
                new MountDisksParams()
                    .index(0)
                    .boot(0)
                    .bus(Bus.VIRTIO)
                    .vmVolumeId("vm_volume_id")));
VmCreationParams param2 = new VmCreationParams()
    .clusterId("cluster_id")
    .name("vm_name_2")
    .ha(true)
    .cpuCores(4)
    .cpuSockets(4)
    .memory((double) 4 * 1024 * 1024 * 1024)
    .vcpu(16)
    .status(VmStatus.STOPPED)
    .firmware(VmFirmware.BIOS)
    .addVmNicsItem(new VmNicParams().connectVlanId("vlan_id"))
    .vmDisks(
        new VmDiskParams()
            .addMountCdRomsItem(
                new VmCdRomParams()
                    .boot(1)
                    .index(1))
            .addMountDisksItem(
                new MountDisksParams()
                    .index(0)
                    .boot(0)
                    .bus(Bus.VIRTIO)
                    .vmVolumeId("vm_volume_id")));
List<VmCreationParams> params = new ArrayList<VmCreationParams>(2) {
  {
    add(param1);
    add(param2);
  }
};
List<WithTaskVm> withTaskVms = vmApi.createVm(params);
List<String> tasks = withTaskVms.stream().map(vms -> vms.getTaskId()).collect(Collectors.toList());
List<String> ids = withTaskVms.stream().map(vms -> vms.getData().getId()).collect(Collectors.toList());
TaskUtil.WaitTasks(tasks, client);
List<Vm> createdVms = vmApi
    .getVms(
        new GetVmsRequestBody()
            .where(new VmWhereInput()
                .idIn(ids)));
```

#### 创建时配置虚拟盘

##### CD-ROM 加载 ISO

```java
VmApi vmApi = new VmApi(client);
VmCreationParams param = new VmCreationParams()
    .clusterId("cluster_id")
    .name("vm_name_1")
    .ha(true)
    .cpuCores(4)
    .cpuSockets(4)
    .memory((double) 4 * 1024 * 1024 * 1024)
    .vcpu(16)
    .status(VmStatus.STOPPED)
    .firmware(VmFirmware.BIOS)
    .addVmNicsItem(new VmNicParams().connectVlanId("vlan_id"))
    .vmDisks(
        new VmDiskParams()
            .addMountCdRomsItem(
                new VmCdRomParams()
                    .boot(0)
                    .index(0)
                    .elfImageId("elf_image_id")));
List<VmCreationParams> params = new ArrayList<VmCreationParams>(1) {
  {
    add(param);
  }
};
WithTaskVm withTaskVm = vmApi.createVm(params).get(0);
TaskUtil.WaitTask(withTaskVm.getTaskId(), client);
Vm createdVm = vmApi
    .getVms(
        new GetVmsRequestBody()
            .where(new VmWhereInput()
                .id(withTaskVm.getData().getId())))
    .get(0);
```

##### 挂载虚拟卷为虚拟盘

```java
VmApi vmApi = new VmApi(client);
VmCreationParams param = new VmCreationParams()
    .clusterId("cluster_id")
    .name("vm_name_1")
    .ha(true)
    .cpuCores(4)
    .cpuSockets(4)
    .memory((double) 4 * 1024 * 1024 * 1024)
    .vcpu(16)
    .status(VmStatus.STOPPED)
    .firmware(VmFirmware.BIOS)
    .addVmNicsItem(new VmNicParams().connectVlanId("vlan_id"))
    .vmDisks(
        new VmDiskParams()
            .addMountDisksItem(
                new MountDisksParams()
                    .index(0)
                    .boot(0)
                    .bus(Bus.VIRTIO)
                    .vmVolumeId("vm_volume_id")));
List<VmCreationParams> params = new ArrayList<VmCreationParams>(1) {
  {
    add(param);
  }
};
WithTaskVm withTaskVm = vmApi.createVm(params).get(0);
TaskUtil.WaitTask(withTaskVm.getTaskId(), client);
Vm createdVm = vmApi
    .getVms(
        new GetVmsRequestBody()
            .where(new VmWhereInput()
                .id(withTaskVm.getData().getId())))
    .get(0);
```

##### 新增并挂载虚拟盘

```java
VmApi vmApi = new VmApi(client);
VmCreationParams param = new VmCreationParams()
    .clusterId("cluster_id")
    .name("vm_name_1")
    .ha(true)
    .cpuCores(4)
    .cpuSockets(4)
    .memory((double) 4 * 1024 * 1024 * 1024)
    .vcpu(16)
    .status(VmStatus.STOPPED)
    .firmware(VmFirmware.BIOS)
    .addVmNicsItem(new VmNicParams().connectVlanId("vlan_id"))
    .vmDisks(
        new VmDiskParams()
            .addMountNewCreateDisksItem(
                new MountNewCreateDisksParams()
                    .index(0)
                    .boot(0)
                    .bus(Bus.VIRTIO)
                    .vmVolume(
                        new MountNewCreateDisksParamsVmVolume()
                            .elfStoragePolicy(VmVolumeElfStoragePolicyType._2_THIN_PROVISION)
                            .name("disk_name")
                            .size((double) 4 * 1024 * 1024 * 1024))));
List<VmCreationParams> params = new ArrayList<VmCreationParams>(1) {
  {
    add(param);
  }
};
WithTaskVm withTaskVm = vmApi.createVm(params).get(0);
TaskUtil.WaitTask(withTaskVm.getTaskId(), client);
Vm createdVm = vmApi
    .getVms(
        new GetVmsRequestBody()
            .where(new VmWhereInput()
                .id(withTaskVm.getData().getId())))
    .get(0);
```

#### 创建时配置虚拟网卡

```java
      VmApi vmApi = new VmApi(client);
      VmCreationParams param = new VmCreationParams()
          .clusterId("cluster_id")
          .name("vm_name_1")
          .ha(true)
          .cpuCores(4)
          .cpuSockets(4)
          .memory((double) 4 * 1024 * 1024 * 1024)
          .vcpu(16)
          .status(VmStatus.STOPPED)
          .firmware(VmFirmware.BIOS)
          .addVmNicsItem(
              new VmNicParams()
                  .connectVlanId("vlan_id"))
          .addVmNicsItem(
              new VmNicParams()
                  .connectVlanId("vlan_id_2")
                  .mirror(true)
                  .model(VmNicModel.SRIOV))
          .vmDisks(
              new VmDiskParams()
                  .addMountCdRomsItem(
                      new VmCdRomParams()
                          .boot(1)
                          .index(1))
                  .addMountDisksItem(
                      new MountDisksParams()
                          .index(0)
                          .boot(0)
                          .bus(Bus.VIRTIO)
                          .vmVolumeId("vm_volume_id")));
      List<VmCreationParams> params = new ArrayList<VmCreationParams>(1) {
        {
          add(param);
        }
      };
      WithTaskVm withTaskVm = vmApi.createVm(params).get(0);
      TaskUtil.WaitTask(withTaskVm.getTaskId(), client);
      Vm createdVm = vmApi
          .getVms(
              new GetVmsRequestBody()
                  .where(new VmWhereInput()
                      .id(withTaskVm.getData().getId())))
          .get(0);
```

### 编辑虚拟机

#### 编辑基本信息

```java
VmApi vmApi = new VmApi(client);
VmUpdateParams param = new VmUpdateParams()
    .where(new VmWhereInput()
        .id("vm_id"))
    .data(new VmUpdateParamsData()
        .name("new_name")
        .description("new_description")
        .ha(false)
        .cpuCores(2)
        .cpuSockets(8)
        .vcpu(2 * 8)
        .memory((double) 8 * 1024 * 1024 * 1024));
WithTaskVm withTaskVm = vmApi.updateVm(param).get(0);
TaskUtil.WaitTask(withTaskVm.getTaskId(), client);
Vm updatedVm = vmApi
    .getVms(
        new GetVmsRequestBody()
            .where(new VmWhereInput()
                .id(withTaskVm.getData().getId())))
    .get(0);
```

#### CD-ROM 编辑

##### 添加 CD-ROM

```java
VmApi vmApi = new VmApi(client);
VmAddCdRomParams param = new VmAddCdRomParams()
    .where(new VmWhereInput()
        .id("vm_id"))
    .data(new VmAddCdRomParamsData()
        .addVmCdRomsItem(
            new VmCdRomParams()
                .boot(0)
                .index(0)
                .elfImageId("elf_image_id")));
WithTaskVm withTaskVm = vmApi.addVmCdRom(param).get(0);
TaskUtil.WaitTask(withTaskVm.getTaskId(), client);
Vm updatedVm = vmApi
    .getVms(
        new GetVmsRequestBody()
            .where(new VmWhereInput()
                .id(withTaskVm.getData().getId())))
    .get(0);
```

##### 删除 CD-ROM

```java
VmApi vmApi = new VmApi(client);
VmRemoveCdRomParams param = new VmRemoveCdRomParams()
    .where(new VmWhereInput()
        .id("vm_id"))
    .data(new VmRemoveCdRomParamsData()
        .addCdRomIdsItem("cd_rom_to_remove_id_1")
        .addCdRomIdsItem("cd_rom_to_remove_id_2"));
WithTaskVm withTaskVm = vmApi.removeVmCdRom(param).get(0);
TaskUtil.WaitTask(withTaskVm.getTaskId(), client);
Vm updatedVm = vmApi
    .getVms(
        new GetVmsRequestBody()
            .where(new VmWhereInput()
                .id(withTaskVm.getData().getId())))
    .get(0);
```

#### 虚拟卷操作

##### 添加新虚拟卷

```java
VmApi vmApi = new VmApi(client);
VmAddDiskParams param = new VmAddDiskParams()
    .where(new VmWhereInput()
        .id("vm_id"))
    .data(new VmAddDiskParamsData()
        .vmDisks(
            new VmAddDiskParamsDataVmDisks()
                .addMountNewCreateDisksItem(
                    new MountNewCreateDisksParams()
                        .boot(1)
                        .boot(1)
                        .bus(Bus.VIRTIO))));
WithTaskVm withTaskVm = vmApi.addVmDisk(param).get(0);
TaskUtil.WaitTask(withTaskVm.getTaskId(), client);
Vm updatedVm = vmApi
    .getVms(
        new GetVmsRequestBody()
            .where(new VmWhereInput()
                .id(withTaskVm.getData().getId())))
    .get(0);
```

##### 挂载已存在虚拟卷为虚拟盘

```java
VmApi vmApi = new VmApi(client);
VmAddDiskParams param = new VmAddDiskParams()
    .where(new VmWhereInput()
        .id("vm_id"))
    .data(new VmAddDiskParamsData()
        .vmDisks(
            new VmAddDiskParamsDataVmDisks()
                .addMountDisksItem(
                    new MountDisksParams()
                        .boot(1)
                        .boot(1)
                        .bus(Bus.VIRTIO)
                        .vmVolumeId("vm_volume_id"))));
WithTaskVm withTaskVm = vmApi.addVmDisk(param).get(0);
TaskUtil.WaitTask(withTaskVm.getTaskId(), client);
Vm updatedVm = vmApi
    .getVms(
        new GetVmsRequestBody()
            .where(new VmWhereInput()
                .id(withTaskVm.getData().getId())))
    .get(0);
```

##### 卸载虚拟盘

```java
VmApi vmApi = new VmApi(client);
VmRemoveDiskParams param = new VmRemoveDiskParams()
    .where(new VmWhereInput()
        .id("vm_id"))
    .data(new VmRemoveDiskParamsData()
        .addDiskIdsItem("disk_to_remove_id_1")
        .addDiskIdsItem("disk_to_remove_id_2"));
WithTaskVm withTaskVm = vmApi.removeVmDisk(param).get(0);
TaskUtil.WaitTask(withTaskVm.getTaskId(), client);
Vm updatedVm = vmApi
    .getVms(
        new GetVmsRequestBody()
            .where(new VmWhereInput()
                .id(withTaskVm.getData().getId())))
    .get(0);
```

#### 网卡操作

##### 添加网卡

```java
VmApi vmApi = new VmApi(client);
VmAddNicParams param = new VmAddNicParams()
    .where(new VmWhereInput()
        .id("vm_id"))
    .data(new VmAddNicParamsData()
        .addVmNicsItem(
            new VmNicParams()
                .connectVlanId("target_vlan_id1")
                .enabled(true)
                .model(VmNicModel.VIRTIO)
                .gateway("gateway1")
                .ipAddress("ip_address1")
                .subnetMask("subnet_mask1"))
        .addVmNicsItem(
            new VmNicParams()
                .connectVlanId("target_vlan_id2")
                .enabled(true)
                .model(VmNicModel.VIRTIO)
                .gateway("gateway2")
                .ipAddress("ip_address2")
                .subnetMask("subnet_mask2")));
WithTaskVm withTaskVm = vmApi.addVmNic(param).get(0);
TaskUtil.WaitTask(withTaskVm.getTaskId(), client);
Vm updatedVm = vmApi
    .getVms(
        new GetVmsRequestBody()
            .where(new VmWhereInput()
                .id(withTaskVm.getData().getId())))
    .get(0);
```

##### 编辑网卡

```java
VmApi vmApi = new VmApi(client);
VmUpdateNicParams param = new VmUpdateNicParams()
    .where(new VmWhereInput()
        .id("vm_id"))
    .data(new VmUpdateNicParamsData()
        .nicIndex(0)
        .enabled(false)
        .mirror(false)
        .ipAddress("new_ip")
        .gateway("new_gateway")
        .subnetMask("new_subnet_mask"));
WithTaskVm withTaskVm = vmApi.updateVmNic(param).get(0);
TaskUtil.WaitTask(withTaskVm.getTaskId(), client);
Vm updatedVm = vmApi
    .getVms(
        new GetVmsRequestBody()
            .where(new VmWhereInput()
                .id(withTaskVm.getData().getId())))
    .get(0);
```

##### 移除网卡

```java
VmApi vmApi = new VmApi(client);
VmRemoveNicParams param = new VmRemoveNicParams()
    .where(new VmWhereInput().id("vm_id"))
    .data(new VmRemoveNicParamsData()
    .addNicIndexItem(0)
    .addNicIndexItem(1));
WithTaskVm withTaskVm = vmApi.removeVmNic(param).get(0);
TaskUtil.WaitTask(withTaskVm.getTaskId(), client);
Vm updatedVm = vmApi
    .getVms(
        new GetVmsRequestBody()
            .where(new VmWhereInput()
                .id(withTaskVm.getData().getId())))
    .get(0);
```

#### 虚拟机迁移

##### 迁移至指定主机

```java
VmApi vmApi = new VmApi(client);
VmRemoveNicParams param = new VmRemoveNicParams()
    .where(new VmWhereInput()
        .id("vm_id"))
    .data(new VmRemoveNicParamsData()
        .addNicIndexItem(0)
        .addNicIndexItem(1));
WithTaskVm withTaskVm = vmApi.removeVmNic(param).get(0);
TaskUtil.WaitTask(withTaskVm.getTaskId(), client);
Vm updatedVm = vmApi
    .getVms(
        new GetVmsRequestBody()
            .where(new VmWhereInput()
                .id(withTaskVm.getData().getId())))
    .get(0);
```

##### 自动调度到合适的主机

```java
VmApi vmApi = new VmApi(client);
VmMigrateParams param = new VmMigrateParams()
    .where(new VmWhereInput()
        .id("vm_id"));
WithTaskVm withTaskVm = vmApi.migRateVm(param).get(0);
TaskUtil.WaitTask(withTaskVm.getTaskId(), client);
Vm migratedVm = vmApi
    .getVms(
        new GetVmsRequestBody()
            .where(new VmWhereInput()
                .id(withTaskVm.getData().getId())))
    .get(0);
```

### 虚拟机电源操作

#### 虚拟机开机:

##### 指定虚拟机开机，自动调度到合适的虚拟机

```java
VmApi vmApi = new VmApi(client);
VmStartParams param = new VmStartParams()
    .where(new VmWhereInput()
        .id("vm_id"));
WithTaskVm withTaskVm = vmApi.startVm(param).get(0);
TaskUtil.WaitTask(withTaskVm.getTaskId(), client);
Vm createdVm = vmApi
    .getVms(
        new GetVmsRequestBody()
            .where(new VmWhereInput()
                .id(withTaskVm.getData().getId())))
    .get(0);
```

##### 批量虚拟机开机，自动调度到合适的虚拟机

```java
VmApi vmApi = new VmApi(client);
List<String> ids = new ArrayList<String>(2) {
  {
    add("vm_id_1");
    add("vm_id_2");
  }
};
VmStartParams param = new VmStartParams()
    .where(new VmWhereInput()
        .idIn(ids));
List<WithTaskVm> withTaskVms = vmApi.startVm(param);
List<String> tasks = withTaskVms.stream().map(vms -> vms.getTaskId()).collect(Collectors.toList());
TaskUtil.WaitTasks(tasks, client);
List<Vm> createdVms = vmApi
    .getVms(
        new GetVmsRequestBody()
            .where(new VmWhereInput()
                .idIn(ids)));
```

##### 开机至指定主机

```java
VmApi vmApi = new VmApi(client);
VmStartParams param = new VmStartParams()
    .where(new VmWhereInput()
        .id("vm_id"))
    .data(new VmStartParamsData()
        .hostId("target_host_id"));
WithTaskVm withTaskVm = vmApi.startVm(param).get(0);
TaskUtil.WaitTask(withTaskVm.getTaskId(), client);
Vm createdVm = vmApi
    .getVms(
        new GetVmsRequestBody()
            .where(new VmWhereInput()
                .id(withTaskVm.getData().getId())))
    .get(0);
```

#### 虚拟机关机

##### 指定虚拟机关机

```java
VmApi vmApi = new VmApi(client);
VmOperateParams param = new VmOperateParams()
    .where(new VmWhereInput()
        .id("vm_id"));
WithTaskVm withTaskVm = vmApi.shutDownVm(param).get(0);
TaskUtil.WaitTask(withTaskVm.getTaskId(), client);
Vm shutdownVm = vmApi
    .getVms(
        new GetVmsRequestBody()
            .where(new VmWhereInput()
                .id(withTaskVm.getData().getId())))
    .get(0);
```

##### 批量虚拟机关机

```java
VmApi vmApi = new VmApi(client);
List<String> ids = new ArrayList<String>(2) {
  {
    add("vm_id_1");
    add("vm_id_2");
  }
};
VmOperateParams param = new VmOperateParams()
    .where(new VmWhereInput()
        .idIn(ids));
List<WithTaskVm> withTaskVms = vmApi.shutDownVm(param);
List<String> tasks = withTaskVms.stream().map(vms -> vms.getTaskId()).collect(Collectors.toList());
TaskUtil.WaitTasks(tasks, client);
List<Vm> shutdownVms = vmApi
    .getVms(
        new GetVmsRequestBody()
            .where(new VmWhereInput()
                .idIn(ids)));
```

##### 强制关机指定虚拟机

```java
VmApi vmApi = new VmApi(client);
VmOperateParams param = new VmOperateParams()
    .where(new VmWhereInput()
        .id("vm_id"));
WithTaskVm withTaskVm = vmApi.forceShutDownVm(param).get(0);
TaskUtil.WaitTask(withTaskVm.getTaskId(), client);
Vm shutdownVm = vmApi
    .getVms(
        new GetVmsRequestBody()
            .where(new VmWhereInput()
                .id(withTaskVm.getData().getId())))
    .get(0);
```

##### 强制关机批量虚拟机

```java
VmApi vmApi = new VmApi(client);
List<String> ids = new ArrayList<String>(2) {
  {
    add("vm_id_1");
    add("vm_id_2");
  }
};
VmOperateParams param = new VmOperateParams()
    .where(new VmWhereInput()
        .idIn(ids));
List<WithTaskVm> withTaskVms = vmApi.forceShutDownVm(param);
List<String> tasks = withTaskVms.stream().map(vms -> vms.getTaskId()).collect(Collectors.toList());
TaskUtil.WaitTasks(tasks, client);
List<Vm> shutdownVms = vmApi
    .getVms(
        new GetVmsRequestBody()
            .where(new VmWhereInput()
                .idIn(ids)));
```

#### 虚拟机重启

##### 重启指定虚拟机

```java
VmApi vmApi = new VmApi(client);
VmOperateParams param = new VmOperateParams()
    .where(new VmWhereInput()
        .id("vm_id"));
WithTaskVm withTaskVm = vmApi.restartVm(param).get(0);
TaskUtil.WaitTask(withTaskVm.getTaskId(), client);
Vm restartedVm = vmApi
    .getVms(
        new GetVmsRequestBody()
            .where(new VmWhereInput()
                .id(withTaskVm.getData().getId())))
    .get(0);
```

##### 重启批量虚拟机

```java
VmApi vmApi = new VmApi(client);
List<String> ids = new ArrayList<String>(2) {
  {
    add("vm_id_1");
    add("vm_id_2");
  }
};
VmOperateParams param = new VmOperateParams()
    .where(new VmWhereInput()
        .idIn(ids));
List<WithTaskVm> withTaskVms = vmApi.restartVm(param);
List<String> tasks = withTaskVms.stream().map(vms -> vms.getTaskId()).collect(Collectors.toList());
TaskUtil.WaitTasks(tasks, client);
List<Vm> restartedVms = vmApi
    .getVms(
        new GetVmsRequestBody()
            .where(new VmWhereInput()
                .idIn(ids)));
```

##### 重启指定虚拟机

```java
VmApi vmApi = new VmApi(client);
VmOperateParams param = new VmOperateParams()
    .where(new VmWhereInput()
        .id("vm_id"));
WithTaskVm withTaskVm = vmApi.forceRestartVm(param).get(0);
TaskUtil.WaitTask(withTaskVm.getTaskId(), client);
Vm restartedVm = vmApi
    .getVms(
        new GetVmsRequestBody()
            .where(new VmWhereInput()
                .id(withTaskVm.getData().getId())))
    .get(0);
```

##### 强制重启批量虚拟机

```java
VmApi vmApi = new VmApi(client);
List<String> ids = new ArrayList<String>(2) {
  {
    add("vm_id_1");
    add("vm_id_2");
  }
};
VmOperateParams param = new VmOperateParams()
    .where(new VmWhereInput()
        .idIn(ids));
List<WithTaskVm> withTaskVms = vmApi.forceRestartVm(param);
List<String> tasks = withTaskVms.stream().map(vms -> vms.getTaskId()).collect(Collectors.toList());
TaskUtil.WaitTasks(tasks, client);
List<Vm> restartedVms = vmApi
    .getVms(
        new GetVmsRequestBody()
            .where(new VmWhereInput()
                .idIn(ids)));
```

#### 虚拟机暂停

##### 暂停指定虚拟机

```java
VmApi vmApi = new VmApi(client);
VmOperateParams param = new VmOperateParams()
    .where(new VmWhereInput()
        .id("vm_id"));
WithTaskVm withTaskVm = vmApi.suspendVm(param).get(0);
TaskUtil.WaitTask(withTaskVm.getTaskId(), client);
Vm suspendedVm = vmApi
    .getVms(
        new GetVmsRequestBody()
            .where(new VmWhereInput()
                .id(withTaskVm.getData().getId())))
    .get(0);
```

##### 暂停批量虚拟机

```java
VmApi vmApi = new VmApi(client);
List<String> ids = new ArrayList<String>(2) {
  {
    add("vm_id_1");
    add("vm_id_2");
  }
};
VmOperateParams param = new VmOperateParams()
    .where(new VmWhereInput()
        .idIn(ids));
List<WithTaskVm> withTaskVms = vmApi.suspendVm(param);
List<String> tasks = withTaskVms.stream().map(vms -> vms.getTaskId()).collect(Collectors.toList());
TaskUtil.WaitTasks(tasks, client);
List<Vm> suspendedVms = vmApi
    .getVms(
        new GetVmsRequestBody()
            .where(new VmWhereInput()
                .idIn(ids)));
```

#### 虚拟机恢复

##### 恢复指定虚拟机

```java
VmApi vmApi = new VmApi(client);
VmOperateParams param = new VmOperateParams()
    .where(new VmWhereInput()
        .id("vm_id"));
WithTaskVm withTaskVm = vmApi.resumeVm(param).get(0);
TaskUtil.WaitTask(withTaskVm.getTaskId(), client);
Vm resumedVm = vmApi
    .getVms(
        new GetVmsRequestBody()
            .where(new VmWhereInput()
                .id(withTaskVm.getData().getId())))
    .get(0);
```

##### 恢复批量虚拟机

```java
VmApi vmApi = new VmApi(client);
List<String> ids = new ArrayList<String>(2) {
  {
    add("vm_id_1");
    add("vm_id_2");
  }
};
VmOperateParams param = new VmOperateParams()
    .where(new VmWhereInput()
        .idIn(ids));
List<WithTaskVm> withTaskVms = vmApi.resumeVm(param);
List<String> tasks = withTaskVms.stream().map(vms -> vms.getTaskId()).collect(Collectors.toList());
TaskUtil.WaitTasks(tasks, client);
List<Vm> resumedVms = vmApi
    .getVms(
        new GetVmsRequestBody()
            .where(new VmWhereInput()
                .idIn(ids)));
```

### 删除虚拟机

#### 回收站

##### 移入回收站

```java
VmApi vmApi = new VmApi(client);
List<String> ids = new ArrayList<String>(2) {
  {
    add("vm_id_1");
    add("vm_id_2");
  }
};
VmOperateParams param = new VmOperateParams()
    .where(new VmWhereInput()
        .idIn(ids));
List<WithTaskDeleteVm> withTaskDeletedVms = vmApi.moveVmToRecycleBin(param);
List<String> tasks = withTaskDeletedVms.stream().map(vms -> vms.getTaskId()).collect(Collectors.toList());
TaskUtil.WaitTasks(tasks, client);
List<Vm> deletedVms = vmApi
    .getVms(
        new GetVmsRequestBody()
            .where(new VmWhereInput()
                .idIn(ids)));
```

##### 从回收站恢复

```java
VmApi vmApi = new VmApi(client);
List<String> ids = new ArrayList<String>(2) {
  {
    add("vm_id_1");
    add("vm_id_2");
  }
};
VmOperateParams param = new VmOperateParams()
    .where(new VmWhereInput()
        .idIn(ids));
List<WithTaskDeleteVm> withTaskDeletedVms = vmApi.recoverVmFromRecycleBin(param);
List<String> tasks = withTaskDeletedVms.stream().map(vms -> vms.getTaskId()).collect(Collectors.toList());
TaskUtil.WaitTasks(tasks, client);
List<Vm> recoveredVms = vmApi
    .getVms(
        new GetVmsRequestBody()
            .where(new VmWhereInput()
                .idIn(ids)));
```

#### 永久删除

```java
VmApi vmApi = new VmApi(client);
List<String> ids = new ArrayList<String>(2) {
  {
    add("vm_id_1");
    add("vm_id_2");
  }
};
VmOperateParams param = new VmOperateParams()
    .where(new VmWhereInput()
        .idIn(ids));
List<WithTaskDeleteVm> withTaskDeletedVms = vmApi.deleteVm(param);
List<String> tasks = withTaskDeletedVms.stream().map(vms -> vms.getTaskId()).collect(Collectors.toList());
TaskUtil.WaitTasks(tasks, client);
// will get an empty list
List<Vm> deletedVms = vmApi
    .getVms(
        new GetVmsRequestBody()
            .where(new VmWhereInput()
                .idIn(ids)));
```

## 场景示例

### 虚拟机备份

```java

public class BackupResult {
  public List<IscsiLunSnapshot> lunSnapshots;
  public VmSnapshot vmSnapshot = null;

  public BackupResult(VmSnapshot vmSnapshot, List<IscsiLunSnapshot> lunSnapshots) {
    this.lunSnapshots = lunSnapshots;
    this.vmSnapshot = vmSnapshot;
  }
}

public BackupResult vmBackup(ApiClient client, String vmId, String snapshotName,
    ConsistentType consistentType) throws ApiException {
  VmApi vmApi = new VmApi(client);
  VmSnapshotApi vmSnapshotApi = new VmSnapshotApi(client);
  IscsiLunSnapshotApi iscsiLunSnapshotApi = new IscsiLunSnapshotApi(client);
  // 1. 获取所需备份的虚拟机的信息，这里我们需要 vm 的 id 来构建创建 snapshot 的参数，以及虚拟机工具的状态来确定是否允许创建文件系统一致性快照
  Vm target = vmApi.getVms(new GetVmsRequestBody().where(new VmWhereInput().id(vmId)).first(1))
      .get(0);
  if (target.getVmToolsStatus() != VmToolsStatus.RUNNING && consistentType == ConsistentType.FILE_SYSTEM_CONSISTENT) {
    consistentType = ConsistentType.CRASH_CONSISTENT;
  }
  WithTaskVmSnapshot snapshot_with_task = vmSnapshotApi.createVmSnapshot(
      new VmSnapshotCreationParams()
          .addDataItem(
              new VmSnapshotCreationParamsData()
                  .consistentType(consistentType)
                  .name(snapshotName)
                  .vmId(vmId)))
      .get(0);
  // 2. 等待 Task 完成
  TaskUtil.WaitTask(snapshot_with_task.getTaskId(), client);
  // 3. 查询创建完成的虚拟机快照
  VmSnapshot snapshot = vmSnapshotApi.getVmSnapshots(
      new GetVmSnapshotsRequestBody()
          .where(new VmSnapshotWhereInput()
              .id(snapshot_with_task.getData().getId()))).get(0);
  // 4. 查询生成的 iSCSI Lun 快照
  List<String> lunSnapshotIds = snapshot.getVmDisks().stream().filter(disk -> disk.getType() == VmDiskType.DISK)
      .map(disk -> disk.getSnapshotLocalId()).collect(Collectors.toList());
  List<IscsiLunSnapshot> lunSnapshots = null;
  if (lunSnapshotIds.size() > 0) {
    lunSnapshots = iscsiLunSnapshotApi.getIscsiLunSnapshots(
        new GetIscsiLunSnapshotsRequestBody()
            .where(new IscsiLunSnapshotWhereInput()
                .nameIn(lunSnapshotIds)));
  }
  return new BackupResult(snapshot, lunSnapshots);
}
```

### Dashboard 构建

#### 定义工具方法

```java
private static String[] byteUnits = new String[] { "B", "KiB", "MiB", "GiB", "TiB", "PiB" };
private static String[] hzUnits = new String[] { "Hz", "KHz", "MHz", "GHz", "THz" };

public static String formatUnit(double base, String[] units, int step) {
  if (units.length == 0) {
    throw new InvalidParameterException();
  }
  if (base < 0) {
    return String.format("0%s", units[0]);
  }
  for (int i = 0; i < units.length; i++) {
    if (base < step || i == units.length - 1) {
      return String.format("%.2f%s", base, units[i]);
    }
    base /= step;
  }
  return String.format("%.2f%s", base, units[units.length - 1]);
}
```

#### 构建报警信息

```java
public class AlertInfo {
  ArrayList<Alert> critialAlerts;
  ArrayList<Alert> noticeAlerts;
  ArrayList<Alert> infoAlerts;

  public AlertInfo(ArrayList<Alert> critialAlerts, ArrayList<Alert> noticeAlerts, ArrayList<Alert> infoAlerts) {
    this.critialAlerts = critialAlerts;
    this.noticeAlerts = noticeAlerts;
    this.infoAlerts = infoAlerts;
  }
}

public AlertInfo buildAlerts(ApiClient client, List<String> clusterIds) throws ApiException {
  AlertApi api = new AlertApi(client);
  List<Alert> alerts = api.getAlerts(new GetAlertsRequestBody()
      .where(new AlertWhereInput()
          .ended(false)
          .cluster(new ClusterWhereInput()
              .idIn(clusterIds))));
  ArrayList<Alert> critialAlerts = new ArrayList<>(alerts.size());
  ArrayList<Alert> noticeAlerts = new ArrayList<>(alerts.size());
  ArrayList<Alert> infoAlerts = new ArrayList<>(alerts.size());
  alerts.forEach(alert -> {
    switch (alert.getSeverity()) {
      case "CRITICAL":
        critialAlerts.add(alert);
        break;
      case "NOTICE":
        noticeAlerts.add(alert);
        break;
      case "INFO":
        infoAlerts.add(alert);
        break;
    }
  });
  return new AlertInfo(critialAlerts, noticeAlerts, infoAlerts);
}
```

#### 构建硬盘信息

> 这里以机械硬盘为例

```java
public class DiskInfo {
  public int healthyCount;
  public int warningCount;
  public int errorCount;
  public int total;

  public DiskInfo(int healthy, int warning, int error, int total) {
    this.healthyCount = healthy;
    this.warningCount = warning;
    this.errorCount = error;
    this.total = total;
  }
}
public DiskInfo buildHddDiskInfo(ApiClient client, List<String> clusterIds) throws ApiException {
  DiskApi diskApi = new DiskApi(client);
  List<Disk> disks = diskApi.getDisks(
      new GetDisksRequestBody()
          .where(new DiskWhereInput()
              .host(new HostWhereInput()
                  .cluster(new ClusterWhereInput()
                      .idIn(clusterIds)))));
  DiskInfo hddInfo = new DiskInfo(0, 0, 0, 0);
  disks.forEach(disk -> {
    if (disk.getType() == DiskType.HDD) {
      hddInfo.total++;
      DiskHealthStatus healthStatus = disk.getHealthStatus();
      DiskUsageStatus usageStatus = disk.getUsageStatus();
      if (healthStatus == DiskHealthStatus.UNHEALTHY || healthStatus == DiskHealthStatus.SUBHEALTHY
          || healthStatus == DiskHealthStatus.SMART_FAILED) {
        hddInfo.errorCount++;
      } else if (usageStatus == DiskUsageStatus.UNMOUNTED || usageStatus == DiskUsageStatus.PARTIAL_MOUNTED) {
        hddInfo.warningCount++;
      } else {
        hddInfo.healthyCount++;
      }
    }
  });
  return hddInfo;
}
```

#### 构建性能指标

> 获取指定集群的 CPU 核数，CPU 频率总数，CPU 使用率，内存总量，内存使用量，存储资源总量，存储资源已使用量，存储资源失效量与存储资源可用量。

```java
public class CpuInfo {
  public int totalCore;
  public long totalHz;
  public String totalHzWithUnit;
  public long usedHz;
  public String usedHzWithUnit;
  public String usage;

  public CpuInfo(int totalCore, long totalHz, long usedHz) {
    this.totalCore = totalCore;
    this.totalHz = totalHz;
    this.usedHz = usedHz;
  }

  public CpuInfo compute() {
    if (this.totalCore > 0) {
      this.usage = String.format("%.2f%%", (double) usedHz / totalHz * 100);
      this.totalHzWithUnit = formatUnit(totalHz, hzUnits, 1000);
      this.usedHzWithUnit = formatUnit(usedHz, hzUnits, 1000);
    }
    return this;
  }
}

public class MemoryInfo {
  public long total;
  public String totalWithUnit;
  public long used;
  public String usedWithUnit;
  public String usage;

  public MemoryInfo(long total, long used) {
    this.total = total;
    this.used = used;
  }

  public MemoryInfo compute() {
    this.usage = String.format("%.2f%%", (double) used / total * 100);
    this.totalWithUnit = formatUnit(total, byteUnits, 1024);
    this.usedWithUnit = formatUnit(used, byteUnits, 1024);
    return this;
  }
}

public class StorageInfo {
  public long total;
  public String totalWithUnit;
  public long used;
  public String usedWithUnit;
  public long invalid;
  public String invalidWithUnit;
  public long available;
  public String availableWithUnit;

  public StorageInfo(long total, long used, long invalid) {
    this.total = total;
    this.used = used;
    this.invalid = invalid;
  }

  public StorageInfo compute() {
    this.available = total - used - invalid;
    this.totalWithUnit = formatUnit(total, byteUnits, 1024);
    this.usedWithUnit = formatUnit(used, byteUnits, 1024);
    this.invalidWithUnit = formatUnit(invalid, byteUnits, 1024);
    this.availableWithUnit = formatUnit(available, byteUnits, 1024);
    return this;
  }
}

public class MetricInfo {
  public CpuInfo cpu;
  public MemoryInfo memory;
  public StorageInfo storage;

  public MetricInfo(CpuInfo cpu, MemoryInfo memory, StorageInfo storage) {
    this.cpu = cpu;
    this.memory = memory;
    this.storage = storage;
  }
}

public static MetricInfo buildMetricInfo(ApiClient client, List<Cluster> clusters, List<String> clusterIds)
  throws ApiException {
  CpuInfo cpu = new CpuInfo(0, 0, 0);
  MemoryInfo memory = new MemoryInfo(0, 0);
  StorageInfo storage = new StorageInfo(0, 0, 0);
  HostApi hostApi = new HostApi(client);
  List<Host> hosts = hostApi.getHosts(
      new GetHostsRequestBody()
          .where(new HostWhereInput()
              .cluster(new ClusterWhereInput()
                  .idIn(clusterIds))));
  HashMap<String, Cluster> clusterIdMap = new HashMap<String, Cluster>();
  clusters.forEach(cluster -> {
    clusterIdMap.put(cluster.getId(), cluster);

    if (cluster.getType() == ClusterType.SMTX_OS) {
      cpu.totalCore += cluster.getTotalCpuCores();
      cpu.totalHz += cluster.getTotalCpuHz();
      cpu.usedHz += cluster.getUsedCpuHz();
      if (cluster.getHypervisor() == Hypervisor.VMWARE) {
        memory.total += cluster.getTotalMemoryBytes();
        memory.used += cluster.getUsedMemoryBytes();
      }
    }
    storage.total += cluster.getTotalDataCapacity();
    storage.used += cluster.getUsedDataSpace();
    storage.invalid += cluster.getFailureDataSpace();
  });

  hosts.forEach(host -> {
    Cluster cluster = clusterIdMap.get(host.getCluster().getId());
    if (cluster != null && cluster.getHypervisor() == Hypervisor.ELF) {
      memory.total += host.getTotalMemoryBytes();
      memory.used += host.getRunningPauseVmMemoryBytes() + host.getOsMemoryBytes();
    }
  });

  return new MetricInfo(cpu.compute(), memory.compute(), storage.compute());
}
```

#### 构建 Dashboard

```java
public class DashboardInfo {
  public MetricInfo metrics;
  public DiskInfo hdd;
  public AlertInfo alert;

  public DashboardInfo(MetricInfo metrics, DiskInfo hdd, AlertInfo alert) {
    this.metrics = metrics;
    this.hdd = hdd;
    this.alert = alert;
  }
}
public static DashboardInfo buildDashboardInfo(ApiClient client, String datacenterId, String clusterId)
  throws ApiException {
  ClusterApi clusterApi = new ClusterApi(client);
  GetClustersRequestBody request = new GetClustersRequestBody();
  if (clusterId != null) {
  request.where(new ClusterWhereInput().id(clusterId));
  } else if (datacenterId != null) {
  request.where(new ClusterWhereInput()
      .datacentersSome(new DatacenterWhereInput()
          .id(datacenterId)));
  }
  List<Cluster> clusters = clusterApi.getClusters(request);
  List<String> clusterIds = clusters.stream().map(cluster -> cluster.getId()).collect(Collectors.toList());
  return new DashboardInfo(
    buildMetricInfo(client, clusters, clusterIds),
    buildHddDiskInfo(client, clusterIds),
    buildAlertInfo(client, clusterIds));
}
```
