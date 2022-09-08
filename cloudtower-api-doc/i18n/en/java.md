import '../../swagger/utils/autoScroll';

# CloudTower Java SDK

The CloudTower SDK in Java for versions 1.8 and above

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

> if https connection is required，cert should be installed，or skip verify cert

```java
ApiClient client = new ApiClient();
client.setBasePath("https://192.168.96.133/v2/api");
client.setVerifyingSsl(false);
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
> | Parameter name | Type      | Required | Description                                       |
> | -------------- | --------- | -------- | ------------------------------------------------- |
> | id             | string    | Yes      | The id of the task to be queried                  |
> | apiClient      | ApiClient | Yes      | The ApiClient instance used by the query          |
> | interval       | int       | No       | The polling interval with the default value of 5s |
> | timeout        | int       | No       | The timeout with the default value of 300s        |
>
> - Error Description
>
> | Error code | Description                            |
> | ---------- | -------------------------------------- |
> | 408        | Timeout                                |
> | 500        | An internal error of asynchronous task |

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
> | Parameter name | Type           | Required | Description                                                                                                                                     |
> | -------------- | -------------- | -------- | ----------------------------------------------------------------------------------------------------------------------------------------------- |
> | ids            | List\<String\> | Yes      | The id list of the tasks to be queried                                                                                                          |
> | apiClient      | ApiClient      | Yes      | The ApiClient instance used by the query                                                                                                        |
> | exitOnError    | boolean        | No       | Whether to exit immediately when a single task fails, otherwise wait for all the tasks to finish before exiting, and the default value is False |
> | interval       | int            | No       | The polling interval with the default value of 5s                                                                                               |
> | timeout        | int            | No       | The timeout with the default value of 300s                                                                                                      |
>
> - Error Description
>
> | Error code | Description                            |
> | ---------- | -------------------------------------- |
> | 408        | Timeout                                |
> | 500        | An internal error of asynchronous task |

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
public class App {

  public static void main(String[] args) throws ApiException {
    ApiClient client = new ApiClient();
    client.setBasePath("http://192.168.96.133/v2/api");
    client.setApiKey("token");
    List<Vm> vms = getAllVms(client);
  }

  public static List<Vm> getAllVms(ApiClient client) throws ApiException {
    VmApi vmApi = new VmApi(client);
    return vmApi.getVms(new GetVmsRequestBody());
  }
}
```

#### Get virtual machines by page

```java
public class App {

  public static void main(String[] args) throws ApiException {
    ApiClient client = new ApiClient();
    client.setBasePath("http://192.168.96.133/v2/api");
    client.setApiKey("token");
    List<Vm> vms = getVmsByPagination(client, 50, 100);
  }

  public static List<Vm> getVmsByPagination(ApiClient client, int from, int to) throws ApiException {
    VmApi vmApi = new VmApi(client);
    GetVmsRequestBody body = new GetVmsRequestBody().skip(from - 1).first(to - from);
    return vmApi.getVms(body);
  }
}
```

#### Get all powered-on virtual machines

```java
public class App {

  public static void main(String[] args) throws ApiException {
    ApiClient client = new ApiClient();
    client.setBasePath("http://192.168.96.133/v2/api");
    client.setApiKey("token");
    List<Vm> vms = getAllRunningVms(client);
  }

  public static List<Vm> getAllRunningVms(ApiClient client) throws ApiException {
    VmApi vmApi = new VmApi(client);
    VmWhereInput where = new VmWhereInput().status(VmStatus.RUNNING);
    GetVmsRequestBody body = new GetVmsRequestBody().where(where);
    return vmApi.getVms(body);
  }
}
```

#### Get virtual machines with a specific string in their names

```java
public class App {

  public static void main(String[] args) throws ApiException {
    ApiClient client = new ApiClient();
    client.setBasePath("http://192.168.96.133/v2/api");
    client.setApiKey("token");
    List<Vm> vms = getVmsByNameMatching(client, "yinsw");
  }

  public static List<Vm> getVmsByNameMatching(ApiClient client, String matching) throws ApiException {
    VmApi vmApi = new VmApi(client);
    VmWhereInput where = new VmWhereInput().nameContains(matching);
    GetVmsRequestBody body = new GetVmsRequestBody().where(where);
    return vmApi.getVms(body);
  }
}
```

#### Get all virtual machines with vcpu > n

```java
public class App {

  public static void main(String[] args) throws ApiException {
    ApiClient client = new ApiClient();
    client.setBasePath("http://192.168.96.133/v2/api");
    client.setApiKey("token");
    List<Vm> vms = getVmsHasNMoreCpuCore(client, 4);
  }

  public static List<Vm> getVmsHasNMoreCpuCore(ApiClient client, int n) throws ApiException {
    VmApi vmApi = new VmApi(client);
    VmWhereInput where = new VmWhereInput().vcpuGt(n);
    GetVmsRequestBody body = new GetVmsRequestBody().where(where);
    return vmApi.getVms(body);
  }
}
```

### Create a virtual machine from a template

#### Specify ids only

```java
public class App {

  public static void main(String[] args) throws ApiException {
    ApiClient client = new ApiClient();
    client.setBasePath("http://192.168.96.133/v2/api");
    client.setApiKey("token");

    List<Vm> vms = createVmFromTemplate(client, new VmCreateVmFromTemplateParams()
        .clusterId("cl2k0mpoy026d0822xq6ctsim")
        .templateId("cl2k0tvpw04y608222h8so9ov")
        .name("createFromVmTemplate")
        .isFullCopy(false));
  }

  public static List<Vm> createVmFromTemplate(ApiClient client, VmCreateVmFromTemplateParams param)
      throws ApiException {
    VmApi vmApi = new VmApi(client);
    List<VmCreateVmFromTemplateParams> params = new ArrayList<VmCreateVmFromTemplateParams>(1);
    params.add(param);
    List<WithTaskVm> withTaskVms = vmApi.createVmFromTemplate(params);
    List<String> tasks = withTaskVms.stream().map(vms -> vms.getTaskId()).collect(Collectors.toList());
    List<String> ids = withTaskVms.stream().map(vms -> vms.getData().getId()).collect(Collectors.toList());
    TaskUtil.WaitTasks(tasks, client);
    List<Vm> vms = vmApi
        .getVms(
            new GetVmsRequestBody()
                .where(new VmWhereInput()
                    .idIn(ids)));
    return vms;
  }
}
```

#### Configure the virtual disk parameters which are different from those of the template

