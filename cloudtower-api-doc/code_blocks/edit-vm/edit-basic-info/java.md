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
