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
