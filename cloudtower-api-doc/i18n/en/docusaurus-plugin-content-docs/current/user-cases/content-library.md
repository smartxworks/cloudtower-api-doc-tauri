---
title: Creating a virtual machine from a template in content library
sidebar_position: 41
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

## Creating a virtual machine from a template in content library

You can create a virtual machine from a template in content library and configure its settings using the template.

- `template_name`: Select the name of the VM template to use.
- `cluster_name`: Select the name of the cluster where the virtual machine will reside.
- `vm_name`: Enter the name of the virtual machine.

The return value is the created virtual machine. <Tabs>

<TabItem value="py" label="Python">

```py
from cloudtower.api import VmApi, ContentLibraryVmTemplateApi, ClusterApi
from cloudtower.utils import login, wait_tasks
from cloudtower.configuration import Configuration
from cloudtower import ApiClient
import os


configuration = Configuration(host=os.getenv("CLOUDTOWER_ENDPOINT"))
client = ApiClient(configuration)

login(client, os.getenv("CLOUDTOWER_USERNAME"), os.getenv("CLOUDTOWER_PASSWORD"))


def create_vm_from_template(template_name, cluster_name, vm_name):
    vm_api = VmApi(client)
    cluster_api = ClusterApi(client)
    template_api = ContentLibraryVmTemplateApi(client)

    cluster = cluster_api.get_clusters({
        "where": {
            "name": cluster_name
        }
    })
    if len(cluster) == 0:
        raise Exception("cluster not found")

    template = template_api.get_content_library_vm_templates({
        "where": {
            "name": template_name
        }
    })
    if len(template) == 0:
        raise Exception("template not found")

    with_task_vms = vm_api.create_vm_from_content_library_template([
        {
            "template_id": template[0].id,
            "cluster_id": cluster[0].id,
            "name": vm_name,
            "is_full_copy": False
        }
    ])
    tasks = [with_task_vm.task_id for with_task_vm in with_task_vms]
    vm_ids = [
        with_task_vm.data.id for with_task_vm in with_task_vms]
    wait_tasks(tasks, client)
    return vm_api.get_vms({
        "where": {
            "id_in": vm_ids
        }
    })[0]
```

</TabItem>

<TabItem value="java" label="Java">

```java
package com.smartx.com;
​
import com.smartx.tower.ApiClient;
import com.smartx.tower.ApiException;
import com.smartx.tower.ClientUtil;
import com.smartx.tower.TaskUtil;
import com.smartx.tower.api.ClusterApi;
import com.smartx.tower.api.ContentLibraryVmTemplateApi;
import com.smartx.tower.api.VmApi;
import com.smartx.tower.model.*;
import java.io.IOException;
import java.util.List;
import java.util.ArrayList;
import java.util.stream.Collectors;
​
public class App {
        public static void main(String[] args) throws ApiException, IOException {
                ApiClient client = new ApiClient();
                client.setBasePath("http://tower.smartx.com/v2/api");
                ClientUtil.login("username", "root", client);
​
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
                                .isFullCopy(false));
                List<WithTaskVm> vms = vmApi.createVmFromContentLibraryTemplate(createVmParams);
                List<String> taskIds = vms.stream().map(withTaskObj -> withTaskObj.getTaskId())
                                .collect(Collectors.toList());
                TaskUtil.WaitTasks(taskIds, client);
        }
}
```

</TabItem>

<TabItem value="go" label="Go">

