```go
package main

import (
	"github.com/openlyinc/pointy"
	apiclient "github.com/smartxworks/cloudtower-go-sdk/client"
	"github.com/smartxworks/cloudtower-go-sdk/client/vm"
	"github.com/smartxworks/cloudtower-go-sdk/models"
	"github.com/smartxworks/cloudtower-go-sdk/utils"

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
	err = utils.WaitTask(client, withTaskVm.TaskID)
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
