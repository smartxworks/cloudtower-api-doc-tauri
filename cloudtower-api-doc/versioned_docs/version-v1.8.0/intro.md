---
id: intro
slug: /
---

# CloudTower API 通用指南
欢迎使用 CloudTower API, 请仔细阅读通用指南。
* CloudTower API 可以用于调用 CloudTower 内所管理的各类资源。
* 此文档采用 OpenApi v3.0.0 规范书写。
* 为了增强易用性，将 API 文档拆分为多个模块，可以通过页面右上角下拉框，选择具体的模块，例如：「用户管理」、「多集群管理」 等。
* CloudTower API 提供了极为灵活的请求参数类型，方便进行批量操作和条件查询，考虑到参数灵活性和使用上的便捷性，如 `GET` 具有请求限制等，所以一律使用了 `POST` 请求类型，发送 json 类型格式的数据。
​
​
## 如何调用
CloudTower API 基于 OpenApi v3.0.0 规范进行开发，可以使用 cURL 或任何 HTTP 客户端进行调用。
​
为每个具体的接口提供 example 示例，包括请求参数和返回参数示例，可以通过修改示例参数来进行调用。
​
为每个接口下的 schema 提供详细的参数类型，具体请参考各接口的 example 和 schema 。
​
点击 `Try it out` 可以对真实的环境进行调用，通过选择上方的 `服务` 下拉框连接服务。
​
## 鉴权
> 除了登录以外，所有的请求都需要加上鉴权字段。