```go
package main
​
import (
	"context"
	"fmt"
	"time"
​
	"github.com/openlyinc/pointy"
	apiclient "github.com/smartxworks/cloudtower-go-sdk/v2/client"
	"github.com/smartxworks/cloudtower-go-sdk/v2/client/cluster"
	"github.com/smartxworks/cloudtower-go-sdk/v2/client/content_library_vm_template"
	"github.com/smartxworks/cloudtower-go-sdk/v2/client/vm"
	"github.com/smartxworks/cloudtower-go-sdk/v2/models"
	"github.com/smartxworks/cloudtower-go-sdk/v2/utils"
	"github.com/thoas/go-funk"
)
​
func main() {
	client, err := apiclient.NewWithUserConfig(apiclient.ClientConfig{
		Host:     "tower.smartx.com",
		BasePath: "v2/api",
		Schemes:  []string{"http"},
	}, apiclient.UserConfig{
		Name:     "Name",
		Password: "Password",
		Source:   models.UserSourceLOCAL,
	})
	if err != nil {
		fmt.Println(err)
		return
	}
	cluster_api := client.Cluster
	content_library_vm_template_api := client.ContentLibraryVMTemplate
	vm_api := client.VM
	get_clusters_params := cluster.NewGetClustersParams()
	get_clusters_params.RequestBody = &models.GetClustersRequestBody{
		Where: &models.ClusterWhereInput{
			Name: pointy.String("cluster_name"),
		},
	}
	rawClusters, err := cluster_api.GetClusters(get_clusters_params)
	if err != nil {
		fmt.Println(err)
		return
	}
	clusters := rawClusters.Payload
	get_templates_params := content_library_vm_template.NewGetContentLibraryVMTemplatesParams()
	get_templates_params.RequestBody = &models.GetContentLibraryVMTemplatesRequestBody{
		Where: &models.ContentLibraryVMTemplateWhereInput{
			Name: pointy.String("template_name"),
		},
	}
	rawTemplates, err := content_library_vm_template_api.GetContentLibraryVMTemplates(get_templates_params)
	if err != nil {
		fmt.Println(err)
		return
	}
	templates := rawTemplates.Payload
	create_vm_params := vm.NewCreateVMFromContentLibraryTemplateParams()
	create_vm_params.RequestBody = []*models.VMCreateVMFromContentLibraryTemplateParams{
		{
			TemplateID: templates[0].ID,
			ClusterID:  clusters[0].ID,
			Name:       pointy.String("vm_name"),
			IsFullCopy: pointy.Bool(false),
		},
	}
	rawVms, err := vm_api.CreateVMFromContentLibraryTemplate(create_vm_params)
	if err != nil {
		fmt.Println(err)
		return
	}
	vms := rawVms.Payload
	err = utils.WaitTasks(context.Background(), client, funk.Map(vms, func(withTaskObj *models.WithTaskVM) string {
		return *withTaskObj.TaskID
	}).([]string), 1*time.Second)
	if err != nil {
		fmt.Println(err)
		return
	}
}
```

</TabItem>

</Tabs>

## Creating a virtual machine from a template in content library and editing its disks

You can create a virtual machine from a template in content library and configure its disks.

- `template_name`: The name of the VM template in content library.
- `cluster_name`: The name of the cluster.
- `vm_name`: The name of the virtual machine.
- `disk_operate`: The disk operations.

For details, see the method for `create_vm_from_template_modify_disk_example`.

The return value is the created virtual machine.

When creating a virtual machine from a template in content library, you can modify the source disks by configuring the `disk_operate` parameter. The `disk_operate` parameter is of the `VmDiskOperate` type, which is a dictionary containing the following fields:

- `remove_disks`: Delete disks by specifying their index.
- `modify_disks`: Modify existing disk configurations. Currently, only changing the bus type is supported. For other modifications, delete the original disk first.
- `new_disks`: Add new disks. The parameter type is `VmDiskParams`, which is a dictionary containing the following fields:
  - `mount_cd_roms`: Mount CD-ROMs.
  - `mount_disks`: Mount existing disks.
  - `mount_new_create_disks`: Mount newly created disks.

<Tabs>
<TabItem value="py" label="Python">