```java
public class App {

  public static void main(String[] args) throws ApiException {
    ApiClient client = new ApiClient();
    client.setBasePath("http://192.168.96.133/v2/api");
    client.setApiKey("token");
    VmCreateVmFromTemplateParamsDiskOperate diskOperate = new VmCreateVmFromTemplateParamsDiskOperate()
        .removeDisks(
            new VmCreateVmFromTemplateParamsDiskOperateRemoveDisks()
                .addDiskIndexItem(1))
        .newDisks(
            new VmDiskParams()
                .addMountCdRomsItem(
                    new VmCdRomParams()
                        .boot(3))
                .addMountDisksItem(
                    new MountDisksParams()
                        .boot(1)
                        .bus(Bus.VIRTIO)
                        .vmVolumeId("cl2k1kohp08up08225yjgfpdz"))
                .addMountNewCreateDisksItem(
                    new MountNewCreateDisksParams()
                        .vmVolume(
                            new MountNewCreateDisksParamsVmVolume()
                                .elfStoragePolicy(VmVolumeElfStoragePolicyType._2_THIN_PROVISION)
                                .size(4L * 1024 * 1024 * 1024)
                                .name("disk_name"))
                        .boot(3)
                        .bus(Bus.VIRTIO)));

    List<Vm> vms = createVmFromTemplate(client, new VmCreateVmFromTemplateParams()
        .clusterId("cl2k0mpoy026d0822xq6ctsim")
        .templateId("cl2k0tvpw04y608222h8so9ov")
        .name("createFromVmTemplate")
        .isFullCopy(false)
        .diskOperate(diskOperate));
  }

  public static List<Vm> createVmFromTemplate(ApiClient client, VmCreateVmFromTemplateParams param)
      throws ApiException {
    VmApi vmApi = new VmApi(client);
    List<VmCreateVmFromTemplateParams> params = new ArrayList<VmCreateVmFromTemplateParams>(1);
    params.add(param);
    List<WithTaskVm> withTaskVms = vmApi.createVmFromTemplate(params);
    List<String> tasks = withTaskVms.stream().map(vms -> vms.getTaskId()).collect(Collectors.toList());
    List<String> ids = withTaskVms.stream().map(vms -> vms.getData().getId()).collect(Collectors.toList());
    TaskUtil.WaitTasks(tasks, client);
    List<Vm> vms = vmApi
        .getVms(
            new GetVmsRequestBody()
                .where(new VmWhereInput()
                    .idIn(ids)));
    return vms;
  }
}
```

#### Configure the NIC parameters which are different from those of the template

```java
public class App {

  public static void main(String[] args) throws ApiException {
    ApiClient client = new ApiClient();
    client.setBasePath("http://192.168.96.133/v2/api");
    client.setApiKey("token");
    VmNicParams nicParams = new VmNicParams()
        .connectVlanId("cl2k1ohoq09si0822q648n9v8")
        .enabled(true)
        .model(VmNicModel.E1000);
    List<Vm> vms = createVmFromTemplate(client, new VmCreateVmFromTemplateParams()
        .clusterId("cl2k0mpoy026d0822xq6ctsim")
        .templateId("cl2k0tvpw04y608222h8so9ov")
        .name("createFromVmTemplate")
        .isFullCopy(false)
        .addVmNicsItem(nicParams));
  }

  public static List<Vm> createVmFromTemplate(ApiClient client, VmCreateVmFromTemplateParams param)
      throws ApiException {
    VmApi vmApi = new VmApi(client);
    List<VmCreateVmFromTemplateParams> params = new ArrayList<VmCreateVmFromTemplateParams>(1);
    params.add(param);
    List<WithTaskVm> withTaskVms = vmApi.createVmFromTemplate(params);
    List<String> tasks = withTaskVms.stream().map(vms -> vms.getTaskId()).collect(Collectors.toList());
    List<String> ids = withTaskVms.stream().map(vms -> vms.getData().getId()).collect(Collectors.toList());
    TaskUtil.WaitTasks(tasks, client);
    List<Vm> vms = vmApi
        .getVms(
            new GetVmsRequestBody()
                .where(new VmWhereInput()
                    .idIn(ids)));
    return vms;
  }
}
```

### Create a blank virtual machine

#### Create a virtual machine simply

```java
public class App {

  public static void main(String[] args) throws ApiException {
    ApiClient client = new ApiClient();
    client.setBasePath("http://192.168.96.133/v2/api");
    client.setApiKey("token");
    VmCreationParams param = new VmCreationParams()
        .clusterId("cl2k0mpoy026d0822xq6ctsim")
        .name("vm_name_2")
        .ha(true)
        .cpuCores(4)
        .cpuSockets(4)
        .memory(4L * 1024 * 1024 * 1024)
        .vcpu(16)
        .status(VmStatus.STOPPED)
        .firmware(VmFirmware.BIOS)
        .addVmNicsItem(new VmNicParams().connectVlanId("cl2k0msiz02wc08220d6m3bz5"))
        .vmDisks(new VmDiskParams().addMountCdRomsItem(new VmCdRomParams().boot(0).index(0)));

    List<Vm> vms = createVm(client, param);
  }

  public static List<Vm> createVm(ApiClient client, VmCreationParams param)
      throws ApiException {
    VmApi vmApi = new VmApi(client);
    List<VmCreationParams> params = new ArrayList<VmCreationParams>(1);
    params.add(param);
    List<WithTaskVm> withTaskVms = vmApi.createVm(params);
    List<String> tasks = withTaskVms.stream().map(vms -> vms.getTaskId()).collect(Collectors.toList());
    List<String> ids = withTaskVms.stream().map(vms -> vms.getData().getId()).collect(Collectors.toList());
    TaskUtil.WaitTasks(tasks, client);
    List<Vm> vms = vmApi
        .getVms(
            new GetVmsRequestBody()
                .where(new VmWhereInput()
                    .idIn(ids)));
    return vms;
  }
}
```

#### Configure a virtual disk during creation

##### Load an ISO from CD-ROM

```java
public class App {

  public static void main(String[] args) throws ApiException {
    ApiClient client = new ApiClient();
    client.setBasePath("http://192.168.96.133/v2/api");
    client.setApiKey("token");
    VmCreationParams param = new VmCreationParams()
        .clusterId("cl2k0mpoy026d0822xq6ctsim")
        .name("vm_name")
        .ha(true)
        .cpuCores(4)
        .cpuSockets(4)
        .memory(4L * 1024 * 1024 * 1024)
        .vcpu(16)
        .status(VmStatus.STOPPED)
        .firmware(VmFirmware.BIOS)
        .addVmNicsItem(new VmNicParams().connectVlanId("cl2k0msiz02wc08220d6m3bz5"))
        .vmDisks(new VmDiskParams()
            .addMountCdRomsItem(new VmCdRomParams()
                .boot(0)
                .index(0)
                .elfImageId("cl2k1yswo0csh0822299yalwn")));

    List<Vm> vms = createVm(client, param);
  }

  public static List<Vm> createVm(ApiClient client, VmCreationParams param)
      throws ApiException {
    VmApi vmApi = new VmApi(client);
    List<VmCreationParams> params = new ArrayList<VmCreationParams>(1);
    params.add(param);
    List<WithTaskVm> withTaskVms = vmApi.createVm(params);
    List<String> tasks = withTaskVms.stream().map(vms -> vms.getTaskId()).collect(Collectors.toList());
    List<String> ids = withTaskVms.stream().map(vms -> vms.getData().getId()).collect(Collectors.toList());
    TaskUtil.WaitTasks(tasks, client);
    List<Vm> vms = vmApi
        .getVms(
            new GetVmsRequestBody()
                .where(new VmWhereInput()
                    .idIn(ids)));
    return vms;
  }
}
```

##### Mount a virtual volume as a virtual disk

