---
title: 维护模式
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# 进入维护模式

## 执行维护模式预检查

进入维护模式前，需要知道哪些虚拟机需要被关机。可以通过以下步骤来获取

1. 调用进入维护模式预检查获取到 $TASK_ID

<Tabs>
<TabItem value="py" label="Python">

```python
from cloudtower import ApiClient, Configuration, HostApi

conf = Configuration(host="http://192.168.96.133/v2/api")
conf.api_key["Authorization"] = "token"
api_client = ApiClient(conf)
host_api = HostApi(api_client)

host_id = ""

precheck_task = host_api.enter_maintenance_mode_precheck({
  "where": {
    "id": host_id
  }
})
```

</TabItem>
<TabItem value="go" label="Golang">

```go
package main

import (
	"fmt"

	apiclient "github.com/smartxworks/cloudtower-go-sdk/client"
	"github.com/smartxworks/cloudtower-go-sdk/client/host"
	"github.com/smartxworks/cloudtower-go-sdk/models"

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
}
```

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

其中 $HOST_ID 为需要进入维护模式的主机 id，返回结果如下

```
{
    "task_id" : "$TASK_ID"
}
```

2. 获取检查结果，与相关数据

<Tabs>
<TabItem value="py" label="Python">

```python
from cloudtower import ApiClient, Configuration, HostApi

conf = Configuration(host="http://192.168.96.133/v2/api")
conf.api_key["Authorization"] = "token"
api_client = ApiClient(conf)
host_api = HostApi(api_client)

task_id = ""

precheck_task = host_api.enter_maintenance_mode_precheck_result({
  "where": {
    "id": task_id
  }
})
```

</TabItem>
<TabItem value="go" label="Golang">

```go
package main

import (
	"fmt"

	apiclient "github.com/smartxworks/cloudtower-go-sdk/client"
	"github.com/smartxworks/cloudtower-go-sdk/client/host"
	"github.com/smartxworks/cloudtower-go-sdk/models"

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
}
```

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

其中 $TASK_ID 可以从第一步中获取，返回结果如下

```
{
    "done": true,
    "shutdownVms": ["someVmId1","someVmId2"]
}
```

done 字段表示检查是否完成。
shutdownVms 表示需要关闭的虚拟机。

## 进入维护模式

1. 调用进入维护模式 API 进入维护模式

<Tabs>
<TabItem value="py" label="Python">

```python
from cloudtower import ApiClient, Configuration, HostApi

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
})
```

</TabItem>
<TabItem value="go" label="Golang">

```go
package main

import (
	"fmt"

	apiclient "github.com/smartxworks/cloudtower-go-sdk/client"
	"github.com/smartxworks/cloudtower-go-sdk/client/host"
	"github.com/smartxworks/cloudtower-go-sdk/models"

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
}
```

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

其中 $HOST_ID 为需要进入维护模式的主机 id。$SHUTDOWN_VMS 为预检查中返回的 shutdownVms。

# 退出维护模式

## 获取退出维护模式预检查结果

退出维护模式时，需要将一些被关机的虚拟机重新开机、将一些被迁移走的虚拟机迁移回来。可以通过以下步骤获取相关数据

<Tabs>
<TabItem value="py" label="Python">

```python
from cloudtower import ApiClient, Configuration, HostApi

conf = Configuration(host="http://192.168.96.133/v2/api")
conf.api_key["Authorization"] = "token"
api_client = ApiClient(conf)
host_api = HostApi(api_client)

task_id = ""

precheck_task = host_api.enter_maintenance_mode_precheck_result({
  "where": {
    "id": task_id
  }
})
```

</TabItem>
<TabItem value="go" label="Golang">

```go
package main

import (
	"fmt"

	apiclient "github.com/smartxworks/cloudtower-go-sdk/client"
	"github.com/smartxworks/cloudtower-go-sdk/client/host"
	"github.com/smartxworks/cloudtower-go-sdk/models"

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
}
```

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

退出维护模式时，可以直接获取到检查结果。其中 $HOST_ID 是准备退出维护模式的主机 id。请求结果如下。

```
{
  "shutDownVms": [],
  "liveMigrateVms": [],
  "offlineMigrateVms": [
    {
      "state": "done",
      "target_host_name": "qinghua-smtxos-5-1-0X20230906094802X2",
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
      "target_host_name": "qinghua-smtxos-5-1-0X20230906094802X1",
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

## 退出维护模式

退出维护模式时，需要填写重新开机，和迁移回的虚拟机 uuid。获取方式可以参考`获取退出维护模式预检查结果`

```js
const result = {
  shutDownVms: [
    {
      vm_uuid: "vm_uuid_1",
      // 其他虚拟机相关数据
      // ...
    },
  ],
  liveMigrateVms: [
    {
      vm_uuid: "vm_uuid_2",
      // 其他虚拟机相关数据
      // ...
    },
  ],
  offlineMigrateVms: [
    {
      vm_uuid: "vm_uuid_3",
      // 其他虚拟机相关数据
      // ...
    },
  ],
};
```

假设我们获取到数据如上，我们需要将

1. shutDownVms 中的 vm_uuid 填入 poweron_vms 数组中。
2. liveMigrateVms 中的 vm_uuid 填入 live_migrate_back_vms 数组中。
3. offlineMigrateVms 中的 vm_uuid 填入 offline_migrate_back_vms 数组中。

示例如下

<Tabs>
<TabItem value="py" label="Python">

```python
from cloudtower import ApiClient, Configuration, HostApi

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
})
```

</TabItem>
<TabItem value="go" label="Golang">

```go
package main

import (
	"fmt"

	apiclient "github.com/smartxworks/cloudtower-go-sdk/client"
	"github.com/smartxworks/cloudtower-go-sdk/client/host"
	"github.com/smartxworks/cloudtower-go-sdk/models"

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
}
```

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
