---
sidebar_position: 1
id: intro
slug: /
---
# CloudTower API General Guide
Welcome to CloudTower API! Please read this General Guide carefully.
* You can use the CloudTower API to call the different types of resources that are managed by CloudTower.
* This document is written following the OpenApi Specification v3.0.0.
* For a better readability, this API document is divided into multiple modules. You can select a particular module by clicking the drop-down box at the upper-right corner of the page, for example, “User Management”, “Multiple Cluster Management”, etc.
* The CloudTower API provides very flexible request parameter types, which are convenient for batch operations and conditional queries. Considering the flexibility of parameters and the convenience of usage, such as the `GET` request has some restrictions, this API document only uses the `POST` request to send data in json format.
 
​## How to Call
​
The CloudTower API is developed following the OpenApi Specification v3.0.0., and can be called using cURL or any HTTP client. 
 
The APIs provide examples for each specific interface, including request parameters and return results. You can modify the example parameters to call the API.
​
The APIs also provide detailed parameter types for the schema of each interface. For more details, please refer to the example and schema of each interface.
​
Click `Try it out` to make an API call in the real environment and connect to the services by selecting the upper drop-down box of `Servers`.
## Authentication
> Except for login, all the requests need to add the authentication field.
​
The CloudTower API makes authentication by passing the `Authorization` field in the headers. Here is how to get a token, using cURL as an example:
```ssh
curl -X 'POST' \
 'http://localhost:3000/v2/api/login' \
 -H 'accept: application/json' \
 -H 'content-language: en-US' \
 -H 'Content-Type: application/json' \
 -d '{
 "username": "string",
 "source": "LOCAL"，
 "password": "string"
}'
```
And here is what can be obtained:
```ssh
{
 "task_id": "string",
 "data": {
   "token": "string"
 }
}
```
The `data.token` is the authentication field to be used, you can just add it to `header.Authorization`.
* If called via cURL, add `-H 'Authorization: token-string'`.
* If called via the swagger api documentation page, click the `Authorization` button and add `data.token` to `value`.
## Pagination Query
| Parameter Name | Type |  Required |  Explain | 
| --- | :---: | :---: | ---- | 
| **after** | string | No | Fill in a single resource’s id, representing to acquire resources after this resource and not including it. |
| **before** | string | No | Fill in a single resource’s id, representing to acquire resources before this resource but not including it.|
| **first** | number | No | It can be used together with after / before, representing the number of data acquired after the specified resource. |
| **last** | number | No | It can be used together with after / before, representing the number of data acquired before the specified resource. |
| **skip** | number | No | It can be used together with after / before，representing to start a query after skipping n items of the specified resource.|
| **orderBy** | enumeration | No | all the values can be queried in the respective schema of the api. It represents the order of query results, usually including descending or ascending order of all the fields of the resource, i.e., `_DESC` or `_ASC`.|
| **where** | object | No | conditional query, representing to query the resources that meet the conditions. The specific type of where can be found in the schema of the corresponding api. |
 
```graphql
#Take `/get-users` as an example, where is `UserWhereInput`, which explains the query conditions of the id value.

{
   # The resource whose id is 1
   id: "1",
   # The resource whose id is not 1
   id_not: "1"
   # The resource whose id is within the given range
   id_in: ["1","2","3","4"]
   # The resource whose id is not within the given range
   id_not_in: ["1","2","3","4"]
   # The resource whose id is less than 1, here lt = less than (<)
   id_lt: "1",
   # The resource whose id is less than or equal to 1, here lte = less than or equals (≤)
   id_lte: "1",
   # The resource whose id is greater than 1, here gt = greater than (>)
   id_gt: "1",
   # The resource whose id is greater than or equal to 1, here gte = greater than or equals ( ≥)
   id_gte: "1"
   # The resource whose id value contains 1
   id_contains: "1",
   # The resource whose id value does not contain 1
   id_not_contains: "1"
   # The resource whose id value starts with 1
   id_starts_with: "1",
   # The resource whose id value does not start with 1
   id_not_starts_with: "1",
   # The resource whose id value ends with 1
   id_ends_with: "1",
   # The resource whose id value does not end with 1
   id_not_ends_with: "1"
​}
```
 