```java
public class App {

  public static void main(String[] args) throws ApiException {
    ApiClient client = new ApiClient();
    client.setBasePath("http://192.168.96.133/v2/api");
    client.setApiKey("token");
    VmCreationParams param = new VmCreationParams()
        .clusterId("cl2k0mpoy026d0822xq6ctsim")
        .name("vm_name")
        .ha(true)
        .cpuCores(4)
        .cpuSockets(4)
        .memory(4L * 1024 * 1024 * 1024)
        .vcpu(16)
        .status(VmStatus.STOPPED)
        .firmware(VmFirmware.BIOS)
        .addVmNicsItem(new VmNicParams().connectVlanId("cl2k0msiz02wc08220d6m3bz5"))
        .vmDisks(new VmDiskParams()
            .addMountDisksItem(new MountDisksParams()
                .boot(0)
                .index(0)
                .bus(Bus.SCSI)
                .vmVolumeId("cl2k1kohp08up08225yjgfpdz")));

    List<Vm> vms = createVm(client, param);
  }

  public static List<Vm> createVm(ApiClient client, VmCreationParams param)
      throws ApiException {
    VmApi vmApi = new VmApi(client);
    List<VmCreationParams> params = new ArrayList<VmCreationParams>(1);
    params.add(param);
    List<WithTaskVm> withTaskVms = vmApi.createVm(params);
    List<String> tasks = withTaskVms.stream().map(vms -> vms.getTaskId()).collect(Collectors.toList());
    List<String> ids = withTaskVms.stream().map(vms -> vms.getData().getId()).collect(Collectors.toList());
    TaskUtil.WaitTasks(tasks, client);
    List<Vm> vms = vmApi
        .getVms(
            new GetVmsRequestBody()
                .where(new VmWhereInput()
                    .idIn(ids)));
    return vms;
  }
}
```

##### Add and mount a virtual disk

```java
public class App {

  public static void main(String[] args) throws ApiException {
    ApiClient client = new ApiClient();
    client.setBasePath("http://192.168.96.133/v2/api");
    client.setApiKey("token");
    VmCreationParams param = new VmCreationParams()
        .clusterId("cl2k0mpoy026d0822xq6ctsim")
        .name("vm_name")
        .ha(true)
        .cpuCores(4)
        .cpuSockets(4)
        .memory(4L * 1024 * 1024 * 1024)
        .vcpu(16)
        .status(VmStatus.STOPPED)
        .firmware(VmFirmware.BIOS)
        .addVmNicsItem(new VmNicParams().connectVlanId("cl2k0msiz02wc08220d6m3bz5"))
        .vmDisks(new VmDiskParams()
            .addMountNewCreateDisksItem(new MountNewCreateDisksParams()
                .index(0)
                .boot(0)
                .bus(Bus.VIRTIO)
                .vmVolume(new MountNewCreateDisksParamsVmVolume()
                    .elfStoragePolicy(VmVolumeElfStoragePolicyType._2_THIN_PROVISION)
                    .name("new_disk")
                    .size(4L * 1024 * 1024 * 1024))));

    List<Vm> vms = createVm(client, param);
  }

  public static List<Vm> createVm(ApiClient client, VmCreationParams param)
      throws ApiException {
    VmApi vmApi = new VmApi(client);
    List<VmCreationParams> params = new ArrayList<VmCreationParams>(1);
    params.add(param);
    List<WithTaskVm> withTaskVms = vmApi.createVm(params);
    List<String> tasks = withTaskVms.stream().map(vms -> vms.getTaskId()).collect(Collectors.toList());
    List<String> ids = withTaskVms.stream().map(vms -> vms.getData().getId()).collect(Collectors.toList());
    TaskUtil.WaitTasks(tasks, client);
    List<Vm> vms = vmApi
        .getVms(
            new GetVmsRequestBody()
                .where(new VmWhereInput()
                    .idIn(ids)));
    return vms;
  }
}
```

#### Configure a virtual NIC during creation

```java
public class App {

  public static void main(String[] args) throws ApiException {
    ApiClient client = new ApiClient();
    client.setBasePath("http://192.168.96.133/v2/api");
    client.setApiKey("token");
    VmCreationParams param = new VmCreationParams()
        .clusterId("cl2k0mpoy026d0822xq6ctsim")
        .name("vm_name")
        .ha(true)
        .cpuCores(4)
        .cpuSockets(4)
        .memory(4L * 1024 * 1024 * 1024)
        .vcpu(16)
        .status(VmStatus.STOPPED)
        .firmware(VmFirmware.BIOS)
        .addVmNicsItem(new VmNicParams()
            .connectVlanId("cl2k0msiz02wc08220d6m3bz5")
            .macAddress("00:0C:29:B7:D8:E0")
            .model(VmNicModel.E1000))
        .vmDisks(new VmDiskParams()
            .addMountCdRomsItem(new VmCdRomParams().boot(0).index(0)));

    List<Vm> vms = createVm(client, param);
  }

  public static List<Vm> createVm(ApiClient client, VmCreationParams param)
      throws ApiException {
    VmApi vmApi = new VmApi(client);
    List<VmCreationParams> params = new ArrayList<VmCreationParams>(1);
    params.add(param);
    List<WithTaskVm> withTaskVms = vmApi.createVm(params);
    List<String> tasks = withTaskVms.stream().map(vms -> vms.getTaskId()).collect(Collectors.toList());
    List<String> ids = withTaskVms.stream().map(vms -> vms.getData().getId()).collect(Collectors.toList());
    TaskUtil.WaitTasks(tasks, client);
    List<Vm> vms = vmApi
        .getVms(
            new GetVmsRequestBody()
                .where(new VmWhereInput()
                    .idIn(ids)));
    return vms;
  }
}
```

### Edit a virtual machine

#### Edit basic information

```java
public class App {

  public static void main(String[] args) throws ApiException {
    ApiClient client = new ApiClient();
    client.setBasePath("http://192.168.96.133/v2/api");
    client.setApiKey("token");

    VmWhereInput where = new VmWhereInput().id("cl2k0njfl04480822fxjq5nns");
    VmUpdateParamsData data = new VmUpdateParamsData()
        .cpuSockets(2)
        .cpuCores(2)
        .vcpu(4)
        .memory(8L * 1024 * 1024 * 1024)
        .name("new_name")
        .description("new_description");
    List<Vm> vms = updateVm(client, where, data);
  }

  public static List<Vm> updateVm(ApiClient client, VmWhereInput where, VmUpdateParamsData data)
      throws ApiException {
    VmApi vmApi = new VmApi(client);
    List<WithTaskVm> withTaskVms = vmApi.updateVm(new VmUpdateParams().where(where).data(data));
    List<String> tasks = withTaskVms.stream().map(vms -> vms.getTaskId()).collect(Collectors.toList());
    List<String> ids = withTaskVms.stream().map(vms -> vms.getData().getId()).collect(Collectors.toList());
    TaskUtil.WaitTasks(tasks, client);
    List<Vm> vms = vmApi
        .getVms(
            new GetVmsRequestBody()
                .where(new VmWhereInput()
                    .idIn(ids)));
    return vms;
  }
}
```

#### Edit vm advance options

```java
public class App {

  public static void main(String[] args) throws ApiException {
    ApiClient client = new ApiClient();
    client.setBasePath("http://192.168.96.133/v2/api");
    client.setApiKey("token");

    VmWhereInput where = new VmWhereInput().id("cl2k0njfl04480822fxjq5nns");
    VmUpdateAdvancedOptionsParamsData data = new VmUpdateAdvancedOptionsParamsData()
        .clockOffset(VmClockOffset.LOCALTIME)
        .cpuModel("Skylake-Server-IBRS")
        .videoType(VmVideoType.VGA)
        .windowsOptimize(true);
    List<Vm> vms = updateVm(client, where, data);
  }

  public static List<Vm> updateVm(ApiClient client, VmWhereInput where, VmUpdateAdvancedOptionsParamsData data)
      throws ApiException {
    VmApi vmApi = new VmApi(client);
    List<WithTaskVm> withTaskVms = vmApi
        .updateVmAdvancedOptions(new VmUpdateAdvancedOptionsParams().where(where).data(data));
    List<String> tasks = withTaskVms.stream().map(vms -> vms.getTaskId()).collect(Collectors.toList());
    List<String> ids = withTaskVms.stream().map(vms -> vms.getData().getId()).collect(Collectors.toList());
    TaskUtil.WaitTasks(tasks, client);
    List<Vm> vms = vmApi
        .getVms(
            new GetVmsRequestBody()
                .where(new VmWhereInput()
                    .idIn(ids)));
    return vms;
  }
}
```