```py
from cloudtower.api import VmApi, ContentLibraryVmTemplateApi, ClusterApi
from cloudtower.utils import login, wait_tasks
from cloudtower.configuration import Configuration
from cloudtower.models import Bus, VmVolumeElfStoragePolicyType
from cloudtower import ApiClient
import os


configuration = Configuration(host=os.getenv("CLOUDTOWER_ENDPOINT"))
client = ApiClient(configuration)

login(client, os.getenv("CLOUDTOWER_USERNAME"), os.getenv("CLOUDTOWER_PASSWORD"))


def create_vm_from_template_modify_disk(template_name, cluster_name, vm_name, disk_operate):

    vm_api = VmApi(client)
    cluster_api = ClusterApi(client)
    template_api = ContentLibraryVmTemplateApi(client)

    cluster = cluster_api.get_clusters({
        "where": {
            "name": cluster_name
        }
    })
    if len(cluster) == 0:
        raise Exception("cluster not found")

    template = template_api.get_content_library_vm_templates({
        "where": {
            "name": template_name
        }
    })
    if len(template) == 0:
        raise Exception("template not found")

    with_task_vms = vm_api.create_vm_from_content_library_template([
        {
            "template_id": template[0].id,
            "cluster_id": cluster[0].id,
            "name": vm_name,
            "is_full_copy": False,
            "disk_operate": disk_operate
        }
    ])
    tasks = [with_task_vm.task_id for with_task_vm in with_task_vms]
    vm_ids = [
        with_task_vm.data.id for with_task_vm in with_task_vms]
    wait_tasks(tasks, client)
    return vm_api.get_vms({
        "where": {
            "id_in": vm_ids
        }
    })[0]


def create_vm_from_template_modify_disk_example():
    disk_operate = {
        "remove_disks": {
            "disk_index": [0]  # Deletes the disk specified by index. The index starts from 0, so this deletes the first disk.
        },
        "new_disks": {
            "mount_cd_roms": [
                {
                    "boot": 2,  # Boot order
                    "content_library_image_id": ""  # Specifies the ID of the content library image to mount
                }
            ],
            "mount_disks": [
                {
                    "boot": 3,  # Boot order
                    "bus": Bus.VIRTIO,  # Bus type
                    "vm_volume_id": "cljm6x2g1405g0958tp3zkhvh"  # ID of the virtual volume to be mounted
                }
            ],
            "mount_new_create_disks": [
                {
                    "boot": 4,
                    "bus": Bus.VIRTIO,
                    "vm_volume": {
                        "name": "test",  # Name of the new virtual volume
                        "size": 10 * 1024 * 1024 * 1024,  # Size of the new virtual volume in bytes
                        "elf_storage_policy": VmVolumeElfStoragePolicyType._2_THIN_PROVISION  # Storage policy
                    }
                }
            ]
        }
    }
    create_vm_from_template_modify_disk("template-name", "cluster-name", "vm-name", disk_operate)
```

</TabItem>
<TabItem value="java" label="Java">

```java
package com.smartx.com;
​
import com.smartx.tower.ApiClient;
import com.smartx.tower.ApiException;
import com.smartx.tower.ClientUtil;
import com.smartx.tower.TaskUtil;
import com.smartx.tower.api.ClusterApi;
import com.smartx.tower.api.ContentLibraryVmTemplateApi;
import com.smartx.tower.api.VmApi;
import com.smartx.tower.model.*;
import java.io.IOException;
import java.util.List;
import java.util.ArrayList;
import java.util.stream.Collectors;
​
public class App {
    public static void main(String[] args) throws ApiException, IOException {
        ApiClient client = new ApiClient();
        client.setBasePath("http://tower.smartx.com/v2/api");
        ClientUtil.login("username", "root", client);
​
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
}
```

</TabItem>

<TabItem value="go" label="Go">

