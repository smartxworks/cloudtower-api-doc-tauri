---
title: Entering and exiting maintenance mode for a host
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';
import CodeBlock from '@theme/CodeBlock';
import CodeTerminology from '@site/code-terminology.json';

## Performing maintenance mode pre-check

Before placing a host in maintenance mode, you need to know which virtual machines need to be shut down. You can obtain this information by following the steps below:

1. Calling the maintenance mode pre-check API to get the $TASK_ID

<Tabs>
<TabItem value="py" label="Python">

<CodeBlock language="python">
{`from ${CodeTerminology["python_from_package"]} import ApiClient, Configuration, HostApi
conf = Configuration(host="http://192.168.96.133/v2/api")
conf.api_key["Authorization"] = "token"
api_client = ApiClient(conf)
host_api = HostApi(api_client)
host_id = ""
precheck_task = host_api.enter_maintenance_mode_precheck({
  "where": {
    "id": host_id
  }
})`}
</CodeBlock>

</TabItem>
<TabItem value="go" label="Golang">

<CodeBlock language="go">
{`package main
import (
	"fmt"
	apiclient "github.com/${CodeTerminology["go_github_address"]}/client"
	"github.com/${CodeTerminology["go_github_address"]}/client/host"
	"github.com/${CodeTerminology["go_github_address"]}/models"
	httptransport "github.com/go-openapi/runtime/client"
)
func main() {
	transport := httptransport.New("192.168.36.133", "/v2/api", []string{"http"})
	client := apiclient.New(transport, strfmt.Default)
	transport.DefaultAuthentication = httptransport.APIKeyAuth("Authorization", "header", "token")
  enterMaintenanceModePrecheckParams := host.EnterMaintenanceModePrecheckParams()
	enterMaintenanceModePrecheckParams.RequestBody = &models.EnterMaintenanceModePrecheckRequestBody{
    Where: &models.HostWhereInput{
      ID: pointy.String("hostId")
    }
  }
  precheckTaskRes, err := client.Host.EnterMaintenanceModePrecheck(enterMaintenanceModePrecheckParams)
}`}
</CodeBlock>

</TabItem>
<TabItem value="java" label="Java">

```java
public class App {

  public static void main(String[] args) throws ApiException {
    ApiClient client = new ApiClient();
    client.setBasePath("http://192.168.96.133/v2/api");
    client.setApiKey("token");
    HostApi hostApi = new HostApi(client);
    Task enterMaintenanceModePrecheckTask = hostApi.enterMaintenanceModePrecheck(new EnterMaintenanceModePrecheckRequestBody().where(new HostWhereInput().id("hostId")));
  }
}
```

</TabItem>
</Tabs>

The `$HOST_ID` is the ID of the host that needs to be placed in maintenance mode. The API returns the following result:

```json
{
    "task_id" : "$TASK_ID"
}
```

2. Retrieve the check results along with the related data.

<Tabs>
<TabItem value="py" label="Python">

<CodeBlock language="python">
{`from ${CodeTerminology["python_from_package"]} import ApiClient, Configuration, HostApi
conf = Configuration(host="http://192.168.96.133/v2/api")
conf.api_key["Authorization"] = "token"
api_client = ApiClient(conf)
host_api = HostApi(api_client)
task_id = ""
precheck_task = host_api.enter_maintenance_mode_precheck_result({
  "where": {
    "id": task_id
  }
})`}
</CodeBlock>

</TabItem>
<TabItem value="go" label="Golang">

