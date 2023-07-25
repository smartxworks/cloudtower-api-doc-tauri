---
title: 获取虚拟机
sidebar_position: 43
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

## 获取所有
<Tabs>
<TabItem value="py" label="Python">

```python
from cloudtower import ApiClient, Configuration, VmApi

conf = Configuration(host="http://192.168.96.133/v2/api")
conf.api_key["Authorization"] = "token"
api_client = ApiClient(conf)
vm_api = VmApi(api_client)

vms = vm_api.get_vms({})
```

</TabItem>
<TabItem value="go" label="Golang">

```go
package main

import (
	"fmt"

	apiclient "github.com/smartxworks/cloudtower-go-sdk/client"
	"github.com/smartxworks/cloudtower-go-sdk/client/vm"
	"github.com/smartxworks/cloudtower-go-sdk/models"

	httptransport "github.com/go-openapi/runtime/client"
)

func main() {
	transport := httptransport.New("192.168.36.133", "/v2/api", []string{"http"})
	client := apiclient.New(transport, strfmt.Default)
	transport.DefaultAuthentication = httptransport.APIKeyAuth("Authorization", "header", "token")
	vms, err := getAllVms(client)
	if err != nil {
		panic(err.Error())
	}
  // handle queried vms
}

func getAllVms(
	client *apiclient.Cloudtower) ([]*models.VM, error) {
	getAllVmsParams := vm.NewGetVmsParams()
	getAllVmsParams.RequestBody = &models.GetVmsRequestBody{}
	vmsRes, err := client.VM.GetVms(getAllVmsParams)
	if err != nil {
		return nil, err
	}
	return vmsRes.Payload, nil
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
    List<Vm> vms = getAllVms(client);
  }

  public static List<Vm> getAllVms(ApiClient client) throws ApiException {
    VmApi vmApi = new VmApi(client);
    return vmApi.getVms(new GetVmsRequestBody());
  }
}
```
</TabItem>
</Tabs>

## 分页获取
<Tabs>
<TabItem value="py" label="Python">

```python
from cloudtower import ApiClient, Configuration, VmApi

conf = Configuration(host="http://192.168.96.133/v2/api")
conf.api_key["Authorization"] = "token"
api_client = ApiClient(conf)
vm_api = VmApi(api_client)

vms_from_51_to_100 = vm_api.get_vms({
  "first": 50,
  "skip": 50,
})
```

</TabItem>
<TabItem value="go" label="Golang">

```go
package main

import (
	"github.com/openlyinc/pointy"
	apiclient "github.com/smartxworks/cloudtower-go-sdk/client"
	"github.com/smartxworks/cloudtower-go-sdk/client/vm"
	"github.com/smartxworks/cloudtower-go-sdk/models"

	httptransport "github.com/go-openapi/runtime/client"

	"github.com/go-openapi/strfmt"
)

func main() {
	transport := httptransport.New("192.168.36.133", "/v2/api", []string{"http"})
	client := apiclient.New(transport, strfmt.Default)
	transport.DefaultAuthentication = httptransport.APIKeyAuth("Authorization", "header", "token")
	vms, err := getVmsWithPagination(client,50,100)
	if err != nil {
		panic(err.Error())
	}
  // handle queried vms
}

func getVmsWithPagination(
	client *apiclient.Cloudtower,
  from int32,
  to int32) ([]*models.VM, error) {
	getVmsWithPaginationParams := vm.NewGetVmsParams()
	getVmsWithPaginationParams.RequestBody = &models.GetVmsRequestBody{
		First: pointy.Int32(from+1),
		Skip:  pointy.Int32(to-from),
	}
	vmsRes, err := client.VM.GetVms(getVmsWithPaginationParams)
	if err != nil {
		return nil, err
	}
	return vmsRes.Payload, nil
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
    List<Vm> vms = getVmsByPagination(client, 50, 100);
  }

  public static List<Vm> getVmsByPagination(ApiClient client, int from, int to) throws ApiException {
    VmApi vmApi = new VmApi(client);
    GetVmsRequestBody body = new GetVmsRequestBody().skip(from - 1).first(to - from);
    return vmApi.getVms(body);
  }
}
```

</TabItem>
</Tabs>

## 获取所有已开机虚拟机
<Tabs>
<TabItem value="py" label="Python">

```python
from cloudtower import ApiClient, Configuration, VmApi, VmStatus

conf = Configuration(host="http://192.168.96.133/v2/api")
conf.api_key["Authorization"] = "token"
api_client = ApiClient(conf)
vm_api = VmApi(api_client)

running_vms = vm_api.get_vms(
    {
        "where": {
            "status": VmStatus.RUNNING
        }
    },
)
```

</TabItem>
<TabItem value="go" label="Golang">


```go
package main

import (
	"github.com/openlyinc/pointy"
	apiclient "github.com/smartxworks/cloudtower-go-sdk/client"
	"github.com/smartxworks/cloudtower-go-sdk/client/vm"
	"github.com/smartxworks/cloudtower-go-sdk/models"

	httptransport "github.com/go-openapi/runtime/client"

	"github.com/go-openapi/strfmt"
)

func main() {
	transport := httptransport.New("192.168.36.133", "/v2/api", []string{"http"})
	client := apiclient.New(transport, strfmt.Default)
	transport.DefaultAuthentication = httptransport.APIKeyAuth("Authorization", "header", "token")
	vms, err := getAllRunningVms(client)
	if err != nil {
		panic(err.Error())
	}
  // handle queried vms
}

func getAllRunningVms(
	client *apiclient.Cloudtower) ([]*models.VM, error) {
	getAllRunningVmsParams := vm.NewGetVmsParams()
	getAllRunningVmsParams.RequestBody = &models.GetVmsRequestBody{
		Where: &models.VMWhereInput{
			Status: models.VMStatusRUNNING.Pointer(),
		},
	}
	vmsRes, err := client.VM.GetVms(getAllRunningVmsParams)
	if err != nil {
		return nil, err
	}
	return vmsRes.Payload, nil
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
    List<Vm> vms = getAllRunningVms(client);
  }

  public static List<Vm> getAllRunningVms(ApiClient client) throws ApiException {
    VmApi vmApi = new VmApi(client);
    VmWhereInput where = new VmWhereInput().status(VmStatus.RUNNING);
    GetVmsRequestBody body = new GetVmsRequestBody().where(where);
    return vmApi.getVms(body);
  }
}
```