```go
package main
​
import (
	"context"
	"fmt"
	"time"
​
	"github.com/openlyinc/pointy"
	apiclient "github.com/smartxworks/cloudtower-go-sdk/v2/client"
	"github.com/smartxworks/cloudtower-go-sdk/v2/client/cluster"
	"github.com/smartxworks/cloudtower-go-sdk/v2/client/content_library_vm_template"
	"github.com/smartxworks/cloudtower-go-sdk/v2/client/vm"
	"github.com/smartxworks/cloudtower-go-sdk/v2/models"
	"github.com/smartxworks/cloudtower-go-sdk/v2/utils"
	"github.com/thoas/go-funk"
)
​
func main() {
	client, err := apiclient.NewWithUserConfig(apiclient.ClientConfig{
		Host:     "tower.smartx.com",
		BasePath: "v2/api",
		Schemes:  []string{"http"},
	}, apiclient.UserConfig{
		Name:     "Name",
		Password: "Password",
		Source:   models.UserSourceLOCAL,
	})
	if err != nil {
		fmt.Println(err)
		return
	}
	cluster_api := client.Cluster
	content_library_vm_template_api := client.ContentLibraryVMTemplate
	vm_api := client.VM
	get_clusters_params := cluster.NewGetClustersParams()
	get_clusters_params.RequestBody = &models.GetClustersRequestBody{
		Where: &models.ClusterWhereInput{
			Name: pointy.String("cluster_name"),
		},
	}
	rawClusters, err := cluster_api.GetClusters(get_clusters_params)
	if err != nil {
		fmt.Println(err)
		return
	}
	clusters := rawClusters.Payload
	get_templates_params := content_library_vm_template.NewGetContentLibraryVMTemplatesParams()
	get_templates_params.RequestBody = &models.GetContentLibraryVMTemplatesRequestBody{
		Where: &models.ContentLibraryVMTemplateWhereInput{
			Name: pointy.String("template_name"),
		},
	}
	rawTemplates, err := content_library_vm_template_api.GetContentLibraryVMTemplates(get_templates_params)
	if err != nil {
		fmt.Println(err)
		return
	}
	templates := rawTemplates.Payload
	create_vm_params := vm.NewCreateVMFromContentLibraryTemplateParams()
	create_vm_params.RequestBody = []*models.VMCreateVMFromContentLibraryTemplateParams{
		{
			TemplateID: templates[0].ID,
			ClusterID:  clusters[0].ID,
			Name:       pointy.String("vm_name"),
			IsFullCopy: pointy.Bool(false),
			DiskOperate: &models.VMDiskOperate{
				RemoveDisks: &models.VMDiskOperateRemoveDisks{
					DiskIndex: []int32{0},
				},
				NewDisks: &models.VMDiskParams{
					MountCdRoms: []*models.VMCdRomParams{
						{
							Boot:                  pointy.Int32(2),
							ContentLibraryImageID: pointy.String(""),
						},
					},
					MountDisks: []*models.MountDisksParams{
						{
							Boot:       pointy.Int32(3),
							Bus:        models.BusVIRTIO.Pointer(),
							VMVolumeID: pointy.String("cljm6x2g1405g0958tp3zkhvh"),
						},
					},
					MountNewCreateDisks: []*models.MountNewCreateDisksParams{
						{
							Boot: pointy.Int32(4),
							Bus:  models.BusVIRTIO.Pointer(),
							VMVolume: &models.MountNewCreateDisksParamsVMVolume{
								Name:             pointy.String("test"),
								Size:             pointy.Int64(10737418240),
								ElfStoragePolicy: models.VMVolumeElfStoragePolicyTypeREPLICA2THINPROVISION.Pointer(),
							},
						},
					},
				},
			},
		},
	}
	rawVms, err := vm_api.CreateVMFromContentLibraryTemplate(create_vm_params)
	if err != nil {
		fmt.Println(err)
		return
	}
	vms := rawVms.Payload
	err = utils.WaitTasks(context.Background(), client, funk.Map(vms, func(withTaskObj *models.WithTaskVM) string {
		return *withTaskObj.TaskID
	}).([]string), 1*time.Second)
	if err != nil {
		fmt.Println(err)
		return
	}
}
```

</TabItem>
</Tabs>

## Creating and editing virtual NICs via a VM template in content library

You can create a virtual machine from a template in content library and configure its NICs.

- `template_name`: The name of the template in content library.
- `cluster_name`: The name of the cluster.
- `vm_name`: The name of the virtual machine.
- `nic_params`: The NIC parameters.

For details, see the method for `create_vm_from_template_modified_nic_example`.

The return value is the created virtual machine.

When creating a virtual machine from a template in content library, if you do not provide the `vm_nics` parameter, the virtual machine will use the NIC configuration from the template by default. To modify the NIC configuration, you can pass the `vm_nics` parameter, which is a list with each element being a dictionary:

