import CodeBlock from '@theme/CodeBlock';
import CodeTerminology from '@site/code-terminology.json';

export default function GoAddNic() {
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
	client *${CodeTerminology["go_client"]},
	addVMNicParams *vm.AddVMNicParams) (*models.VM, error) {
	updateRes, err := client.VM.AddVMNic(addVMNicParams)
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
