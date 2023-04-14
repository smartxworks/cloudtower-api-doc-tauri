import '../../swagger/utils/autoScroll';

<header>
  <h1>CloudTower API General Guide</h1>
  <hr className="header-divider"/>
</header>

# Overview
Welcome to CloudTower API! Please read this General Guide carefully.
* You can use the CloudTower API to call the different types of resources that are managed by CloudTower.
* This document is written following the OpenApi Specification v3.0.0.
* To enhance ease of use, the API documentation is split into multiple modules, which can be selected from the left sidebar under the CloudTower API page, such as Virtual Machine Management and Cluster Management.
* The CloudTower API provides very flexible request parameter types, which are convenient for batch operations and conditional queries. Considering the flexibility of parameters and the convenience of usage, such as the `GET` request has some restrictions, this API document only uses the `POST` request to send data in json format.
 
## How to Call

The CloudTower API is developed following the OpenApi Specification v3.0.0., and can be called using cURL or any HTTP client. 

Currently each interface document includes:
 * Request: Request data
   * header parameters: Request parameters in the header
   * request body schema: Request filed description in body
* Response: Return data
  * 200: Description of data fields returned after a successful request.
  * 400: Description of the returned data field when the requested data is incorrect.
  * 404: A return when no corresponding operation resource can be found.
  * 500: An error within the service

Note: The panel explained by each field is folded by default. Click > to expand the details.

The panel to the right of the document includes:
* Try it: Call panel. Click the Try it button to expand the debugging panel, and you can enter parameters in the panel to call the page.
* Request samples: The calling example panel provides JSON examples and curl example codes of API interface calls.
* Response samples: Return to the example panel, which provides examples returned by the API interface.

## Authentication
> Except for login, all the requests need to add the authentication field.

The CloudTower API makes authentication by passing the `Authorization` field in the headers. Here is how to get a token, using cURL as an example:

<components.GetToken />

And here is what can be obtained:

<components.GetTokenResponse />

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
}
```
 
Take the [prisma Official Document](https://v1.prisma.io/docs/1.34/prisma-client/basic-data-access/reading-data-JAVASCRIPT-rsc2/#pagination) as an example, to further explain the query conditions of `after, before,first, last, skip`.

![first](https://i.imgur.com/O1Jj3Z2.png=x120)
``` graphql
# Get the first 3 records in the resource
{ first: 3 }
```
 
![first-and-skip](https://i.imgur.com/PpI5X0X.png=x120)
```graphql
# Get the first 5 records after the 5th one, i.e., the 6th ~ 10th records
{
   skip: 5
   first: 5
}
```

![last](https://i.imgur.com/pkuYCrV.png=x120)
```graphql
# Get the last 3 records in the resource
{
   last: 3
}
```
 
![last-and-skip](https://i.imgur.com/iSl9Y07.png=x120)
```graphql
# Get the 7 records before the last but three record, i.e., the 4th ~ 10th before the last record
{
   last: 7,
   skip: 3
}

```
 
![after-first](https://i.imgur.com/InYSSkQ.png=x120)
```graphql
# Get the first 3 records after the record with id of cixnen24p33lo0143bexvr52n
{
   after: "cixnen24p33lo0143bexvr52n",
   first: 3
}
```
 
![after-skip-first](https://i.imgur.com/u4WEAJv.png=x120)
```graphql
# Get the first 5 records after the 3rd record after the record with id of cixnen24p33lo0143bexvr52n
{
 first: 5,
 after: 'cixnen24p33lo0143bexvr52n',
 skip: 3,
}
```
 
![before-last](https://i.imgur.com/306eghw.png=x120)
```graphql
# Get the first 5 records before the record with id of cixnen24p33lo0143bexvr52n
{
 last: 5,
 before: 'cixnen24p33lo0143bexvr52n',
}
```
 
![before-skip-last](https://i.imgur.com/iZGUiHJ.png=x120)
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

In order to keep API invocations concise and consistent, this type of APIs will return the asynchronous task id as a parameter of `{ task_id: string }`.

After obtaining the `task_id`, you can further query the status and results of the asynchronous task via `/get-tasks`. Refer to `Task Center`for specific parameter types.

Please note that when a resource executes an asynchronous task, only the resource id is credible and stable, but the other fields of this resource and the fields of its associated resources could be modified in the asynchronous task. If you need to perform query or other operations on these fields, please use the resource id to perform operations again after the asynchronous task is completed.
## Example: Virtual Machine Backup via the CloudTower API
1. Backing up a virtual machine (VM) will include backing up the VM configurations such as the VM name and the number of vCPUs, and the data contained in the disks.
2.Before any backup, you need first to understand the relations between VM resources as shown below:

- VM 
  - Virtual Disk (CD-ROM)
  - Virtual Disk (Data Disk 1)
    - Virtual Volume
      - iSCSI LUN
      - ZBS Volume
  - Virtual Disk (Data Disk 2)
    - Virtual Volume
      - iSCSI LUN
      - ZBS Volume

Similarly, when taking a snapshot of a virtual machine, the relations between VM resources are shown as below:
- VM Snapshot
  - Virtual Disk (CD-ROM)
  - Virtual Disk (Data Disk 1)
    - iSCSI LUN Snapshot
      - ZBS Volume
  - Virtual Disk (Data Disk 2)
    - iSCSI LUN Snapshot
      - ZBS Volume

The ZBS volume is where the data is ultimately stored. You can read data from or write data into the ZBS volume using ZADP to complete data backup and restore.  

### Get VM Information
You can obtain the VM information using the VM name. For details, refer to the following example. You can also use other filters to get the information you need. Please refer to the API documentation for details.

After querying the desired VM, the returned value will contain the vm's ID and other configuration information. This result can be used as a backup of the VM configurations.

<components.GetVm />

### Create VM Snapshot
Before backing up the VM data, you need first to create a VM snapshot and then back up data contained in this snapshot.

The VM will create a crash-consistent snapshot by default. If you have installed VM tools in the VM, you can create a file-consistent snapshot. Specifically, pass data.consistent_type = FILE_SYSTEM_CONSISTENT. 

This step will return the task id and the snapshot id.

<components.CreateVmSnapshot />

Then you need to check the task via the loop based on the task id. For details, please refer to Asynchronous Task.

<components.GetTask />

### Query Snapshot Using Snapshot id in Step 2.
The returned value contains the necessary information to help find the association between the VM snapshot and the storage object.

The virtual disks included in the snapshot are listed under vm_disks in the returned value. If the type is DISK, it means that the virtual disk corresponds to a volume, and if the type is CD_ROM, it can be ignored.

The snapshot_local_id of vm_disk is the name of the LUN snapshot corresponding to the snapshot.

<components.GetVmSnapshot />

### Query LUN Snapshot Using the LUN Name 

Through the API, you can query the LUN snapshot information corresponding to a group of LUN snapshot names.

<components.GetLunSnapshot />

The local_id field of each LUN snapshot is the identifier in ZBS and can be further interacted with through the ZBS API.