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