#### Edit a CD-ROM

##### Add a CD-ROM

```java
public class App {

  public static void main(String[] args) throws ApiException {
    ApiClient client = new ApiClient();
    client.setBasePath("http://192.168.96.133/v2/api");
    client.setApiKey("token");

    VmWhereInput where = new VmWhereInput().id("cl2k0njfl04480822fxjq5nns");
    VmAddCdRomParamsData data = new VmAddCdRomParamsData()
        .addVmCdRomsItem(new VmCdRomParams()
        .boot(0)
        .index(0)
        .elfImageId("cl2k1yswo0csh0822299yalwn"));
    List<Vm> vms = addCdRom(client, where, data);
  }

  public static List<Vm> addCdRom(ApiClient client, VmWhereInput where, VmAddCdRomParamsData data)
      throws ApiException {
    VmApi vmApi = new VmApi(client);
    List<WithTaskVm> withTaskVms = vmApi
        .addVmCdRom(new VmAddCdRomParams().where(where).data(data));
    List<String> tasks = withTaskVms.stream().map(vms -> vms.getTaskId()).collect(Collectors.toList());
    List<String> ids = withTaskVms.stream().map(vms -> vms.getData().getId()).collect(Collectors.toList());
    TaskUtil.WaitTasks(tasks, client);
    List<Vm> vms = vmApi
        .getVms(
            new GetVmsRequestBody()
                .where(new VmWhereInput()
                    .idIn(ids)));
    return vms;
  }
}
```

##### Delete a CD-ROM

```java
public class App {

  public static void main(String[] args) throws ApiException {
    ApiClient client = new ApiClient();
    client.setBasePath("http://192.168.96.133/v2/api");
    client.setApiKey("token");

    VmWhereInput where = new VmWhereInput().id("cl2k0njfl04480822fxjq5nns");
    VmRemoveCdRomParamsData data = new VmRemoveCdRomParamsData().addCdRomIdsItem("cl2k2v1fv0jvo0822dr73hd1n");
    List<Vm> vms = deleteCdRom(client, where, data);
  }

  public static List<Vm> deleteCdRom(ApiClient client, VmWhereInput where, VmRemoveCdRomParamsData data)
      throws ApiException {
    VmApi vmApi = new VmApi(client);
    List<WithTaskVm> withTaskVms = vmApi
        .removeVmCdRom(new VmRemoveCdRomParams().where(where).data(data));
    List<String> tasks = withTaskVms.stream().map(vms -> vms.getTaskId()).collect(Collectors.toList());
    List<String> ids = withTaskVms.stream().map(vms -> vms.getData().getId()).collect(Collectors.toList());
    TaskUtil.WaitTasks(tasks, client);
    List<Vm> vms = vmApi
        .getVms(
            new GetVmsRequestBody()
                .where(new VmWhereInput()
                    .idIn(ids)));
    return vms;
  }
}
```

#### Virtual volume operations

##### Add a new virtual volume

```java
public class App {

  public static void main(String[] args) throws ApiException {
    ApiClient client = new ApiClient();
    client.setBasePath("http://192.168.96.133/v2/api");
    client.setApiKey("token");

    VmWhereInput where = new VmWhereInput().id("cl2k0njfl04480822fxjq5nns");
    VmAddDiskParamsData data = new VmAddDiskParamsData().vmDisks(new VmAddDiskParamsDataVmDisks()
        .addMountNewCreateDisksItem(new MountNewCreateDisksParams()
            .boot(0)
            .index(0)
            .bus(Bus.VIRTIO)
            .vmVolume(
                new MountNewCreateDisksParamsVmVolume()
                    .elfStoragePolicy(VmVolumeElfStoragePolicyType._2_THIN_PROVISION)
                    .name("new_mount_disk")
                    .size(10L * 1024 * 1024 * 1024))));
    List<Vm> vms = addDisk(client, where, data);
  }

  public static List<Vm> addDisk(ApiClient client, VmWhereInput where, VmAddDiskParamsData data)
      throws ApiException {
    VmApi vmApi = new VmApi(client);
    List<WithTaskVm> withTaskVms = vmApi
        .addVmDisk(new VmAddDiskParams().where(where).data(data));
    List<String> tasks = withTaskVms.stream().map(vms -> vms.getTaskId()).collect(Collectors.toList());
    List<String> ids = withTaskVms.stream().map(vms -> vms.getData().getId()).collect(Collectors.toList());
    TaskUtil.WaitTasks(tasks, client);
    List<Vm> vms = vmApi
        .getVms(
            new GetVmsRequestBody()
                .where(new VmWhereInput()
                    .idIn(ids)));
    return vms;
  }
}
```

##### Mount an existing virtual volume as a virtual disk

```java
public class App {

  public static void main(String[] args) throws ApiException {
    ApiClient client = new ApiClient();
    client.setBasePath("http://192.168.96.133/v2/api");
    client.setApiKey("token");

    VmWhereInput where = new VmWhereInput().id("cl2k0njfl04480822fxjq5nns");
    VmAddDiskParamsData data = new VmAddDiskParamsData().vmDisks(new VmAddDiskParamsDataVmDisks()
        .addMountDisksItem(new MountDisksParams()
            .boot(0)
            .index(0)
            .bus(Bus.VIRTIO)
            .vmVolumeId("cl2k37rex0maa0822ivcy2s9l")));
    List<Vm> vms = mountDisk(client, where, data);
  }

  public static List<Vm> mountDisk(ApiClient client, VmWhereInput where, VmAddDiskParamsData data)
      throws ApiException {
    VmApi vmApi = new VmApi(client);
    List<WithTaskVm> withTaskVms = vmApi
        .addVmDisk(new VmAddDiskParams().where(where).data(data));
    List<String> tasks = withTaskVms.stream().map(vms -> vms.getTaskId()).collect(Collectors.toList());
    List<String> ids = withTaskVms.stream().map(vms -> vms.getData().getId()).collect(Collectors.toList());
    TaskUtil.WaitTasks(tasks, client);
    List<Vm> vms = vmApi
        .getVms(
            new GetVmsRequestBody()
                .where(new VmWhereInput()
                    .idIn(ids)));
    return vms;
  }
}
```

##### Unmount a virtual disk

