
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
