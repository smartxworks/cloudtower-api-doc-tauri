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
	createParams := vm.NewCreateVMParams()
	createParams.RequestBody = []*models.VMCreationParams{
		{
			ClusterID:  pointy.String("clusterId"),
			Name:       pointy.String("test_vm_name"),
			Ha:         pointy.Bool(true),
			CPUCores:   pointy.Int32(4),
			CPUSockets: pointy.Int32(2),
			Memory:     pointy.Float64(8 * 1024 * 1024 * 1024),
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
							Size:             pointy.Float64(10 * 1024 * 1024 * 1024),
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

