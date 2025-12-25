---
title: Java
---

import Terminology from '@site/terminology.json'
import CodeTerminology from '@site/code-terminology.json'
import CodeBlock from '@theme/CodeBlock'

<>The {Terminology['terminology']['en-US']['PRODUCT']} SDK for Java supports Java 1.8 or later.</>

- <a href={`https://github.com/${CodeTerminology["java_github_address"]}`}>Source repository</a>
- <a href={`https://github.com/${CodeTerminology["java_github_address"]}/releases`}>Download the SDK</a>

## Installing the SDK

- ### Installing using the source code

  <CodeBlock language="shell">
  {`git clone https://github.com/${CodeTerminology["java_github_address"]}.git
  mvn clean install
  `}
  </CodeBlock>

- ### Installing using the JAR package

  ```shell
  # Download the JAR and POM files from the release page.
  mvn install:install-file -D"file=<path/to/jar>" -D"pomFile=<path/to/pom>"
  ```

- ### Central repository
  > Not available.

## Using the SDK

### Creating an instance

#### Creating an `ApiClient` instance

```java
ApiClient client = new ApiClient();
client.setBasePath("http://192.168.96.133/v2/api");
```

> If you need to use HTTPS, you can skip certificate verification.

```java
ApiClient client = new ApiClient();
client.setBasePath("https://192.168.96.133/v2/api");
client.setVerifyingSsl(false);
```

#### Creating a corresponding API instance

> Create the related API instance based on the type of operation. For example, to perform operations related to virtual machines, create a `VmApi` instance:

```java
VmApi vmApi = new VmApi(client);
```

### Authenticating

```java
// Use the login method in UserApi to obtain a token.
UserApi userApi = new UserApi(client);
LoginInput loginInput = new LoginInput()
    .username("root")
    .password("!QAZ2wsx").source(UserSource.LOCAL);
WithTaskLoginResponse token = userApi.login(loginInput);
((ApiKeyAuth) client.getAuthentication("Authorization")).setApiKey(token.getData().getToken());
```

### Sending requests

#### Retrieving resources

```java
List<Vm> vms = vmApi.getVms(new GetVmsRequestBody().first(1));
```

#### Updating resources

> Updating resources will trigger a related asynchronous task. When the task is completed, it indicates that the resource operation has finished and the data has been updated.

```java
WithTaskVm withTaskVm = vmApi.startVm(
    new VmStartParams()
        .where(new VmWhereInput()
            .id(vm.getId()))).get(0);
```

> You can use the provided utility method `WaitTask` to synchronously wait for the asynchronous task to complete.
>
> - **Method parameters**
>
> | <strong>Parameter</strong> | <strong>Type</strong> | <strong>Required</strong> | <strong>Description</strong>                                                       |
> | -------------------------- | --------------------- | ------------------------- | ---------------------------------------------------------------------------------- |
> | `id`                       | string                | Yes                       | The ID of the task to query.                                       |
> | `apiClient`                | ApiClient             | Yes                       | The ApiClient instance used for querying.                          |
> | `interval`                 | int                   | No                        | The polling interval. Default: 5s. |
> | `timeout`                  | int                   | No                        | The timeout period. Default: 300s. |
>
> - **Errors**
>
> | <strong>Error code</strong> | <strong>Description</strong>                                 |
> | --------------------------- | ------------------------------------------------------------ |
> | `408`                       | Timeout                                                      |
> | `500`                       | The internal error of the asynchronous task. |

```java
WithTaskVm withTaskVm = vmApi.startVm(
    new VmStartParams()
        .where(new VmWhereInput()
            .id(vm.getId()))).get(0);
TaskUtil.WaitTask(withTaskVm.getTaskId(), client);
```

> If there are multiple tasks, you can use `WaitTasks` instead.
>
> - **Method parameters**
>
> | <strong>Parameter</strong> | <strong>Type</strong>                     | <strong>Required</strong> | <strong>Description</strong>                                                                                                                                                                     |
> | -------------------------- | ----------------------------------------- | ------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
> | `ids`                      | List\<String\> | Yes                       | The list of task IDs to query.                                                                                                                                                   |
> | `apiClient`                | ApiClient                                 | Yes                       | The ApiClient instance used for querying.                                                                                                                                        |
> | `exitOnError`              | boolean                                   | No                        | Whether to exit immediately when a singe task fails. Otherwise, wait for all tasks to complete before exiting. Default: `False`. |
> | `interval`                 | int                                       | No                        | The polling interval. Default: 5s.                                                                                                               |
> | `timeout`                  | int                                       | No                        | The timeout. Default: 300s.                                                                                                                      |
>
> - **Errors**
>
> | <strong>Error code</strong> | <strong>Description</strong>                                 |
> | --------------------------- | ------------------------------------------------------------ |
> | `408`                       | Timeout                                                      |
> | `500`                       | The internal error of the asynchronous task. |

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