```java
public class App {

  public static void main(String[] args) throws ApiException {
    ApiClient client = new ApiClient();
    client.setBasePath("http://192.168.96.133/v2/api");
    client.setApiKey("token");

    VmWhereInput where = new VmWhereInput().id("cl2k0njfl04480822fxjq5nns");
    VmRemoveDiskParamsData data = new VmRemoveDiskParamsData().addDiskIdsItem("cl2k38qv70mna082283l646jl");
    List<Vm> vms = removeDisk(client, where, data);
  }

  public static List<Vm> removeDisk(ApiClient client, VmWhereInput where, VmRemoveDiskParamsData data)
      throws ApiException {
    VmApi vmApi = new VmApi(client);
    List<WithTaskVm> withTaskVms = vmApi
        .removeVmDisk(new VmRemoveDiskParams().where(where).data(data));
    List<String> tasks = withTaskVms.stream().map(vms -> vms.getTaskId()).collect(Collectors.toList());
    List<String> ids = withTaskVms.stream().map(vms -> vms.getData().getId()).collect(Collectors.toList());
    TaskUtil.WaitTasks(tasks, client);
    List<Vm> vms = vmApi
        .getVms(
            new GetVmsRequestBody()
                .where(new VmWhereInput()
                    .idIn(ids)));
    return vms;
  }
}
```

#### NIC operations

##### Add a NIC

```java
public class App {

  public static void main(String[] args) throws ApiException {
    ApiClient client = new ApiClient();
    client.setBasePath("http://192.168.96.133/v2/api");
    client.setApiKey("token");

    VmWhereInput where = new VmWhereInput().id("cl2k0njfl04480822fxjq5nns");
    VmAddNicParamsData data = new VmAddNicParamsData()
        .addVmNicsItem(new VmNicParams().connectVlanId("cl2k1ohoq09si0822q648n9v8"));
    List<Vm> vms = addVmNic(client, where, data);
  }

  public static List<Vm> addVmNic(ApiClient client, VmWhereInput where, VmAddNicParamsData data)
      throws ApiException {
    VmApi vmApi = new VmApi(client);
    List<WithTaskVm> withTaskVms = vmApi
        .addVmNic(new VmAddNicParams().where(where).data(data));
    List<String> tasks = withTaskVms.stream().map(vms -> vms.getTaskId()).collect(Collectors.toList());
    List<String> ids = withTaskVms.stream().map(vms -> vms.getData().getId()).collect(Collectors.toList());
    TaskUtil.WaitTasks(tasks, client);
    List<Vm> vms = vmApi
        .getVms(
            new GetVmsRequestBody()
                .where(new VmWhereInput()
                    .idIn(ids)));
    return vms;
  }
}
```

##### Edit basic information of a nic

```java
public class App {

  public static void main(String[] args) throws ApiException {
    ApiClient client = new ApiClient();
    client.setBasePath("http://192.168.96.133/v2/api");
    client.setApiKey("token");

    VmNicWhereInput where = new VmNicWhereInput().id("cl2k3coie0ngx0822oz5wgubx");
    VmUpdateNicBasicInfoParamsData data = new VmUpdateNicBasicInfoParamsData()
        .subnetMask("255.255.240.0")
        .ipAddress("192.168.10.114")
        .gateway("192.168.31.215");
    List<Vm> vms = updateVmNic(client, where, data);
  }

  public static List<Vm> updateVmNic(ApiClient client, VmNicWhereInput where, VmUpdateNicBasicInfoParamsData data)
      throws ApiException {
    VmApi vmApi = new VmApi(client);
    List<WithTaskVm> withTaskVms = vmApi
        .updateVmNicBasicInfo(new VmUpdateNicBasicInfoParams().where(where).data(data));
    List<String> tasks = withTaskVms.stream().map(vms -> vms.getTaskId()).collect(Collectors.toList());
    List<String> ids = withTaskVms.stream().map(vms -> vms.getData().getId()).collect(Collectors.toList());
    TaskUtil.WaitTasks(tasks, client);
    List<Vm> vms = vmApi
        .getVms(
            new GetVmsRequestBody()
                .where(new VmWhereInput()
                    .idIn(ids)));
    return vms;
  }
}
```

##### Edit advance information of a nic

```java
public class App {

  public static void main(String[] args) throws ApiException {
    ApiClient client = new ApiClient();
    client.setBasePath("http://192.168.96.133/v2/api");
    client.setApiKey("token");

    VmNicWhereInput where = new VmNicWhereInput().id("cl2k3ill50oes0822f09n8ml6");
    VmUpdateNicAdvanceInfoParamsData data = new VmUpdateNicAdvanceInfoParamsData()
        .connectVlanId("cl2k0msiz02wc08220d6m3bz5")
        .enabled(false)
        .macAddress("00:0C:29:B7:D8:E0")
        .mirror(true);
    List<Vm> vms = updateVmNic(client, where, data);
  }

  public static List<Vm> updateVmNic(ApiClient client, VmNicWhereInput where, VmUpdateNicAdvanceInfoParamsData data)
      throws ApiException {
    VmApi vmApi = new VmApi(client);
    List<WithTaskVm> withTaskVms = vmApi
        .updateVmNicAdvanceInfo(new VmUpdateNicAdvanceInfoParams().where(where).data(data));
    List<String> tasks = withTaskVms.stream().map(vms -> vms.getTaskId()).collect(Collectors.toList());
    List<String> ids = withTaskVms.stream().map(vms -> vms.getData().getId()).collect(Collectors.toList());
    TaskUtil.WaitTasks(tasks, client);
    List<Vm> vms = vmApi
        .getVms(
            new GetVmsRequestBody()
                .where(new VmWhereInput()
                    .idIn(ids)));
    return vms;
  }
}
```

##### Delete a NIC

```java
public class App {

  public static void main(String[] args) throws ApiException {
    ApiClient client = new ApiClient();
    client.setBasePath("http://192.168.96.133/v2/api");
    client.setApiKey("token");

    VmWhereInput where = new VmWhereInput().id("cl2k0njfl04480822fxjq5nns");
    VmRemoveNicParamsData data = new VmRemoveNicParamsData()
        .addNicIndexItem(1);
    List<Vm> vms = removeVmNic(client, where, data);
  }

  public static List<Vm> removeVmNic(ApiClient client, VmWhereInput where, VmRemoveNicParamsData data)
      throws ApiException {
    VmApi vmApi = new VmApi(client);
    List<WithTaskVm> withTaskVms = vmApi
        .removeVmNic(new VmRemoveNicParams().where(where).data(data));
    List<String> tasks = withTaskVms.stream().map(vms -> vms.getTaskId()).collect(Collectors.toList());
    List<String> ids = withTaskVms.stream().map(vms -> vms.getData().getId()).collect(Collectors.toList());
    TaskUtil.WaitTasks(tasks, client);
    List<Vm> vms = vmApi
        .getVms(
            new GetVmsRequestBody()
                .where(new VmWhereInput()
                    .idIn(ids)));
    return vms;
  }
}
```

#### Virtual machine migration

##### Migrate to a specified host

```java
public class App {

  public static void main(String[] args) throws ApiException {
    ApiClient client = new ApiClient();
    client.setBasePath("http://192.168.96.133/v2/api");
    client.setApiKey("token");

    VmWhereInput where = new VmWhereInput().id("cl2k0njfl04480822fxjq5nns");
    VmStartParamsData data = new VmStartParamsData().hostId("cl2k0mq69027u0822q69zct7z");
    List<Vm> vms = migrateVm(client, where, data);
  }

  public static List<Vm> migrateVm(ApiClient client, VmWhereInput where, VmStartParamsDatadata)
      throws ApiException {
    VmApi vmApi = new VmApi(client);
    List<WithTaskVm> withTaskVms = vmApi
        .migRateVm(new VmMigrateParams().where(where).data(data));
    List<String> tasks = withTaskVms.stream().map(vms -> vms.getTaskId()).collect(Collectors.toList());
    List<String> ids = withTaskVms.stream().map(vms -> vms.getData().getId()).collect(Collectors.toList());
    TaskUtil.WaitTasks(tasks, client);
    List<Vm> vms = vmApi
        .getVms(
            new GetVmsRequestBody()
                .where(new VmWhereInput()
                    .idIn(ids)));
    return vms;
  }
}
```

