---
sidebar_position: 1
id: java-sdk
slug: /java-sdk
---
# Cloudtower Java SDK

The Cloudtower SDK in Java for versions 1.8 and above

- [Source Address](https://github.com/smartxworks/cloudtower-java-sdk)
- [Download Links](https://github.com/smartxworks/cloudtower-java-sdk/releases)

## Install

- ### git source installation

  ```shell
  git clone https://github.com/smartxworks/cloudtower-java-sdk.git
  mvn clean install
  ```

- ### jar package installation

  ```shell
  # download jar and pom from release page
  mvn install:install-file -D"file=<path/to/jar>" -D"pomFile=<path/to/pom>"
  ```

- ### Central repository
  > Not available

## The Use of SDK

### Create an instance

#### Create an `ApiClient` instance

```java
ApiClient client = new ApiClient();
client.setBasePath("http://192.168.96.133/v2/api");
```

#### Create a corresponding API instance

> Create a relevant API instance based on operations for different purposes, e.g., a `VmApi` needs to be created for the operations related to virtual machines.

```java
VmApi vmApi = new VmApi(client);
```

### Authentication

```java
// Obtain a token through the login method in UserApi.
UserApi userApi = new UserApi(client);
LoginInput loginInput = new LoginInput()
    .username("root")
    .password("!QAZ2wsx").source(UserSource.LOCAL);
WithTaskTokenString token = userApi.login(loginInput);
((ApiKeyAuth) client.getAuthentication("Authorization")).setApiKey(token.getData().getToken());
```

### Send a request

#### Get resources

```java
List<Vm> vms = vmApi.getVms(new GetVmsRequestBody().first(1));
```

#### Update resources

> Resource updates will generate relevant asynchronous tasks. When an asynchronous task finishes, the resource operations are completed and the data has been updated.

```java
WithTaskVm withTaskVm = vmApi.startVm(
    new VmStartParams()
        .where(new VmWhereInput()
            .id(vm.getId()))).get(0);
```

> Users can synchronously wait for the asynchronous task to finish through the provided tool method `WaitTask`.
>
> - Description of Method Parameters
>
> | Parameter name    | Type      | Required | Description                        |
> | --------- | --------- | -------- | --------------------------- |
> | id        | string    | Yes       | The id of the task to be queried         |
> | apiClient | ApiClient | Yes       | The ApiClient instance used by the query |
> | interval  | int       | No       | The polling interval with the default value of 5s   |
> | timeout   | int       | No       | The timeout with the default value of 300s       |
>
> - Error Description
>
> | Error code | Description             |
> | ------ | ---------------- |
> | 408    | Timeout             |
> | 500    | An internal error of asynchronous task |

```java
WithTaskVm withTaskVm = vmApi.startVm(
    new VmStartParams()
        .where(new VmWhereInput()
            .id(vm.getId()))).get(0);
TaskUtil.WaitTask(withTaskVm.getTaskId(), client);
```

> For multiple taska, you can use `WaitTasks`
>
> - Description of Method Parameters
>
> | Parameter name      | Type           | Required | Description                                                                               |
> | ----------- | -------------- | -------- | ---------------------------------------------------------------------------------- |
> | ids         | List\<String\> | Yes       | The id list of the tasks to be queried                                                           |
> | apiClient   | ApiClient      | Yes       | The ApiClient instance used by the query                                                        |
> | exitOnError | boolean        | No       | Whether to exit immediately when a single task fails, otherwise wait for all the tasks to finish before exiting, and the default value is False |
> | interval    | int            | No       | The polling interval with the default value of 5s                                                          |
> | timeout     | int            | No       | The timeout with the default value of 300s                                                              |
>
> - Error Description
>
> | Error code | Description             |
> | ------ | ---------------- |
> | 408    | Timeout             |
> | 500    | An internal error of asynchronous task |

```java
VmStartParams startParams = new VmStartParams()
    .where(new VmWhereInput()
        .addIdInItem("vm_id_1")
        .addIdInItem("vm_id_2"));
List<WithTaskVm> startedVms = vmApi.startVm(startParams);
List<String> tasks = startedVms.stream().map(startedVm -> startedVm.getTaskId()).collect(Collectors.toList());
TaskUtil.WaitTasks(tasks, client);
```

#### Others

##### Send an asynchronous request

> The sending of all the above requests is synchronous and will block the current process. If users need to use an asynchronous request, they can use `${Api}Async` with `ApiCallback` to send an asynchronous request.

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

##### Set the language of the returned information

> The language of the return value can be set by setting/clearing the default request header. The optional values are `["en-US", "zh-CN"]`. The languages that are not in the range of optional values will return an HTTP 400 error.

```java
AlertApi alertApi = new AlertApi(client);
// The fields of message, solution, cause, impact in the alerts obtained at this time will be English descriptions
List<Alert> alerts = alertApi.getAlerts(new GetAlertsRequestBody().first(1));
// The fields of message, solution, cause, impact in the alerts obtained at this time will be converted into Chinese descriptions
client.addDefaultHeader("content-language", "zh-CN");
alerts = alertApi.getAlerts(new GetAlertsRequestBody().first(1));
client.removeDefaultHeader("content-language");
// The fields of message, solution, cause, impact in the alerts obtained at this time will be English descriptions
alerts = alertApi.getAlerts(new GetAlertsRequestBody().first(1));
client.addDefaultHeader("content-language", "fr-CA");
// An HTTP 400 error will be returned at this time
alerts = alertApi.getAlerts(new GetAlertsRequestBody().first(1));
```

## Operation Examples

### Get a virtual machine

#### Get all virtual machines

```java
VmApi vmApi = new VmApi(client);
List<Vm> vms = vmApi.getVms(new GetVmsRequestBody());
```

#### Get virtual machines by page

```java
VmApi vmApi = new VmApi(client);
GetVmsRequestBody body = new GetVmsRequestBody().skip(50).first(50);
List<Vm> vmsFrom51To100 = vmApi.getVms(body);
```

#### Get all powered-on virtual machines

```java
VmApi vmApi = new VmApi(client);
VmWhereInput where = new VmWhereInput().status(VmStatus.RUNNING);
GetVmsRequestBody body = new GetVmsRequestBody().where(where);
List<Vm> runningVms = vmApi.getVms(body);
```

#### Get virtual machines with a specific string in their names or descriptions

```java
VmApi vmApi = new VmApi(client);
VmWhereInput where = new VmWhereInput().nameContains("matching_word");
GetVmsRequestBody body = new GetVmsRequestBody().where(where);
List<Vm> matchedVms = vmApi.getVms(body);
```

#### Get all virtual machines with vcpu > n

```java
VmApi vmApi = new VmApi(client);
VmWhereInput where = new VmWhereInput().vcpuGt(n);
GetVmsRequestBody body = new GetVmsRequestBody().where(where);
List<Vm> vmCpuGtN = vmApi.getVms(body);
```

### Create a virtual machine from a template

#### Specify ids only

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

#### Configure the virtual disk parameters which are different from those of the template

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

#### Configure the NIC parameters which are different from those of the template

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

### Create a blank virtual machine

#### Create a virtual machine simply

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

#### Configure a virtual disk during creation

##### Load an ISO from CD-ROM

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

##### Mount a virtual volume as a virtual disk

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

##### Add and mount a virtual disk

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

#### Configure a virtual NIC during creation

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

### Edit a virtual machine

#### Edit basic information

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

#### Edit a CD-ROM

##### Add a CD-ROM

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

##### Delete a CD-ROM

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

#### Virtual volume operations

##### Add a new virtual volume

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

##### Mount an existing virtual volume as a virtual disk

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

##### Unmount a virtual disk

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

#### NIC operations

##### Add a NIC

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

##### Edit a NIC

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

##### Delete a NIC

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

#### Virtual machine migration

##### Migrate to a specified host

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

##### Schedule to an appropriate host automatically

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

### Virtual machine power operations

#### Power on a virtual machine:

##### The specified virtual machine is powered on and scheduled to an appropriate virtual machine automatically

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

##### The virtual machines are powered on in batch and scheduled to appropriate virtual machines automatically

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

##### The virtual machine is powered on to a specified host

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

#### Power off a virtual machine

##### Shut down the specified virtual machine

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

##### Shut down the virtual machines in batch

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

##### Power off the specified virtual machine

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

##### Power off virtual machines in batch

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

#### Reboot a virtual machine

##### Reboot a specified virtual machine

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

##### Reboot the virtual machines in batch

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

##### Reboot the specified virtual machine

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

##### Force reboot the virtual machines in batch

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

#### Suspend a virtual machine

##### Suspend the specified virtual machine

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

##### Suspend the virtual machines in batch

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

#### Resume a virtual machine

##### Resume the specified virtual machine

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

##### Resume the virtual machines in batch

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

### Delete virtual machine

#### Recycle bin

##### Move to recycle bin

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

##### Recover from recycle bin

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

#### Delete permanently

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

## A scenario example

### Backup a virtual machine

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
  // 1. Get the information of the virtual machine to be backed up, here we need the id of the virtual machine to construct the parameters for creating a snapshot, and need the status of the VMTools to determine whether creating a file system consistency snapshot is allowed.
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
  // 2. Wait for the task to finish.
  TaskUtil.WaitTask(snapshot_with_task.getTaskId(), client);
  // 3. Query the created virtual machine snapshot.
  VmSnapshot snapshot = vmSnapshotApi.getVmSnapshots(
      new GetVmSnapshotsRequestBody()
          .where(new VmSnapshotWhereInput()
              .id(snapshot_with_task.getData().getId()))).get(0);
  // 4. Query the generated iSCSI Lun snapshot.
  List<String> lunSnapshotIds = snapshot.getVmDisks().stream().filter(disk -> disk.getType() == VmDiskType.DISK)
      .map(disk -> disk.getSnapshotLocalId()).collect(Collectors.toList());
  List<IscsiLunSnapshot> lunSnapshots = null;
  if (lunSnapshotIds.size() > 0) {
    lunSnapshots = iscsiLunSnapshotApi.getIscsiLunSnapshots(
        new GetIscsiLunSnapshotsRequestBody()
            .where(new IscsiLunSnapshotWhereInput()
                .localIdIn(lunSnapshotIds)));
  }
  return new BackupResult(snapshot, lunSnapshots);
}
```

### Build Dashboard

#### Define utility methods

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

#### Build alart information

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

#### Build hard disk information

> Here is an example of a mechanical hard disk

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

#### Build performance metrics

> Get total CPU cores, total CPU frequency, CPU usage, total memory, used memory, total storage, used storage, invalid storage, and available storage of the specified cluster.

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

#### Build Dashboard

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
