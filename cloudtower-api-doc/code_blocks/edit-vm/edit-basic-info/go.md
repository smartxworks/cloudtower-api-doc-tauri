import CodeBlock from '@theme/CodeBlock';
import CodeTerminology from '@site/code-terminology.json';

export default function GoEditBasicInfo() {
  return (
    <CodeBlock language="go">
{`package main
import (
	"github.com/openlyinc/pointy"
	apiclient "github.com/${CodeTerminology["go_github_address"]}/client"
	"github.com/${CodeTerminology["go_github_address"]}/client/vm"
	"github.com/${CodeTerminology["go_github_address"]}/models"
	"github.com/${CodeTerminology["go_github_address"]}/utils"
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
			Memory:      pointy.Float64(16 * 1024 * 1024 * 1024),
		},
	}
	updatedVm, err := updateVm(client, updateParams)
	if err != nil {
		panic(err.Error())
	}
  // handle updated vm
}
func updateVm(
	client *${CodeTerminology["go_client"]},
	updateParams *vm.UpdateVMParams) (*models.VM, error) {
	updateRes, err := client.VM.UpdateVM(updateParams)
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
}`}
    </CodeBlock>
  );
}
