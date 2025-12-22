---
title: 虚拟机备份
---
import Terminology from '@site/terminology'
import GetVm from '@site/code_blocks/GetVm.md'
import CreateVmSnapshot from '@site/code_blocks/CreateVmSnapshot.md'
import GetTask from '@site/code_blocks/GetTask.md'
import GetVmSnapshot from '@site/code_blocks/GetVmSnapshot.md'
import GetLunSnapshot from '@site/code_blocks/GetLunSnapshot.md'

对虚拟机的备份分为两部分
1. 虚拟机配置的备份，例如虚拟机名称、vCPU 数量等。
2. <>虚拟机业务数据的备份。在 {Terminology['terminology']['zh-CN']['HCI_OS']} 中，即虚拟机所使用的存储的备份。
对虚拟机业务数据备份之前，需要先理解 {Terminology['terminology']['zh-CN']['HCI_OS']} 虚拟机的资源关系。一个虚拟机与最终的存储之间的示例关系如下：</>
  - 虚拟机
    - 虚拟盘（CD-ROM）
    - 虚拟盘（数据盘 1）
      - 虚拟卷
        - iscsi LUN
          - <>{Terminology['terminology']['zh-CN']['STORAGE_PRODUCT']}</> volume
    - 虚拟盘（数据盘 2）
      - 虚拟卷
        - iscsi LUN
          - <>{Terminology['terminology']['zh-CN']['STORAGE_PRODUCT']}</> volume

同样地，当对虚拟机进行快照，一个虚拟机快照与最终的存储之间的示例关系如下：
- 虚拟机快照
  - 虚拟盘（CD-ROM）
  - 虚拟盘（数据盘 1）
    - iscsi LUN 快照
      - <>{Terminology['terminology']['zh-CN']['STORAGE_PRODUCT']}</> volume
  - 虚拟盘（数据盘 2）
    - iscsi LUN 快照
      - <>{Terminology['terminology']['zh-CN']['STORAGE_PRODUCT']}</> volume
      
<>{Terminology['terminology']['zh-CN']['STORAGE_PRODUCT']}</> volume 指最终的存储对象，使用 ZADP 可以与 <>{Terminology['terminology']['zh-CN']['STORAGE_PRODUCT']}</> volume 交互，完成数据的备份和恢复。

### 获取所需虚拟机的基本信息。
以下示例通过虚拟机名称进行查询，也可以根据业务实际情况使用其他的筛选条件进行查询，完整的查询方式请参考 API 文档。
通过虚拟机名称查询到对应虚拟机后，返回值中将包含 vm 的 id 和其他配置信息，如需对虚拟机配置信息进行备份，可以使用这一结果。

<GetVm />

### 创建虚拟机快照
备份业务数据时应该先创建虚拟机快照，再对快照包含的存储对象进行实际备份。
虚拟机默认创建的是崩溃一致性快照。当虚拟机已安装并启动 VMTools 时，可以创建文件系统一致性快照，具体方式为 API body 中的 consistent_type 使用 FILE_SYSTEM_CONSISTENT。
这步操作会返回 task_id，即该异步任务的 id。同时会返回 snapshot_id，即快照 id。

<CreateVmSnapshot />

之后需要基于 task id 轮询直到完成，具体请参考《异步任务》示例。

<GetTask />

### 通过第二步的快照 id 查询快照。
返回值中包含了我们寻找虚拟机快照与存储对象之间关联的必要信息。
在返回值的 vm_disks 下为该快照包含的虚拟盘，type 为 DISK 表示对应一个卷，type 为 CD_ROM 可忽略。
vm_disk 的 snapshot_local_id 即该快照对应的 LUN 快照名称。

<GetVmSnapshot />

### 通过 LUN 快照名称查询对应 LUN 快照。
通过 API 可以查询一组 LUN 快照名称对应的 LUN 快照信息。

<GetLunSnapshot />


<>每一个 LUN 快照的 local_id 字段即在 {Terminology['terminology']['zh-CN']['STORAGE_PRODUCT']} 中的标识符，可以通过{Terminology['terminology']['zh-CN']['STORAGE_PRODUCT']} API 进行进一步交互。</> 