​
CloudTower API 通过在 headers 中传递 `Authorization` 字段进行鉴权，token 的获取方式如下, 以 cURL 为例：
```ssh
curl -X 'POST' \
 'http://192.168.31.209/v2/api/login' \
 -H 'accept: application/json' \
 -H 'content-language: en-US' \
 -H 'Content-Type: application/json' \
 -d '{
 "username": "string",
 "source": "LOCAL",
 "password": "string"
}'
```
获取到
```ssh
{
 "task_id": "string",
 "data": {
   "token": "string"
 }
}
```
其中  `data.token` 是需要用到的鉴权字段，加入到 `header.Authorization ` 即可。
* 如果通过 cURL 调用， 则加入 `-H 'Authorization: token-string'`。
* 如果通过 swagger api 文档页面调用，则点击 `Authorization` 按钮，将`data.token` 填入到 `value` 中即可。
## 分页查询
| 字段名 |  类型 |  是否必填 |  解释 | 
|  ----- |  :---: |  :-------: |  --- | 
|  **after** |  string |  否 |  填入单个资源的 id。表示从该资源之后开始获取，不包含该资源。| 
|  **before** | string | 否 | 填入单个资源的 id。表示从该资源之前开始获取，不包含该资源。| 
|  **first** | number | 否| 可与 after / before 搭配使用，表示获取指定资源后的多少个数据。| 
| **last** | number | 否 | 非必填项。可与 after / before 搭配使用，表示获取指定资源前的多少个数据。| 
|  **skip** | number | 否 | 非必填项。可与 after / before 搭配使用，表示跳过指定资源的 n 项后开始查询。| 
|  **orderBy** | enum | 否 | 所有的值都在 api 各自的 schema 中可以查询到。表示查询顺序，通常包含了资源所有字段的降序(`_DESC`)或者升序 (`_ASC`)。| 
|  **where** | object | 否| 条件查询，表示查询符合该条件的资源。where 的具体类型定义可在对应 api 的 schema 中查询到。| 
```graphql
# 以 `/get-users` 为例，where 为 `UserWhereInput` , 对 id 值的查询条件进行说明。

{
   # 满足 id 为 1 的资源
   id: "1",
   # 满足 id 不为 1 的资源
   id_not: "1"
   # 满足 id 在给定范围内的资源
   id_in: ["1","2","3","4"]
   # 满足 id 不在给定范围内的资源
   id_not_in: ["1","2","3","4"]
   # 满足 id 小于 1 的资源, lt = less than (<)
   id_lt: "1",
   # 满足 id 小于等于 1 的资源, lte = less than or equals (≤)
   id_lte: "1",
   # 满足 id 大于 1 的资源, gt = greater than (>)
   id_gt: "1",
   # 满足 id 大于等于 1 的资源, gte = greater than or equals ( ≥)
   id_gte: "1"
   # 满足 id 值中包含 1 的资源
   id_contains: "1",
   # 满足 id 值中不包含 1 的资源
   id_not_contains: "1"
   # 满足 id 值以 1 为起始的资源
   id_starts_with: "1",
   # 满足 id 值不以 1 为起始的资源
   id_not_starts_with: "1",
   # 满足 id 值以 1 为结尾的资源
   id_ends_with: "1",
   # 满足 id 值不以 1 为结尾 的资源
   id_not_ends_with: "1"
​
}
```
​
以 [prisma 官方文档](https://v1.prisma.io/docs/1.34/prisma-client/basic-data-access/reading-data-JAVASCRIPT-rsc2/#pagination) 为例，对`after, before,first, last, skip`查询条件进一步说明。
​
​
![first](https://i.imgur.com/O1Jj3Z2.png=x120)
``` graphql
# 获取资源中的前三条记录
{ first: 3 }
```
​
​
![first-and-skip](https://i.imgur.com/PpI5X0X.png=x120)
```graphql
# 获取第 5 条记录之后的前 5 条记录，即第 6 ～ 10 条记录
{
   skip: 5
   first: 5
}
```
​
![last](https://i.imgur.com/pkuYCrV.png=x120)
```graphql
# 获取资源的后三条记录
{
   last: 3
}
```
​
![last-and-skip](https://i.imgur.com/iSl9Y07.png=x120)
```graphql
# 获取倒数第 3 条记录之前的 7 条记录，即倒数第 4 ~ 10 条记录
{
   last: 7,
   skip: 3
}
​
```
![after-first](https://i.imgur.com/InYSSkQ.png=x120)
```graphql
# 获取 id 为 cixnen24p33lo0143bexvr52n 的记录之后的前 3 条记录
{
   after: "cixnen24p33lo0143bexvr52n",
   first: 3
}
```
​
![after-skip-first](https://i.imgur.com/u4WEAJv.png=x120)
```graphql
# 获取 id 为 cixnen24p33lo0143bexvr52n 的记录之后的第 3 条资源之后的前 5 条记录，即第 4～8 条记录
{
 first: 5,
 after: 'cixnen24p33lo0143bexvr52n',
 skip: 3,
}
```
![before-last](https://i.imgur.com/306eghw.png=x120)
```graphql
# 获取 id 为 cixnen24p33lo0143bexvr52n 的记录之前的 5 条记录
{
 last: 5,
 before: 'cixnen24p33lo0143bexvr52n',
}
```
![before-skip-last](https://i.imgur.com/iZGUiHJ.png=x120)
```graphql
# 获取 id 为 cixnen24p33lo0143bexvr52n 的记录之前的倒数第 5 条资源之前的 3 条记录，即倒数第 6 ～ 9 条记录
{
 last: 3,
 before: 'cixnen24p33lo0143bexvr52n',
 skip: 5,
}
```
## 异步任务
CloudTower 在管理资源时，大多数时候会将实际的操作过程放入异步任务中执行。因此当一次涉及到创建、删除、修改的 API 返回结果后，其对应的实际操作可能还在执行中，该操作的状态将由对应的异步任务进行展示。
​
为了保持 API 调用的简洁与一致，此类 API 会将其产生的异步任务 id 以 `{ task_id: string }` 的参数返回。
​
获得 `task_id` 后可以进一步通过 `/get-tasks` 查询异步任务的状态和结果，具体参数类型请查看 `任务中心`。
 
需要注意的是，在资源执行异步任务时，只有资源的 id 是可信稳定的，资源的其他字段及其关联资源的字段都有可能在异步任务中进行更改。如果需要对这些字段进行查询或其它操作，请在异步任务完成之后通过 id 再次进行操作。
## 虚拟机备份 CloudTower API 示例
对虚拟机的备份分为两部分
1. 虚拟机配置的备份，例如虚拟机名称、vcpu 数量等。
2. 虚拟机业务数据的备份。在 SMTX OS 中，即虚拟机所使用的存储的备份。
对虚拟机业务数据备份之前，需要先理解 SMTX OS 虚拟机的资源关系。一个虚拟机与最终的存储之间的示例关系如下：
- 虚拟机
  - 虚拟盘（CD-ROM）
  - 虚拟盘（数据盘 1）
    - 虚拟卷
      - iscsi LUN
        - ZBS volume
  - 虚拟盘（数据盘 2）
    - 虚拟卷
      - iscsi LUN
        - ZBS volume
同样地，当对虚拟机进行快照，一个虚拟机快照与最终的存储之间的示例关系如下：
- 虚拟机快照
  - 虚拟盘（CD-ROM）
  - 虚拟盘（数据盘 1）
    - iscsi LUN 快照
      - ZBS volume
  - 虚拟盘（数据盘 2）
    - iscsi LUN 快照
      - ZBS volume
ZBS volume 指最终的存储对象，使用 ZADP 可以与 ZBS volume 交互，完成数据的备份和恢复。
### 获取所需虚拟机的基本信息。
以下示例通过虚拟机名称进行查询，也可以根据业务实际情况使用其他的筛选条件进行查询，完整的查询方式请参考 API 文档。
通过虚拟机名称查询到对应虚拟机后，返回值中将包含 vm 的 id 和其他配置信息，如需对虚拟机配置信息进行备份，可以使用这一结果。
```ssh
curl --location --request POST 'http://CLOUDTOWER_IP/v2/api/get-vms' \ --header 'Authorization: YOUR_TOKEN' \
--header 'Content-Type: application/json' \
--data-raw '{
"where": {
"name": "YOUR_VM_NAME"
} }'
```
### 创建虚拟机快照
备份业务数据时应该先创建虚拟机快照，再对快照包含的存储对象进行实际备份。
虚拟机默认创建的是崩溃一致性快照。当虚拟机已安装并启动 VMTools 时，可以创建文件系统一致性快照，具体方式为 API body 中的 consistent_type 使用 FILE_SYSTEM_CONSISTENT。
这步操作会返回 task_id，即该异步任务的 id。同时会返回 snapshot_id，即快照 id。
```ssh
curl --location --request POST 'http://CLOUDTOWER_IP/v2/api/create-vm-snapshot' \
--header 'Authorization: YOUR_TOKEN' \
--header 'Content-Type: application/json' \
--data-raw '{ "data": {
} }'
```
之后需要基于 task id 轮询直到完成，具体请参考《异步任务》示例。
```ssh
curl --location --request POST 'http://CLOUDTOWER_IP/v2/api/get-tasks' \ --header 'Authorization: YOUR_TOKEN' \
--header 'Content-Type: application/json' \
--data-raw '{
"where": {
"id": "STEP_2_TASK_ID"
} }'
```
### 通过第二步的快照 id 查询快照。
返回值中包含了我们寻找虚拟机快照与存储对象之间关联的必要信息。
在返回值的 vm_disks 下为该快照包含的虚拟盘，type 为 DISK 表示对应一个卷，type 为 CD_ROM 可忽略。
vm_disk 的 snapshot_local_id 即该快照对应的 LUN 快照名称。
```ssh
curl --location --request POST 'http://CLOUDTOWER_IP/v2/api/get-vm-snapshots' \
--header 'Authorization: YOUR_TOKEN' \
--header 'Content-Type: application/json' \
--data-raw '{ "where": {
"id": "STEP_2_SNAPSHOT_ID" }
}'
```
### 通过 LUN 快照名称查询对应 LUN 快照。
通过 API 可以查询一组 LUN 快照名称对应的 LUN 快照信息。
```ssh
curl --location --request POST 'http://CLOUDTOWER_IP/v2/api/get-iscsi-lun-snapshots' \
--header 'Authorization: YOUR_TOKEN' \
--header 'Content-Type: application/json' \
--data-raw '{ "where": {
"name_in": ["STEP_4_SNAPSHOT_LOCAL_ID_1", "STEP_4_SNAPSHOT_LOCAL_ID_2"] }
}'
```
每一个 LUN 快照的 local_id 字段即在 ZBS 中的标识符，可以通过 ZBS API 进行进一步交互。
