import CodeBlock from '@theme/CodeBlock'
import CodeTerminology from '@site/code-terminology.json'

<CodeBlock language="java">
{`package ${CodeTerminology["java_package"]};
import ${CodeTerminology["java_import_package"]}.ApiClient;
import ${CodeTerminology["java_import_package"]}.ApiException;
import ${CodeTerminology["java_import_package"]}.ClientUtil;
import ${CodeTerminology["java_import_package"]}.TaskUtil;
import ${CodeTerminology["java_import_package"]}.api.ClusterApi;
import ${CodeTerminology["java_import_package"]}.api.ContentLibraryVmTemplateApi;
import ${CodeTerminology["java_import_package"]}.api.VmApi;
import ${CodeTerminology["java_import_package"]}.model.*;
import java.io.IOException;
import java.util.List;
import java.util.ArrayList;
import java.util.stream.Collectors;
public class App {
    public static void main(String[] args) throws ApiException, IOException {
        ApiClient client = new ApiClient();
        client.setBasePath('http://${CodeTerminology["example_host"]}/v2/api');
        ClientUtil.login("username", "root", client);
        ClusterApi clusterApi = new ClusterApi(client);
        ContentLibraryVmTemplateApi contentLibraryVmTemplateApi = new ContentLibraryVmTemplateApi(client);
        VmApi vmApi = new VmApi(client);
        GetClustersRequestBody getClustersParams = new GetClustersRequestBody()
                .where(new ClusterWhereInput()
                        .name("cluster_name"));
        List<Cluster> clusters = clusterApi.getClusters(getClustersParams);
        GetContentLibraryVmTemplatesRequestBody getTemplatesParams = new GetContentLibraryVmTemplatesRequestBody()
                .where(new ContentLibraryVmTemplateWhereInput()
                        .name("template_name"));
        List<ContentLibraryVmTemplate> templates = contentLibraryVmTemplateApi
                .getContentLibraryVmTemplates(getTemplatesParams);
        List<VmCreateVmFromContentLibraryTemplateParams> createVmParams = new ArrayList<>();
        createVmParams.add(new VmCreateVmFromContentLibraryTemplateParams()
                .templateId(templates.get(0).getId())
                .clusterId(clusters.get(0).getId())
                .name("vm_name")
                .isFullCopy(false)
                .diskOperate(new VmDiskOperate()
                        .removeDisks(new VmDiskOperateRemoveDisks()
                                .addDiskIndexItem(0))
                        .newDisks(new VmDiskParams()
                                .addMountCdRomsItem(new VmCdRomParams()
                                        .boot(2)
                                        .contentLibraryImageId(""))
                                .addMountDisksItem(new MountDisksParams()
                                        .boot(3)
                                        .bus(Bus.fromValue("VIRTIO"))
                                        .vmVolumeId("cljm6x2g1405g0958tp3zkhvh"))
                                .addMountNewCreateDisksItem(
                                        new MountNewCreateDisksParams()
                                                .boot(4)
                                                .bus(Bus.fromValue(
                                                        "VIRTIO"))
                                                .vmVolume(new MountNewCreateDisksParamsVmVolume()
                                                        .name("test")
                                                        .size(10737418240L)
                                                        .elfStoragePolicy(
                                                                VmVolumeElfStoragePolicyType
                                                                        .fromValue("REPLICA_2_THIN_PROVISION")))))));
        List<WithTaskVm> vms = vmApi.createVmFromContentLibraryTemplate(createVmParams);
        List<String> taskIds = vms.stream().map(withTaskObj -> withTaskObj.getTaskId())
                .collect(Collectors.toList());
        TaskUtil.WaitTasks(taskIds, client);
    }
}`}
</CodeBlock>