##### Schedule to an appropriate host automatically

```java
public class App {

  public static void main(String[] args) throws ApiException {
    ApiClient client = new ApiClient();
    client.setBasePath("http://192.168.96.133/v2/api");
    client.setApiKey("token");

    VmWhereInput where = new VmWhereInput().id("cl2k0njfl04480822fxjq5nns");
    VmStartParamsData data = null;
    List<Vm> vms = migrateVm(client, where, data);
  }

  public static List<Vm> migrateVm(ApiClient client, VmWhereInput where, VmStartParamsDatadata)
      throws ApiException {
    VmApi vmApi = new VmApi(client);
    List<WithTaskVm> withTaskVms = vmApi
        .migRateVm(new VmMigrateParams().where(where).data(data));
    List<String> tasks = withTaskVms.stream().map(vms -> vms.getTaskId()).collect(Collectors.toList());
    List<String> ids = withTaskVms.stream().map(vms -> vms.getData().getId()).collect(Collectors.toList());
    TaskUtil.WaitTasks(tasks, client);
    List<Vm> vms = vmApi
        .getVms(
            new GetVmsRequestBody()
                .where(new VmWhereInput()
                    .idIn(ids)));
    return vms;
  }
}
```

### Virtual machine power operations

#### Power on a virtual machine:

##### The specified virtual machine is powered on and scheduled to an appropriate virtual machine automatically

```java
public class App {

  public static void main(String[] args) throws ApiException {
    ApiClient client = new ApiClient();
    client.setBasePath("http://192.168.96.133/v2/api");
    client.setApiKey("token");

    VmWhereInput where = new VmWhereInput().id("cl2k0njfl04480822fxjq5nns");
    VmStartParamsData data = null;
    List<Vm> vms = startVm(client, where, data);
  }

  public static List<Vm> startVm(ApiClient client, VmWhereInput where, VmStartParamsData data)
      throws ApiException {
    VmApi vmApi = new VmApi(client);
    List<WithTaskVm> withTaskVms = vmApi
        .startVm(new VmStartParams().where(where).data(data));
    List<String> tasks = withTaskVms.stream().map(vms -> vms.getTaskId()).collect(Collectors.toList());
    List<String> ids = withTaskVms.stream().map(vms -> vms.getData().getId()).collect(Collectors.toList());
    TaskUtil.WaitTasks(tasks, client);
    List<Vm> vms = vmApi
        .getVms(
            new GetVmsRequestBody()
                .where(new VmWhereInput()
                    .idIn(ids)));
    return vms;
  }
}
```

##### The virtual machines are powered on in batch and scheduled to appropriate virtual machines automatically

```java
public class App {

  public static void main(String[] args) throws ApiException {
    ApiClient client = new ApiClient();
    client.setBasePath("http://192.168.96.133/v2/api");
    client.setApiKey("token");

    VmWhereInput where = new VmWhereInput().nameStartsWith("prefix");
    VmStartParamsData data = null;
    List<Vm> vms = startVm(client, where, data);
  }

  public static List<Vm> startVm(ApiClient client, VmWhereInput where, VmStartParamsData data)
      throws ApiException {
    VmApi vmApi = new VmApi(client);
    List<WithTaskVm> withTaskVms = vmApi
        .startVm(new VmStartParams().where(where).data(data));
    List<String> tasks = withTaskVms.stream().map(vms -> vms.getTaskId()).collect(Collectors.toList());
    List<String> ids = withTaskVms.stream().map(vms -> vms.getData().getId()).collect(Collectors.toList());
    TaskUtil.WaitTasks(tasks, client);
    List<Vm> vms = vmApi
        .getVms(
            new GetVmsRequestBody()
                .where(new VmWhereInput()
                    .idIn(ids)));
    return vms;
  }
}
```

##### The virtual machine is powered on to a specified host

```java
public class App {

  public static void main(String[] args) throws ApiException {
    ApiClient client = new ApiClient();
    client.setBasePath("http://192.168.96.133/v2/api");
    client.setApiKey("token");

    VmWhereInput where = new VmWhereInput().id("cl2k0njfl04480822fxjq5nns");
    VmStartParamsData data = new VmStartParamsData().hostId("cl2k0mq69027u0822q69zct7z");
    List<Vm> vms = startVm(client, where, data);
  }

  public static List<Vm> startVm(ApiClient client, VmWhereInput where, VmStartParamsData data)
      throws ApiException {
    VmApi vmApi = new VmApi(client);
    List<WithTaskVm> withTaskVms = vmApi
        .startVm(new VmStartParams().where(where).data(data));
    List<String> tasks = withTaskVms.stream().map(vms -> vms.getTaskId()).collect(Collectors.toList());
    List<String> ids = withTaskVms.stream().map(vms -> vms.getData().getId()).collect(Collectors.toList());
    TaskUtil.WaitTasks(tasks, client);
    List<Vm> vms = vmApi
        .getVms(
            new GetVmsRequestBody()
                .where(new VmWhereInput()
                    .idIn(ids)));
    return vms;
  }
}
```

#### Power off a virtual machine

##### Shut down the specified virtual machine

```java
public class App {

  public static void main(String[] args) throws ApiException {
    ApiClient client = new ApiClient();
    client.setBasePath("http://192.168.96.133/v2/api");
    client.setApiKey("token");

    VmWhereInput where = new VmWhereInput().id("cl2k0njfl04480822fxjq5nns");
    List<Vm> vms = shutdownVm(client, where);
  }

  public static List<Vm> shutdownVm(ApiClient client, VmWhereInput where)
      throws ApiException {
    VmApi vmApi = new VmApi(client);
    List<WithTaskVm> withTaskVms = vmApi
        .shutDownVm(new VmOperateParams().where(where));
    List<String> tasks = withTaskVms.stream().map(vms -> vms.getTaskId()).collect(Collectors.toList());
    List<String> ids = withTaskVms.stream().map(vms -> vms.getData().getId()).collect(Collectors.toList());
    TaskUtil.WaitTasks(tasks, client);
    List<Vm> vms = vmApi
        .getVms(
            new GetVmsRequestBody()
                .where(new VmWhereInput()
                    .idIn(ids)));
    return vms;
  }
}
```

##### Shut down the virtual machines in batch

```java
public class App {

  public static void main(String[] args) throws ApiException {
    ApiClient client = new ApiClient();
    client.setBasePath("http://192.168.96.133/v2/api");
    client.setApiKey("token");

    VmWhereInput where = new VmWhereInput().nameStartsWith("prefix");
    List<Vm> vms = shutdownVm(client, where);
  }

  public static List<Vm> shutdownVm(ApiClient client, VmWhereInput where)
      throws ApiException {
    VmApi vmApi = new VmApi(client);
    List<WithTaskVm> withTaskVms = vmApi
        .shutDownVm(new VmOperateParams().where(where));
    List<String> tasks = withTaskVms.stream().map(vms -> vms.getTaskId()).collect(Collectors.toList());
    List<String> ids = withTaskVms.stream().map(vms -> vms.getData().getId()).collect(Collectors.toList());
    TaskUtil.WaitTasks(tasks, client);
    List<Vm> vms = vmApi
        .getVms(
            new GetVmsRequestBody()
                .where(new VmWhereInput()
                    .idIn(ids)));
    return vms;
  }
}
```