<CodeBlock language="go">
{`package main
import (
	"fmt"
	apiclient "github.com/${CodeTerminology["go_github_address"]}/client"
	"github.com/${CodeTerminology["go_github_address"]}/client/host"
	"github.com/${CodeTerminology["go_github_address"]}/models"
	httptransport "github.com/go-openapi/runtime/client"
)
func main() {
	transport := httptransport.New("192.168.36.133", "/v2/api", []string{"http"})
	client := apiclient.New(transport, strfmt.Default)
	transport.DefaultAuthentication = httptransport.APIKeyAuth("Authorization", "header", "token")
  enterMaintenanceModeResultParams := host.EnterMaintenanceModeResultParams()
	enterMaintenanceModeResultParams.RequestBody = &models.EnterMaintenanceModeResultRequestBody{
    Where: &models.TaskWhereInput{
      ID: pointy.String("task_id")
    }
  }
  precheckTaskResultRes, err := client.Host.EnterMaintenanceModePrecheckResult(enterMaintenanceModeParams)
}`}
</CodeBlock>

</TabItem>
<TabItem value="java" label="Java">

```java
public class App {

  public static void main(String[] args) throws ApiException {
    ApiClient client = new ApiClient();
    client.setBasePath("http://192.168.96.133/v2/api");
    client.setApiKey("token");
    HostApi hostApi = new HostApi(client);
    EnterMaintenanceModeResult enterMaintenanceModePrecheckResult = hostApi.enterMaintenanceModePrecheckResult(new EnterMaintenanceModePrecheckResultRequestBody().where(new TaskWhereInput().task_id("taskId")));
  }
}
```

</TabItem>
</Tabs>

The $TASK_ID can be obtained from the first step. The API returns the following result:

```json
{
    "done": true,
    "shutdownVms": ["someVmId1","someVmId2"]
}
```

The `done` field indicates whether the pre-check is complete.
The `shutdownVms` field lists the virtual machines that need to be shut down.

## Placing a host in maintenance mode

1. Call the API to place the host in maintenance mode.

<Tabs>
<TabItem value="py" label="Python">

<CodeBlock language="python">
{`from ${CodeTerminology["python_from_package"]} import ApiClient, Configuration, HostApi
conf = Configuration(host="http://192.168.96.133/v2/api")
conf.api_key["Authorization"] = "token"
api_client = ApiClient(conf)
host_api = HostApi(api_client)
host_id = ""
host_api.enter_maintenance_mode({
  "where": {
    "id": host_id
  },
  "data": {
    "shutdown_vms": ["someVmId1","someVmId2"]
  }
})`}
</CodeBlock>

</TabItem>
<TabItem value="go" label="Golang">

<CodeBlock language="go">
{`package main
import (
	"fmt"
	apiclient "github.com/${CodeTerminology["go_github_address"]}/client"
	"github.com/${CodeTerminology["go_github_address"]}/client/host"
	"github.com/${CodeTerminology["go_github_address"]}/models"
	httptransport "github.com/go-openapi/runtime/client"
)
func main() {
	transport := httptransport.New("192.168.36.133", "/v2/api", []string{"http"})
	client := apiclient.New(transport, strfmt.Default)
	transport.DefaultAuthentication = httptransport.APIKeyAuth("Authorization", "header", "token")
  enterMaintenanceModeParams := host.EnterMaintenanceModeParams()
	enterMaintenanceModeParams.RequestBody = &models.EnterMaintenanceModePrecheckRequestBody{
    Where: &models.HostWhereInput{
      ID: pointy.String("hostId")
    }
    Data: &models.EnterMainteanceModeData{
      ShutdownVms: []string{"someVmId1", "someVmId2"},
    }
  }
  client.Host.EnterMaintenanceMode(enterMaintenanceModeParams)
}`}
</CodeBlock>

</TabItem>
<TabItem value="java" label="Java">

```java
public class App {

  public static void main(String[] args) throws ApiException {
    ApiClient client = new ApiClient();
    client.setBasePath("http://192.168.96.133/v2/api");
    client.setApiKey("token");
    HostApi hostApi = new HostApi(client);
    EnterMainteanceModeData data = new EnterMainteanceModeData()
        .addShutdownVmsItem("someId");

    hostApi.enterMaintenanceMode(new EnterMaintenanceModeRequestBody().where(new HostWhereInput().id("hostId"))).data(data);
  }
}
```

