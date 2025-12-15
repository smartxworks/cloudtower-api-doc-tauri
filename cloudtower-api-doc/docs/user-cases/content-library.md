---
title: 内容库模板创建虚拟机
sidebar_position: 41
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

## 内容库模板创建虚拟机

通过内容库模板创建一台虚拟机，内容通过内容库模板设置。

* template_name: 指定所需使用的内容库模板名称
* cluster_name: 指定虚拟机被部署的集群的集群名称
* vm_name: 虚拟机名称。

返回值为被创建的虚拟机
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

## 内容库模板创建虚拟机并编辑虚拟机盘

通过内容库模板创建一台虚拟机，配置虚拟机的磁盘。

* template_name 为模板名称
* cluster_name 为集群名称
* vm_name 为虚拟机名称
* disk_operate 为磁盘操作

使用详见 create_vm_from_template_modify_disk_example 方法。

返回值为被创建的虚拟机

通过内容库模板创建虚拟机时，如果希望对原有的磁盘进行任何修改，可以通过 disk_operate 参数进行配置
disk_operate 参数的类型是 VmDiskOperate，它是一个字典，包含以下字段：
- remove_disks 用于删除指定index的磁盘
- modify_disks 修改现有磁盘的配置，目前仅支持修改总线，如果有其他修改可以通过，删除原有盘
- new_disks 新增磁盘，类型是 VmDiskParams，它是一个字典，包含以下字段：
    - mount_cd_roms 挂载 cd-rom
    - mount_disks 挂载已有磁盘
    - mount_new_create_disks 挂载新磁盘

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
            "disk_index": [0]  # 用于删除指定 index 的磁盘，index 从 0 开始计算，这里既是删除第一块磁盘
        },
        "new_disks": {
            "mount_cd_roms": [
                {
                    "boot": 2,  # 启动顺序
                    "content_library_image_id": ""  # 指定挂载内容库镜像的 id
                }
            ],
            "mount_disks": [
                {
                    "boot": 3,  # 启动顺序
                    "bus": Bus.VIRTIO,  # 总线类型
                    "vm_volume_id": "cljm6x2g1405g0958tp3zkhvh"  # 被挂载虚拟卷的 id
                }
            ],
            "mount_new_create_disks": [
                {
                    "boot": 4,
                    "bus": Bus.VIRTIO,
                    "vm_volume": {
                        "name": "test",  # 新建虚拟卷的名称
                        "size": 10 * 1024 * 1024 * 1024,  # 新建虚拟卷的大小，单位是字节
                        "elf_storage_policy": VmVolumeElfStoragePolicyType._2_THIN_PROVISION  # 存储策略
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

## 通过内容库模板创建并编辑虚拟网卡

通过内容库模板创建一台虚拟机，配置虚拟机的网卡

* template_name 为模板名称
* cluster_name 为集群名称
* vm_name 为虚拟机名称
* nic_params 为磁盘操作

使用详见 create_vm_from_template_modified_nic_example 方法。

返回值为被创建的虚拟机。

通过内容库模板创建虚拟机时，如果不传递 vm_nics 参数，会默认使用模板的网卡配置，如果需要修改网卡配置，可以传递 vm_nics 参数，
vm_nics 参数是一个列表，列表中的每个元素都是一个字典：
- connect_vlan_id 网卡对应虚拟机网络的 id，并非虚拟机网络的 vlan_id
- enabled 是否启用网卡
- model 网卡类型，可以使用 VmNicModel 类的属性，如 VmNicModel.VIRTIO
创建虚拟机时并不支持修改网卡的 ip，mac，gateway，subnet mask，如果需要配置ip，子网，网关，可以通过 cloudinit 来实现，需要模板支持 cloudinit

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


## 通过内容库模板创建并编辑 cloud-init

通过内容库模板创建一台虚拟机，配置虚拟机的 cloud-init，需要模板启用
* template_name: 模板名称
*  cluster_name: 集群名称
* vm_name: 虚拟机名称
* cloud_init: cloud-init 配置，使用详见 create_vm_from_template_with_cloudinit_example 方法

返回值为被创建的虚拟机。

cloudinit 可以用于配置虚拟机的初始化，例如配置网络、配置默认账户密码等，需要模板创建时已经安装 cloud-init 或者 cloudbase-init 服务才能正常工作

cloud_init 配置项是 TemplateCloudInit 类型，是一个字典，包含以下字段
- default_user_password: 配置默认用户密码
- nameservers: dns 服务地址，是一个字符串列表，最多支持配置3个
- networks: 网络配置，一个字典列表
    - ip_address: ip 地址，配置静态地址后必填
    - netmask: 子网，配置静态地址后必填
    - nic_index: 配置网卡的顺序，以 0 为起始
    - routes: 静态路由配置，一个字典列表
        - gateway: 网关地址
        - network: 目标网络
        - netmask: 目标子网
- hostname: 主机名
- public_keys: 登陆用的公钥
- user_data: 用户数据配置

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
                        "gateway": "192.168.16.1", # 默认网关配置
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