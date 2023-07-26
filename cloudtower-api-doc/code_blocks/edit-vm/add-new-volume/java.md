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
