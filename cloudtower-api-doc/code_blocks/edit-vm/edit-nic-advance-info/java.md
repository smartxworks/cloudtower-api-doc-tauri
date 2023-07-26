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