- `connect_vlan_id`: The ID of the VM network to which the NIC corresponds. It is not the `vlan_id` of the VM network.
- `enabled`: Specifies whether to enable the NIC.
- `model`: The NIC type. You can use the attributes of the `VmNicModel` class, such as `VmNicModel.VIRTIO`. When creating a virtual machine, you cannot modify the NIC's IP address, MAC address, gateway, or subnet mask. To configure IP, subnet, and gateway settings, use cloud-init. The template must support cloud-init.

<Tabs>
<TabItem value="py" label="Python">

```py
from cloudtower.api import VmApi, ContentLibraryVmTemplateApi, ClusterApi
from cloudtower.utils import login, wait_tasks
from cloudtower.configuration import Configuration
from cloudtower.models import Bus, VmNicModel
from cloudtower import ApiClient
import os


configuration = Configuration(host=os.getenv("CLOUDTOWER_ENDPOINT"))
client = ApiClient(configuration)

login(client, os.getenv("CLOUDTOWER_USERNAME"), os.getenv("CLOUDTOWER_PASSWORD"))


def create_vm_from_template_modified_nic(template_name, cluster_name, vm_name, nic_params):
    vm_api = VmApi(client)
    cluster_api = ClusterApi(client)
    template_api = ContentLibraryVmTemplateApi(client)

    cluster = cluster_api.get_clusters({
        "where": {
            "name": cluster_name
        }
    })
    if len(cluster) == 0:
        raise Exception("cluster not found")

    template = template_api.get_content_library_vm_templates({
        "where": {
            "name": template_name
        }
    })
    if len(template) == 0:
        raise Exception("template not found")

    with_task_vms = vm_api.create_vm_from_content_library_template([
        {
            "template_id": template[0].id,
            "cluster_id": cluster[0].id,
            "name": vm_name,
            "is_full_copy": False,
            "vm_nics": nic_params
        }
    ])
    tasks = [with_task_vm.task_id for with_task_vm in with_task_vms]
    vm_ids = [
        with_task_vm.data.id for with_task_vm in with_task_vms]
    wait_tasks(tasks, client)
    return vm_api.get_vms({
        "where": {
            "id_in": vm_ids
        }
    })[0]


def create_vm_from_template_modified_nic_example():
    nic_params = [
        {
            "connect_vlan_id": "vlan_id",
            "enabled": True,
            "model": VmNicModel.VIRTIO
        }
    ]
    create_vm_from_template_modified_nic("template_name", "cluster_name", "vm_name", nic_params)
```

</TabItem>
<TabItem label="Java" value="java">

```java
package com.smartx.com;
​
import com.smartx.tower.ApiClient;
import com.smartx.tower.ApiException;
import com.smartx.tower.ClientUtil;
import com.smartx.tower.TaskUtil;
import com.smartx.tower.api.ClusterApi;
import com.smartx.tower.api.ContentLibraryVmTemplateApi;
import com.smartx.tower.api.VmApi;
import com.smartx.tower.model.*;
import java.io.IOException;
import java.util.List;
import java.util.ArrayList;
import java.util.stream.Collectors;
​
public class App {
    public static void main(String[] args) throws ApiException, IOException {
        ApiClient client = new ApiClient();
        client.setBasePath("http://tower.smartx.com/v2/api");
        ClientUtil.login("username", "root", client);
​
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
                .addVmNicsItem(new VmNicParams()
                        .connectVlanId("vlan_id")
                        .enabled(true)
                        .model(VmNicModel.fromValue("VIRTIO"))));
        List<WithTaskVm> vms = vmApi.createVmFromContentLibraryTemplate(createVmParams);
        List<String> taskIds = vms.stream().map(withTaskObj -> withTaskObj.getTaskId()).collect(Collectors.toList());
        TaskUtil.WaitTasks(taskIds, client);
    }
}
```

</TabItem>

<TabItem value="go" label="Go">