</TabItem>
</Tabs>

## 获取名称或描述中包含特定字符串的虚拟机
<Tabs>
<TabItem value="py" label="Python">

```python
from cloudtower import ApiClient, Configuration, VmApi

conf = Configuration(host="http://192.168.96.133/v2/api")
conf.api_key["Authorization"] = "token"
api_client = ApiClient(conf)
vm_api = VmApi(api_client)

vms_name_contains = vm_api.get_vms(
    {
        "where": {
            "name_contains": "string"
        }
    },
)
```

</TabItem>
<TabItem value="go" label="Golang">

```go
package main

import (
	"github.com/openlyinc/pointy"
	apiclient "github.com/smartxworks/cloudtower-go-sdk/client"
	"github.com/smartxworks/cloudtower-go-sdk/client/vm"
	"github.com/smartxworks/cloudtower-go-sdk/models"

	httptransport "github.com/go-openapi/runtime/client"

	"github.com/go-openapi/strfmt"
)

func main() {
	transport := httptransport.New("192.168.36.133", "/v2/api", []string{"http"})
	client := apiclient.New(transport, strfmt.Default)
	transport.DefaultAuthentication = httptransport.APIKeyAuth("Authorization", "header", "token")
	vms, err := getVmsMatchStr(client, "matchStr")
	if err != nil {
		panic(err.Error())
	}
  // handle queried vms
}

func getVmsMatchStr(
	client *apiclient.Cloudtower,
	match string) ([]*models.VM, error) {
	getAllVmNameMatchStrParams := vm.NewGetVmsParams()
	getAllVmNameMatchStrParams.RequestBody = &models.GetVmsRequestBody{
		Where: &models.VMWhereInput{
			NameContains: pointy.String(match),
		},
	}
	vmsRes, err := client.VM.GetVms(getAllVmNameMatchStrParams)
	if err != nil {
		return nil, err
	}
	return vmsRes.Payload, nil
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
    List<Vm> vms = getVmsByNameMatching(client, "yinsw");
  }

  public static List<Vm> getVmsByNameMatching(ApiClient client, String matching) throws ApiException {
    VmApi vmApi = new VmApi(client);
    VmWhereInput where = new VmWhereInput().nameContains(matching);
    GetVmsRequestBody body = new GetVmsRequestBody().where(where);
    return vmApi.getVms(body);
  }
}
```
</TabItem>
</Tabs>

## 获取所有 vcpu > n 的虚拟机
<Tabs>
<TabItem value="py" label="Python">

```python
from cloudtower import ApiClient, Configuration, VmApi

conf = Configuration(host="http://192.168.96.133/v2/api")
conf.api_key["Authorization"] = "token"
api_client = ApiClient(conf)
vm_api = VmApi(api_client)

vms_has_4_more_vcpu = vm_api.get_vms(
    {
        "where": {
            "vcpu_gt": 4
        }
    },
)
```

</TabItem>
<TabItem value="go" label="Golang">

```go
package main

import (
	"github.com/openlyinc/pointy"
	apiclient "github.com/smartxworks/cloudtower-go-sdk/client"
	"github.com/smartxworks/cloudtower-go-sdk/client/vm"
	"github.com/smartxworks/cloudtower-go-sdk/models"

	httptransport "github.com/go-openapi/runtime/client"

	"github.com/go-openapi/strfmt"
)

func main() {
	transport := httptransport.New("192.168.36.133", "/v2/api", []string{"http"})
	client := apiclient.New(transport, strfmt.Default)
	transport.DefaultAuthentication = httptransport.APIKeyAuth("Authorization", "header", "token")
	vms, err := getVmshasNMoreCpuCore(client, 4)
	if err != nil {
		panic(err.Error())
	}
  // handle queried vms
}

func getVmshasNMoreCpuCore(
	client *apiclient.Cloudtower,
	n int32) ([]*models.VM, error) {
	getAllVmCoreGtNParams := vm.NewGetVmsParams()
	getAllVmCoreGtNParams.RequestBody = &models.GetVmsRequestBody{
		Where: &models.VMWhereInput{
			VcpuGt: pointy.Int32(n),
		},
	}
	vmsRes, err := client.VM.GetVms(getAllVmCoreGtNParams)
	if err != nil {
		return nil, err
	}
	return vmsRes.Payload, nil
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
    List<Vm> vms = getVmsHasNMoreCpuCore(client, 4);
  }

  public static List<Vm> getVmsHasNMoreCpuCore(ApiClient client, int n) throws ApiException {
    VmApi vmApi = new VmApi(client);
    VmWhereInput where = new VmWhereInput().vcpuGt(n);
    GetVmsRequestBody body = new GetVmsRequestBody().where(where);
    return vmApi.getVms(body);
  }
}
```

</TabItem>
</Tabs>


