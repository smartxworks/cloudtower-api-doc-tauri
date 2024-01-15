---
title: 维护模式
---

# 进入维护模式

## 执行维护模式预检查

进入维护模式前，需要知道哪些虚拟机需要被关机。可以通过以下步骤来获取

1. 调用进入维护模式预检查获取到 $TASK_ID


import EnterMaintenanceModePrecheck from '../../code_blocks/EnterMaintenanceModePrecheck.md'

<EnterMaintenanceModePrecheck />

其中 $HOST_ID 为需要进入维护模式的主机 id，返回结果如下

```
{
    "task_id" : "$TASK_ID"
}
```

2. 获取检查结果，与相关数据

import EnterMaintenanceModePrecheckResult from '../../code_blocks/EnterMaintenanceModePrecheckResult.md'

<EnterMaintenanceModePrecheckResult />

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

import EnterMaintenanceMode from '../../code_blocks/EnterMaintenanceMode.md'

<EnterMaintenanceMode />

其中 $HOST_ID 为需要进入维护模式的主机 id。$SHUTDOWN_VMS 为预检查中返回的 shutdownVms。

# 退出维护模式

## 获取退出维护模式预检查结果

退出维护模式时，需要将一些被关机的虚拟机重新开机、将一些被迁移走的虚拟机迁移回来。可以通过以下步骤获取相关数据

import ExitMaintenanceModePrecheckResult from '../../code_blocks/ExitMaintenanceModePrecheckResult.md'

<ExitMaintenanceModePrecheckResult />

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

import ExitMaintenanceMode from '../../code_blocks/ExitMaintenanceMode.md'

```js
const result = {
  "shutDownVms": [
    {
        "vm_uuid":"vm_uuid_1",
        // 其他虚拟机相关数据
        // ...
    }
  ],
  "liveMigrateVms": [
    {

        "vm_uuid":"vm_uuid_2",
        // 其他虚拟机相关数据
        // ...
    }
  ],
  "offlineMigrateVms": [
    {
      "vm_uuid": "vm_uuid_3",
        // 其他虚拟机相关数据
        // ...
    },
  ]
}
```

假设我们获取到数据如上，我们需要将 

1. shutDownVms 中的 vm_uuid 填入 poweron_vms 数组中。
2. liveMigrateVms 中的 vm_uuid 填入 live_migrate_back_vms 数组中。
3. offlineMigrateVms 中的 vm_uuid 填入 offline_migrate_back_vms 数组中。

示例如下

<ExitMaintenanceMode />