Take the “prisma Official Document”(https://v1.prisma.io/docs/1.34/prisma-client/basic-data-access/reading-data-JAVASCRIPT-rsc2/#pagination) as an example, to further explain the query conditions of `after, before,first, last, skip`.
​
```
![first](https://i.imgur.com/O1Jj3Z2.png =x120)
``` graphql
# Get the first 3 records in the resource
{ first: 3 }
```
 
![first-and-skip](https://i.imgur.com/PpI5X0X.png =x120)
```graphql
# Get the first 5 records after the 5th one, i.e., the 6th ~ 10th records
{
   skip: 5
   first: 5
}
```
​
![last](https://i.imgur.com/pkuYCrV.png =x120)
```graphql
# Get the last 3 records in the resource
{
   last: 3
}
```
 
​![last-and-skip](https://i.imgur.com/iSl9Y07.png =x120)
```graphql
# Get the 7 records before the last but three record, i.e., the 4th ~ 10th before the last record
{
   last: 7,
   skip: 3
}
​
```
 
![after-first](https://i.imgur.com/InYSSkQ.png =x120)
```graphql
# Get the first 3 records after the record with id of cixnen24p33lo0143bexvr52n
{
   after: "cixnen24p33lo0143bexvr52n",
   first: 3
}
```
 
![after-skip-first](https://i.imgur.com/u4WEAJv.png =x120)
```graphql
# Get the first 5 records after the 3rd record after the record with id of cixnen24p33lo0143bexvr52n
{
 first: 5,
 after: 'cixnen24p33lo0143bexvr52n',
 skip: 3,
}
```
 
![before-last](https://i.imgur.com/306eghw.png =x120)
```graphql
# Get the first 5 records before the record with id of cixnen24p33lo0143bexvr52n
{
 last: 5,
 before: 'cixnen24p33lo0143bexvr52n',
}
```
 
![before-skip-last](https://i.imgur.com/iZGUiHJ.png =x120)
```graphql
# Get the 3 records before the last but five record before the record with id of cixnen24p33lo0143bexvr52n, i.e., the 6th ~ 9th records from the record with that id
{
 last: 3,
 before: 'cixnen24p33lo0143bexvr52n',
 skip: 5,
}
```
## Asynchronous Task
When you use CloudTower to manage resources, most of the time, the actual operations are put into an asynchronous task to execute, therefore, after an API that includes such operations as creation, deletion, and modification returns a result, the corresponding operations may still be in execution, and the status of the operations will be displayed by the corresponding asynchronous task.
​
In order to keep API invocations concise and consistent, this type of APIs will return the asynchronous task id as a parameter of `{ task_id: string }`.
​
After obtaining the `task_id`, you can further query the status and results of the asynchronous task via `/get-tasks`. Refer to `Task Center`for specific parameter types.

Please note that when a resource executes an asynchronous task, only the resource id is credible and stable, but the other fields of this resource and the fields of its associated resources could be modified in the asynchronous task. If you need to perform query or other operations on these fields, please use the resource id to perform operations again after the asynchronous task is completed.
## An Example of CloudTower API: Virtual Machine Backup
1. Obtain the basic information of the virtual machine, for example, query by virtual machine name to obtain the virtual machine’s id.
```ssh
curl --location --request POST 'http://192.168.31.209/v2/api/get-vms' \ --header 'Authorization: YOUR_TOKEN' \
--header 'Content-Type: application/json' \
--data-raw '{
"where": {
"name": "YOUR_VM_NAME"
} }'
```
2. Create a virtual machine snapshot. When the virtual machine is installed with the VMTools and the VMTools is started，the consistent_type can use FILE_SYSTEM_CONSISTENT  to represent a consistency snapshot of the file system. This operation will return task_id, i.e., the id of the asynchronous task; in the meanwhile, will return snapshot id, i.e., the id of the snapshot.
```ssh
​curl --location --request POST 'http://192.168.31.209/v2/api/create-vm-snapshot' \
--header 'Authorization: YOUR_TOKEN' \
--header 'Content-Type: application/json' \
--data-raw '{ "data": {
} }'
```
3. Polling until the task is completed.(The status is SUCCESSED.)
```ssh
curl --location --request POST 'http://192.168.31.209/v2/api/get-tasks' \ --header 'Authorization: YOUR_TOKEN' \
--header 'Content-Type: application/json' \
--data-raw '{
"where": {
"id": "STEP_2_TASK_ID"
} }'
```
4. Query the snapshot by using the snapshot is obtained in Step 2.
The vm_disks in the return value is the virtual disk included in the snapshot, the type of DISK represents a corresponding volume, and the type of CD_ROM can be ignored.
The snapshot_local_id of vm_disk is the name of the LUN snapshot corresponding to this snapshot.
```ssh
curl --location --request POST 'http://192.168.31.209/v2/api/get-vm-snapshots' \
--header 'Authorization: YOUR_TOKEN' \
--header 'Content-Type: application/json' \
--data-raw '{ "where": {
"id": "STEP_2_SNAPSHOT_ID" }
}'
```
5. Query the corresponding LUN snapshot by using the LUN snapshot name.
The local_id of each LUN snapshot is the identifier in ZBS and can be used by ZBS APIs for more interactive operations.
```ssh
​curl --location --request POST 'http://192.168.31.209/v2/api/get-iscsi-lun- snapshots' \
--header 'Authorization: YOUR_TOKEN' \
--header 'Content-Type: application/json' \
--data-raw '{ "where": {
"name_in": ["STEP_4_SNAPSHOT_LOCAL_ID_1", "STEP_4_SNAPSHOT_LOCAL_ID_2"] }
}'
```