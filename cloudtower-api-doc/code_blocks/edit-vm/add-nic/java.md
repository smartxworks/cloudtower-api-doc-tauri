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
