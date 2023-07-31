---
title: Pagination
sidebar_position: 322
---

## Sorting Parameters

We define `OrderByInput` for sorting the results of a query. By defining the `orderBy` parameter in the query, each sortable field (such as `int`, `string`) will have an `_ASC` or `_DESC` enum type defined for sorting. Currently, only single-column sorting is supported. For example, if we want to sort virtual machines in descending order by CPU, we can use the following `order` parameter:

```json
{
  "orderBy": "VcpuDesc"
}
```

This will sort the virtual machines in descending order based on their CPU values.

## Other Parameters

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