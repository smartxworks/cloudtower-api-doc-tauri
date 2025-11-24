---
title: Go
---

Golang 环境下的 CloudTower SDK，适用于 golang 1.16 及以上版本

- [源码地址](https://github.com/smartxworks/cloudtower-go-sdk)
- [下载地址](https://github.com/smartxworks/cloudtower-go-sdk/releases)

## 安装

```shell
go get github.com/smartxworks/cloudtower-go-sdk
```

## 使用

> 样例中使用了两个工具库 [pointy](https://github.com/openlyinc/pointy) 与 [go-funk](https://github.com/thoas/go-funk)，pointy 用于快速创建一个原始类型的指针，go-funk 则提供了一些工具方法，例如 `Map`、`Filter`、`Reduce` 等。

### 创建实例

#### 创建 `ApiClient` 实例

```go
import (
	apiclient "github.com/smartxworks/cloudtower-go-sdk/client"
	httptransport "github.com/go-openapi/runtime/client"
	"github.com/go-openapi/strfmt"
)
transport := httptransport.New("192.168.36.133", "/v2/api", []string{"http"})
client := apiclient.New(transport, strfmt.Default)
```

> 如果需要使用 https，可以安装证书，或者忽略证书验证
```go
import (
	apiclient "github.com/smartxworks/cloudtower-go-sdk/v2/client"
	httptransport "github.com/go-openapi/runtime/client"
	"github.com/go-openapi/strfmt"
)
tlsClient, err := httptransport.TLSClient(httptransport.TLSClientOptions{
	InsecureSkipVerify: true,
})
if err != nil {
	fmt.Print(err)
	return
}
transport := httptransport.NewWithClient("192.168.29.157", "/v2/api", []string{"https"}, tlsClient)
client := apiclient.New(transport, strfmt.Default)
```

### 发送请求

#### 引入对应的 `client` 包

> 根据不同用途的操作引入创建相关的 `client` 包

```go
import (
  	vm "github.com/smartxworks/cloudtower-go-sdk/client/vm"
)
```

#### 鉴权

```go
import (
  User "github.com/smartxworks/cloudtower-go-sdk/client/user"
)
loginParams := User.NewLoginParams()
loginParams.RequestBody = &models.LoginInput{
	Username: pointy.String("username"),
	Password: pointy.String("password"),
	Source:   models.NewUserSource(models.UserSourceLOCAL),
}
logRes, err := client.User.Login(loginParams)
if err != nil {
	return err
}
transport.DefaultAuthentication = httptransport.APIKeyAuth("Authorization", "header", *logRes.Payload.Data.Token)
```

#### 获取资源

```go
getVmParams := vm.NewGetVmsParams();
getVmParams.RequestBody = &models.GetVmsRequestBody{
	Where: &models.VMWhereInput{
		ID: pointy.String("vm_id"),
	},
}
vmsRes, err := client.VM.GetVms(getVmParams)
if err != nil {
	return err
}
vms := vmsRes.Payload
```

#### 更新资源

> 资源更新会产生相关的异步任务，当异步任务结束时，代表资源操作完成且数据已更新。

```go
target_vm := vmsRes.Payload[0]
vmStartParams := vm.NewStartVMParams()
vmStartParams.RequestBody = &models.VMStartParams{
	Where: &models.VMWhereInput{
		ID: target_vm.ID,
	},
}
startRes, err := client.VM.StartVM(vmStartParams)
if err != nil {
	return err
}
```

> 可以通过提供的工具方法 `WaitTask` 同步等待异步任务结束，如果任务失败或超时，都会返回一个异常，轮询间隔 5s，超时时间为 300s。
>
> - 方法参数说明
>
> | 参数名 | 类型                | 是否必须 | 说明                     |
> | ------ | ------------------- | -------- | ------------------------ |
> | client | \*client.Cloudtower | 是       | 查询所使用的 client 实例 |
> | id     | string              | 是       | 需查询的 task 的 id      |

```go
task := *startRes.Payload[0].TaskID
err = utils.WaitTask(client, task)
if err != nil {
	return err
}
```

> 如果是复数任务则可以通过 `WaitTasks`，接受复数个 task id，其余与 `WaitTask` 相同。
>
> - 方法参数说明
>
> | 参数名 | 类型                | 是否必须 | 说明                     |
> | ------ | ------------------- | -------- | ------------------------ |
> | client | \*client.Cloudtower | 是       | 查询所使用的 client 实例 |
> | ids    | []string            | 是       | 需查询的 task 的 id 列表 |

```go
tasks := funk.Map(startRes.Payload, func(tvm *models.WithTaskVM) string {
	return *tvm.TaskID
}).([]string)
err = utils.WaitTasks(client, tasks)
if err != nil {
	return err
}
```

#### 其他

##### 设置返回信息的语言

> 可以设置请求 params 中的 `ContentLanguage` 项设置返回值的语言，可选值为 `["en-US", "zh-CN"]`，默认值为 `en-US`，不在可选值范围内的语言会返回一个 HTTP 400 错误

```go
getTaskDefaultParams := task.NewGetTasksParams()
getTaskDefaultParams.RequestBody = &models.GetTasksRequestBody{
	First: pointy.Int32(10),
}
// 此时得到的 alerts 中的 message, solution, cause, impact 将被转换为英文描述。
taskDefaultRes, err := client.Task.GetTasks(getTaskDefaultParams)

getTaskZhParams := task.NewGetTasksParams()
getTaskZhParams.RequestBody = &models.GetTasksRequestBody{
	First: pointy.Int32(10),
}
// 此时得到的 alerts 中的 message, solution, cause, impact 将被转换为中文描述。
getTaskZhParams.ContentLanguage = pointy.String("zh-CN")
taskZhRes, err := client.Task.GetTasks(getTaskZhParams)
```

## 场景示例

### 虚拟机备份

```go
package main

import (
	"fmt"

	apiclient "github.com/smartxworks/cloudtower-go-sdk/client"
	"github.com/smartxworks/cloudtower-go-sdk/client/iscsi_lun_snapshot"
	"github.com/smartxworks/cloudtower-go-sdk/client/user"
	"github.com/smartxworks/cloudtower-go-sdk/client/vm"
	"github.com/smartxworks/cloudtower-go-sdk/client/vm_snapshot"
	"github.com/smartxworks/cloudtower-go-sdk/models"
	"github.com/smartxworks/cloudtower-go-sdk/utils"
	"github.com/openlyinc/pointy"
	"github.com/thoas/go-funk"

	httptransport "github.com/go-openapi/runtime/client"

	"github.com/go-openapi/strfmt"
)

func create_vm_snapshot(
  client *apiclient.Cloudtower,
	targetVmName string,
	targetSnapshotName string,
	consistentType models.ConsistentType) (*models.VMSnapshot, []*models.IscsiLunSnapshot, error) {
	getVmParams := vm.NewGetVmsParams()
	getVmParams.RequestBody = &models.GetVmsRequestBody{
		Where: &models.VMWhereInput{
			Name: &targetVmName,
		},
		First: pointy.Int32(1),
	}
	// 1. 获取所需备份的虚拟机的信息，这里我们需要vm的id来构建创建snapshot的参数
	getVmRes, err := client.VM.GetVms(getVmParams)
	if err != nil {
		return nil, nil, err
	}
	targetVm := getVmRes.Payload[0]
	vmToolStatus := *targetVm.VMToolsStatus
	// vm 已安装并启动 VMTools 时，consistent_type 可以使用 FILE_SYSTEM_CONSISTENT 代表文件系统一致性快照
	if vmToolStatus != models.VMToolsStatusRUNNING && consistentType == models.ConsistentTypeFILESYSTEMCONSISTENT {
		consistentType = models.ConsistentTypeCRASHCONSISTENT
	}
	createSnapshotParams := vm_snapshot.NewCreateVMSnapshotParams()
	createSnapshotParams.RequestBody = &models.VMSnapshotCreationParams{
		Data: []*models.VMSnapshotCreationParamsDataItems0{
			{
				VMID:           targetVm.ID,
				Name:           &targetSnapshotName,
				ConsistentType: consistentType.Pointer(),
			},
		},
	}
	// 2. 创建虚拟机快照
	createRes, err := client.VMSnapshot.CreateVMSnapshot(createSnapshotParams)
	if err != nil {
		return nil, nil, err
	}
	withTaskSnapshot := createRes.Payload[0]
	// 3. 等待Task完成
	err = utils.WaitTask(client, withTaskSnapshot.TaskID)
	if err != nil {
		return nil, nil, err
	}
	getSnapshotParams := vm_snapshot.NewGetVMSnapshotsParams()
	getSnapshotParams.RequestBody = &models.GetVMSnapshotsRequestBody{
		Where: &models.VMSnapshotWhereInput{
			ID: withTaskSnapshot.Data.ID,
		},
	}
	// 4. 根据返回的id查询生成的虚拟机快照
	getSnapshotRes, err := client.VMSnapshot.GetVMSnapshots(getSnapshotParams)
	if err != nil {
		return nil, nil, err
	}
	createdSnapshot := getSnapshotRes.Payload[0]
	// 5. 根据返回的snapshot中的vm_disks包含了快照的虚拟盘信息
	// type 为 DISK 表示对应一个卷，其中会包含一个 snapshot_local_id 则表示该虚拟卷对应的lun快照的 local_id
	// type 为 CD-ROM则代表为被挂载的CD-ROM，不会产生lun快照
	lunSnapshotIds := funk.Map(funk.Filter(createdSnapshot.VMDisks, func(disk *models.NestedFrozenDisks) bool {
		return *disk.Type == models.VMDiskTypeDISK
	}), func(disk *models.NestedFrozenDisks) string {
		return *disk.SnapshotLocalID
	}).([]string)
	getLunSnapshotParams := iscsi_lun_snapshot.NewGetIscsiLunSnapshotsParams()
	getLunSnapshotParams.RequestBody = &models.GetIscsiLunSnapshotsRequestBody{
		Where: &models.IscsiLunSnapshotWhereInput{
			NameIn: lunSnapshotIds,
		},
	}
	getLunSnapshotRes, err := client.IscsiLunSnapshot.GetIscsiLunSnapshots(getLunSnapshotParams)
	if err != nil {
		return nil, nil, err
	}
	return createdSnapshot, getLunSnapshotRes.Payload, nil
}
```

### Dashboard 构建

#### 定义工具方法

```go
import (
	"fmt"

	apiclient "github.com/smartxworks/cloudtower-go-sdk/client"
	"github.com/smartxworks/cloudtower-go-sdk/client/alert"
	"github.com/smartxworks/cloudtower-go-sdk/client/cluster"
	"github.com/smartxworks/cloudtower-go-sdk/client/disk"
	"github.com/smartxworks/cloudtower-go-sdk/client/host"
	"github.com/smartxworks/cloudtower-go-sdk/client/user"
	"github.com/smartxworks/cloudtower-go-sdk/models"
	"github.com/openlyinc/pointy"
	"github.com/thoas/go-funk"

	httptransport "github.com/go-openapi/runtime/client"

	"github.com/go-openapi/strfmt"
)

var ByteUnits []string = []string{"B", "KiB", "MiB", "GiB", "TiB", "PiB"}
var HzUnits []string = []string{"Hz", "KHz", "MHz", "GHz", "THz"}

func formatUnit(base float64, units []string, step int32) string {
	length := len(units)
	if length == 0 {
		panic("No unit provided")
	}
	if base <= 0 {
		return fmt.Sprintf("0%s", units[0])
	}
	for i, unit := range units {
		if base < float64(step) || i == length-1 {
			return fmt.Sprintf("%0.2f%s", base, unit)
		}
		base = base / float64(step)
	}
	return fmt.Sprintf("%0.2f%s", base, units[length-1])
}
```

#### 构建报警信息

```go
type AlertInfo struct {
	Critical []*models.Alert
	Notice   []*models.Alert
	Info     []*models.Alert
}

func NewAlertInfo(critial []*models.Alert, notice []*models.Alert, info []*models.Alert) *AlertInfo {
	return &AlertInfo{
		Critical: critial,
		Notice:   notice,
		Info:     info,
	}
}

func buildAlertInfo(client *apiclient.Cloudtower, clusterIds []string) (*AlertInfo, error) {
	getAlertParams := alert.NewGetAlertsParams()
	if len(clusterIds) == 0 {
		getAlertParams.RequestBody = &models.GetAlertsRequestBody{
			Where: &models.AlertWhereInput{
				Ended: pointy.Bool(false),
			},
		}
	} else {
		getAlertParams.RequestBody = &models.GetAlertsRequestBody{
			Where: &models.AlertWhereInput{
				Ended: pointy.Bool(false),
				Cluster: &models.ClusterWhereInput{
					IDIn: clusterIds,
				},
			},
		}
	}
	res, err := client.Alert.GetAlerts(getAlertParams)
	if err != nil {
		return nil, err
	}
	var critial []*models.Alert = []*models.Alert{}
	var notice []*models.Alert = []*models.Alert{}
	var info []*models.Alert = []*models.Alert{}
	for _, alert := range res.Payload {
		switch *alert.Severity {
		case "CRITICAL":
			critial = append(critial, alert)
		case "NOTICE":
			notice = append(notice, alert)
		case "INFO":
			info = append(info, alert)
		}
	}
	return NewAlertInfo(critial, notice, info), nil
}
```

#### 构建硬盘信息

> 这里以机械硬盘为例

```go
type DiskInfo struct {
	Healthy int32
	Warning int32
	Error   int32
	Total   int32
}

func NewDiskInfo() *DiskInfo {
	return &DiskInfo{
		Healthy: 0,
		Warning: 0,
		Error:   0,
		Total:   0,
	}
}

func buildHddInfo(client *apiclient.Cloudtower, clusterIds []string) (*DiskInfo, error) {
	getDiskParams := disk.NewGetDisksParams()
	if len(clusterIds) == 0 {
		getDiskParams.RequestBody = &models.GetDisksRequestBody{}
	} else {
		getDiskParams.RequestBody = &models.GetDisksRequestBody{
			Where: &models.DiskWhereInput{
				Host: &models.HostWhereInput{
					Cluster: &models.ClusterWhereInput{
						IDIn: clusterIds,
					},
				},
			},
		}
	}
	res, err := client.Disk.GetDisks(getDiskParams)
	if err != nil {
		return nil, err
	}
	hddInfo := NewDiskInfo()
	for _, disk := range res.Payload {
		if *disk.Type == models.DiskTypeHDD {
			if funk.Contains(
				[]models.DiskHealthStatus{
					models.DiskHealthStatusHEALTHY,
					models.DiskHealthStatusSUBHEALTHY,
					models.DiskHealthStatusSMARTFAILED,
				},
				*disk.HealthStatus,
			) {
				hddInfo.Error++
			} else if funk.Contains(
				[]models.DiskUsageStatus{
					models.DiskUsageStatusUNMOUNTED,
					models.DiskUsageStatusPARTIALMOUNTED,
				},
				*disk.UsageStatus,
			) {
				hddInfo.Warning++
			} else {
				hddInfo.Healthy++
			}
			hddInfo.Total++
		}
	}
	return hddInfo, nil
}
```

#### 构建性能指标

> 获取指定集群的 CPU 核数，CPU 频率总数，CPU 使用率，内存总量，内存使用量，存储资源总量，存储资源已使用量，存储资源失效量与存储资源可用量。

```go
type CpuInfo struct {
	TotalCore uint32
	TotalInHz uint64
	Total     string
	UsedInHz  uint64
	Used      string
	Usage     string
}

func NewCpuInfo() *CpuInfo {
	return &CpuInfo{
		TotalCore: 0,
		TotalInHz: 0,
		UsedInHz:  0,
	}
}

func (info *CpuInfo) compute() *CpuInfo {
	info.Total = formatUnit(float64(info.TotalInHz), HzUnits, 1000)
	info.Used = formatUnit(float64(info.UsedInHz), HzUnits, 1000)
	info.Usage = fmt.Sprintf("%0.2f%%", float64(info.UsedInHz)/float64(info.TotalInHz))
	return info
}

type MemoryInfo struct {
	TotalInByte uint64
	Total       string
	UsedInByte  uint64
	Used        string
	Usage       string
}

func NewMemoryInfo() *MemoryInfo {
	return &MemoryInfo{
		TotalInByte: 0,
		UsedInByte:  0,
	}
}

func (info *MemoryInfo) compute() *MemoryInfo {
	info.Total = formatUnit(float64(info.TotalInByte), ByteUnits, 1024)
	info.Used = formatUnit(float64(info.UsedInByte), ByteUnits, 1024)
	info.Usage = fmt.Sprintf("%0.2f%%", float64(info.UsedInByte)/float64(info.TotalInByte))
	return info
}

type StorageInfo struct {
	TotalInByte     uint64
	Total           string
	UsedInByte      uint64
	Used            string
	InvalidInByte   uint64
	Invalid         string
	AvailableInByte uint64
	Available       string
}

func NewStorageInfo() *StorageInfo {
	return &StorageInfo{
		TotalInByte:     0,
		UsedInByte:      0,
		InvalidInByte:   0,
		AvailableInByte: 0,
	}
}

func (info *StorageInfo) compute() *StorageInfo {
	info.AvailableInByte = info.TotalInByte - info.UsedInByte - info.InvalidInByte
	info.Total = formatUnit(float64(info.TotalInByte), ByteUnits, 1024)
	info.Used = formatUnit(float64(info.UsedInByte), ByteUnits, 1024)
	info.Invalid = formatUnit(float64(info.InvalidInByte), ByteUnits, 1024)
	info.Available = formatUnit(float64(info.AvailableInByte), ByteUnits, 1024)
	return info
}

type MetricInfo struct {
	Storage *StorageInfo
	Memory  *MemoryInfo
	Cpu     *CpuInfo
}

func buildMetricsInfo(client *apiclient.Cloudtower, clusters []*models.Cluster, clusterIds []string) (*MetricInfo, error) {
	memory := NewMemoryInfo()
	storage := NewStorageInfo()
	cpu := NewCpuInfo()
	getHostParams := host.NewGetHostsParams()
	if len(clusterIds) == 0 {
		getHostParams.RequestBody = &models.GetHostsRequestBody{}
	} else {
		getHostParams.RequestBody = &models.GetHostsRequestBody{
			Where: &models.HostWhereInput{
				Cluster: &models.ClusterWhereInput{
					IDIn: clusterIds,
				},
			},
		}
	}
	hosts, err := client.Host.GetHosts(getHostParams)
	if err != nil {
		return nil, err
	}
	clusterIdMap := make(map[string]*models.Cluster)
	for _, cluster := range clusters {
		if _, ok := clusterIdMap[*cluster.ID]; !ok {
			clusterIdMap[*cluster.ID] = cluster
		}
		if *cluster.Type == models.ClusterTypeSMTXOS {
			cpu.TotalCore += uint32(*cluster.TotalCPUCores)
			cpu.TotalInHz += uint64(*cluster.TotalCPUHz)
			cpu.UsedInHz += uint64(*cluster.UsedCPUHz)
			if cluster.Hypervisor != nil && *cluster.Hypervisor == models.HypervisorVMWARE {
				memory.TotalInByte += uint64(*cluster.TotalMemoryBytes)
				memory.UsedInByte += uint64(*cluster.UsedMemoryBytes)
			}
		}
		storage.TotalInByte += uint64(*cluster.TotalDataCapacity)
		storage.UsedInByte += uint64(*cluster.UsedDataSpace)
		storage.InvalidInByte += uint64(*cluster.FailureDataSpace)
	}
	for _, host := range hosts.Payload {
		cluster, ok := clusterIdMap[*host.Cluster.ID]
		if ok {
			if *cluster.Hypervisor == models.HypervisorELF {
				memory.TotalInByte += uint64(*host.TotalMemoryBytes)
				memory.UsedInByte += uint64(*host.UsedMemoryBytes)
			}
		}
	}
	storage.compute()
	cpu.compute()
	memory.compute()
	return &MetricInfo{
		Memory:  memory,
		Cpu:     cpu,
		Storage: storage,
	}, nil
}
```

#### 构建 Dashboard

```go
type DashboardInfo struct {
	Metric *MetricInfo
	Hdd    *DiskInfo
	Alert  *AlertInfo
}

func BuildDashboard(client *apiclient.Cloudtower, clusterIds []string) (*DashboardInfo, error) {
	getClusterParams := cluster.NewGetClustersParams()
	if len(clusterIds) == 0 {
		getClusterParams.RequestBody = &models.GetClustersRequestBody{}
	} else {
		getClusterParams.RequestBody = &models.GetClustersRequestBody{
			Where: &models.ClusterWhereInput{
				IDIn: clusterIds,
			},
		}
	}
	res, err := client.Cluster.GetClusters(getClusterParams)
	if err != nil {
		return nil, err
	}
	metrics, err := buildMetricsInfo(client, res.Payload, clusterIds)
	if err != nil {
		return nil, err
	}
	hdd, err := buildHddInfo(client, clusterIds)
	if err != nil {
		return nil, err
	}
	alert, err := buildAlertInfo(client, clusterIds)
	if err != nil {
		return nil, err
	}
	return &DashboardInfo{
		Metric: metrics,
		Hdd:    hdd,
		Alert:  alert,
	}, nil
}
```
