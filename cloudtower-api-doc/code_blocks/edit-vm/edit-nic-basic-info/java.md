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