</TabItem>
</Tabs>

The `$HOST_ID` represents the ID of the host that needs to be placed in maintenance mode. `$SHUTDOWN_VMS` is the `shutdownVms` returned in the pre-check.

# Exiting the host from maintenance mode

## Fetching the pre-check result for exiting the host from maintenance mode

When exiting the host from maintenance mode, you need to power on the virtual machines that were shut down and migrate back the virtual machines that were moved away. You can obtain relevant data by following the steps below.

<Tabs>
<TabItem value="py" label="Python">

<CodeBlock language="python">
{`from ${CodeTerminology["python_from_package"]} import ApiClient, Configuration, HostApi
conf = Configuration(host="http://192.168.96.133/v2/api")
conf.api_key["Authorization"] = "token"
api_client = ApiClient(conf)
host_api = HostApi(api_client)
task_id = ""
precheck_task = host_api.enter_maintenance_mode_precheck_result({
  "where": {
    "id": task_id
  }
})`}
</CodeBlock>

</TabItem>
<TabItem value="go" label="Golang">

<CodeBlock language="go">
{`package main
import (
	"fmt"
	apiclient "github.com/${CodeTerminology["go_github_address"]}/client"
	"github.com/${CodeTerminology["go_github_address"]}/client/host"
	"github.com/${CodeTerminology["go_github_address"]}/models"
	httptransport "github.com/go-openapi/runtime/client"
)
func main() {
	transport := httptransport.New("192.168.36.133", "/v2/api", []string{"http"})
	client := apiclient.New(transport, strfmt.Default)
	transport.DefaultAuthentication = httptransport.APIKeyAuth("Authorization", "header", "token")
  exitMaintenanceModeResultParams := host.ExitMaintenanceModeResultParams()
	exitMaintenanceModeResultParams.RequestBody = &models.ExitMaintenanceModeResultRequestBody{
    Where: &models.TaskWhereInput{
      ID: pointy.String("task_id")
    }
  }
  precheckTaskResultRes, err := client.Host.ExitMaintenanceModePrecheckResult(exitMaintenanceModeParams)
}`}
</CodeBlock>

</TabItem>
<TabItem value="java" label="Java">

```java
public class App {

  public static void main(String[] args) throws ApiException {
    ApiClient client = new ApiClient();
    client.setBasePath("http://192.168.96.133/v2/api");
    client.setApiKey("token");
    HostApi hostApi = new HostApi(client);
    ExitMaintenanceModeResult exitMaintenanceModePrecheckResult = hostApi.exitMaintenanceModePrecheckResult(new ExitMaintenanceModePrecheckResultRequestBody().where(new TaskWhereInput().task_id("taskId")));
  }
}
```

</TabItem>
</Tabs>

When exiting the host from maintenance mode, you can directly retrieve the pre-check results. The `$HOST_ID` is the ID of the host to exit maintenance mode. The request results are as follows.

```json
{
  "shutDownVms": [],
  "liveMigrateVms": [],
  "offlineMigrateVms": [
    {
      "state": "done",
      "target_host_name": "test-os-5-1-0X20230906094802X2",
      "verify": {
      "changed": false,
        "reason": ""
      },
      "vm_ha": true,
      "vm_name": "1",
      "vm_state": "stopped",
      "vm_uuid": "faa83c4c-8390-4b63-80e4-9cb2218f249f"
    },
    {
      "state": "done",
      "target_host_name": "test-os-5-1-0X20230906094802X1",
       "verify": {
        "changed": false,
        "reason": ""
      },
      "vm_ha": true,
      "vm_name": "in-recycle-bin-b9e93364-1d87-4de8-b143-d8cf21bc5652",
      "vm_state": "stopped",
      "vm_uuid": "34f30b16-dca3-4d38-9c9a-ec6c147220a7"
    }
  ]
}
```

## Exiting the host from maintenance mode

