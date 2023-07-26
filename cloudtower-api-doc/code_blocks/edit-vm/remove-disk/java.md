```java
public class App {

  public static void main(String[] args) throws ApiException {
    ApiClient client = new ApiClient();
    client.setBasePath("http://192.168.96.133/v2/api");
    client.setApiKey("token");

    VmWhereInput where = new VmWhereInput().id("cl2k0njfl04480822fxjq5nns");
    VmRemoveDiskParamsData data = new VmRemoveDiskParamsData().addDiskIdsItem("cl2k38qv70mna082283l646jl");
    List<Vm> vms = removeDisk(client, where, data);
  }

  public static List<Vm> removeDisk(ApiClient client, VmWhereInput where, VmRemoveDiskParamsData data)
      throws ApiException {
    VmApi vmApi = new VmApi(client);
    List<WithTaskVm> withTaskVms = vmApi
        .removeVmDisk(new VmRemoveDiskParams().where(where).data(data));
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