##### Sending asynchronous requests

> The requests shown above are synchronous and will block the current process. To send asynchronous requests, you can use `${Api}Async` together with `ApiCallback`.

```java
vmApi.getVmsAsync(
    new GetVmsRequestBody().first(1),
    new ApiCallback<List<Alert>>() {
      @Override
      public void onFailure(ApiException e, int statusCode, Map responseHeaders) {
        // Error callback
      }
      @Override
      public void onUploadProgress(long bytesWritten, long contentLength, boolean done) {
        // Upload progress callback
      }
      @Override
      public void onDownloadProgress(long bytesRead, long contentLength, boolean done) {
        // Download progress callback
      }
      @Override
      public void onSuccess(List<Alert> vms, int statusCode, Map<String, List<String>> responseHeaders) {
        // Success callback
      }
    });
```

##### Setting the response language

> You can set the response language by setting or clearing the default request header. Available values are `["en-US", "zh-CN"]`. Specifying a language other than this range will result in an `HTTP 400` error.

```java
AlertApi alertApi = new AlertApi(client);
// The message, solution, cause, and impact fields in the returned alerts will be in English.
List<Alert> alerts = alertApi.getAlerts(new GetAlertsRequestBody().first(1));
// The message, solution, cause, and impact fields in the returned alerts will be in Chinese.
client.addDefaultHeader("content-language", "en-US");
alerts = alertApi.getAlerts(new GetAlertsRequestBody().first(1));
client.removeDefaultHeader("content-language");
// The message, solution, cause, and impact fields in the returned alerts will be in English.
alerts = alertApi.getAlerts(new GetAlertsRequestBody().first(1));
client.addDefaultHeader("content-language", "fr-CA");
// This will return an HTTP 400 error.
alerts = alertApi.getAlerts(new GetAlertsRequestBody().first(1));
```

## Operation examples

### Fetching virtual machines

#### Fetching all virtual machines

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

#### Fetching virtual machines with pagination

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

#### Fetching all powered-on virtual machines

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

#### Fetching virtual machines whose name or description contain a specific string

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

#### Fetching all virtual machines with the number of vCPUs greater than `n`

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

### Creating a virtual machine from a template

#### Specifying IP address

```java
public class App {

  public static void main(String[] args) throws ApiException {
    ApiClient client = new ApiClient();

    client.setBasePath("http://192.168.96.133/v2/api");
    ClientUtil.login("username", "password", client);
    List<Vm> vms = createVmFromTemplate(client, new VmCreateVmFromContentLibraryTemplateParams()
        .clusterId("cluster_id")
        .templateId("template_id")
        .name("vm_name")
        .isFullCopy(false));
  }

  public static List<Vm> createVmFromTemplate(ApiClient client, VmCreateVmFromContentLibraryTemplateParams param)
      throws ApiException {
    VmApi vmApi = new VmApi(client);
    List<VmCreateVmFromContentLibraryTemplateParams> params = new ArrayList<VmCreateVmFromContentLibraryTemplateParams>(
        1);
    params.add(param);
    List<WithTaskVm> withTaskVms = vmApi.createVmFromContentLibraryTemplate(params);
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

#### Configure virtual disk parameters that differ from the template

```java
public class App {

  public static void main(String[] args) throws ApiException, IOException {
    ApiClient client = new ApiClient();

    client.setBasePath("http://192.168.96.133/v2/api");
    ClientUtil.login("username", "password", client);
    VmDiskOperate diskOperate = new VmDiskOperate()
        .removeDisks(
            new VmDiskOperateRemoveDisks()
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
                        .vmVolumeId("vm_volume_id"))
                .addMountNewCreateDisksItem(
                    new MountNewCreateDisksParams()
                        .vmVolume(
                            new MountNewCreateDisksParamsVmVolume()
                                .elfStoragePolicy(VmVolumeElfStoragePolicyType._2_THIN_PROVISION)
                                .size(4L * 1024 * 1024 * 1024)
                                .name("disk_name"))
                        .boot(3)
                        .bus(Bus.VIRTIO)));

