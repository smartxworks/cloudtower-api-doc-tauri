---
title: Filtering
sidebar_position: 221
---


In step 2 of the Quick start example, we use `/v2/api/get-vms` to obtain a list of virtual machines. This is a query API, and the parameters for a query API generally include the following parts:

### Filter parameters

We define the `where` parameter for filtering resources. Each type of resource has its own `WhereInput` type for describing filtering conditions, which includes some commonly used filtering conditions such as `VmWhereInput`, `ClusterWhereInput`, etc.

#### Filtering by an exact match

For example, to filter resources where a field matches a certain value, you can directly pass the field name and value in the `where` parameter. If we want to filter virtual machines with a name of "demo", we can use the following `where` parameter:

```json
{
  "where": {
    "name": "demo"
  }
}
```

#### Filtering by not equal to

You can also filter resources where a field does not match a certain value by adding `_not` to the field name in the `where` parameter. If we want to filter virtual machines with a name that is not "demo", we can use the following `where` parameter:

```json
{
  "where": {
    "name_not": "demo"
  }
}
```

#### Filtering by membership in a set

You can use `_in` or `_not_in` to filter by whether a value belongs to or does not belong to a set. For example, if we want to filter virtual machines with a name of "demo" or "demo2", we can use the following `where` parameter:

```json
{
  "where": {
    "name_in": ["demo", "demo2"]
  }
}
```

#### Derived comparison conditions

For different types of fields, there are other derived filtering conditions. For example, for an `int` type field, you can use `_gt`, `_gte`, `_lt`, `_lte` to filter by greater than, greater than or equal to, less than, and less than or equal to. For example, if we want to filter virtual machines with more than 2 CPUs, we can use the following `where` parameter:

```json
{
  "where": {
    "vcpu_gt": "2"
  }
}
```

Different types of fields have their own derived conditions. For example, for a `string` type field, you can use `_contains`, `_starts_with`, `_ends_with`, `_not_contains`, `_not_starts_with`, `_not_ends_with`. Please refer to the detailed API documentation for specific types.

#### Filtering by cascading resources

##### Single cascading resource

If a resource corresponds to only one cascading resource, then filtering by cascading resource is simple. It is similar to filtering by a field matching a certain value, but the filtering condition changes from a value to the `WhereInput` object of the corresponding cascading resource. For example, a virtual machine can only belong to one cluster, but a cluster can have multiple virtual machines. If we want to filter virtual machines belonging to a cluster named "clusterA", we can use the following `where` parameter:

```json
{
  "where": {
    "cluster": {
      "name": "clusterA"
    }
  }
}
```

##### Multiple resources

From the above example, we know that a cluster can have multiple virtual machines. Can we query clusters by virtual machines? The answer is yes, but we cannot directly filter by items. We can use the item name plus `_every`, `_some`, `_none` to filter by whether all, some or none of the corresponding cascading resources satisfy the condition. The condition is still the `WhereInput` object of the corresponding cluster. Here is an example using `/v2/api/get-cluster`. If we want to filter clusters with at least one virtual machine named "demo", we can use the following `where` parameter:

```json
{
  "where": {
    "vms_some": {
      "name": "demo"
    }
  }
}
```

#### Combining conditions

##### Simple combination

The examples given above only use one condition, but there is no limit on the number of conditions in `where`. Different conditions can be combined. For example, if we want to filter virtual machines belonging to a cluster named "clusterA" and with more than 2 CPUs, we can use the following `where` parameter:

```json
{
  "where": {
    "cluster": {
      "name": "clusterA"
    },
    "vcpu_gt": "2"
  }
}
```

##### Operator combination

For more complex conditions, you can use `OR`, `NOT`, `AND` to combine conditions in `where`. The types of these filtering options are arrays of the current resource's `WhereInput`. For example, if we want to filter virtual machines belonging to clusterA or clusterB and not belonging to any other cluster, we can use the following `where` parameter:

```json
{
  "where": {
    "OR": [
      {
        "cluster": {
          "name": "clusterA"
        }
      },
      {
        "cluster": {
          "name": "clusterB"
        }
      }
    ],
    "NOT": [{}]
  }
}
```