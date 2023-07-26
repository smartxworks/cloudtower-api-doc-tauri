```go
package main

import (
	"fmt"

	"github.com/openlyinc/pointy"
	apiclient "github.com/smartxworks/cloudtower-go-sdk/client"
	"github.com/smartxworks/cloudtower-go-sdk/client/vm"
	"github.com/smartxworks/cloudtower-go-sdk/models"
	"github.com/smartxworks/cloudtower-go-sdk/utils"
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
	err = utils.WaitTasks(client, taskIds)
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
