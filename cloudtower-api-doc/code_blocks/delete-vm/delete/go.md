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
	err = utils.WaitTask(client, withTaskVm.TaskID)
	if err != nil {
		return err
	}
	return nil
}
```