When exiting the host from maintenance mode, you need to provide the UUIDs of the virtual machines to be powered on and migrated back. You can obtain this information by referring to _Fetching the pre-check result for exiting the host from maintenance mode_.

```js
const result = {
  shutDownVms: [
    {
      vm_uuid: "vm_uuid_1",
      // Other virtual machine-related data
      // ...
    },
  ],
  liveMigrateVms: [
    {
      vm_uuid: "vm_uuid_2",
      // Other virtual machine-related data
      // ...
    },
  ],
  offlineMigrateVms: [
    {
      vm_uuid: "vm_uuid_3",
      // Other virtual machine-related data
      // ...
    },
  ],
};
```

Suppose that the data you have obtained are as above. You then need to:

1. Add the `vm_uuid` from `shutDownVms` to the `poweron_vms` array.
2. Add the `vm_uuid` from `liveMigrateVms` to the `live_migrate_back_vms` array.
3. Add the `vm_uuid` from `offlineMigrateVms` to the `offline_migrate_back_vms` array.

The example is as follows:

<Tabs>
<TabItem value="py" label="Python">

<CodeBlock language="python">
{`from ${CodeTerminology["python_from_package"]} import ApiClient, Configuration, HostApi
conf = Configuration(host="http://192.168.96.133/v2/api")
conf.api_key["Authorization"] = "token"
api_client = ApiClient(conf)
host_api = HostApi(api_client)
host_id = ""
host_api.exit_maintenance_mode({
  "where": {
    "id": host_id
  },
  "data": {
    "poweron_vms": [
      "vm_uuid_1"
    ],
    "live_migrate_back_vms": [
      "vm_uuid_2"
    ],
    "offline_migrate_back_vms": [
      "vm_uuid_3"
    ],
  }
})`}
</CodeBlock>

</TabItem>
<TabItem value="go" label="Golang">

<CodeBlock language="go">
{`package main
import (
	"fmt"
	apiclient "github.com/${CodeTerminology["go_github_address"]}/client"
	"github.com/${CodeTerminology["go_github_address"]}/client/host"
	"github.com/${CodeTerminology["go_github_address"]}/models"
	httptransport "github.com/go-openapi/runtime/client"
)
func main() {
	transport := httptransport.New("192.168.36.133", "/v2/api", []string{"http"})
	client := apiclient.New(transport, strfmt.Default)
	transport.DefaultAuthentication = httptransport.APIKeyAuth("Authorization", "header", "token")
  exitMaintenanceModeParams := host.ExitMaintenanceModeParams()
	exitMaintenanceModeParams.RequestBody = &models.ExitMaintenanceModePrecheckRequestBody{
    Where: &models.HostWhereInput{
      ID: pointy.String("hostId")
    }
    Data: &models.ExitMainteanceModeData{
      PoweronVms: []string{"vm_uuid_1"},
      LiveMigrateBackVms: []string{"vm_uuid_2"},
      OfflineMigrateBackVms: []string{"vm_uuid_3"},
    }
  }
  precheckTaskRes, err := client.Host.ExitMaintenanceMode(exitMaintenanceModeParams)
}`}
</CodeBlock>

</TabItem>
<TabItem value="java" label="Java">

```java
public class App {

  public static void main(String[] args) throws ApiException {
    ApiClient client = new ApiClient();
    client.setBasePath("http://192.168.96.133/v2/api");
    client.setApiKey("token");
    HostApi hostApi = new HostApi(client);
    ExitMainteanceModeData data = new ExitMainteanceModeData()
        .addPoweronVmsItem("vm_uuid_1").addLiveMigrateBackVmsItem("vm_uuid_2").addOfflineMigrateBackVms("vm_uuid_3");

    Task exitMaintenanceModeTask = hostApi.exitMaintenanceMode(new ExitMaintenanceModeRequestBody().where(new HostWhereInput().id("hostId"))).data(data);
  }
}
```

</TabItem>
</Tabs>