##### Power off the specified virtual machine

```java
public class App {

  public static void main(String[] args) throws ApiException {
    ApiClient client = new ApiClient();
    client.setBasePath("http://192.168.96.133/v2/api");
    client.setApiKey("token");

    VmWhereInput where = new VmWhereInput().id("cl2k0njfl04480822fxjq5nns");
    List<Vm> vms = powerOffVm(client, where);
  }

  public static List<Vm> powerOffVm(ApiClient client, VmWhereInput where)
      throws ApiException {
    VmApi vmApi = new VmApi(client);
    List<WithTaskVm> withTaskVms = vmApi
        .poweroffVm(new VmOperateParams().where(where));
    List<String> tasks = withTaskVms.stream().map(vms -> vms.getTaskId()).collect(Collectors.toList());
    List<String> ids = withTaskVms.stream().map(vms -> vms.getData().getId()).collect(Collectors.toList());
    TaskUtil.WaitTasks(tasks, client);
    List<Vm> vms = vmApi
        .getVms(
            new GetVmsRequestBody()
                .where(new VmWhereInput()
                    .idIn(ids)));
    return vms;
  }
}
```

##### Power off virtual machines in batch

```java
public class App {

  public static void main(String[] args) throws ApiException {
    ApiClient client = new ApiClient();
    client.setBasePath("http://192.168.96.133/v2/api");
    client.setApiKey("token");

    VmWhereInput where = new VmWhereInput().nameStartsWith("prefix");
    List<Vm> vms = powerOffVm(client, where);
  }

  public static List<Vm> powerOffVm(ApiClient client, VmWhereInput where)
      throws ApiException {
    VmApi vmApi = new VmApi(client);
    List<WithTaskVm> withTaskVms = vmApi
        .poweroffVm(new VmOperateParams().where(where));
    List<String> tasks = withTaskVms.stream().map(vms -> vms.getTaskId()).collect(Collectors.toList());
    List<String> ids = withTaskVms.stream().map(vms -> vms.getData().getId()).collect(Collectors.toList());
    TaskUtil.WaitTasks(tasks, client);
    List<Vm> vms = vmApi
        .getVms(
            new GetVmsRequestBody()
                .where(new VmWhereInput()
                    .idIn(ids)));
    return vms;
  }
}
```

#### Reboot a virtual machine

##### Reboot a specified virtual machine

```java
public class App {

  public static void main(String[] args) throws ApiException {
    ApiClient client = new ApiClient();
    client.setBasePath("http://192.168.96.133/v2/api");
    client.setApiKey("token");

    VmWhereInput where = new VmWhereInput().id("cl2k0njfl04480822fxjq5nns");
    List<Vm> vms = restartVm(client, where);
  }

  public static List<Vm> restartVm(ApiClient client, VmWhereInput where)
      throws ApiException {
    VmApi vmApi = new VmApi(client);
    List<WithTaskVm> withTaskVms = vmApi
        .restartVm(new VmOperateParams().where(where));
    List<String> tasks = withTaskVms.stream().map(vms -> vms.getTaskId()).collect(Collectors.toList());
    List<String> ids = withTaskVms.stream().map(vms -> vms.getData().getId()).collect(Collectors.toList());
    TaskUtil.WaitTasks(tasks, client);
    List<Vm> vms = vmApi
        .getVms(
            new GetVmsRequestBody()
                .where(new VmWhereInput()
                    .idIn(ids)));
    return vms;
  }
}
```

##### Reboot the virtual machines in batch

```java
public class App {

  public static void main(String[] args) throws ApiException {
    ApiClient client = new ApiClient();
    client.setBasePath("http://192.168.96.133/v2/api");
    client.setApiKey("token");

    VmWhereInput where = new VmWhereInput().nameStartsWith("prefix");
    List<Vm> vms = restartVm(client, where);
  }

  public static List<Vm> restartVm(ApiClient client, VmWhereInput where)
      throws ApiException {
    VmApi vmApi = new VmApi(client);
    List<WithTaskVm> withTaskVms = vmApi
        .restartVm(new VmOperateParams().where(where));
    List<String> tasks = withTaskVms.stream().map(vms -> vms.getTaskId()).collect(Collectors.toList());
    List<String> ids = withTaskVms.stream().map(vms -> vms.getData().getId()).collect(Collectors.toList());
    TaskUtil.WaitTasks(tasks, client);
    List<Vm> vms = vmApi
        .getVms(
            new GetVmsRequestBody()
                .where(new VmWhereInput()
                    .idIn(ids)));
    return vms;
  }
}
```

##### Reboot the specified virtual machine

```java
public class App {

  public static void main(String[] args) throws ApiException {
    ApiClient client = new ApiClient();
    client.setBasePath("http://192.168.96.133/v2/api");
    client.setApiKey("token");

    VmWhereInput where = new VmWhereInput().id("cl2k0njfl04480822fxjq5nns");
    List<Vm> vms = forceRestartVm(client, where);
  }

  public static List<Vm> forceRestartVm(ApiClient client, VmWhereInput where)
      throws ApiException {
    VmApi vmApi = new VmApi(client);
    List<WithTaskVm> withTaskVms = vmApi
        .forceRestartVm(new VmOperateParams().where(where));
    List<String> tasks = withTaskVms.stream().map(vms -> vms.getTaskId()).collect(Collectors.toList());
    List<String> ids = withTaskVms.stream().map(vms -> vms.getData().getId()).collect(Collectors.toList());
    TaskUtil.WaitTasks(tasks, client);
    List<Vm> vms = vmApi
        .getVms(
            new GetVmsRequestBody()
                .where(new VmWhereInput()
                    .idIn(ids)));
    return vms;
  }
}
```

##### Force reboot the virtual machines in batch

```java
public class App {

  public static void main(String[] args) throws ApiException {
    ApiClient client = new ApiClient();
    client.setBasePath("http://192.168.96.133/v2/api");
    client.setApiKey("token");

    VmWhereInput where = new VmWhereInput().nameStartsWith("prefix");
    List<Vm> vms = forceRestartVm(client, where);
  }

  public static List<Vm> forceRestartVm(ApiClient client, VmWhereInput where)
      throws ApiException {
    VmApi vmApi = new VmApi(client);
    List<WithTaskVm> withTaskVms = vmApi
        .forceRestartVm(new VmOperateParams().where(where));
    List<String> tasks = withTaskVms.stream().map(vms -> vms.getTaskId()).collect(Collectors.toList());
    List<String> ids = withTaskVms.stream().map(vms -> vms.getData().getId()).collect(Collectors.toList());
    TaskUtil.WaitTasks(tasks, client);
    List<Vm> vms = vmApi
        .getVms(
            new GetVmsRequestBody()
                .where(new VmWhereInput()
                    .idIn(ids)));
    return vms;
  }
}
```

#### Suspend a virtual machine

##### Suspend the specified virtual machine