```go
package main
​
import (
	"context"
	"fmt"
	"time"
​
	"github.com/openlyinc/pointy"
	apiclient "github.com/smartxworks/cloudtower-go-sdk/v2/client"
	"github.com/smartxworks/cloudtower-go-sdk/v2/client/cluster"
	"github.com/smartxworks/cloudtower-go-sdk/v2/client/content_library_vm_template"
	"github.com/smartxworks/cloudtower-go-sdk/v2/client/vm"
	"github.com/smartxworks/cloudtower-go-sdk/v2/models"
	"github.com/smartxworks/cloudtower-go-sdk/v2/utils"
	"github.com/thoas/go-funk"
)
​
func main() {
	client, err := apiclient.NewWithUserConfig(apiclient.ClientConfig{
		Host:     "tower.smartx.com",
		BasePath: "v2/api",
		Schemes:  []string{"http"},
	}, apiclient.UserConfig{
		Name:     "Name",
		Password: "Password",
		Source:   models.UserSourceLOCAL,
	})
	if err != nil {
		fmt.Println(err)
		return
	}
	cluster_api := client.Cluster
	content_library_vm_template_api := client.ContentLibraryVMTemplate
	vm_api := client.VM
	get_clusters_params := cluster.NewGetClustersParams()
	get_clusters_params.RequestBody = &models.GetClustersRequestBody{
		Where: &models.ClusterWhereInput{
			Name: pointy.String("cluster_name"),
		},
	}
	rawClusters, err := cluster_api.GetClusters(get_clusters_params)
	if err != nil {
		fmt.Println(err)
		return
	}
	clusters := rawClusters.Payload
	get_templates_params := content_library_vm_template.NewGetContentLibraryVMTemplatesParams()
	get_templates_params.RequestBody = &models.GetContentLibraryVMTemplatesRequestBody{
		Where: &models.ContentLibraryVMTemplateWhereInput{
			Name: pointy.String("template_name"),
		},
	}
	rawTemplates, err := content_library_vm_template_api.GetContentLibraryVMTemplates(get_templates_params)
	if err != nil {
		fmt.Println(err)
		return
	}
	templates := rawTemplates.Payload
	create_vm_params := vm.NewCreateVMFromContentLibraryTemplateParams()
	create_vm_params.RequestBody = []*models.VMCreateVMFromContentLibraryTemplateParams{
		{
			TemplateID: templates[0].ID,
			ClusterID:  clusters[0].ID,
			Name:       pointy.String("vm_name"),
			IsFullCopy: pointy.Bool(false),
			VMNics: []*models.VMNicParams{
				{
					ConnectVlanID: pointy.String("vlan_id"),
					Enabled:       pointy.Bool(true),
					Model:         models.VMNicModelVIRTIO.Pointer(),
				},
			},
		},
	}
	rawVms, err := vm_api.CreateVMFromContentLibraryTemplate(create_vm_params)
	if err != nil {
		fmt.Println(err)
		return
	}
	vms := rawVms.Payload
	err = utils.WaitTasks(context.Background(), client, funk.Map(vms, func(withTaskObj *models.WithTaskVM) string {
		return *withTaskObj.TaskID
	}).([]string), 1*time.Second)
	if err != nil {
		fmt.Println(err)
		return
	}
}
```

</TabItem>

</Tabs>

## Creating and editing cloud-init using a template in content library

You can create a virtual machine from a template in content library and configure its cloud-init settings. The template must have cloud-init enabled.

- `template_name`: The name of the template in content library.
- `cluster_name`: The name of the cluster.
- `vm_name`: Enter the name of the virtual machine.
- `cloud_init`: The cloud-init configuration. For details, see the method for `create_vm_from_template_with_cloudinit_example`.

The return value is the created virtual machine.

You can use cloud-init to initialize a virtual machine, such as configuring the network and the default user password. To work properly, the template must have the cloud-init or cloudbase-init service installed during its creation.

The `cloud_init` parameter is of the `TemplateCloudInit` type and is a dictionary containing the following fields:

- `default_user_password`: Configure the default user password.
- `nameservers`: DNS server addresses. This is a list of strings, supporting up to three entries.
- `networks`: The network configuration, which is a list of dictionaries containing:
  - `ip_address`: The IP address, required after configuring a static address.
  - `netmask`: The subnet mask, required after configuring a static address.
  - `nic_index`: The NIC index, starting from 0.
  - `routes`: The static route configuration. A list of dictionaries containing:
    - `gateway`: The gateway address.
    - `network`: The target network.
    - `netmask`: The target subnet.
