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
