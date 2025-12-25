import CodeBlock from '@theme/CodeBlock';
import CodeTerminology from '@site/code-terminology.json';

export default function GoBatchSuspend() {
  return (
    <CodeBlock language="go">
{`package main
import (
	"fmt"
	apiclient "github.com/${CodeTerminology["go_github_address"]}/client"
	"github.com/${CodeTerminology["go_github_address"]}/client/vm"
	"github.com/${CodeTerminology["go_github_address"]}/models"
	"github.com/${CodeTerminology["go_github_address"]}/utils"
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
func suspendVmsByQuery(client *${CodeTerminology["go_client"]},
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
}`}
    </CodeBlock>
  );
}
