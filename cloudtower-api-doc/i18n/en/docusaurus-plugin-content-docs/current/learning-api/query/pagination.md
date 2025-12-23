---
title: Pagination query
sidebar_position: 222
---

import Terminology from '@site/terminology.json'

### Sorting parameters

We define `OrderByInput` to sort the query results. By providing the `orderBy` parameter in your query, each sortable field (e.g., `int` and `string`) has an associated enum type with `_DESC` and `_ASC` values to define the sort order. Currently, only single-column sorting is supported. For example, if you want to sort virtual machines in descending order by CPU, you can use the following `orderBy` parameter: 

```json
{
  "orderBy": "vcpu_DESC"
}
```

### Other parameters

<>The pagination parameters currently provided by the {Terminology['terminology']['en-US']['PRODUCT']} API are as follows: </>

| <strong>Field</strong> | <strong>Type</strong> | <strong>Required</strong> | <strong>Description</strong>                                                                                                                                                                                                                                                  |
| ---------------------- | :-------------------: | :-----------------------: | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `after`                |         string        |             No            | The ID of a single resource. This field retrieves results that come after the specified resource, excluding itself.                                                                                                                           |
| `before`               |         string        |             No            | The ID of a single resource. This field retrieves results that come before the specified resource, excluding itself.                                                                                                                          |
| `first`                |         number        |             No            | This field retrieves the first n resources, which can be used together with `after` or `before`.                                                                                                                                                              |
| `last`                 |         number        |             No            | Optional. This field retrieves the last n resources, which can be used together with `after` or `before`.                                                                                                                                     |
| `skip`                 |         number        |             No            | Optional. This field starts the query after skipping n resources, which can be used together with `after` or `before`.                                                                                                                        |
| `orderBy`              |          enum         |             No            | All possible values are defined in the corresponding API schema. This field indicates the query order and typically includes descending (`_DESC`) or ascending (`_ASC`) orders for all resource fields. |
| `where`                |         object        |             No            | This field indicates the conditional query and filters resources that match the specified condition. The exact type of `where` can be found in the corresponding API schema.                                                                  |

```graphql
# Example: For `/get-users`, `where` is `UserWhereInput`, demonstrating the query conditions for the `id` field. 

{
   # Resources with `id` equal to 1
   id: "1",
   
   # Resources with `id` not equal to 1
   id_not: "1",
   
   # Resources with `id` in a given list
   id_in: ["1","2","3","4"],
   
   # Resources with `id` not in the given list
   id_not_in: ["1","2","3","4"],
   
   # Resources with `id` less than 1; `lt` means "less than".
   id_lt: "1",
   
   # Resources with `id` less than or equal to 1; `lte` means "less than or equal to".
   id_lte: "1",
   
   # Resources with `id` greater than 1; `gt` means "greater than".
   id_gt: "1",
   
   # Resources with `id` greater than or equal to 1; `gte` means "greater than or equal to".
   id_gte: "1",
   
   # Resources with `id` containing 1
   id_contains: "1",
   
   # Resources with `id` not containing 1
   id_not_contains: "1",
   
   # Resources with `id` starting with 1
   id_starts_with: "1",
   
   # Resources with `id` not starting with 1
   id_not_starts_with: "1",
   
   # Resources with `id` ending with 1
   id_ends_with: "1",
   
   # Resources with `id` not ending with 1
   id_not_ends_with: "1"
}
```

You can refer to the [Prisma official documentation](https://v1.prisma.io/docs/1.34/prisma-client/basic-data-access/reading-data-JAVASCRIPT-rsc2/#pagination), which provides a detailed explanation of the query parameters `after`, `before`, `first`, `last`, and `skip`.
​
​
![first](https://i.imgur.com/O1Jj3Z2.png=x120)

```graphql
# Retrieve the first 3 records from the resources.
{ first: 3 }
```

​
​
![first-and-skip](https://i.imgur.com/PpI5X0X.png=x120)

```graphql
# Retrieve the first 5 records after the 5th record (i.e., records 6 to 10).
{
   skip: 5
   first: 5
}
```

​
![last](https://i.imgur.com/pkuYCrV.png=x120)

```graphql
# Retrieve the last 3 records of the resources.
{
   last: 3
}
```

​
![last-and-skip](https://i.imgur.com/iSl9Y07.png=x120)

```graphql
# Retrieve the 7 records before the 3rd-to-last record (i.e., the 4th-to-last through 10th-to-last records).
{
   last: 7,
   skip: 3
}
```

![after-first](https://i.imgur.com/InYSSkQ.png=x120)

```graphql
# Retrieve the first 3 records after the record with `id` being `cixnen24p33lo0143bexvr52n`.
{
   after: "cixnen24p33lo0143bexvr52n",
   first: 3
}
```


![after-skip-first](https://i.imgur.com/u4WEAJv.png=x120)

```graphql
# Retrieve the first 5 records after the 3rd records following the record with id cixnen24p33lo0143bexvr52n (i.e., records 4 to 8 after that record)
{
   first: 5,
   after: "cixnen24p33lo0143bexvr52n",
   skip: 3
}
```

![before-last](https://i.imgur.com/306eghw.png=x120)

```graphql
# Retrieve the 5 records before the record with `id` being `cixnen24p33lo0143bexvr52n`.
{
  last: 5,
  before: "cixnen24p33lo0143bexvr52n"
}
```

![before-skip-last](https://i.imgur.com/iZGUiHJ.png=x120)

```graphql
# Retrieve the 3 records before the 5th-to-last record preceding the record with `id` being `cixnen24p33lo0143bexvr52n` (i.e., the 6th-to-last through 9th-to-last records).
{
  last: 3,
  before: "cixnen24p33lo0143bexvr52n",
  skip: 5
}
```