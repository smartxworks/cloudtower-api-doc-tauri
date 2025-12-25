import CodeBlock from '@theme/CodeBlock';
import CodeTerminology from '@site/code-terminology.json';

export default function GoRecoverFromRecycleBin() {
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
	vmInRecycleBin, err := recoverVmFromRecycleBin(client, "vmId")
	if err != nil {
		panic(err.Error())
	}
	// fmt.Print(vms)
	print(vmInRecycleBin)
}
func recoverVmFromRecycleBin(
	client *${CodeTerminology["go_client"]},
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