- `hostname`: The host name.
- `public_keys`: Public keys for login.
- `user_data`: The user data configuration.

<Tabs>
<TabItem value="py" label="Python">

```py
from cloudtower.api import VmApi, ContentLibraryVmTemplateApi, ClusterApi
from cloudtower.utils import login, wait_tasks
from cloudtower.configuration import Configuration
from cloudtower import ApiClient
import os


configuration = Configuration(host=os.getenv("CLOUDTOWER_ENDPOINT"))
client = ApiClient(configuration)

login(client, os.getenv("CLOUDTOWER_USERNAME"), os.getenv("CLOUDTOWER_PASSWORD"))


def create_vm_from_template_with_cloudinit(template_name, cluster_name, vm_name, cloud_init):
    vm_api = VmApi(client)
    cluster_api = ClusterApi(client)
    template_api = ContentLibraryVmTemplateApi(client)

    cluster = cluster_api.get_clusters({
        "where": {
            "name": cluster_name
        }
    })
    if len(cluster) == 0:
        raise Exception("cluster not found")

    template = template_api.get_content_library_vm_templates({
        "where": {
            "name": template_name
        }
    })
    if len(template) == 0:
        raise Exception("template not found")

    with_task_vms = vm_api.create_vm_from_content_library_template([
        {
            "template_id": template[0].id,
            "cluster_id": cluster[0].id,
            "name": vm_name,
            "is_full_copy": False,
            "cloud_init": cloud_init
        }
    ])
    tasks = [with_task_vm.task_id for with_task_vm in with_task_vms]
    vm_ids = [
        with_task_vm.data.id for with_task_vm in with_task_vms]
    wait_tasks(tasks, client)
    return vm_api.get_vms({
        "where": {
            "id_in": vm_ids
        }
    })[0]


def create_vm_from_template_with_cloudinit_example():
    cloud_init = {
        "default_user_password": "password",
        "nameservers": [
            "114.114.114.114"
        ],
        "networks": [
            {
                "ip_address": "192.168.20.1",
                "netmask": "255.255.240.0",
                "nic_index": 0,
                "routes": [
                    {
                        "gateway": "192.168.16.1", # Default gateway configuration
                        "network": "0.0.0.0",
                        "netmask": "0.0.0.0",
                    },
                ]
            }
        ],
        "hostname": "test",
        "public_keys": [
            "key_content"
        ],
        "user_data": "user_data"
    }
    create_vm_from_template_with_cloudinit("template_name", "cluster_name", "vm_name", cloud_init)
```

</TabItem>
<TabItem value="java" label="Java">

```java
package com.smartx.com;
​
import com.smartx.tower.ApiClient;
import com.smartx.tower.ApiException;
import com.smartx.tower.ClientUtil;
import com.smartx.tower.TaskUtil;
import com.smartx.tower.api.ClusterApi;
import com.smartx.tower.api.ContentLibraryVmTemplateApi;
import com.smartx.tower.api.VmApi;
import com.smartx.tower.model.*;
import java.io.IOException;
import java.util.List;
import java.util.ArrayList;
import java.util.stream.Collectors;
​
public class App {
    public static void main(String[] args) throws ApiException, IOException {
        ApiClient client = new ApiClient();
        client.setBasePath("http://tower.smartx.com/v2/api");
        ClientUtil.login("username", "root", client);
​
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
                .cloudInit(new TemplateCloudInit()
                        .defaultUserPassword("password")
                        .addNameserversItem("114.114.114.114")
                        .addNetworksItem(new CloudInitNetWork()
                                .ipAddress("192.168.20.1")
                                .netmask("255.255.240.0")
                                .nicIndex(0)
                                .addRoutesItem(new CloudInitNetWorkRoute()
                                        .gateway("192.168.16.1")
                                        .network("0.0.0.0")
                                        .netmask("0.0.0.0")))
                        .hostname("test")
                        .addPublicKeysItem("key_content")
                        .userData("user_data")));
        List<WithTaskVm> vms = vmApi.createVmFromContentLibraryTemplate(createVmParams);
        List<String> taskIds = vms.stream().map(withTaskObj -> withTaskObj.getTaskId()).collect(Collectors.toList());
        TaskUtil.WaitTasks(taskIds, client);
    }
}
```

