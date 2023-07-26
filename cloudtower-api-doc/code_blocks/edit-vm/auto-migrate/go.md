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