```java
public class App {

  public static void main(String[] args) throws ApiException {
    ApiClient client = new ApiClient();
    client.setBasePath("http://192.168.96.133/v2/api");
    client.setApiKey("token");

    VmWhereInput where = new VmWhereInput().id("cl2k0njfl04480822fxjq5nns");
    List<Vm> vms = suspendVm(client, where);
  }

  public static List<Vm> suspendVm(ApiClient client, VmWhereInput where)
      throws ApiException {
    VmApi vmApi = new VmApi(client);
    List<WithTaskVm> withTaskVms = vmApi
        .suspendVm(new VmOperateParams().where(where));
    List<String> tasks = withTaskVms.stream().map(vms -> vms.getTaskId()).collect(Collectors.toList());
    List<String> ids = withTaskVms.stream().map(vms -> vms.getData().getId()).collect(Collectors.toList());
    TaskUtil.WaitTasks(tasks, client);
    List<Vm> vms = vmApi
        .getVms(
            new GetVmsRequestBody()
                .where(new VmWhereInput()
                    .idIn(ids)));
    return vms;
  }
}
```

##### Suspend the virtual machines in batch

```java
public class App {

  public static void main(String[] args) throws ApiException {
    ApiClient client = new ApiClient();
    client.setBasePath("http://192.168.96.133/v2/api");
    client.setApiKey("token");

    VmWhereInput where = new VmWhereInput().nameStartsWith("prefix");
    List<Vm> vms = suspendVm(client, where);
  }

  public static List<Vm> suspendVm(ApiClient client, VmWhereInput where)
      throws ApiException {
    VmApi vmApi = new VmApi(client);
    List<WithTaskVm> withTaskVms = vmApi
        .suspendVm(new VmOperateParams().where(where));
    List<String> tasks = withTaskVms.stream().map(vms -> vms.getTaskId()).collect(Collectors.toList());
    List<String> ids = withTaskVms.stream().map(vms -> vms.getData().getId()).collect(Collectors.toList());
    TaskUtil.WaitTasks(tasks, client);
    List<Vm> vms = vmApi
        .getVms(
            new GetVmsRequestBody()
                .where(new VmWhereInput()
                    .idIn(ids)));
    return vms;
  }
}
```

#### Resume a virtual machine

##### Resume the specified virtual machine

```java
public class App {

  public static void main(String[] args) throws ApiException {
    ApiClient client = new ApiClient();
    client.setBasePath("http://192.168.96.133/v2/api");
    client.setApiKey("token");

    VmWhereInput where = new VmWhereInput().id("cl2k0njfl04480822fxjq5nns");
    List<Vm> vms = resumeVm(client, where);
  }

  public static List<Vm> resumeVm(ApiClient client, VmWhereInput where)
      throws ApiException {
    VmApi vmApi = new VmApi(client);
    List<WithTaskVm> withTaskVms = vmApi
        .resumeVm(new VmOperateParams().where(where));
    List<String> tasks = withTaskVms.stream().map(vms -> vms.getTaskId()).collect(Collectors.toList());
    List<String> ids = withTaskVms.stream().map(vms -> vms.getData().getId()).collect(Collectors.toList());
    TaskUtil.WaitTasks(tasks, client);
    List<Vm> vms = vmApi
        .getVms(
            new GetVmsRequestBody()
                .where(new VmWhereInput()
                    .idIn(ids)));
    return vms;
  }
}
```

##### Resume the virtual machines in batch

```java
public class App {

  public static void main(String[] args) throws ApiException {
    ApiClient client = new ApiClient();
    client.setBasePath("http://192.168.96.133/v2/api");
    client.setApiKey("token");

    VmWhereInput where = new VmWhereInput().nameStartsWith("prefix");
    List<Vm> vms = resumeVm(client, where);
  }

  public static List<Vm> resumeVm(ApiClient client, VmWhereInput where)
      throws ApiException {
    VmApi vmApi = new VmApi(client);
    List<WithTaskVm> withTaskVms = vmApi
        .resumeVm(new VmOperateParams().where(where));
    List<String> tasks = withTaskVms.stream().map(vms -> vms.getTaskId()).collect(Collectors.toList());
    List<String> ids = withTaskVms.stream().map(vms -> vms.getData().getId()).collect(Collectors.toList());
    TaskUtil.WaitTasks(tasks, client);
    List<Vm> vms = vmApi
        .getVms(
            new GetVmsRequestBody()
                .where(new VmWhereInput()
                    .idIn(ids)));
    return vms;
  }
}
```

### Delete virtual machine

#### Recycle bin

##### Move to recycle bin

```java
public class App {

  public static void main(String[] args) throws ApiException {
    ApiClient client = new ApiClient();
    client.setBasePath("http://192.168.96.133/v2/api");
    client.setApiKey("token");

    VmWhereInput where = new VmWhereInput().id("cl2k0njfl04480822fxjq5nns");
    List<Vm> vms = moveVmToRecycleBin(client, where);
    System.out.print(vms);
  }

  public static List<Vm> moveVmToRecycleBin(ApiClient client, VmWhereInput where)
      throws ApiException {
    VmApi vmApi = new VmApi(client);
    List<WithTaskDeleteVm> withTaskVms = vmApi
        .moveVmToRecycleBin(new VmOperateParams().where(where));
    List<String> tasks = withTaskVms.stream().map(vms -> vms.getTaskId()).collect(Collectors.toList());
    List<String> ids = withTaskVms.stream().map(vms -> vms.getData().getId()).collect(Collectors.toList());
    TaskUtil.WaitTasks(tasks, client);
    List<Vm> vms = vmApi
        .getVms(
            new GetVmsRequestBody()
                .where(new VmWhereInput()
                    .idIn(ids)));
    return vms;
  }
}
```

##### Recover from recycle bin

```java
public class App {

  public static void main(String[] args) throws ApiException {
    ApiClient client = new ApiClient();
    client.setBasePath("http://192.168.96.133/v2/api");
    client.setApiKey("token");

    VmWhereInput where = new VmWhereInput().id("cl2k0njfl04480822fxjq5nns");
    List<Vm> vms = moveVmToRecycleBin(client, where);
    System.out.print(vms);
  }

  public static List<Vm> moveVmToRecycleBin(ApiClient client, VmWhereInput where)
      throws ApiException {
    VmApi vmApi = new VmApi(client);
    List<WithTaskDeleteVm> withTaskVms = vmApi
        .recoverVmFromRecycleBin(new VmOperateParams().where(where));
    List<String> tasks = withTaskVms.stream().map(vms -> vms.getTaskId()).collect(Collectors.toList());
    List<String> ids = withTaskVms.stream().map(vms -> vms.getData().getId()).collect(Collectors.toList());
    TaskUtil.WaitTasks(tasks, client);
    List<Vm> vms = vmApi
        .getVms(
            new GetVmsRequestBody()
                .where(new VmWhereInput()
                    .idIn(ids)));
    return vms;
  }
}
```

#### Delete permanently

```java
public class App {

  public static void main(String[] args) throws ApiException {
    ApiClient client = new ApiClient();
    client.setBasePath("http://192.168.96.133/v2/api");
    client.setApiKey("token");

    VmWhereInput where = new VmWhereInput().id("cl2k0njfl04480822fxjq5nns");
    deleteVm(client, where);
  }

  public static void deleteVm(ApiClient client, VmWhereInput where)
      throws ApiException {
    VmApi vmApi = new VmApi(client);
    List<WithTaskDeleteVm> withTaskVms = vmApi
        .deleteVm(new VmOperateParams().where(where));
    List<String> tasks = withTaskVms.stream().map(vms -> vms.getTaskId()).collect(Collectors.toList());
    List<String> ids = withTaskVms.stream().map(vms -> vms.getData().getId()).collect(Collectors.toList());
    TaskUtil.WaitTasks(tasks, client);
  }
}
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
                .nameIn(lunSnapshotIds)));
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