    List<Vm> vms = createVmFromTemplate(client, new VmCreateVmFromContentLibraryTemplateParams()
        .clusterId("cluster_id")
        .templateId("template_id")
        .name("vm_name")
        .isFullCopy(false)
        .diskOperate(diskOperate));
    // Process vms
    System.out.println(vms);
  }

  public static List<Vm> createVmFromTemplate(ApiClient client, VmCreateVmFromContentLibraryTemplateParams param)
      throws ApiException {
    VmApi vmApi = new VmApi(client);
    List<VmCreateVmFromContentLibraryTemplateParams> params = new ArrayList<VmCreateVmFromContentLibraryTemplateParams>(
        1);
    params.add(param);
    List<WithTaskVm> withTaskVms = vmApi.createVmFromContentLibraryTemplate(params);
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

#### Configure NIC parameters that differ from the template

```java
public class App {

  public static void main(String[] args) throws ApiException {
    ApiClient client = new ApiClient();
    client.setBasePath("http://192.168.96.133/v2/api");
    ClientUtil.login("username", "password", client);
    VmNicParams nicParams = new VmNicParams()
        .connectVlanId("nic_vlan_id") // Not vlan's vlan_id (0-4095) but vlan's id (UUID)
        .enabled(true)
        .model(VmNicModel.E1000);
    List<Vm> vms = createVmFromTemplate(client, new VmCreateVmFromContentLibraryTemplateParams()
        .clusterId("cl2k0mpoy026d0822xq6ctsim")
        .templateId("cl2k0tvpw04y608222h8so9ov")
        .name("createFromVmTemplate")
        .isFullCopy(false)
        .addVmNicsItem(nicParams));
  }

  public static List<Vm> createVmFromTemplate(ApiClient client, VmCreateVmFromContentLibraryTemplateParams param)
      throws ApiException {
    VmApi vmApi = new VmApi(client);
    List<VmCreateVmFromContentLibraryTemplateParams> params = new ArrayList<VmCreateVmFromContentLibraryTemplateParams>(
        1);
    params.add(param);
    List<WithTaskVm> withTaskVms = vmApi.createVmFromContentLibraryTemplate(params);
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

### Creating a blank virtual machine

#### Simple creation

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

#### Configuring virtual disks during creation

##### Mounting ISOs via CD-ROM

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

##### Mounting virtual volumes as virtual disks

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

##### Mounting newly created virtual disks

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

#### Configuring virtual NICs during creation

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

### Editing a virtual machine

#### Editing basic information

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

### Editing advanced attributes

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

#### Editing CD-ROMs

##### Adding a CD-ROM

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

##### Deleting a CD-ROM

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

#### Managing virtual volumes

##### Adding a new virtual volume

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

##### Mounting an existing virtual volume as a virtual disk

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

##### Unmounting a virtual disk

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

#### Managing NICs

##### Adding a NIC

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

##### Editing basic NIC information

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

##### Editing advanced NIC attributes

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

##### Removing a NIC

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

#### Migrating a virtual machine

##### Migrating a virtual machine to a specific host

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

##### Automatically placing a virtual machine on a proper host

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

### Managing virtual machine power

#### Powering on virtual machines:

##### Powering on a specific virtual machine and automatically scheduling it to a proper host

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

##### Powering on virtual machines in batches and automatically scheduling them to a proper host

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

##### Powering on a virtual machine and placing it on a specified host

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

#### Shutting down virtual machines

##### Shutting down a specific virtual machine

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

##### Shutting down virtual machines in batches

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

##### Forcibly powering off a specific virtual machine

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

##### Forcibly powering off virtual machines in batches

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

#### Restrating virtual machines

##### Restarting a specific virtual machine

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

##### Restarting virtual machines in batches

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

##### Forcibly restarting a specific virtual machine

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

##### Forcibly restarting virtual machines in batches

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

#### Suspending virtual machines

##### Suspending a specific virtual machine

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

##### Suspending virtual machines in batches

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

#### Resuming virtual machines

##### Resuming a specific virtual machine

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

##### Resuming virtual machines in batches

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

### Deleting a virtual machine

#### Recycle bin

##### Moving virtual machines to the recycle bin

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

##### Restoring virtual machines from the recycle bin

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

#### Permanently deleting virtual machines

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

## Scenario examples

### Backing up a virtual machine

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
  // 1. Obtain the virtual machine information for backup.
  //     The VM ID is required to construct the parameters for creating a snapshot,
  //     and the VMTools status determines whether a file-system-consistent snapshot can be created.
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
  // 2. Wait for the task to complete.
  TaskUtil.WaitTask(snapshot_with_task.getTaskId(), client);
  // 3. Query the created VM snapshot.
  VmSnapshot snapshot = vmSnapshotApi.getVmSnapshots(
      new GetVmSnapshotsRequestBody()
          .where(new VmSnapshotWhereInput()
              .id(snapshot_with_task.getData().getId()))).get(0);
  // 4. Query the generated iSCSI LUN snapshots.
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

### Building Dashboard

#### Defining utility methods

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

#### Building alert information

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

#### Building disk information

> Use mechanical hard drives (HDDs) as an example.

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

#### Building performance metrics

> Retrieve the number of CPU cores, total CPU frequency, CPU utilization, total memory, used memory, total storage capacity, used storage capacity, failed storage capacity, and available storage capacity of a specified cluster.

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

#### Building dashboard

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
