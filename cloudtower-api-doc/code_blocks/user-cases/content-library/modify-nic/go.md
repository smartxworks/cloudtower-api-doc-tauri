import CodeBlock from '@theme/CodeBlock'
import CodeTerminology from '@site/code-terminology.json'

<CodeBlock language="go">
{`package main
import (
	"context"
	"fmt"
	"time"
	"github.com/openlyinc/pointy"
	apiclient "github.com/${CodeTerminology["go_github_address"]}/v2/client"
	"github.com/${CodeTerminology["go_github_address"]}/v2/client/cluster"
	"github.com/${CodeTerminology["go_github_address"]}/v2/client/content_library_vm_template"
	"github.com/${CodeTerminology["go_github_address"]}/v2/client/vm"
	"github.com/${CodeTerminology["go_github_address"]}/v2/models"
	"github.com/${CodeTerminology["go_github_address"]}/v2/utils"
	"github.com/thoas/go-funk"
)
func main() {
	client, err := apiclient.NewWithUserConfig(apiclient.ClientConfig{
		Host:     \`${CodeTerminology["example_host"]}\`,
		BasePath: "v2/api",
		Schemes:  []string{"http"},
	}, apiclient.UserConfig{
		Name:     "Name",
		Password: "Password",
		Source:   models.UserSourceLOCAL,
	})
	if err != nil {
		fmt.Println(err)
		return
	}
	cluster_api := client.Cluster
	content_library_vm_template_api := client.ContentLibraryVMTemplate
	vm_api := client.VM
	get_clusters_params := cluster.NewGetClustersParams()
	get_clusters_params.RequestBody = &models.GetClustersRequestBody{
		Where: &models.ClusterWhereInput{
			Name: pointy.String("cluster_name"),
		},
	}
	rawClusters, err := cluster_api.GetClusters(get_clusters_params)
	if err != nil {
		fmt.Println(err)
		return
	}
	clusters := rawClusters.Payload
	get_templates_params := content_library_vm_template.NewGetContentLibraryVMTemplatesParams()
	get_templates_params.RequestBody = &models.GetContentLibraryVMTemplatesRequestBody{
		Where: &models.ContentLibraryVMTemplateWhereInput{
			Name: pointy.String("template_name"),
		},
	}
	rawTemplates, err := content_library_vm_template_api.GetContentLibraryVMTemplates(get_templates_params)
	if err != nil {
		fmt.Println(err)
		return
	}
	templates := rawTemplates.Payload
	create_vm_params := vm.NewCreateVMFromContentLibraryTemplateParams()
	create_vm_params.RequestBody = []*models.VMCreateVMFromContentLibraryTemplateParams{
		{
			TemplateID: templates[0].ID,
			ClusterID:  clusters[0].ID,
			Name:       pointy.String("vm_name"),
			IsFullCopy: pointy.Bool(false),
			VMNics: []*models.VMNicParams{
				{
					ConnectVlanID: pointy.String("vlan_id"),
					Enabled:       pointy.Bool(true),
					Model:         models.VMNicModelVIRTIO.Pointer(),
				},
			},
		},
	}
	rawVms, err := vm_api.CreateVMFromContentLibraryTemplate(create_vm_params)
	if err != nil {
		fmt.Println(err)
		return
	}
	vms := rawVms.Payload
	err = utils.WaitTasks(context.Background(), client, funk.Map(vms, func(withTaskObj *models.WithTaskVM) string {
		return *withTaskObj.TaskID
	}).([]string), 1*time.Second)
	if err != nil {
		fmt.Println(err)
		return
	}
}`}
</CodeBlock>

