---
title: 分页查询
---

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