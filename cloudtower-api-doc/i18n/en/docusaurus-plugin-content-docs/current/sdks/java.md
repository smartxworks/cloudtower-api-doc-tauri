---
title: Java
---
import Terminology from '@site/terminology.json'

<>The {Terminology['en-US']['PRODUCT']} SDK in Java for versions 1.8 and above</>

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

## Scenario Examples

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