</TabItem>
<TabItem value="go" label="Go">

```go
package main
​
import (
	"context"
	"fmt"
	"time"
​
	"github.com/openlyinc/pointy"
	apiclient "github.com/smartxworks/cloudtower-go-sdk/v2/client"
	"github.com/smartxworks/cloudtower-go-sdk/v2/client/cluster"
	"github.com/smartxworks/cloudtower-go-sdk/v2/client/content_library_vm_template"
	"github.com/smartxworks/cloudtower-go-sdk/v2/client/vm"
	"github.com/smartxworks/cloudtower-go-sdk/v2/models"
	"github.com/smartxworks/cloudtower-go-sdk/v2/utils"
	"github.com/thoas/go-funk"
)
​
func main() {
	client, err := apiclient.NewWithUserConfig(apiclient.ClientConfig{
		Host:     "tower.smartx.com",
		BasePath: "v2/api",
		Schemes:  []string{"http"},
	}, apiclient.UserConfig{
		Name:     "Name",
		Password: "Password",
		Source:   models.UserSourceLOCAL,
	})
	if err != nil {
		fmt.Println(err)
		return
	}
	cluster_api := client.Cluster
	content_library_vm_template_api := client.ContentLibraryVMTemplate
	vm_api := client.VM
	get_clusters_params := cluster.NewGetClustersParams()
	get_clusters_params.RequestBody = &models.GetClustersRequestBody{
		Where: &models.ClusterWhereInput{
			Name: pointy.String("cluster_name"),
		},
	}
	rawClusters, err := cluster_api.GetClusters(get_clusters_params)
	if err != nil {
		fmt.Println(err)
		return
	}
	clusters := rawClusters.Payload
	get_templates_params := content_library_vm_template.NewGetContentLibraryVMTemplatesParams()
	get_templates_params.RequestBody = &models.GetContentLibraryVMTemplatesRequestBody{
		Where: &models.ContentLibraryVMTemplateWhereInput{
			Name: pointy.String("template_name"),
		},
	}
	rawTemplates, err := content_library_vm_template_api.GetContentLibraryVMTemplates(get_templates_params)
	if err != nil {
		fmt.Println(err)
		return
	}
	templates := rawTemplates.Payload
	create_vm_params := vm.NewCreateVMFromContentLibraryTemplateParams()
	create_vm_params.RequestBody = []*models.VMCreateVMFromContentLibraryTemplateParams{
		{
			TemplateID: templates[0].ID,
			ClusterID:  clusters[0].ID,
			Name:       pointy.String("vm_name"),
			IsFullCopy: pointy.Bool(false),
			CloudInit: &models.TemplateCloudInit{
				DefaultUserPassword: pointy.String("password"),
				Nameservers:         []string{"114.114.114.114"},
				Networks: []*models.CloudInitNetWork{
					{
						IPAddress: pointy.String("192.168.20.1"),
						Netmask:   pointy.String("255.255.240.0"),
						NicIndex:  pointy.Int32(0),
						Routes: []*models.CloudInitNetWorkRoute{
							{
								Gateway: pointy.String("192.168.16.1"),
								Network: pointy.String("0.0.0.0"),
								Netmask: pointy.String("0.0.0.0"),
							},
						},
					},
				},
				Hostname:   pointy.String("test"),
				PublicKeys: []string{"key_content"},
				UserData:   pointy.String("user_data"),
			},
		},
	}
	rawVms, err := vm_api.CreateVMFromContentLibraryTemplate(create_vm_params)
	if err != nil {
		fmt.Println(err)
		return
	}
	vms := rawVms.Payload
	err = utils.WaitTasks(context.Background(), client, funk.Map(vms, func(withTaskObj *models.WithTaskVM) string {
		return *withTaskObj.TaskID
	}).([]string), 1*time.Second)
	if err != nil {
		fmt.Println(err)
		return
	}
}
```

</TabItem>
</Tabs>