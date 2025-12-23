---
title: Go
---

import Terminology from '@site/terminology.json'

<>The {Terminology['terminology']['en-US']['PRODUCT']} SDK for Golang supports Golang 1.16 or later. </>

- [Source repository](https://github.com/smartxworks/cloudtower-go-sdk)
- [Download the SDK](https://github.com/smartxworks/cloudtower-go-sdk/releases)

## Installing the SDK

```shell
go get github.com/smartxworks/cloudtower-go-sdk/v2
```

## Using the SDK

> The examples use two helper libraries: [pointy](https://github.com/openlyinc/pointy) and [go-funk](https://github.com/thoas/go-funk). pointy can quickly create pointers to primitive types. Go-funk provides utility methods such as `Map`, `Filter`, `Reduce`, etc.

### Creating an instance

#### Creating an `ApiClient` instance

```go
import (
	apiclient "github.com/smartxworks/cloudtower-go-sdk/v2/client"
	httptransport "github.com/go-openapi/runtime/client"
	"github.com/go-openapi/strfmt"
)
transport := httptransport.New("192.168.36.133", "/v2/api", []string{"http"})
client := apiclient.New(transport, strfmt.Default)
```

> If you need to use HTTPS, you can either install a certificate or skip certificate verification.

```go
import (
	apiclient "github.com/smartxworks/cloudtower-go-sdk/v2/client"
	httptransport "github.com/go-openapi/runtime/client"
	"github.com/go-openapi/strfmt"
)
tlsClient, err := httptransport.TLSClient(httptransport.TLSClientOptions{
	InsecureSkipVerify: true,
})
if err != nil {
	fmt.Print(err)
	return
}
transport := httptransport.NewWithClient("192.168.29.157", "/v2/api", []string{"https"}, tlsClient)
client := apiclient.New(transport, strfmt.Default)
```

### Sending requests

#### Importing the corresponding `client` package

> Import and create the `client` package based on the type of operation you want to perform.

```go
import (
  	vm "github.com/smartxworks/cloudtower-go-sdk/v2/client/vm"
)
```

#### Authenticating

You can use `NewWithUserConfig` to create a `Client` with authentication information.

```go
import (
	apiclient "github.com/smartxworks/cloudtower-go-sdk/v2/client"
	"github.com/smartxworks/cloudtower-go-sdk/v2/models"
)

client, err := apiclient.NewWithUserConfig(apiclient.ClientConfig{
	Host:     "localhost:8090",
	BasePath: "v2/api",
	Schemes:  []string{"http"},
}, apiclient.UserConfig{
	Name:     "Name",
	Password: "Password",
	Source:   models.UserSourceLOCAL,
})
```

Alternatively, you can create a `Client` and then manually add authentication information.

```go
import (
  User "github.com/smartxworks/cloudtower-go-sdk/v2/client/user"
)
loginParams := User.NewLoginParams()
loginParams.RequestBody = &models.LoginInput{
	Username: pointy.String("username"),
	Password: pointy.String("password"),
	Source:   models.NewUserSource(models.UserSourceLOCAL),
}
logRes, err := client.User.Login(loginParams)
if err != nil {
	return err
}
transport.DefaultAuthentication = httptransport.APIKeyAuth("Authorization", "header", *logRes.Payload.Data.Token)
```

#### Retrieving resources

```go
getVmParams := vm.NewGetVmsParams();
getVmParams.RequestBody = &models.GetVmsRequestBody{
	Where: &models.VMWhereInput{
		ID: pointy.String("vm_id"),
	},
}
vmsRes, err := client.VM.GetVms(getVmParams)
if err != nil {
	return err
}
vms := vmsRes.Payload
```

#### Updating resources

> Updating resources will trigger a related asynchronous task. When the task is completed, it indicates that the resource operation has finished and the data has been updated.

```go
target_vm := vmsRes.Payload[0]
vmStartParams := vm.NewStartVMParams()
vmStartParams.RequestBody = &models.VMStartParams{
	Where: &models.VMWhereInput{
		ID: target_vm.ID,
	},
}
startRes, err := client.VM.StartVM(vmStartParams)
if err != nil {
	return err
}
```

> You can use the provided utility method `WaitTask` to synchronously wait for an asynchronous task to complete. If the task fails or times out, an error will be returned. The polling interval is 5 seconds, and the timeout is 300 seconds.
>
> - **Method parameters**
>
> | <strong>Parameter</strong> | <strong>Type</strong>               | <strong>Required</strong> | <strong>Description</strong>                                                                |
> | -------------------------- | ----------------------------------- | ------------------------- | ------------------------------------------------------------------------------------------- |
> | context                    | Context                             | Yes                       | Used to control interrupts.                                                 |
> | <code>client</code>        | \*client.Cloudtower | Yes                       | The client instance used for querying.                                      |
> | `id`                       | string                              | Yes                       | The ID of the task to query.                                                |
> | interval                   | time.duration       | Yes                       | The waiting time after each query. The minimum is 1 second. |

```go
task := *startRes.Payload[0].TaskID
err = utils.WaitTask(context.TODO(), client, task, 1*time.Second)
if err != nil {
	return err
}
```

> If there are multiple tasks, you can use `WaitTasks`, which accepts multiple task IDs. Other behaviors are the same as `WaitTask`.
>
> - **Method parameters**
>
> | <strong>Parameter</strong> | <strong>Type</strong>                                        | <strong>Required</strong> | <strong>Description</strong>                                                                |
> | -------------------------- | ------------------------------------------------------------ | ------------------------- | ------------------------------------------------------------------------------------------- |
> | context                    | Context                                                      | Yes                       | Used to control interrupts.                                                 |
> | `client`                   | \*client.Cloudtower                          | Yes                       | The client instance used for querying.                                      |
> | `ids`                      | []string | Yes                       | The list of task IDs to query.                                              |
> | interval                   | time.duration                                | Yes                       | The waiting time after each query. The minimum is 1 second. |

```go
tasks := funk.Map(startRes.Payload, func(tvm *models.WithTaskVM) string {
	return *tvm.TaskID
}).([]string)
err = utils.WaitTask(context.TODO(), client, tasks, 1*time.Second)
if err != nil {
	return err
}
```

#### Others

##### Setting the response language

> You can set the response language by configuring the `ContentLanguage` field in the request parameters. Available values are `["en-US", "zh-CN"]`, with `en-US` as the default. If you specify an unsupported language, the API returns an `HTTP 400` error.

```go
getTaskDefaultParams := task.NewGetTasksParams()
getTaskDefaultParams.RequestBody = &models.GetTasksRequestBody{
	First: pointy.Int32(10),
}
// The message, solution, cause, and impact in alerts will be returned in English. 
taskDefaultRes, err := client.Task.GetTasks(getTaskDefaultParams)

getTaskZhParams := task.NewGetTasksParams()
getTaskZhParams.RequestBody = &models.GetTasksRequestBody{
	First: pointy.Int32(10),
}
// The message, solution, cause, and impact in alerts will be returned in Chinese. 
getTaskZhParams.ContentLanguage = pointy.String("en-US")
taskZhRes, err := client.Task.GetTasks(getTaskZhParams)
```

## Operation examples

### Fetching virtual machines

#### Fetching all virtual machines

```go
package main

import (
	"fmt"

	apiclient "github.com/smartxworks/cloudtower-go-sdk/v2/client"
	"github.com/smartxworks/cloudtower-go-sdk/v2/client/vm"
	"github.com/smartxworks/cloudtower-go-sdk/v2/models"

	httptransport "github.com/go-openapi/runtime/client"
)

func main() {
	transport := httptransport.New("192.168.36.133", "/v2/api", []string{"http"})
	client := apiclient.New(transport, strfmt.Default)
	transport.DefaultAuthentication = httptransport.APIKeyAuth("Authorization", "header", "token")
	vms, err := getAllVms(client)
	if err != nil {
		panic(err.Error())
	}
  // handle queried vms
}

func getAllVms(
	client *apiclient.Cloudtower) ([]*models.VM, error) {
	getAllVmsParams := vm.NewGetVmsParams()
	getAllVmsParams.RequestBody = &models.GetVmsRequestBody{}
	vmsRes, err := client.VM.GetVms(getAllVmsParams)
	if err != nil {
		return nil, err
	}
	return vmsRes.Payload, nil
}
```

#### Fetching virtual machines with pagination

```go
package main

import (
	"github.com/openlyinc/pointy"
	apiclient "github.com/smartxworks/cloudtower-go-sdk/v2/client"
	"github.com/smartxworks/cloudtower-go-sdk/v2/client/vm"
	"github.com/smartxworks/cloudtower-go-sdk/v2/models"

	httptransport "github.com/go-openapi/runtime/client"

	"github.com/go-openapi/strfmt"
)

func main() {
	transport := httptransport.New("192.168.36.133", "/v2/api", []string{"http"})
	client := apiclient.New(transport, strfmt.Default)
	transport.DefaultAuthentication = httptransport.APIKeyAuth("Authorization", "header", "token")
	vms, err := getVmsWithPagination(client)
	if err != nil {
		panic(err.Error())
	}
  // handle queried vms
}

func getVmsWithPagination(
	client *apiclient.Cloudtower,
  from int32,
  to int32) ([]*models.VM, error) {
	getVmsWithPaginationParams := vm.NewGetVmsParams()
	getVmsWithPaginationParams.RequestBody = &models.GetVmsRequestBody{
		First: pointy.Int32(from+1),
		Skip:  pointy.Int32(to-from),
	}
	vmsRes, err := client.VM.GetVms(getVmsWithPaginationParams)
	if err != nil {
		return nil, err
	}
	return vmsRes.Payload, nil
}
```

#### Fetching all powered-on virtual machines

```go
package main

import (
	"github.com/openlyinc/pointy"
	apiclient "github.com/smartxworks/cloudtower-go-sdk/v2/client"
	"github.com/smartxworks/cloudtower-go-sdk/v2/client/vm"
	"github.com/smartxworks/cloudtower-go-sdk/v2/models"

	httptransport "github.com/go-openapi/runtime/client"

	"github.com/go-openapi/strfmt"
)

func main() {
	transport := httptransport.New("192.168.36.133", "/v2/api", []string{"http"})
	client := apiclient.New(transport, strfmt.Default)
	transport.DefaultAuthentication = httptransport.APIKeyAuth("Authorization", "header", "token")
	vms, err := getAllRunningVms(client)
	if err != nil {
		panic(err.Error())
	}
  // handle queried vms
}

func getAllRunningVms(
	client *apiclient.Cloudtower) ([]*models.VM, error) {
	getAllRunningVmsParams := vm.NewGetVmsParams()
	getAllRunningVmsParams.RequestBody = &models.GetVmsRequestBody{
		Where: &models.VMWhereInput{
			Status: models.VMStatusRUNNING.Pointer(),
		},
	}
	vmsRes, err := client.VM.GetVms(getAllRunningVmsParams)
	if err != nil {
		return nil, err
	}
	return vmsRes.Payload, nil
}
```

#### Fetching virtual machines whose name or description contain a specific string

```go
package main

import (
	"github.com/openlyinc/pointy"
	apiclient "github.com/smartxworks/cloudtower-go-sdk/v2/client"
	"github.com/smartxworks/cloudtower-go-sdk/v2/client/vm"
	"github.com/smartxworks/cloudtower-go-sdk/v2/models"

	httptransport "github.com/go-openapi/runtime/client"

	"github.com/go-openapi/strfmt"
)

func main() {
	transport := httptransport.New("192.168.36.133", "/v2/api", []string{"http"})
	client := apiclient.New(transport, strfmt.Default)
	transport.DefaultAuthentication = httptransport.APIKeyAuth("Authorization", "header", "token")
	vms, err := getVmsMatchStr(client, "matchStr")
	if err != nil {
		panic(err.Error())
	}
  // handle queried vms
}

func getVmsMatchStr(
	client *apiclient.Cloudtower,
	match string) ([]*models.VM, error) {
	getAllVmNameMatchStrParams := vm.NewGetVmsParams()
	getAllVmNameMatchStrParams.RequestBody = &models.GetVmsRequestBody{
		Where: &models.VMWhereInput{
			NameContains: pointy.String(match),
		},
	}
	vmsRes, err := client.VM.GetVms(getAllVmNameMatchStrParams)
	if err != nil {
		return nil, err
	}
	return vmsRes.Payload, nil
}
```

#### Fetching all virtual machines with the number of vCPUs greater than `n`

```go
package main

import (
	"github.com/openlyinc/pointy"
	apiclient "github.com/smartxworks/cloudtower-go-sdk/v2/client"
	"github.com/smartxworks/cloudtower-go-sdk/v2/client/vm"
	"github.com/smartxworks/cloudtower-go-sdk/v2/models"

	httptransport "github.com/go-openapi/runtime/client"

	"github.com/go-openapi/strfmt"
)

func main() {
	transport := httptransport.New("192.168.36.133", "/v2/api", []string{"http"})
	client := apiclient.New(transport, strfmt.Default)
	transport.DefaultAuthentication = httptransport.APIKeyAuth("Authorization", "header", "token")
	vms, err := getVmshasNMoreCpuCore(client, 4)
	if err != nil {
		panic(err.Error())
	}
  // handle queried vms
}

func getVmshasNMoreCpuCore(
	client *apiclient.Cloudtower,
	n int32) ([]*models.VM, error) {
	getAllVmCoreGtNParams := vm.NewGetVmsParams()
	getAllVmCoreGtNParams.RequestBody = &models.GetVmsRequestBody{
		Where: &models.VMWhereInput{
			VcpuGt: pointy.Int32(n),
		},
	}
	vmsRes, err := client.VM.GetVms(getAllVmCoreGtNParams)
	if err != nil {
		return nil, err
	}
	return vmsRes.Payload, nil
}
```

### Creating a virtual machine from a template

#### Specifying IP address only

```go
package main

import (
	"time"
	"context"
	"github.com/openlyinc/pointy"
	apiclient "github.com/smartxworks/cloudtower-go-sdk/v2/client"
	"github.com/smartxworks/cloudtower-go-sdk/v2/client/vm"
	"github.com/smartxworks/cloudtower-go-sdk/v2/models"
	"github.com/smartxworks/cloudtower-go-sdk/v2/utils"

	httptransport "github.com/go-openapi/runtime/client"

	"github.com/go-openapi/strfmt"
)

func main() {
	transport := httptransport.New("192.168.36.133", "/v2/api", []string{"http"})
	client := apiclient.New(transport, strfmt.Default)
	transport.DefaultAuthentication = httptransport.APIKeyAuth("Authorization", "header", "token")
	createdVm, err := createVmFromTemplate(client, "templateId", "clusterId", "vm_name")
	if err != nil {
		panic(err.Error())
	}
  // handle created vm
}

func createVmFromTemplate(
	client *apiclient.Cloudtower,
	templateId string,
	clusterId string,
	name string) (*models.VM, error) {
	createVmFromTemplateParams := vm.NewCreateVMFromContentLibraryTemplateParams()
	createVmFromTemplateParams.RequestBody = []*models.VMCreateVMFromContentLibraryTemplateParams{
		{
			TemplateID: &templateId,
			ClusterID:  &clusterId,
			Name:       &name,
			IsFullCopy: pointy.Bool(false),
		},
	}
	createRes, err := client.VM.CreateVMFromContentLibraryTemplate(createVmFromTemplateParams)
	if err != nil {
		return nil, err
	}
	withTaskVm := createRes.Payload[0]
	err = utils.WaitTask(context.TODO(), client, withTaskVm.TaskID, 1*time.Second)
	if err != nil {
		return nil, err
	}
	getVmParams := vm.NewGetVmsParams()
	getVmParams.RequestBody = &models.GetVmsRequestBody{
		Where: &models.VMWhereInput{
			ID: withTaskVm.Data.ID,
		},
	}
	queryRes, err := client.VM.GetVms(getVmParams)
	if err != nil {
		return nil, err
	}
	return queryRes.Payload[0], nil
}
```

#### Configure virtual disk parameters that differ from the template

```go
package main

import (
	"time"
	"context"
	"github.com/openlyinc/pointy"
	apiclient "github.com/smartxworks/cloudtower-go-sdk/v2/client"
	"github.com/smartxworks/cloudtower-go-sdk/v2/client/vm"
	"github.com/smartxworks/cloudtower-go-sdk/v2/models"
	"github.com/smartxworks/cloudtower-go-sdk/v2/utils"

	httptransport "github.com/go-openapi/runtime/client"

	"github.com/go-openapi/strfmt"
)

func main() {
	transport := httptransport.New("192.168.36.133", "/v2/api", []string{"http"})
	client := apiclient.New(transport, strfmt.Default)
	transport.DefaultAuthentication = httptransport.APIKeyAuth("Authorization", "header", "token")
	createdVm, err := createVmFromTemplate(client, "templateId", "clusterId", "vm_name")
	if err != nil {
		panic(err.Error())
	}
  // handle created vm
}

func createVmFromTemplate(
	client *apiclient.Cloudtower,
	templateId string,
	clusterId string,
	name string) (*models.VM, error) {
	createVmFromTemplateParams := vm.NewCreateVMFromContentLibraryTemplateParams()
	createVmFromTemplateParams.RequestBody = []*models.VMCreateVMFromContentLibraryTemplateParams{
		{
			TemplateID: &templateId,
			ClusterID:  &clusterId,
			Name:       &name,
			DiskOperate: &models.VMDiskOperate{
				RemoveDisks: &models.VMDiskOperateRemoveDisks{
					DiskIndex: []int32{2, 3},
				},
				ModifyDisks: []*models.DiskOperateModifyDisk{
					{
						DiskIndex:  pointy.Int32(0),
						VMVolumeID: pointy.String("vmVolumeId1"),
					},
				},
				NewDisks: &models.VMDiskParams{
					MountCdRoms: []*models.VMCdRomParams{
						{
							Index:                 pointy.Int32(2),
							Boot:                  pointy.Int32(0),
							ContentLibraryImageID: pointy.String("contentLibraryImageId"),
						},
					},
					MountDisks: []*models.MountDisksParams{
						{
							Index:      pointy.Int32(3),
							Bus:        models.BusVIRTIO.Pointer(),
							Boot:       pointy.Int32(1),
							VMVolumeID: pointy.String("vmVolumeId2"),
						},
					},
					MountNewCreateDisks: []*models.MountNewCreateDisksParams{
						{
							VMVolume: &models.MountNewCreateDisksParamsVMVolume{
								ElfStoragePolicy: models.VMVolumeElfStoragePolicyTypeREPLICA2THINPROVISION.Pointer(),
								Size:             pointy.Int64(4 * 1024 * 1024 * 1024),
								Name:             pointy.String("disk_name"),
							},
							Boot: pointy.Int32(2),
							Bus:  models.BusVIRTIO.Pointer(),
						},
					},
				},
			},
			IsFullCopy: pointy.Bool(false),
		},
	}
	createRes, err := client.VM.CreateVMFromContentLibraryTemplate(createVmFromTemplateParams)
	if err != nil {
		return nil, err
	}
	withTaskVm := createRes.Payload[0]
	err = utils.WaitTask(context.TODO(), client, withTaskVm.TaskID, 1*time.Second)
	if err != nil {
		return nil, err
	}
	getVmParams := vm.NewGetVmsParams()
	getVmParams.RequestBody = &models.GetVmsRequestBody{
		Where: &models.VMWhereInput{
			ID: withTaskVm.Data.ID,
		},
	}
	queryRes, err := client.VM.GetVms(getVmParams)
	if err != nil {
		return nil, err
	}
	return queryRes.Payload[0], nil
}
```

#### Configure NIC parameters that differ from the template

```go
package main

import (
	"time"
	"context"
	"github.com/openlyinc/pointy"
	apiclient "github.com/smartxworks/cloudtower-go-sdk/v2/client"
	"github.com/smartxworks/cloudtower-go-sdk/v2/client/vm"
	"github.com/smartxworks/cloudtower-go-sdk/v2/models"
	"github.com/smartxworks/cloudtower-go-sdk/v2/utils"

	httptransport "github.com/go-openapi/runtime/client"

	"github.com/go-openapi/strfmt"
)

func main() {
	transport := httptransport.New("192.168.36.133", "/v2/api", []string{"http"})
	client := apiclient.New(transport, strfmt.Default)
	transport.DefaultAuthentication = httptransport.APIKeyAuth("Authorization", "header", "token")
	createdVm, err := createVmFromTemplate(client, "templateId", "clusterId", "vm_name")
	if err != nil {
		panic(err.Error())
	}
  // handle created vm
}

func createVmFromTemplate(
	client *apiclient.Cloudtower,
	templateId string,
	clusterId string,
	name string) (*models.VM, error) {
	createVmFromTemplateParams := vm.NewCreateVMFromContentLibraryTemplateParams()
	createVmFromTemplateParams.RequestBody = []*models.VMCreateVMFromContentLibraryTemplateParams{
		{
			TemplateID: &templateId,
			ClusterID:  &clusterId,
			Name:       &name,
			VMNics: []*models.VMNicParams{
				{
					ConnectVlanID: pointy.String("vlanId2"),
					Enabled:       pointy.Bool(true),
					Model:         models.VMNicModelVIRTIO.Pointer(),
				},
			},
			IsFullCopy: pointy.Bool(false),
		},
	}
	createRes, err := client.VM.CreateVMFromContentLibraryTemplate(createVmFromTemplateParams)
	if err != nil {
		return nil, err
	}
	withTaskVm := createRes.Payload[0]
	err = utils.WaitTask(context.TODO(), client, withTaskVm.TaskID, 1*time.Second)
	if err != nil {
		return nil, err
	}
	getVmParams := vm.NewGetVmsParams()
	getVmParams.RequestBody = &models.GetVmsRequestBody{
		Where: &models.VMWhereInput{
			ID: withTaskVm.Data.ID,
		},
	}
	queryRes, err := client.VM.GetVms(getVmParams)
	if err != nil {
		return nil, err
	}
	return queryRes.Payload[0], nil
}
```

### Creating a blank virtual machine

#### Simple creation

```go
package main

import (
  	"time"
	"context"
	"github.com/openlyinc/pointy"
	apiclient "github.com/smartxworks/cloudtower-go-sdk/v2/client"
	"github.com/smartxworks/cloudtower-go-sdk/v2/client/vm"
	"github.com/smartxworks/cloudtower-go-sdk/v2/models"
	"github.com/smartxworks/cloudtower-go-sdk/v2/utils"

	httptransport "github.com/go-openapi/runtime/client"

	"github.com/go-openapi/strfmt"
)

func main() {
	transport := httptransport.New("192.168.36.133", "/v2/api", []string{"http"})
	client := apiclient.New(transport, strfmt.Default)
	transport.DefaultAuthentication = httptransport.APIKeyAuth("Authorization", "header", "token")
	createParams := vm.NewCreateVMParams()
	createParams.RequestBody = []*models.VMCreationParams{
		{
			ClusterID:  pointy.String("clusterId"),
			Name:       pointy.String("test_vm_name"),
			Ha:         pointy.Bool(true),
			CPUCores:   pointy.Int32(4),
			CPUSockets: pointy.Int32(2),
			Memory:     pointy.Int64(8 * 1024 * 1024 * 1024),
			Vcpu:       pointy.Int32(4 * 2),
			Status:     models.VMStatusSTOPPED.Pointer(),
			Firmware:   models.VMFirmwareBIOS.Pointer(),
			VMNics: []*models.VMNicParams{
				{ConnectVlanID: pointy.String("vlanId1")},
			},
			VMDisks: &models.VMDiskParams{
				MountCdRoms: []*models.VMCdRomParams{
					{
						Boot:  pointy.Int32(0),
						Index: pointy.Int32(0),
					},
				},
			},
		},
	}
	createdVm, err := createVm(client, createParams)
	if err != nil {
		panic(err.Error())
	}
  // handle created vm
}

func createVm(
	client *apiclient.Cloudtower,
	createParams *vm.CreateVMParams) (*models.VM, error) {

	createRes, err := client.VM.CreateVM(createParams)
	if err != nil {
		return nil, err
	}
	withTaskVm := createRes.Payload[0]
	err = utils.WaitTask(context.TODO(), client, withTaskVm.TaskID, 1*time.Second)
	if err != nil {
		return nil, err
	}
	getVmParams := vm.NewGetVmsParams()
	getVmParams.RequestBody = &models.GetVmsRequestBody{
		Where: &models.VMWhereInput{
			ID: withTaskVm.Data.ID,
		},
	}
	queryRes, err := client.VM.GetVms(getVmParams)
	if err != nil {
		return nil, err
	}
	return queryRes.Payload[0], nil
}

```

#### Configuring virtual disks during creation

##### Mounting ISOs via CD-ROM

```go
package main

import (
	"time"
	"context"
	"github.com/openlyinc/pointy"
	apiclient "github.com/smartxworks/cloudtower-go-sdk/v2/client"
	"github.com/smartxworks/cloudtower-go-sdk/v2/client/vm"
	"github.com/smartxworks/cloudtower-go-sdk/v2/models"
	"github.com/smartxworks/cloudtower-go-sdk/v2/utils"

	httptransport "github.com/go-openapi/runtime/client"

	"github.com/go-openapi/strfmt"
)

func main() {
	transport := httptransport.New("192.168.36.133", "/v2/api", []string{"http"})
	client := apiclient.New(transport, strfmt.Default)
	transport.DefaultAuthentication = httptransport.APIKeyAuth("Authorization", "header", "token")
	createParams := vm.NewCreateVMParams()
	createParams.RequestBody = []*models.VMCreationParams{
		{
			ClusterID:  pointy.String("clusterId"),
			Name:       pointy.String("test_vm_name"),
			Ha:         pointy.Bool(true),
			CPUCores:   pointy.Int32(4),
			CPUSockets: pointy.Int32(2),
			Memory:     pointy.Int64(8 * 1024 * 1024 * 1024),
			Vcpu:       pointy.Int32(4 * 2),
			Status:     models.VMStatusSTOPPED.Pointer(),
			Firmware:   models.VMFirmwareBIOS.Pointer(),
			VMNics: []*models.VMNicParams{
				{ConnectVlanID: pointy.String("vlanId1")},
			},
			VMDisks: &models.VMDiskParams{
				MountCdRoms: []*models.VMCdRomParams{
					{
						Index:      pointy.Int32(0),
						Boot:       pointy.Int32(0),
						ElfImageID: pointy.String("elfImageId"),
					},
				},
			},
		},
	}
	createdVm, err := createVm(client, createParams)
	if err != nil {
		panic(err.Error())
	}
  // handle created vm
}

func createVm(
	client *apiclient.Cloudtower,
	createParams *vm.CreateVMParams) (*models.VM, error) {

	createRes, err := client.VM.CreateVM(createParams)
	if err != nil {
		return nil, err
	}
	withTaskVm := createRes.Payload[0]
	err = utils.WaitTask(context.TODO(), client, withTaskVm.TaskID, 1*time.Second)
	if err != nil {
		return nil, err
	}
	getVmParams := vm.NewGetVmsParams()
	getVmParams.RequestBody = &models.GetVmsRequestBody{
		Where: &models.VMWhereInput{
			ID: withTaskVm.Data.ID,
		},
	}
	queryRes, err := client.VM.GetVms(getVmParams)
	if err != nil {
		return nil, err
	}
	return queryRes.Payload[0], nil
}
```

##### Mounting virtual volumes as virtual disks

```go
package main

import (
	"time"
	"context"
	"github.com/openlyinc/pointy"
	apiclient "github.com/smartxworks/cloudtower-go-sdk/v2/client"
	"github.com/smartxworks/cloudtower-go-sdk/v2/client/vm"
	"github.com/smartxworks/cloudtower-go-sdk/v2/models"
	"github.com/smartxworks/cloudtower-go-sdk/v2/utils"

	httptransport "github.com/go-openapi/runtime/client"

	"github.com/go-openapi/strfmt"
)

func main() {
	transport := httptransport.New("192.168.36.133", "/v2/api", []string{"http"})
	client := apiclient.New(transport, strfmt.Default)
	transport.DefaultAuthentication = httptransport.APIKeyAuth("Authorization", "header", "token")
	createParams := vm.NewCreateVMParams()
	createParams.RequestBody = []*models.VMCreationParams{
		{
			ClusterID:  pointy.String("clusterId"),
			Name:       pointy.String("test_vm_name"),
			Ha:         pointy.Bool(true),
			CPUCores:   pointy.Int32(4),
			CPUSockets: pointy.Int32(2),
			Memory:     pointy.Int64(8 * 1024 * 1024 * 1024),
			Vcpu:       pointy.Int32(4 * 2),
			Status:     models.VMStatusSTOPPED.Pointer(),
			Firmware:   models.VMFirmwareBIOS.Pointer(),
			VMNics: []*models.VMNicParams{
				{ConnectVlanID: pointy.String("vlanId1")},
			},
			VMDisks: &models.VMDiskParams{
				MountDisks: []*models.MountDisksParams{
					{
						Boot:       pointy.Int32(0),
						Bus:        models.BusVIRTIO.Pointer(),
						VMVolumeID: pointy.String("vmVolumeId1"),
						Index:      pointy.Int32(0),
					},
				},
			},
		},
	}
	createdVm, err := createVm(client, createParams)
	if err != nil {
		panic(err.Error())
	}
  // handle created vm
}

func createVm(
	client *apiclient.Cloudtower,
	createParams *vm.CreateVMParams) (*models.VM, error) {

	createRes, err := client.VM.CreateVM(createParams)
	if err != nil {
		return nil, err
	}
	withTaskVm := createRes.Payload[0]
	err = utils.WaitTask(context.TODO(), client, withTaskVm.TaskID, 1*time.Second)
	if err != nil {
		return nil, err
	}
	getVmParams := vm.NewGetVmsParams()
	getVmParams.RequestBody = &models.GetVmsRequestBody{
		Where: &models.VMWhereInput{
			ID: withTaskVm.Data.ID,
		},
	}
	queryRes, err := client.VM.GetVms(getVmParams)
	if err != nil {
		return nil, err
	}
	return queryRes.Payload[0], nil
}
```

##### Mounting newly created virtual disks

```go
package main

import (
	"time"
	"context"
	"github.com/openlyinc/pointy"
	apiclient "github.com/smartxworks/cloudtower-go-sdk/v2/client"
	"github.com/smartxworks/cloudtower-go-sdk/v2/client/vm"
	"github.com/smartxworks/cloudtower-go-sdk/v2/models"
	"github.com/smartxworks/cloudtower-go-sdk/v2/utils"

	httptransport "github.com/go-openapi/runtime/client"

	"github.com/go-openapi/strfmt"
)

func main() {
	transport := httptransport.New("192.168.36.133", "/v2/api", []string{"http"})
	client := apiclient.New(transport, strfmt.Default)
	transport.DefaultAuthentication = httptransport.APIKeyAuth("Authorization", "header", "token")
	createParams := vm.NewCreateVMParams()
	createParams.RequestBody = []*models.VMCreationParams{
		{
			ClusterID:  pointy.String("clusterId"),
			Name:       pointy.String("test_vm_name"),
			Ha:         pointy.Bool(true),
			CPUCores:   pointy.Int32(4),
			CPUSockets: pointy.Int32(2),
			Memory:     pointy.Int64(8 * 1024 * 1024 * 1024),
			Vcpu:       pointy.Int32(4 * 2),
			Status:     models.VMStatusSTOPPED.Pointer(),
			Firmware:   models.VMFirmwareBIOS.Pointer(),
			VMNics: []*models.VMNicParams{
				{ConnectVlanID: pointy.String("vlanId1")},
			},
			VMDisks: &models.VMDiskParams{
				MountNewCreateDisks: []*models.MountNewCreateDisksParams{
					{
						Boot: pointy.Int32(0),
						Bus:  models.BusVIRTIO.Pointer(),
						VMVolume: &models.MountNewCreateDisksParamsVMVolume{
							Size:             pointy.Int64(10 * 1024 * 1024 * 1024),
							ElfStoragePolicy: models.VMVolumeElfStoragePolicyTypeREPLICA2THINPROVISION.Pointer(),
							Name:             pointy.String("new_vm_disk_name"),
						},
					},
				},
			},
		},
	}
	createdVm, err := createVm(client, createParams)
	if err != nil {
		panic(err.Error())
	}
  // handle created vm
}

func createVm(
	client *apiclient.Cloudtower,
	createParams *vm.CreateVMParams) (*models.VM, error) {

	createRes, err := client.VM.CreateVM(createParams)
	if err != nil {
		return nil, err
	}
	withTaskVm := createRes.Payload[0]
	err = utils.WaitTask(context.TODO(), client, withTaskVm.TaskID, 1*time.Second)
	if err != nil {
		return nil, err
	}
	getVmParams := vm.NewGetVmsParams()
	getVmParams.RequestBody = &models.GetVmsRequestBody{
		Where: &models.VMWhereInput{
			ID: withTaskVm.Data.ID,
		},
	}
	queryRes, err := client.VM.GetVms(getVmParams)
	if err != nil {
		return nil, err
	}
	return queryRes.Payload[0], nil
}
```

#### Configuring virtual NICs during creation

```go
package main

import (
	"time"
	"context"
	"github.com/openlyinc/pointy"
	apiclient "github.com/smartxworks/cloudtower-go-sdk/v2/client"
	"github.com/smartxworks/cloudtower-go-sdk/v2/client/vm"
	"github.com/smartxworks/cloudtower-go-sdk/v2/models"
	"github.com/smartxworks/cloudtower-go-sdk/v2/utils"

	httptransport "github.com/go-openapi/runtime/client"

	"github.com/go-openapi/strfmt"
)

func main() {
	transport := httptransport.New("192.168.36.133", "/v2/api", []string{"http"})
	client := apiclient.New(transport, strfmt.Default)
	transport.DefaultAuthentication = httptransport.APIKeyAuth("Authorization", "header", "token")
	createParams := vm.NewCreateVMParams()
	createParams.RequestBody = []*models.VMCreationParams{
		{
			ClusterID:  pointy.String("clusterId"),
			Name:       pointy.String("test_vm_name"),
			Ha:         pointy.Bool(true),
			CPUCores:   pointy.Int32(4),
			CPUSockets: pointy.Int32(2),
			Memory:     pointy.Int64(8 * 1024 * 1024 * 1024),
			Vcpu:       pointy.Int32(4 * 2),
			Status:     models.VMStatusSTOPPED.Pointer(),
			Firmware:   models.VMFirmwareBIOS.Pointer(),
			VMNics: []*models.VMNicParams{
				{
					ConnectVlanID: pointy.String("vlanId1"),
					Mirror:        pointy.Bool(true),
					Enabled:       pointy.Bool(false),
					Model:         models.VMNicModelE1000.Pointer(),
				},
			},
			VMDisks: &models.VMDiskParams{
				MountCdRoms: []*models.VMCdRomParams{
					{
						Boot:  pointy.Int32(0),
						Index: pointy.Int32(0),
					},
				},
			},
		},
	}
	createdVm, err := createVm(client, createParams)
	if err != nil {
		panic(err.Error())
	}
  // handle created vm
}

func createVm(
	client *apiclient.Cloudtower,
	createParams *vm.CreateVMParams) (*models.VM, error) {

	createRes, err := client.VM.CreateVM(createParams)
	if err != nil {
		return nil, err
	}
	withTaskVm := createRes.Payload[0]
	err = utils.WaitTask(context.TODO(), client, withTaskVm.TaskID, 1*time.Second)
	if err != nil {
		return nil, err
	}
	getVmParams := vm.NewGetVmsParams()
	getVmParams.RequestBody = &models.GetVmsRequestBody{
		Where: &models.VMWhereInput{
			ID: withTaskVm.Data.ID,
		},
	}
	queryRes, err := client.VM.GetVms(getVmParams)
	if err != nil {
		return nil, err
	}
	return queryRes.Payload[0], nil
}
```

### Editing a virtual machine

#### Editing basic information

```go
package main

import (
	"time"
	"context"
	"github.com/openlyinc/pointy"
	apiclient "github.com/smartxworks/cloudtower-go-sdk/v2/client"
	"github.com/smartxworks/cloudtower-go-sdk/v2/client/vm"
	"github.com/smartxworks/cloudtower-go-sdk/v2/models"
	"github.com/smartxworks/cloudtower-go-sdk/v2/utils"

	httptransport "github.com/go-openapi/runtime/client"

	"github.com/go-openapi/strfmt"
)

func main() {
	transport := httptransport.New("192.168.36.133", "/v2/api", []string{"http"})
	client := apiclient.New(transport, strfmt.Default)
	transport.DefaultAuthentication = httptransport.APIKeyAuth("Authorization", "header", "token")
	updateParams := vm.NewUpdateVMParams()
	updateParams.RequestBody = &models.VMUpdateParams{
		Where: &models.VMWhereInput{
			ID: pointy.String("vmId"),
		},
		Data: &models.VMUpdateParamsData{
			Name:        pointy.String("updated_name"),
			Description: pointy.String("updated description"),
			Ha:          pointy.Bool(true),
			CPUCores:    pointy.Int32(2),
			CPUSockets:  pointy.Int32(8),
			Vcpu:        pointy.Int32(2 * 8),
			Memory:      pointy.Int64(16 * 1024 * 1024 * 1024),
		},
	}
	updatedVm, err := updateVm(client, updateParams)
	if err != nil {
		panic(err.Error())
	}
  // handle updated vm
}

func updateVm(
	client *apiclient.Cloudtower,
	updateParams *vm.UpdateVMParams) (*models.VM, error) {
	updateRes, err := client.VM.UpdateVM(updateParams)
	if err != nil {
		return nil, err
	}
	withTaskVm := updateRes.Payload[0]
	err = utils.WaitTask(context.TODO(), client, withTaskVm.TaskID, 1*time.Second)
	if err != nil {
		return nil, err
	}
	getVmParams := vm.NewGetVmsParams()
	getVmParams.RequestBody = &models.GetVmsRequestBody{
		Where: &models.VMWhereInput{
			ID: withTaskVm.Data.ID,
		},
	}
	queryRes, err := client.VM.GetVms(getVmParams)
	if err != nil {
		return nil, err
	}
	return queryRes.Payload[0], nil
}
```

#### Editing CD-ROMs

##### Adding a CD-ROM

```go
package main

import (
	"time"
	"context"
	"github.com/openlyinc/pointy"
	apiclient "github.com/smartxworks/cloudtower-go-sdk/v2/client"
	"github.com/smartxworks/cloudtower-go-sdk/v2/client/vm"
	"github.com/smartxworks/cloudtower-go-sdk/v2/models"
	"github.com/smartxworks/cloudtower-go-sdk/v2/utils"

	httptransport "github.com/go-openapi/runtime/client"

	"github.com/go-openapi/strfmt"
)

func main() {
	transport := httptransport.New("192.168.36.133", "/v2/api", []string{"http"})
	client := apiclient.New(transport, strfmt.Default)
	transport.DefaultAuthentication = httptransport.APIKeyAuth("Authorization", "header", "token")
	addCdRomParams := vm.NewAddVMCdRomParams()
	addCdRomParams.RequestBody = &models.VMAddCdRomParams{
		Where: &models.VMWhereInput{
			ID: pointy.String("vmId"),
		},
		Data: &models.VMAddCdRomParamsData{
			VMCdRoms: []*models.VMCdRomParams{
				{
					Index:      pointy.Int32(0),
					ElfImageID: pointy.String("elfImageId"),
					Boot:       pointy.Int32(0),
				},
			},
		},
	}
	updatedVm, err := addVmCdRom(client, addCdRomParams)
	if err != nil {
		panic(err.Error())
	}
  // handle updated vm
}

func addVmCdRom(
	client *apiclient.Cloudtower,
	addCdRomParams *vm.AddVMCdRomParams) (*models.VM, error) {
	updateRes, err := client.VM.AddVMCdRom(addCdRomParams)
	if err != nil {
		return nil, err
	}
	withTaskVm := updateRes.Payload[0]
	err = utils.WaitTask(context.TODO(), client, withTaskVm.TaskID, 1*time.Second)
	if err != nil {
		return nil, err
	}
	getVmParams := vm.NewGetVmsParams()
	getVmParams.RequestBody = &models.GetVmsRequestBody{
		Where: &models.VMWhereInput{
			ID: withTaskVm.Data.ID,
		},
	}
	queryRes, err := client.VM.GetVms(getVmParams)
	if err != nil {
		return nil, err
	}
	return queryRes.Payload[0], nil
}
```

##### Deleting a CD-ROM

```go
package main

import (
	"time"
	"context"
	"github.com/openlyinc/pointy"
	apiclient "github.com/smartxworks/cloudtower-go-sdk/v2/client"
	"github.com/smartxworks/cloudtower-go-sdk/v2/client/vm"
	"github.com/smartxworks/cloudtower-go-sdk/v2/models"
	"github.com/smartxworks/cloudtower-go-sdk/v2/utils"

	httptransport "github.com/go-openapi/runtime/client"

	"github.com/go-openapi/strfmt"
)

func main() {
	transport := httptransport.New("192.168.36.133", "/v2/api", []string{"http"})
	client := apiclient.New(transport, strfmt.Default)
	transport.DefaultAuthentication = httptransport.APIKeyAuth("Authorization", "header", "token")
	updateParams := vm.NewRemoveVMCdRomParams()
	updateParams.RequestBody = &models.VMRemoveCdRomParams{
		Where: &models.VMWhereInput{
			ID: pointy.String("vmId"),
		},
		Data: &models.VMRemoveCdRomParamsData{
			CdRomIds: []string{"cdRomId1", "cdRomId2"},
		},
	}
	updatedVm, err := removeVmCdRom(client, updateParams)
	if err != nil {
		panic(err.Error())
	}
  // handle updated vm
}

func removeVmCdRom(
	client *apiclient.Cloudtower,
	removeCdRomParams *vm.RemoveVMCdRomParams) (*models.VM, error) {
	updateRes, err := client.VM.RemoveVMCdRom(removeCdRomParams)
	if err != nil {
		return nil, err
	}
	withTaskVm := updateRes.Payload[0]
	err = utils.WaitTask(context.TODO(), client, withTaskVm.TaskID, 1*time.Second)
	if err != nil {
		return nil, err
	}
	getVmParams := vm.NewGetVmsParams()
	getVmParams.RequestBody = &models.GetVmsRequestBody{
		Where: &models.VMWhereInput{
			ID: withTaskVm.Data.ID,
		},
	}
	queryRes, err := client.VM.GetVms(getVmParams)
	if err != nil {
		return nil, err
	}
	return queryRes.Payload[0], nil
}
```

#### Managing virtual volumes

##### Adding a new virtual volume

```go
package main

import (
	"time"
	"context"
	"github.com/openlyinc/pointy"
	apiclient "github.com/smartxworks/cloudtower-go-sdk/v2/client"
	"github.com/smartxworks/cloudtower-go-sdk/v2/client/vm"
	"github.com/smartxworks/cloudtower-go-sdk/v2/models"
	"github.com/smartxworks/cloudtower-go-sdk/v2/utils"

	httptransport "github.com/go-openapi/runtime/client"

	"github.com/go-openapi/strfmt"
)

func main() {
	transport := httptransport.New("192.168.36.133", "/v2/api", []string{"http"})
	client := apiclient.New(transport, strfmt.Default)
	transport.DefaultAuthentication = httptransport.APIKeyAuth("Authorization", "header", "token")
	updateParams := vm.NewAddVMDiskParams()
	updateParams.RequestBody = &models.VMAddDiskParams{
		Where: &models.VMWhereInput{
			ID: pointy.String("vmId"),
		},
		Data: &models.VMAddDiskParamsData{
			VMDisks: &models.VMAddDiskParamsDataVMDisks{
				MountNewCreateDisks: []*models.MountNewCreateDisksParams{
					{
						VMVolume: &models.MountNewCreateDisksParamsVMVolume{
							ElfStoragePolicy: models.VMVolumeElfStoragePolicyTypeREPLICA2THINPROVISION.Pointer(),
							Size:             pointy.Int64(10 * 1024 * 1024 * 1024),
							Name:             pointy.String("new_disk_name"),
						},
						Boot: pointy.Int32(1),
						Bus:  models.BusVIRTIO.Pointer(),
					},
				},
			},
		},
	}
	updatedVm, err := addVmDisk(client, updateParams)
	if err != nil {
		panic(err.Error())
	}
  // handle created vm
}

func addVmDisk(
	client *apiclient.Cloudtower,
	addVMDiskParams *vm.AddVMDiskParams) (*models.VM, error) {
	updateRes, err := client.VM.AddVMDisk(addVMDiskParams)
	if err != nil {
		return nil, err
	}
	withTaskVm := updateRes.Payload[0]
	err = utils.WaitTask(context.TODO(), client, withTaskVm.TaskID, 1*time.Second)
	if err != nil {
		return nil, err
	}
	getVmParams := vm.NewGetVmsParams()
	getVmParams.RequestBody = &models.GetVmsRequestBody{
		Where: &models.VMWhereInput{
			ID: withTaskVm.Data.ID,
		},
	}
	queryRes, err := client.VM.GetVms(getVmParams)
	if err != nil {
		return nil, err
	}
	return queryRes.Payload[0], nil
}
```

##### Mounting an existing virtual volume as a virtual disk

```go
package main

import (
	"time"
	"context"
	"github.com/openlyinc/pointy"
	apiclient "github.com/smartxworks/cloudtower-go-sdk/v2/client"
	"github.com/smartxworks/cloudtower-go-sdk/v2/client/vm"
	"github.com/smartxworks/cloudtower-go-sdk/v2/models"
	"github.com/smartxworks/cloudtower-go-sdk/v2/utils"

	httptransport "github.com/go-openapi/runtime/client"

	"github.com/go-openapi/strfmt"
)

func main() {
	transport := httptransport.New("192.168.36.133", "/v2/api", []string{"http"})
	client := apiclient.New(transport, strfmt.Default)
	transport.DefaultAuthentication = httptransport.APIKeyAuth("Authorization", "header", "token")
	updateParams := vm.NewAddVMDiskParams()
	updateParams.RequestBody = &models.VMAddDiskParams{
		Where: &models.VMWhereInput{
			ID: pointy.String("vmId"),
		},
		Data: &models.VMAddDiskParamsData{
			VMDisks: &models.VMAddDiskParamsDataVMDisks{
				MountDisks: []*models.MountDisksParams{
					{
						Index:      pointy.Int32(0),
						VMVolumeID: pointy.String("vmVolumeId"),
						Boot:       pointy.Int32(0),
						Bus:        models.BusVIRTIO.Pointer(),
					},
				},
			},
		},
	}
	updatedVm, err := addVmDisk(client, updateParams)
	if err != nil {
		panic(err.Error())
	}
  // handle updated vm
}

func addVmDisk(
	client *apiclient.Cloudtower,
	addVMDiskParams *vm.AddVMDiskParams) (*models.VM, error) {
	updateRes, err := client.VM.AddVMDisk(addVMDiskParams)
	if err != nil {
		return nil, err
	}
	withTaskVm := updateRes.Payload[0]
	err = utils.WaitTask(context.TODO(), client, withTaskVm.TaskID, 1*time.Second)
	if err != nil {
		return nil, err
	}
	getVmParams := vm.NewGetVmsParams()
	getVmParams.RequestBody = &models.GetVmsRequestBody{
		Where: &models.VMWhereInput{
			ID: withTaskVm.Data.ID,
		},
	}
	queryRes, err := client.VM.GetVms(getVmParams)
	if err != nil {
		return nil, err
	}
	return queryRes.Payload[0], nil
}
```

##### Unmounting a virtual disk

```go
package main

import (
	"time"
	"context"
	"github.com/openlyinc/pointy"
	apiclient "github.com/smartxworks/cloudtower-go-sdk/v2/client"
	"github.com/smartxworks/cloudtower-go-sdk/v2/client/vm"
	"github.com/smartxworks/cloudtower-go-sdk/v2/models"
	"github.com/smartxworks/cloudtower-go-sdk/v2/utils"

	httptransport "github.com/go-openapi/runtime/client"

	"github.com/go-openapi/strfmt"
)

func main() {
	transport := httptransport.New("192.168.36.133", "/v2/api", []string{"http"})
	client := apiclient.New(transport, strfmt.Default)
	transport.DefaultAuthentication = httptransport.APIKeyAuth("Authorization", "header", "token")
	updateParams := vm.NewRemoveVMDiskParams()
	updateParams.RequestBody = &models.VMRemoveDiskParams{
		Where: &models.VMWhereInput{
			ID: pointy.String("vmId"),
		},
		Data: &models.VMRemoveDiskParamsData{
			DiskIds: []string{"diskId1", "diskId2"},
		},
	}
	updatedVm, err := removeVmDisk(client, updateParams)
	if err != nil {
		panic(err.Error())
	}
  // handle updated vm
}

func removeVmDisk(
	client *apiclient.Cloudtower,
	removeVmDiskParams *vm.RemoveVMDiskParams) (*models.VM, error) {
	updateRes, err := client.VM.RemoveVMDisk(removeVmDiskParams)
	if err != nil {
		return nil, err
	}
	withTaskVm := updateRes.Payload[0]
	err = utils.WaitTask(context.TODO(), client, withTaskVm.TaskID, 1*time.Second)
	if err != nil {
		return nil, err
	}
	getVmParams := vm.NewGetVmsParams()
	getVmParams.RequestBody = &models.GetVmsRequestBody{
		Where: &models.VMWhereInput{
			ID: withTaskVm.Data.ID,
		},
	}
	queryRes, err := client.VM.GetVms(getVmParams)
	if err != nil {
		return nil, err
	}
	return queryRes.Payload[0], nil
}
```

#### Managing NICs

##### Adding a NIC

```go
package main

import (
	"time"
	"context"
	"github.com/openlyinc/pointy"
	apiclient "github.com/smartxworks/cloudtower-go-sdk/v2/client"
	"github.com/smartxworks/cloudtower-go-sdk/v2/client/vm"
	"github.com/smartxworks/cloudtower-go-sdk/v2/models"
	"github.com/smartxworks/cloudtower-go-sdk/v2/utils"

	httptransport "github.com/go-openapi/runtime/client"

	"github.com/go-openapi/strfmt"
)

func main() {
	transport := httptransport.New("192.168.36.133", "/v2/api", []string{"http"})
	client := apiclient.New(transport, strfmt.Default)
	transport.DefaultAuthentication = httptransport.APIKeyAuth("Authorization", "header", "token")
	updateParams := vm.NewAddVMNicParams()
	updateParams.RequestBody = &models.VMAddNicParams{
		Where: &models.VMWhereInput{
			ID: pointy.String("vmId"),
		},
		Data: &models.VMAddNicParamsData{
			VMNics: []*models.VMNicParams{
				{
					ConnectVlanID: pointy.String("vlanId2"),
					Enabled:       pointy.Bool(true),
					Model:         models.VMNicModelVIRTIO.Pointer(),
				},
			},
		},
	}
	updatedVm, err := addVmNic(client, updateParams)
	if err != nil {
		panic(err.Error())
	}
  // handle updated vm
}

func addVmNic(
	client *apiclient.Cloudtower,
	addVMNicParams *vm.AddVMNicParams) (*models.VM, error) {
	updateRes, err := client.VM.AddVMNic(addVMNicParams)
	if err != nil {
		return nil, err
	}
	withTaskVm := updateRes.Payload[0]
	err = utils.WaitTask(context.TODO(), client, withTaskVm.TaskID, 1*time.Second)
	if err != nil {
		return nil, err
	}
	getVmParams := vm.NewGetVmsParams()
	getVmParams.RequestBody = &models.GetVmsRequestBody{
		Where: &models.VMWhereInput{
			ID: withTaskVm.Data.ID,
		},
	}
	queryRes, err := client.VM.GetVms(getVmParams)
	if err != nil {
		return nil, err
	}
	return queryRes.Payload[0], nil
}
```

##### Editing NICs

```go
package main

import (
	"time"
	"context"
	"github.com/openlyinc/pointy"
	apiclient "github.com/smartxworks/cloudtower-go-sdk/v2/client"
	"github.com/smartxworks/cloudtower-go-sdk/v2/client/vm"
	"github.com/smartxworks/cloudtower-go-sdk/v2/models"
	"github.com/smartxworks/cloudtower-go-sdk/v2/utils"

	httptransport "github.com/go-openapi/runtime/client"

	"github.com/go-openapi/strfmt"
)

func main() {
	transport := httptransport.New("192.168.36.133", "/v2/api", []string{"http"})
	client := apiclient.New(transport, strfmt.Default)
	transport.DefaultAuthentication = httptransport.APIKeyAuth("Authorization", "header", "token")
	updateParams := vm.NewUpdateVMNicParams()
	updateParams.RequestBody = &models.VMUpdateNicParams{
		Where: &models.VMWhereInput{
			ID: pointy.String("vmId"),
		},
		Data: &models.VMUpdateNicParamsData{
			NicIndex: pointy.Int32(0),
			Enabled:  pointy.Bool(false),
			Mirror:   pointy.Bool(false),
		},
	}
	updatedVm, err := updateVmNic(client, updateParams)
	if err != nil {
		panic(err.Error())
	}
  // handle updated vm
}

func updateVmNic(
	client *apiclient.Cloudtower,
	updateVMNicParams *vm.UpdateVMNicParams) (*models.VM, error) {
	updateRes, err := client.VM.UpdateVMNic(updateVMNicParams)
	if err != nil {
		return nil, err
	}
	withTaskVm := updateRes.Payload[0]
	err = utils.WaitTask(context.TODO(), client, withTaskVm.TaskID, 1*time.Second)
	if err != nil {
		return nil, err
	}
	getVmParams := vm.NewGetVmsParams()
	getVmParams.RequestBody = &models.GetVmsRequestBody{
		Where: &models.VMWhereInput{
			ID: withTaskVm.Data.ID,
		},
	}
	queryRes, err := client.VM.GetVms(getVmParams)
	if err != nil {
		return nil, err
	}
	return queryRes.Payload[0], nil
}
```

##### Removing a NIC

```go
package main

import (
	"time"
	"context"
	"github.com/openlyinc/pointy"
	apiclient "github.com/smartxworks/cloudtower-go-sdk/v2/client"
	"github.com/smartxworks/cloudtower-go-sdk/v2/client/vm"
	"github.com/smartxworks/cloudtower-go-sdk/v2/models"
	"github.com/smartxworks/cloudtower-go-sdk/v2/utils"

	httptransport "github.com/go-openapi/runtime/client"

	"github.com/go-openapi/strfmt"
)

func main() {
	transport := httptransport.New("192.168.36.133", "/v2/api", []string{"http"})
	client := apiclient.New(transport, strfmt.Default)
	transport.DefaultAuthentication = httptransport.APIKeyAuth("Authorization", "header", "token")
	updateParams := vm.NewRemoveVMNicParams()
	updateParams.RequestBody = &models.VMRemoveNicParams{
		Where: &models.VMWhereInput{
			ID: pointy.String("vmId"),
		},
		Data: &models.VMRemoveNicParamsData{
			NicIndex: []int32{0, 1},
		},
	}
	updatedVm, err := removeVmNic(client, updateParams)
	if err != nil {
		panic(err.Error())
	}
  // handle updated vm
}

func removeVmNic(
	client *apiclient.Cloudtower,
	removeVmDiskParams *vm.RemoveVMNicParams) (*models.VM, error) {
	updateRes, err := client.VM.RemoveVMNic(removeVmDiskParams)
	if err != nil {
		return nil, err
	}
	withTaskVm := updateRes.Payload[0]
	err = utils.WaitTask(context.TODO(), client, withTaskVm.TaskID, 1*time.Second)
	if err != nil {
		return nil, err
	}
	getVmParams := vm.NewGetVmsParams()
	getVmParams.RequestBody = &models.GetVmsRequestBody{
		Where: &models.VMWhereInput{
			ID: withTaskVm.Data.ID,
		},
	}
	queryRes, err := client.VM.GetVms(getVmParams)
	if err != nil {
		return nil, err
	}
	return queryRes.Payload[0], nil
}

```

#### Migrating a virtual machine

##### Migrating a virtual machine to a specific host

```go
package main

import (
	"time"
	"context"
	"github.com/openlyinc/pointy"
	apiclient "github.com/smartxworks/cloudtower-go-sdk/v2/client"
	"github.com/smartxworks/cloudtower-go-sdk/v2/client/vm"
	"github.com/smartxworks/cloudtower-go-sdk/v2/models"
	"github.com/smartxworks/cloudtower-go-sdk/v2/utils"

	httptransport "github.com/go-openapi/runtime/client"

	"github.com/go-openapi/strfmt"
)

func main() {
	transport := httptransport.New("192.168.36.133", "/v2/api", []string{"http"})
	client := apiclient.New(transport, strfmt.Default)
	transport.DefaultAuthentication = httptransport.APIKeyAuth("Authorization", "header", "token")

	migratedVm, err := migrateVmToHost(client, "vmId", "hostId")
	if err != nil {
		panic(err.Error())
	}
	// handle migrated vm
}

func migrateVmToHost(
	client *apiclient.Cloudtower,
	vmId string,
	hostId string) (*models.VM, error) {
	migrateParams := vm.NewMigRateVMParams()
	migrateParams.RequestBody = &models.VMMigrateParams{
		Where: &models.VMWhereInput{
			ID: pointy.String(vmId),
		},
		Data: &models.VMMigrateParamsData{
			HostID: pointy.String(hostId),
		},
	}
	migrateRes, err := client.VM.MigRateVM(migrateParams)
	if err != nil {
		return nil, err
	}
	withTaskVm := migrateRes.Payload[0]
	err = utils.WaitTask(context.TODO(), client, withTaskVm.TaskID, 1*time.Second)
	if err != nil {
		return nil, err
	}
	getVmParams := vm.NewGetVmsParams()
	getVmParams.RequestBody = &models.GetVmsRequestBody{
		Where: &models.VMWhereInput{
			ID: withTaskVm.Data.ID,
		},
	}
	queryRes, err := client.VM.GetVms(getVmParams)
	if err != nil {
		return nil, err
	}
	return queryRes.Payload[0], nil
}
```

##### Automatically placing a virtual machine on a proper host

```go
package main

import (
	"time"
	"context"
	"github.com/openlyinc/pointy"
	apiclient "github.com/smartxworks/cloudtower-go-sdk/v2/client"
	"github.com/smartxworks/cloudtower-go-sdk/v2/client/vm"
	"github.com/smartxworks/cloudtower-go-sdk/v2/models"
	"github.com/smartxworks/cloudtower-go-sdk/v2/utils"

	httptransport "github.com/go-openapi/runtime/client"

	"github.com/go-openapi/strfmt"
)

func main() {
	transport := httptransport.New("192.168.36.133", "/v2/api", []string{"http"})
	client := apiclient.New(transport, strfmt.Default)
	transport.DefaultAuthentication = httptransport.APIKeyAuth("Authorization", "header", "token")

	migratedVm, err := migrateVmAutoSchedule(client, "vmId")
	if err != nil {
		panic(err.Error())
	}
	// handle migrated vm
}

func migrateVmAutoSchedule(
	client *apiclient.Cloudtower,
	vmId string) (*models.VM, error) {
	migrateParams := vm.NewMigRateVMParams()
	migrateParams.RequestBody = &models.VMMigrateParams{
		Where: &models.VMWhereInput{
			ID: pointy.String(vmId),
		},
	}
	migrateRes, err := client.VM.MigRateVM(migrateParams)
	if err != nil {
		return nil, err
	}
	withTaskVm := migrateRes.Payload[0]
	err = utils.WaitTask(context.TODO(), client, withTaskVm.TaskID, 1*time.Second)
	if err != nil {
		return nil, err
	}
	getVmParams := vm.NewGetVmsParams()
	getVmParams.RequestBody = &models.GetVmsRequestBody{
		Where: &models.VMWhereInput{
			ID: withTaskVm.Data.ID,
		},
	}
	queryRes, err := client.VM.GetVms(getVmParams)
	if err != nil {
		return nil, err
	}
	return queryRes.Payload[0], nil
}
```

### Managing virtual machine power

#### Powering on virtual machines:

##### Powering on a specific virtual machine and automatically scheduling it to a proper host

```go
package main

import (
	"time"
	"context"
	"github.com/openlyinc/pointy"
	apiclient "github.com/smartxworks/cloudtower-go-sdk/v2/client"
	"github.com/smartxworks/cloudtower-go-sdk/v2/client/vm"
	"github.com/smartxworks/cloudtower-go-sdk/v2/models"
	"github.com/smartxworks/cloudtower-go-sdk/v2/utils"

	httptransport "github.com/go-openapi/runtime/client"

	"github.com/go-openapi/strfmt"
)

func main() {
	transport := httptransport.New("192.168.36.133", "/v2/api", []string{"http"})
	client := apiclient.New(transport, strfmt.Default)
	transport.DefaultAuthentication = httptransport.APIKeyAuth("Authorization", "header", "token")

	startedVm, err := startVm(client, "vmId")
	if err != nil {
		panic(err.Error())
	}
  // handle started vm
}

func startVm(
	client *apiclient.Cloudtower,
	vmId string) (*models.VM, error) {
	startParams := vm.NewStartVMParams()
	startParams.RequestBody = &models.VMStartParams{
		Where: &models.VMWhereInput{
			ID: pointy.String(vmId),
		},
	}
	startRes, err := client.VM.StartVM(startParams)
	if err != nil {
		return nil, err
	}
	withTaskVm := startRes.Payload[0]
	err = utils.WaitTask(context.TODO(), client, withTaskVm.TaskID, 1*time.Second)
	if err != nil {
		return nil, err
	}
	getVmParams := vm.NewGetVmsParams()
	getVmParams.RequestBody = &models.GetVmsRequestBody{
		Where: &models.VMWhereInput{
			ID: withTaskVm.Data.ID,
		},
	}
	queryRes, err := client.VM.GetVms(getVmParams)
	if err != nil {
		return nil, err
	}
	return queryRes.Payload[0], nil
}
```

##### Powering on virtual machines in batches and automatically scheduling them to a proper host

```go
package main

import (
	"fmt"
	"time"
	"context"

	"github.com/openlyinc/pointy"
	apiclient "github.com/smartxworks/cloudtower-go-sdk/v2/client"
	"github.com/smartxworks/cloudtower-go-sdk/v2/client/vm"
	"github.com/smartxworks/cloudtower-go-sdk/v2/models"
	"github.com/smartxworks/cloudtower-go-sdk/v2/utils"
	"github.com/thoas/go-funk"

	httptransport "github.com/go-openapi/runtime/client"

	"github.com/go-openapi/strfmt"
)

func main() {
	transport := httptransport.New("192.168.36.133", "/v2/api", []string{"http"})
	client := apiclient.New(transport, strfmt.Default)
	transport.DefaultAuthentication = httptransport.APIKeyAuth("Authorization", "header", "token")

	startedVms, err := startVmsByQuery(client, &models.VMWhereInput{
		IDIn: []string{"vmId"},
	})
	if err != nil {
		panic(err.Error())
	}
  // handle started vms
}

func startVmsByQuery(client *apiclient.Cloudtower,
	where *models.VMWhereInput) ([]*models.VM, error) {
	startParams := vm.NewStartVMParams()
	startParams.RequestBody = &models.VMStartParams{
		Where: where,
	}
	startRes, err := client.VM.StartVM(startParams)
	if err != nil {
		return nil, err
	}
	withTaskVms := startRes.Payload
	taskIds, valid := funk.Map(withTaskVms, func(vm *models.WithTaskVM) string {
		return *vm.TaskID
	}).([]string)
	if !valid {
		return nil, fmt.Errorf("failed to parse task ids")
	}
	vmIds, valid := funk.Map(withTaskVms, func(vm *models.WithTaskVM) string {
		return *vm.Data.ID
	}).([]string)
	if !valid {
		return nil, fmt.Errorf("failed to parse vm ids")
	}
	err = utils.WaitTasks(context.TODO(), client, taskIds, 1*time.Second)
	if err != nil {
		return nil, err
	}
	getVmParams := vm.NewGetVmsParams()
	getVmParams.RequestBody = &models.GetVmsRequestBody{
		Where: &models.VMWhereInput{
			IDIn: vmIds,
		},
	}
	queryRes, err := client.VM.GetVms(getVmParams)
	if err != nil {
		return nil, err
	}
	return queryRes.Payload, nil
}
```

##### Powering on a virtual machine and placing it on a specified host

```go
package main

import (
	"time"
	"context"
	"github.com/openlyinc/pointy"
	apiclient "github.com/smartxworks/cloudtower-go-sdk/v2/client"
	"github.com/smartxworks/cloudtower-go-sdk/v2/client/vm"
	"github.com/smartxworks/cloudtower-go-sdk/v2/models"
	"github.com/smartxworks/cloudtower-go-sdk/v2/utils"

	httptransport "github.com/go-openapi/runtime/client"

	"github.com/go-openapi/strfmt"
)

func main() {
	transport := httptransport.New("192.168.36.133", "/v2/api", []string{"http"})
	client := apiclient.New(transport, strfmt.Default)
	transport.DefaultAuthentication = httptransport.APIKeyAuth("Authorization", "header", "token")

	startedVm, err := startVmOnHost(client, "vmId", "hostId2")
	if err != nil {
		panic(err.Error())
	}
  // handle started vm
}

func startVmOnHost(
	client *apiclient.Cloudtower,
	vmId string,
	hostId string) (*models.VM, error) {
	startParams := vm.NewStartVMParams()
	startParams.RequestBody = &models.VMStartParams{
		Where: &models.VMWhereInput{
			ID: pointy.String(vmId),
		},
		Data: &models.VMStartParamsData{
			HostID: pointy.String(hostId),
		},
	}
	startRes, err := client.VM.StartVM(startParams)
	if err != nil {
		return nil, err
	}
	withTaskVm := startRes.Payload[0]
	err = utils.WaitTask(context.TODO(), client, withTaskVm.TaskID, 1*time.Second)
	if err != nil {
		return nil, err
	}
	getVmParams := vm.NewGetVmsParams()
	getVmParams.RequestBody = &models.GetVmsRequestBody{
		Where: &models.VMWhereInput{
			ID: withTaskVm.Data.ID,
		},
	}
	queryRes, err := client.VM.GetVms(getVmParams)
	if err != nil {
		return nil, err
	}
	return queryRes.Payload[0], nil
}
```

#### Shutting down virtual machines

##### Shutting down a specific virtual machine

```go
package main

import (
	"time"
	"context"
	"github.com/openlyinc/pointy"
	apiclient "github.com/smartxworks/cloudtower-go-sdk/v2/client"
	"github.com/smartxworks/cloudtower-go-sdk/v2/client/vm"
	"github.com/smartxworks/cloudtower-go-sdk/v2/models"
	"github.com/smartxworks/cloudtower-go-sdk/v2/utils"

	httptransport "github.com/go-openapi/runtime/client"

	"github.com/go-openapi/strfmt"
)

func main() {
	transport := httptransport.New("192.168.36.133", "/v2/api", []string{"http"})
	client := apiclient.New(transport, strfmt.Default)
	transport.DefaultAuthentication = httptransport.APIKeyAuth("Authorization", "header", "token")

	shutdownVm, err := shutdownVm(client, "vmId")
	if err != nil {
		panic(err.Error())
	}
  // handle shutdown vm
}

func shutdownVm(
	client *apiclient.Cloudtower,
	vmId string) (*models.VM, error) {
	shutdownParams := vm.NewShutDownVMParams()
	shutdownParams.RequestBody = &models.VMOperateParams{
		Where: &models.VMWhereInput{
			ID: pointy.String(vmId),
		},
	}
	shutdownRes, err := client.VM.ShutDownVM(shutdownParams)
	if err != nil {
		return nil, err
	}
	withTaskVm := shutdownRes.Payload[0]
	err = utils.WaitTask(context.TODO(), client, withTaskVm.TaskID, 1*time.Second)
	if err != nil {
		return nil, err
	}
	getVmParams := vm.NewGetVmsParams()
	getVmParams.RequestBody = &models.GetVmsRequestBody{
		Where: &models.VMWhereInput{
			ID: withTaskVm.Data.ID,
		},
	}
	queryRes, err := client.VM.GetVms(getVmParams)
	if err != nil {
		return nil, err
	}
	return queryRes.Payload[0], nil
}
```

##### Shutting down virtual machines in batches

```go
package main

import (
	"fmt"
	"time"
	"context"

	"github.com/openlyinc/pointy"
	apiclient "github.com/smartxworks/cloudtower-go-sdk/v2/client"
	"github.com/smartxworks/cloudtower-go-sdk/v2/client/vm"
	"github.com/smartxworks/cloudtower-go-sdk/v2/models"
	"github.com/smartxworks/cloudtower-go-sdk/v2/utils"
	"github.com/thoas/go-funk"

	httptransport "github.com/go-openapi/runtime/client"

	"github.com/go-openapi/strfmt"
)

func main() {
	transport := httptransport.New("192.168.36.133", "/v2/api", []string{"http"})
	client := apiclient.New(transport, strfmt.Default)
	transport.DefaultAuthentication = httptransport.APIKeyAuth("Authorization", "header", "token")

	shutdownVms, err := shutdownVmsByQuery(client, &models.VMWhereInput{
		IDIn: []string{"vmId"},
	})
	if err != nil {
		panic(err.Error())
	}
  // handle shutdown vms
}

func shutdownVmsByQuery(client *apiclient.Cloudtower,
	where *models.VMWhereInput) ([]*models.VM, error) {
	shutdownParams := vm.NewShutDownVMParams()
	shutdownParams.RequestBody = &models.VMOperateParams{
		Where: where,
	}
	shutdownRes, err := client.VM.ShutDownVM(shutdownParams)
	if err != nil {
		return nil, err
	}
	withTaskVms := shutdownRes.Payload
	taskIds, valid := funk.Map(withTaskVms, func(vm *models.WithTaskVM) string {
		return *vm.TaskID
	}).([]string)
	if !valid {
		return nil, fmt.Errorf("failed to parse task ids")
	}
	vmIds, valid := funk.Map(withTaskVms, func(vm *models.WithTaskVM) string {
		return *vm.Data.ID
	}).([]string)
	if !valid {
		return nil, fmt.Errorf("failed to parse vm ids")
	}
	err = utils.WaitTasks(context.TODO(), client, taskIds, 1*time.Second)
	if err != nil {
		return nil, err
	}
	getVmParams := vm.NewGetVmsParams()
	getVmParams.RequestBody = &models.GetVmsRequestBody{
		Where: &models.VMWhereInput{
			IDIn: vmIds,
		},
	}
	queryRes, err := client.VM.GetVms(getVmParams)
	if err != nil {
		return nil, err
	}
	return queryRes.Payload, nil
}
```

##### Forcibly powering off a specific virtual machine

```go
package main

import (
	"time"
	"context"
	"github.com/openlyinc/pointy"
	apiclient "github.com/smartxworks/cloudtower-go-sdk/v2/client"
	"github.com/smartxworks/cloudtower-go-sdk/v2/client/vm"
	"github.com/smartxworks/cloudtower-go-sdk/v2/models"
	"github.com/smartxworks/cloudtower-go-sdk/v2/utils"

	httptransport "github.com/go-openapi/runtime/client"

	"github.com/go-openapi/strfmt"
)

func main() {
	transport := httptransport.New("192.168.36.133", "/v2/api", []string{"http"})
	client := apiclient.New(transport, strfmt.Default)
	transport.DefaultAuthentication = httptransport.APIKeyAuth("Authorization", "header", "token")

	shutdownVm, err := forceShutdownVm(client, "vmId")
	if err != nil {
		panic(err.Error())
	}
  // handle shutdown vm
}

func forceShutdownVm(
	client *apiclient.Cloudtower,
	vmId string) (*models.VM, error) {
	shutdownParams := vm.NewForceShutDownVMParams()
	shutdownParams.RequestBody = &models.VMOperateParams{
		Where: &models.VMWhereInput{
			ID: pointy.String(vmId),
		},
	}
	shutdownRes, err := client.VM.ForceShutDownVM(shutdownParams)
	if err != nil {
		return nil, err
	}
	withTaskVm := shutdownRes.Payload[0]
	err = utils.WaitTask(context.TODO(), client, withTaskVm.TaskID, 1*time.Second)
	if err != nil {
		return nil, err
	}
	getVmParams := vm.NewGetVmsParams()
	getVmParams.RequestBody = &models.GetVmsRequestBody{
		Where: &models.VMWhereInput{
			ID: withTaskVm.Data.ID,
		},
	}
	queryRes, err := client.VM.GetVms(getVmParams)
	if err != nil {
		return nil, err
	}
	return queryRes.Payload[0], nil
}
```

##### Forcibly powering off virtual machines in batches

```go
package main

import (
	"fmt"
	"time"
	"context"

	apiclient "github.com/smartxworks/cloudtower-go-sdk/v2/client"
	"github.com/smartxworks/cloudtower-go-sdk/v2/client/vm"
	"github.com/smartxworks/cloudtower-go-sdk/v2/models"
	"github.com/smartxworks/cloudtower-go-sdk/v2/utils"
	"github.com/thoas/go-funk"

	httptransport "github.com/go-openapi/runtime/client"

	"github.com/go-openapi/strfmt"
)

func main() {
	transport := httptransport.New("192.168.36.133", "/v2/api", []string{"http"})
	client := apiclient.New(transport, strfmt.Default)
	transport.DefaultAuthentication = httptransport.APIKeyAuth("Authorization", "header", "token")

	shutdownVms, err := forceshutdownVmsByQuery(client, &models.VMWhereInput{
		IDIn: []string{"vmId"},
	})
	if err != nil {
		panic(err.Error())
	}
  // handle shutdown vms
}


func forceshutdownVmsByQuery(client *apiclient.Cloudtower,
	where *models.VMWhereInput) ([]*models.VM, error) {
	shutdownParams := vm.NewForceShutDownVMParams()
	shutdownParams.RequestBody = &models.VMOperateParams{
		Where: where,
	}
	shutdownRes, err := client.VM.ForceShutDownVM(shutdownParams)
	if err != nil {
		return nil, err
	}
	withTaskVms := shutdownRes.Payload
	taskIds, valid := funk.Map(withTaskVms, func(vm *models.WithTaskVM) string {
		return *vm.TaskID
	}).([]string)
	if !valid {
		return nil, fmt.Errorf("failed to parse task ids")
	}
	vmIds, valid := funk.Map(withTaskVms, func(vm *models.WithTaskVM) string {
		return *vm.Data.ID
	}).([]string)
	if !valid {
		return nil, fmt.Errorf("failed to parse vm ids")
	}
	err = utils.WaitTasks(context.TODO(), client, taskIds, 1*time.Second)
	if err != nil {
		return nil, err
	}
	getVmParams := vm.NewGetVmsParams()
	getVmParams.RequestBody = &models.GetVmsRequestBody{
		Where: &models.VMWhereInput{
			IDIn: vmIds,
		},
	}
	queryRes, err := client.VM.GetVms(getVmParams)
	if err != nil {
		return nil, err
	}
	return queryRes.Payload, nil
}

```

#### Restrating virtual machines

##### Restarting a specific virtual machine

```go
package main

import (
	"time"
	"context"
	"github.com/openlyinc/pointy"
	apiclient "github.com/smartxworks/cloudtower-go-sdk/v2/client"
	"github.com/smartxworks/cloudtower-go-sdk/v2/client/vm"
	"github.com/smartxworks/cloudtower-go-sdk/v2/models"
	"github.com/smartxworks/cloudtower-go-sdk/v2/utils"

	httptransport "github.com/go-openapi/runtime/client"

	"github.com/go-openapi/strfmt"
)

func main() {
	transport := httptransport.New("192.168.36.133", "/v2/api", []string{"http"})
	client := apiclient.New(transport, strfmt.Default)
	transport.DefaultAuthentication = httptransport.APIKeyAuth("Authorization", "header", "token")

	restartedVm, err := restartVm(client, "vmId")
	if err != nil {
		panic(err.Error())
	}
  // handle restarted vm
}

func restartVm(
	client *apiclient.Cloudtower,
	vmId string) (*models.VM, error) {
	restartParams := vm.NewRestartVMParams()
	restartParams.RequestBody = &models.VMOperateParams{
		Where: &models.VMWhereInput{
			ID: pointy.String(vmId),
		},
	}
	restartRes, err := client.VM.RestartVM(restartParams)
	if err != nil {
		return nil, err
	}
	withTaskVm := restartRes.Payload[0]
	err = utils.WaitTask(context.TODO(), client, withTaskVm.TaskID, 1*time.Second)
	if err != nil {
		return nil, err
	}
	getVmParams := vm.NewGetVmsParams()
	getVmParams.RequestBody = &models.GetVmsRequestBody{
		Where: &models.VMWhereInput{
			ID: withTaskVm.Data.ID,
		},
	}
	queryRes, err := client.VM.GetVms(getVmParams)
	if err != nil {
		return nil, err
	}
	return queryRes.Payload[0], nil
}
```

##### Restarting virtual machines in batches

```go
package main

import (
	"fmt"
	"time"
	"context"

	apiclient "github.com/smartxworks/cloudtower-go-sdk/v2/client"
	"github.com/smartxworks/cloudtower-go-sdk/v2/client/vm"
	"github.com/smartxworks/cloudtower-go-sdk/v2/models"
	"github.com/smartxworks/cloudtower-go-sdk/v2/utils"
	"github.com/thoas/go-funk"

	httptransport "github.com/go-openapi/runtime/client"

	"github.com/go-openapi/strfmt"
)

func main() {
	transport := httptransport.New("192.168.36.133", "/v2/api", []string{"http"})
	client := apiclient.New(transport, strfmt.Default)
	transport.DefaultAuthentication = httptransport.APIKeyAuth("Authorization", "header", "token")

  	restartedVms, err := restartVmsByQuery(client, &models.VMWhereInput{
		IDIn: []string{"vmId"},
	})
	if err != nil {
		panic(err.Error())
	}
  // handle restarted vms
}

func restartVmsByQuery(client *apiclient.Cloudtower,
	where *models.VMWhereInput) ([]*models.VM, error) {
	restartParams := vm.NewRestartVMParams()
	restartParams.RequestBody = &models.VMOperateParams{
		Where: where,
	}
	restartRes, err := client.VM.RestartVM(restartParams)
	if err != nil {
		return nil, err
	}
	withTaskVms := restartRes.Payload
	taskIds, valid := funk.Map(withTaskVms, func(vm *models.WithTaskVM) string {
		return *vm.TaskID
	}).([]string)
	if !valid {
		return nil, fmt.Errorf("failed to parse task ids")
	}
	vmIds, valid := funk.Map(withTaskVms, func(vm *models.WithTaskVM) string {
		return *vm.Data.ID
	}).([]string)
	if !valid {
		return nil, fmt.Errorf("failed to parse vm ids")
	}
	err = utils.WaitTasks(context.TODO(), client, taskIds, 1*time.Second)
	if err != nil {
		return nil, err
	}
	getVmParams := vm.NewGetVmsParams()
	getVmParams.RequestBody = &models.GetVmsRequestBody{
		Where: &models.VMWhereInput{
			IDIn: vmIds,
		},
	}
	queryRes, err := client.VM.GetVms(getVmParams)
	if err != nil {
		return nil, err
	}
	return queryRes.Payload, nil
}
```

##### Forcibly restarting a specific virtual machine

```go
package main

import (
	"time"
	"context"
	"github.com/openlyinc/pointy"
	apiclient "github.com/smartxworks/cloudtower-go-sdk/v2/client"
	"github.com/smartxworks/cloudtower-go-sdk/v2/client/vm"
	"github.com/smartxworks/cloudtower-go-sdk/v2/models"
	"github.com/smartxworks/cloudtower-go-sdk/v2/utils"

	httptransport "github.com/go-openapi/runtime/client"

	"github.com/go-openapi/strfmt"
)

func main() {
	transport := httptransport.New("192.168.36.133", "/v2/api", []string{"http"})
	client := apiclient.New(transport, strfmt.Default)
	transport.DefaultAuthentication = httptransport.APIKeyAuth("Authorization", "header", "token")

	restartedVm, err := forceRestartVm(client, "vmId")
	if err != nil {
		panic(err.Error())
	}
  // handle restarted vm
}

func forceRestartVm(
	client *apiclient.Cloudtower,
	vmId string) (*models.VM, error) {
	restartParams := vm.NewForceRestartVMParams()
	restartParams.RequestBody = &models.VMOperateParams{
		Where: &models.VMWhereInput{
			ID: pointy.String(vmId),
		},
	}
	shutdownRes, err := client.VM.ForceRestartVM(restartParams)
	if err != nil {
		return nil, err
	}
	withTaskVm := shutdownRes.Payload[0]
	err = utils.WaitTask(context.TODO(), client, withTaskVm.TaskID, 1*time.Second)
	if err != nil {
		return nil, err
	}
	getVmParams := vm.NewGetVmsParams()
	getVmParams.RequestBody = &models.GetVmsRequestBody{
		Where: &models.VMWhereInput{
			ID: withTaskVm.Data.ID,
		},
	}
	queryRes, err := client.VM.GetVms(getVmParams)
	if err != nil {
		return nil, err
	}
	return queryRes.Payload[0], nil
}
```

##### Forcibly restarting virtual machines in batches

```go
package main

import (
	"fmt"
	"time"
	"context"

	apiclient "github.com/smartxworks/cloudtower-go-sdk/v2/client"
	"github.com/smartxworks/cloudtower-go-sdk/v2/client/vm"
	"github.com/smartxworks/cloudtower-go-sdk/v2/models"
	"github.com/smartxworks/cloudtower-go-sdk/v2/utils"
	"github.com/thoas/go-funk"

	httptransport "github.com/go-openapi/runtime/client"

	"github.com/go-openapi/strfmt"
)

func main() {
	transport := httptransport.New("192.168.36.133", "/v2/api", []string{"http"})
	client := apiclient.New(transport, strfmt.Default)
	transport.DefaultAuthentication = httptransport.APIKeyAuth("Authorization", "header", "token")

	restartedVms, err := forceRestartVmsByQuery(client, &models.VMWhereInput{
		IDIn: []string{"vmId"},
	})
	if err != nil {
		panic(err.Error())
	}
  // handle restarted vms
}

func forceRestartVmsByQuery(client *apiclient.Cloudtower,
	where *models.VMWhereInput) ([]*models.VM, error) {
	restartParams := vm.NewForceRestartVMParams()
	restartParams.RequestBody = &models.VMOperateParams{
		Where: where,
	}
	startRes, err := client.VM.ForceRestartVM(restartParams)
	if err != nil {
		return nil, err
	}
	withTaskVms := startRes.Payload
	taskIds, valid := funk.Map(withTaskVms, func(vm *models.WithTaskVM) string {
		return *vm.TaskID
	}).([]string)
	if !valid {
		return nil, fmt.Errorf("failed to parse task ids")
	}
	vmIds, valid := funk.Map(withTaskVms, func(vm *models.WithTaskVM) string {
		return *vm.Data.ID
	}).([]string)
	if !valid {
		return nil, fmt.Errorf("failed to parse vm ids")
	}
	err = utils.WaitTasks(context.TODO(), client, taskIds, 1*time.Second)
	if err != nil {
		return nil, err
	}
	getVmParams := vm.NewGetVmsParams()
	getVmParams.RequestBody = &models.GetVmsRequestBody{
		Where: &models.VMWhereInput{
			IDIn: vmIds,
		},
	}
	queryRes, err := client.VM.GetVms(getVmParams)
	if err != nil {
		return nil, err
	}
	return queryRes.Payload, nil
}
```

#### Suspending virtual machines

##### Suspending a specific virtual machine

```go
package main

import (
	"time"
	"context"

	"github.com/openlyinc/pointy"
	apiclient "github.com/smartxworks/cloudtower-go-sdk/v2/client"
	"github.com/smartxworks/cloudtower-go-sdk/v2/client/vm"
	"github.com/smartxworks/cloudtower-go-sdk/v2/models"
	"github.com/smartxworks/cloudtower-go-sdk/v2/utils"

	httptransport "github.com/go-openapi/runtime/client"

	"github.com/go-openapi/strfmt"
)

func main() {
	transport := httptransport.New("192.168.36.133", "/v2/api", []string{"http"})
	client := apiclient.New(transport, strfmt.Default)
	transport.DefaultAuthentication = httptransport.APIKeyAuth("Authorization", "header", "token")

	suspendedVm, err := suspendVm(client, "vmId")
	if err != nil {
		panic(err.Error())
	}
  // handle suspended vm
}

func suspendVm(
	client *apiclient.Cloudtower,
	vmId string) (*models.VM, error) {
	suspendParams := vm.NewSuspendVMParams()
	suspendParams.RequestBody = &models.VMOperateParams{
		Where: &models.VMWhereInput{
			ID: pointy.String(vmId),
		},
	}
	shutdownRes, err := client.VM.SuspendVM(suspendParams)
	if err != nil {
		return nil, err
	}
	withTaskVm := shutdownRes.Payload[0]
	err = utils.WaitTask(context.TODO(), client, withTaskVm.TaskID, 1*time.Second)
	if err != nil {
		return nil, err
	}
	getVmParams := vm.NewGetVmsParams()
	getVmParams.RequestBody = &models.GetVmsRequestBody{
		Where: &models.VMWhereInput{
			ID: withTaskVm.Data.ID,
		},
	}
	queryRes, err := client.VM.GetVms(getVmParams)
	if err != nil {
		return nil, err
	}
	return queryRes.Payload[0], nil
}
```

##### Suspending virtual machines in batches

```go
package main

import (
	"fmt"
	"time"
	"context"

	apiclient "github.com/smartxworks/cloudtower-go-sdk/v2/client"
	"github.com/smartxworks/cloudtower-go-sdk/v2/client/vm"
	"github.com/smartxworks/cloudtower-go-sdk/v2/models"
	"github.com/smartxworks/cloudtower-go-sdk/v2/utils"
	"github.com/thoas/go-funk"

	httptransport "github.com/go-openapi/runtime/client"

	"github.com/go-openapi/strfmt"
)

func main() {
	transport := httptransport.New("192.168.36.133", "/v2/api", []string{"http"})
	client := apiclient.New(transport, strfmt.Default)
	transport.DefaultAuthentication = httptransport.APIKeyAuth("Authorization", "header", "token")

	suspendedVms, err := suspendVmsByQuery(client, &models.VMWhereInput{
		IDIn: []string{"vmId"},
	})
	if err != nil {
		panic(err.Error())
	}
	// handle restarted vms
	print(suspendedVms)
}

func suspendVmsByQuery(client *apiclient.Cloudtower,
	where *models.VMWhereInput) ([]*models.VM, error) {
	suspendParams := vm.NewSuspendVMParams()
	suspendParams.RequestBody = &models.VMOperateParams{
		Where: where,
	}
	suspendRes, err := client.VM.SuspendVM(suspendParams)
	if err != nil {
		return nil, err
	}
	withTaskVms := suspendRes.Payload
	taskIds, valid := funk.Map(withTaskVms, func(vm *models.WithTaskVM) string {
		return *vm.TaskID
	}).([]string)
	if !valid {
		return nil, fmt.Errorf("failed to parse task ids")
	}
	vmIds, valid := funk.Map(withTaskVms, func(vm *models.WithTaskVM) string {
		return *vm.Data.ID
	}).([]string)
	if !valid {
		return nil, fmt.Errorf("failed to parse vm ids")
	}
	err = utils.WaitTasks(context.TODO(), client, taskIds, 1*time.Second)
	if err != nil {
		return nil, err
	}
	getVmParams := vm.NewGetVmsParams()
	getVmParams.RequestBody = &models.GetVmsRequestBody{
		Where: &models.VMWhereInput{
			IDIn: vmIds,
		},
	}
	queryRes, err := client.VM.GetVms(getVmParams)
	if err != nil {
		return nil, err
	}
	return queryRes.Payload, nil
}

```

#### Resuming virtual machines

##### Resuming a specific virtual machine

```go
package main

import (
	"time"
	"context"
	"github.com/openlyinc/pointy"
	apiclient "github.com/smartxworks/cloudtower-go-sdk/v2/client"
	"github.com/smartxworks/cloudtower-go-sdk/v2/client/vm"
	"github.com/smartxworks/cloudtower-go-sdk/v2/models"
	"github.com/smartxworks/cloudtower-go-sdk/v2/utils"

	httptransport "github.com/go-openapi/runtime/client"

	"github.com/go-openapi/strfmt"
)

func main() {
	transport := httptransport.New("192.168.36.133", "/v2/api", []string{"http"})
	client := apiclient.New(transport, strfmt.Default)
	transport.DefaultAuthentication = httptransport.APIKeyAuth("Authorization", "header", "token")

	resumedVm, err := resumeVm(client, "vmId")
	if err != nil {
		panic(err.Error())
	}
  // handle resumed vm
}

func resumeVm(
	client *apiclient.Cloudtower,
	vmId string) (*models.VM, error) {
	resumeVmParams := vm.NewResumeVMParams()
	resumeVmParams.RequestBody = &models.VMOperateParams{
		Where: &models.VMWhereInput{
			ID: pointy.String(vmId),
		},
	}
	resumeRes, err := client.VM.ResumeVM(resumeVmParams)
	if err != nil {
		return nil, err
	}
	withTaskVm := resumeRes.Payload[0]
	err = utils.WaitTask(context.TODO(), client, withTaskVm.TaskID, 1*time.Second)
	if err != nil {
		return nil, err
	}
	getVmParams := vm.NewGetVmsParams()
	getVmParams.RequestBody = &models.GetVmsRequestBody{
		Where: &models.VMWhereInput{
			ID: withTaskVm.Data.ID,
		},
	}
	queryRes, err := client.VM.GetVms(getVmParams)
	if err != nil {
		return nil, err
	}
	return queryRes.Payload[0], nil
}
```

##### Resuming virtual machines in batches

```go
package main

import (
	"fmt"
	"time"
	"context"

	apiclient "github.com/smartxworks/cloudtower-go-sdk/v2/client"
	"github.com/smartxworks/cloudtower-go-sdk/v2/client/vm"
	"github.com/smartxworks/cloudtower-go-sdk/v2/models"
	"github.com/smartxworks/cloudtower-go-sdk/v2/utils"
	"github.com/thoas/go-funk"

	httptransport "github.com/go-openapi/runtime/client"

	"github.com/go-openapi/strfmt"
)

func main() {
	transport := httptransport.New("192.168.36.133", "/v2/api", []string{"http"})
	client := apiclient.New(transport, strfmt.Default)
	transport.DefaultAuthentication = httptransport.APIKeyAuth("Authorization", "header", "token")

	resumedVms, err := resumeVmsByQuery(client, &models.VMWhereInput{
		IDIn: []string{"vmId"},
	})
	if err != nil {
		panic(err.Error())
	}
  // handle resumed vms
}

func resumeVmsByQuery(client *apiclient.Cloudtower,
	where *models.VMWhereInput) ([]*models.VM, error) {
	resumeParams := vm.NewResumeVMParams()
	resumeParams.RequestBody = &models.VMOperateParams{
		Where: where,
	}
	resumeRes, err := client.VM.ResumeVM(resumeParams)
	if err != nil {
		return nil, err
	}
	withTaskVms := resumeRes.Payload
	taskIds, valid := funk.Map(withTaskVms, func(vm *models.WithTaskVM) string {
		return *vm.TaskID
	}).([]string)
	if !valid {
		return nil, fmt.Errorf("failed to parse task ids")
	}
	vmIds, valid := funk.Map(withTaskVms, func(vm *models.WithTaskVM) string {
		return *vm.Data.ID
	}).([]string)
	if !valid {
		return nil, fmt.Errorf("failed to parse vm ids")
	}
	err = utils.WaitTasks(context.TODO(), client, taskIds, 1*time.Second)
	if err != nil {
		return nil, err
	}
	getVmParams := vm.NewGetVmsParams()
	getVmParams.RequestBody = &models.GetVmsRequestBody{
		Where: &models.VMWhereInput{
			IDIn: vmIds,
		},
	}
	queryRes, err := client.VM.GetVms(getVmParams)
	if err != nil {
		return nil, err
	}
	return queryRes.Payload, nil
}

```

### Deleting a virtual machine

#### Recycle bin

##### Moving virtual machines to the recycle bin

```go
package main

import (
	"time"
	"context"
	"github.com/openlyinc/pointy"
	apiclient "github.com/smartxworks/cloudtower-go-sdk/v2/client"
	"github.com/smartxworks/cloudtower-go-sdk/v2/client/vm"
	"github.com/smartxworks/cloudtower-go-sdk/v2/models"
	"github.com/smartxworks/cloudtower-go-sdk/v2/utils"

	httptransport "github.com/go-openapi/runtime/client"

	"github.com/go-openapi/strfmt"
)

func main() {
	transport := httptransport.New("192.168.36.133", "/v2/api", []string{"http"})
	client := apiclient.New(transport, strfmt.Default)
	transport.DefaultAuthentication = httptransport.APIKeyAuth("Authorization", "header", "token")

	vmInRecycleBin, err := moveVmToRecycleBin(client, "vmId")

	if err != nil {
		panic(err.Error())
	}
	// fmt.Print(vms)
	print(vmInRecycleBin)
}

func moveVmToRecycleBin(
	client *apiclient.Cloudtower,
	vmId string) (*models.VM, error) {
	moveParams := vm.NewMoveVMToRecycleBinParams()
	moveParams.RequestBody = &models.VMOperateParams{
		Where: &models.VMWhereInput{
			ID: pointy.String(vmId),
		},
	}
	moveRes, err := client.VM.MoveVMToRecycleBin(moveParams)
	if err != nil {
		return nil, err
	}
	withTaskVm := moveRes.Payload[0]
	err = utils.WaitTask(context.TODO(), client, withTaskVm.TaskID, 1*time.Second)
	if err != nil {
		return nil, err
	}
	getVmParams := vm.NewGetVmsParams()
	getVmParams.RequestBody = &models.GetVmsRequestBody{
		Where: &models.VMWhereInput{
			ID: withTaskVm.Data.ID,
		},
	}
	queryRes, err := client.VM.GetVms(getVmParams)
	if err != nil {
		return nil, err
	}
	return queryRes.Payload[0], nil
}
```

##### Restoring virtual machines from the recycle bin

```go
package main

import (
	"time"
	"context"

	"github.com/openlyinc/pointy"
	apiclient "github.com/smartxworks/cloudtower-go-sdk/v2/client"
	"github.com/smartxworks/cloudtower-go-sdk/v2/client/vm"
	"github.com/smartxworks/cloudtower-go-sdk/v2/models"
	"github.com/smartxworks/cloudtower-go-sdk/v2/utils"

	httptransport "github.com/go-openapi/runtime/client"

	"github.com/go-openapi/strfmt"
)

func main() {
	transport := httptransport.New("192.168.36.133", "/v2/api", []string{"http"})
	client := apiclient.New(transport, strfmt.Default)
	transport.DefaultAuthentication = httptransport.APIKeyAuth("Authorization", "header", "token")

	vmInRecycleBin, err := recoverVmFromRecycleBin(client, "vmId")

	if err != nil {
		panic(err.Error())
	}
	// fmt.Print(vms)
	print(vmInRecycleBin)
}

func recoverVmFromRecycleBin(
	client *apiclient.Cloudtower,
	vmId string) (*models.VM, error) {
	recoverParams := vm.NewRecoverVMFromRecycleBinParams()
	recoverParams.RequestBody = &models.VMOperateParams{
		Where: &models.VMWhereInput{
			ID: pointy.String(vmId),
		},
	}
	recoverRes, err := client.VM.RecoverVMFromRecycleBin(recoverParams)
	if err != nil {
		return nil, err
	}
	withTaskVm := recoverRes.Payload[0]
	err = utils.WaitTask(context.TODO(), client, withTaskVm.TaskID, 1*time.Second)
	if err != nil {
		return nil, err
	}
	getVmParams := vm.NewGetVmsParams()
	getVmParams.RequestBody = &models.GetVmsRequestBody{
		Where: &models.VMWhereInput{
			ID: withTaskVm.Data.ID,
		},
	}
	queryRes, err := client.VM.GetVms(getVmParams)
	if err != nil {
		return nil, err
	}
	return queryRes.Payload[0], nil
}
```

#### Permanently deleting virtual machines

```go
package main

import (
	"time"
	"context"
	"github.com/openlyinc/pointy"
	apiclient "github.com/smartxworks/cloudtower-go-sdk/v2/client"
	"github.com/smartxworks/cloudtower-go-sdk/v2/client/vm"
	"github.com/smartxworks/cloudtower-go-sdk/v2/models"
	"github.com/smartxworks/cloudtower-go-sdk/v2/utils"

	httptransport "github.com/go-openapi/runtime/client"

	"github.com/go-openapi/strfmt"
)

func main() {
	transport := httptransport.New("192.168.36.133", "/v2/api", []string{"http"})
	client := apiclient.New(transport, strfmt.Default)
	transport.DefaultAuthentication = httptransport.APIKeyAuth("Authorization", "header", "token")

	err := deleteVm(client, "vmId")

	if err != nil {
		panic(err.Error())
	}
}

func deleteVm(
	client *apiclient.Cloudtower,
	vmId string) error {
	deleteParams := vm.NewDeleteVMParams()
	deleteParams.RequestBody = &models.VMOperateParams{
		Where: &models.VMWhereInput{
			ID: pointy.String(vmId),
		},
	}
	deleteRes, err := client.VM.DeleteVM(deleteParams)
	if err != nil {
		return err
	}
	withTaskVm := deleteRes.Payload[0]
	err = utils.WaitTask(context.TODO(), client, withTaskVm.TaskID, 1*time.Second)
	if err != nil {
		return err
	}
	return nil
}
```

## Scenario examples

### Backing up a virtual machine

```go
package main

import (
	"fmt"
	"time"
	"context"

	apiclient "github.com/smartxworks/cloudtower-go-sdk/v2/client"
	"github.com/smartxworks/cloudtower-go-sdk/v2/client/iscsi_lun_snapshot"
	"github.com/smartxworks/cloudtower-go-sdk/v2/client/user"
	"github.com/smartxworks/cloudtower-go-sdk/v2/client/vm"
	"github.com/smartxworks/cloudtower-go-sdk/v2/client/vm_snapshot"
	"github.com/smartxworks/cloudtower-go-sdk/v2/models"
	"github.com/smartxworks/cloudtower-go-sdk/v2/utils"
	"github.com/openlyinc/pointy"
	"github.com/thoas/go-funk"

	httptransport "github.com/go-openapi/runtime/client"

	"github.com/go-openapi/strfmt"
)

func create_vm_snapshot(
  client *apiclient.Cloudtower,
	targetVmName string,
	targetSnapshotName string,
	consistentType models.ConsistentType) (*models.VMSnapshot, []*models.IscsiLunSnapshot, error) {
	getVmParams := vm.NewGetVmsParams()
	getVmParams.RequestBody = &models.GetVmsRequestBody{
		Where: &models.VMWhereInput{
			Name: &targetVmName,
		},
		First: pointy.Int32(1),
	}
	// 1. Retrieve the information of the virtual machines to be backed up. The VM ID is required to construct the parameters for snapshot creation. 
	getVmRes, err := client.VM.GetVms(getVmParams)
	if err != nil {
		return nil, nil, err
	}
	targetVm := getVmRes.Payload[0]
	vmToolStatus := *targetVm.VMToolsStatus
	// When VMTools is installed and running on the virtual machine, the consistent_type can be set to FILE_SYSTEM_CONSISTENT to indicate a file-system-consistent snapshot. 
	if vmToolStatus != models.VMToolsStatusRUNNING && consistentType == models.ConsistentTypeFILESYSTEMCONSISTENT {
		consistentType = models.ConsistentTypeCRASHCONSISTENT
	}
	createSnapshotParams := vm_snapshot.NewCreateVMSnapshotParams()
	createSnapshotParams.RequestBody = &models.VMSnapshotCreationParams{
		Data: []*models.VMSnapshotCreationParamsDataItems0{
			{
				VMID:           targetVm.ID,
				Name:           &targetSnapshotName,
				ConsistentType: consistentType.Pointer(),
			},
		},
	}
	// 2. Create virtual machine snapshot
	createRes, err := client.VMSnapshot.CreateVMSnapshot(createSnapshotParams)
	if err != nil {
		return nil, nil, err
	}
	withTaskSnapshot := createRes.Payload[0]
	// 3. Wait till the task completes
	err = utils.WaitTask(context.TODO(), client, withTaskSnapshot.TaskID, 1*time.Second)
	if err != nil {
		return nil, nil, err
	}
	getSnapshotParams := vm_snapshot.NewGetVMSnapshotsParams()
	getSnapshotParams.RequestBody = &models.GetVMSnapshotsRequestBody{
		Where: &models.VMSnapshotWhereInput{
			ID: withTaskSnapshot.Data.ID,
		},
	}
	// 4. Query the generated VM snapshot using the returned ID.
	getSnapshotRes, err := client.VMSnapshot.GetVMSnapshots(getSnapshotParams)
	if err != nil {
		return nil, nil, err
	}
	createdSnapshot := getSnapshotRes.Payload[0]
	// 5. The vm_disks field in the returned snapshot contains information about the virtual disks included in the snapshot. 
	// The DISK type indicates a virtual volume, which includes a snapshot_local_id representing the local_id of the corresponding LUN snapshot. 
	// The CD-ROM type indicates a mounted CD-ROM, for which no LUN snapshot is created.
	lunSnapshotIds := funk.Map(funk.Filter(createdSnapshot.VMDisks, func(disk *models.NestedFrozenDisks) bool {
		return *disk.Type == models.VMDiskTypeDISK
	}), func(disk *models.NestedFrozenDisks) string {
		return *disk.SnapshotLocalID
	}).([]string)
	getLunSnapshotParams := iscsi_lun_snapshot.NewGetIscsiLunSnapshotsParams()
	getLunSnapshotParams.RequestBody = &models.GetIscsiLunSnapshotsRequestBody{
		Where: &models.IscsiLunSnapshotWhereInput{
			NameIn: lunSnapshotIds,
		},
	}
	getLunSnapshotRes, err := client.IscsiLunSnapshot.GetIscsiLunSnapshots(getLunSnapshotParams)
	if err != nil {
		return nil, nil, err
	}
	return createdSnapshot, getLunSnapshotRes.Payload, nil
}
```

### Building dashboard

#### Defining utility methods

```go
import (
	"fmt"

	apiclient "github.com/smartxworks/cloudtower-go-sdk/v2/client"
	"github.com/smartxworks/cloudtower-go-sdk/v2/client/alert"
	"github.com/smartxworks/cloudtower-go-sdk/v2/client/cluster"
	"github.com/smartxworks/cloudtower-go-sdk/v2/client/disk"
	"github.com/smartxworks/cloudtower-go-sdk/v2/client/host"
	"github.com/smartxworks/cloudtower-go-sdk/v2/client/user"
	"github.com/smartxworks/cloudtower-go-sdk/v2/models"
	"github.com/openlyinc/pointy"
	"github.com/thoas/go-funk"

	httptransport "github.com/go-openapi/runtime/client"

	"github.com/go-openapi/strfmt"
)

var ByteUnits []string = []string{"B", "KiB", "MiB", "GiB", "TiB", "PiB"}
var HzUnits []string = []string{"Hz", "KHz", "MHz", "GHz", "THz"}

func formatUnit(base float64, units []string, step int32) string {
	length := len(units)
	if length == 0 {
		panic("No unit provided")
	}
	if base <= 0 {
		return fmt.Sprintf("0%s", units[0])
	}
	for i, unit := range units {
		if base < float64(step) || i == length-1 {
			return fmt.Sprintf("%0.2f%s", base, unit)
		}
		base = base / float64(step)
	}
	return fmt.Sprintf("%0.2f%s", base, units[length-1])
}
```

#### Building alert information

```go
type AlertInfo struct {
	Critical []*models.Alert
	Notice   []*models.Alert
	Info     []*models.Alert
}

func NewAlertInfo(critial []*models.Alert, notice []*models.Alert, info []*models.Alert) *AlertInfo {
	return &AlertInfo{
		Critical: critial,
		Notice:   notice,
		Info:     info,
	}
}

func buildAlertInfo(client *apiclient.Cloudtower, clusterIds []string) (*AlertInfo, error) {
	getAlertParams := alert.NewGetAlertsParams()
	if len(clusterIds) == 0 {
		getAlertParams.RequestBody = &models.GetAlertsRequestBody{
			Where: &models.AlertWhereInput{
				Ended: pointy.Bool(false),
			},
		}
	} else {
		getAlertParams.RequestBody = &models.GetAlertsRequestBody{
			Where: &models.AlertWhereInput{
				Ended: pointy.Bool(false),
				Cluster: &models.ClusterWhereInput{
					IDIn: clusterIds,
				},
			},
		}
	}
	res, err := client.Alert.GetAlerts(getAlertParams)
	if err != nil {
		return nil, err
	}
	var critial []*models.Alert = []*models.Alert{}
	var notice []*models.Alert = []*models.Alert{}
	var info []*models.Alert = []*models.Alert{}
	for _, alert := range res.Payload {
		switch *alert.Severity {
		case "CRITICAL":
			critial = append(critial, alert)
		case "NOTICE":
			notice = append(notice, alert)
		case "INFO":
			info = append(info, alert)
		}
	}
	return NewAlertInfo(critial, notice, info), nil
}
```

#### Building disk information

> Use mechanical hard drives (HDDs) as an example.

```go
type DiskInfo struct {
	Healthy int32
	Warning int32
	Error   int32
	Total   int32
}

func NewDiskInfo() *DiskInfo {
	return &DiskInfo{
		Healthy: 0,
		Warning: 0,
		Error:   0,
		Total:   0,
	}
}

func buildHddInfo(client *apiclient.Cloudtower, clusterIds []string) (*DiskInfo, error) {
	getDiskParams := disk.NewGetDisksParams()
	if len(clusterIds) == 0 {
		getDiskParams.RequestBody = &models.GetDisksRequestBody{}
	} else {
		getDiskParams.RequestBody = &models.GetDisksRequestBody{
			Where: &models.DiskWhereInput{
				Host: &models.HostWhereInput{
					Cluster: &models.ClusterWhereInput{
						IDIn: clusterIds,
					},
				},
			},
		}
	}
	res, err := client.Disk.GetDisks(getDiskParams)
	if err != nil {
		return nil, err
	}
	hddInfo := NewDiskInfo()
	for _, disk := range res.Payload {
		if *disk.Type == models.DiskTypeHDD {
			if funk.Contains(
				[]models.DiskHealthStatus{
					models.DiskHealthStatusHEALTHY,
					models.DiskHealthStatusSUBHEALTHY,
					models.DiskHealthStatusSMARTFAILED,
				},
				*disk.HealthStatus,
			) {
				hddInfo.Error++
			} else if funk.Contains(
				[]models.DiskUsageStatus{
					models.DiskUsageStatusUNMOUNTED,
					models.DiskUsageStatusPARTIALMOUNTED,
				},
				*disk.UsageStatus,
			) {
				hddInfo.Warning++
			} else {
				hddInfo.Healthy++
			}
			hddInfo.Total++
		}
	}
	return hddInfo, nil
}
```

#### Building performance metrics

> Retrieve the number of CPU cores, total CPU frequency, CPU utilization, total memory, used memory, total storage capacity, used storage capacity, failed storage capacity, and available storage capacity of a specified cluster.

```go
type CpuInfo struct {
	TotalCore uint32
	TotalInHz uint64
	Total     string
	UsedInHz  uint64
	Used      string
	Usage     string
}

func NewCpuInfo() *CpuInfo {
	return &CpuInfo{
		TotalCore: 0,
		TotalInHz: 0,
		UsedInHz:  0,
	}
}

func (info *CpuInfo) compute() *CpuInfo {
	info.Total = formatUnit(float64(info.TotalInHz), HzUnits, 1000)
	info.Used = formatUnit(float64(info.UsedInHz), HzUnits, 1000)
	info.Usage = fmt.Sprintf("%0.2f%%", float64(info.UsedInHz)/float64(info.TotalInHz))
	return info
}

type MemoryInfo struct {
	TotalInByte uint64
	Total       string
	UsedInByte  uint64
	Used        string
	Usage       string
}

func NewMemoryInfo() *MemoryInfo {
	return &MemoryInfo{
		TotalInByte: 0,
		UsedInByte:  0,
	}
}

func (info *MemoryInfo) compute() *MemoryInfo {
	info.Total = formatUnit(float64(info.TotalInByte), ByteUnits, 1024)
	info.Used = formatUnit(float64(info.UsedInByte), ByteUnits, 1024)
	info.Usage = fmt.Sprintf("%0.2f%%", float64(info.UsedInByte)/float64(info.TotalInByte))
	return info
}

type StorageInfo struct {
	TotalInByte     uint64
	Total           string
	UsedInByte      uint64
	Used            string
	InvalidInByte   uint64
	Invalid         string
	AvailableInByte uint64
	Available       string
}

func NewStorageInfo() *StorageInfo {
	return &StorageInfo{
		TotalInByte:     0,
		UsedInByte:      0,
		InvalidInByte:   0,
		AvailableInByte: 0,
	}
}

func (info *StorageInfo) compute() *StorageInfo {
	info.AvailableInByte = info.TotalInByte - info.UsedInByte - info.InvalidInByte
	info.Total = formatUnit(float64(info.TotalInByte), ByteUnits, 1024)
	info.Used = formatUnit(float64(info.UsedInByte), ByteUnits, 1024)
	info.Invalid = formatUnit(float64(info.InvalidInByte), ByteUnits, 1024)
	info.Available = formatUnit(float64(info.AvailableInByte), ByteUnits, 1024)
	return info
}

type MetricInfo struct {
	Storage *StorageInfo
	Memory  *MemoryInfo
	Cpu     *CpuInfo
}

func buildMetricsInfo(client *apiclient.Cloudtower, clusters []*models.Cluster, clusterIds []string) (*MetricInfo, error) {
	memory := NewMemoryInfo()
	storage := NewStorageInfo()
	cpu := NewCpuInfo()
	getHostParams := host.NewGetHostsParams()
	if len(clusterIds) == 0 {
		getHostParams.RequestBody = &models.GetHostsRequestBody{}
	} else {
		getHostParams.RequestBody = &models.GetHostsRequestBody{
			Where: &models.HostWhereInput{
				Cluster: &models.ClusterWhereInput{
					IDIn: clusterIds,
				},
			},
		}
	}
	hosts, err := client.Host.GetHosts(getHostParams)
	if err != nil {
		return nil, err
	}
	clusterIdMap := make(map[string]*models.Cluster)
	for _, cluster := range clusters {
		if _, ok := clusterIdMap[*cluster.ID]; !ok {
			clusterIdMap[*cluster.ID] = cluster
		}
		if *cluster.Type == models.ClusterTypeSMTXOS {
			cpu.TotalCore += uint32(*cluster.TotalCPUCores)
			cpu.TotalInHz += uint64(*cluster.TotalCPUHz)
			cpu.UsedInHz += uint64(*cluster.UsedCPUHz)
			if cluster.Hypervisor != nil && *cluster.Hypervisor == models.HypervisorVMWARE {
				memory.TotalInByte += uint64(*cluster.TotalMemoryBytes)
				memory.UsedInByte += uint64(*cluster.UsedMemoryBytes)
			}
		}
		storage.TotalInByte += uint64(*cluster.TotalDataCapacity)
		storage.UsedInByte += uint64(*cluster.UsedDataSpace)
		storage.InvalidInByte += uint64(*cluster.FailureDataSpace)
	}
	for _, host := range hosts.Payload {
		cluster, ok := clusterIdMap[*host.Cluster.ID]
		if ok {
			if *cluster.Hypervisor == models.HypervisorELF {
				memory.TotalInByte += uint64(*host.TotalMemoryBytes)
				memory.UsedInByte += uint64(*host.UsedMemoryBytes)
			}
		}
	}
	storage.compute()
	cpu.compute()
	memory.compute()
	return &MetricInfo{
		Memory:  memory,
		Cpu:     cpu,
		Storage: storage,
	}, nil
}
```

#### Building dashboard

```go
type DashboardInfo struct {
	Metric *MetricInfo
	Hdd    *DiskInfo
	Alert  *AlertInfo
}

func BuildDashboard(client *apiclient.Cloudtower, clusterIds []string) (*DashboardInfo, error) {
	getClusterParams := cluster.NewGetClustersParams()
	if len(clusterIds) == 0 {
		getClusterParams.RequestBody = &models.GetClustersRequestBody{}
	} else {
		getClusterParams.RequestBody = &models.GetClustersRequestBody{
			Where: &models.ClusterWhereInput{
				IDIn: clusterIds,
			},
		}
	}
	res, err := client.Cluster.GetClusters(getClusterParams)
	if err != nil {
		return nil, err
	}
	metrics, err := buildMetricsInfo(client, res.Payload, clusterIds)
	if err != nil {
		return nil, err
	}
	hdd, err := buildHddInfo(client, clusterIds)
	if err != nil {
		return nil, err
	}
	alert, err := buildAlertInfo(client, clusterIds)
	if err != nil {
		return nil, err
	}
	return &DashboardInfo{
		Metric: metrics,
		Hdd:    hdd,
		Alert:  alert,
	}, nil
}
```
