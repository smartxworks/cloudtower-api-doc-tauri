---
title: Filter conditions
sidebar_position: 221
---

In the second step of the _Quick start_ example, we used `/v2/api/get-vms`, a query API, to obtain a list of virtual machines. The parameters of a query API typically include the following parts:

### Filter condition parameters

The `where` parameter is used to filter resources. Each type of resource has its own `WhereInput` type, which defines the filter conditions. Some common examples include `VmWhereInput`, `ClusterWhereInput`, etc.

#### Filtering by a field value

To filter resources where a field equals a specific value, simply pass the field name and value in the `where` parameter. For example, to filter virtual machines whose name is "demo", use the following `where` parameter:

```json
{
  "where": {
    "name": "demo"
  }
}
```

#### Filtering by a field not equal to a value

You can also use the `where` parameter to filter resources where a field does not equal a specific value by simply passing the field name with `_not` appended, along with the corresponding value. For example, to filter virtual machines whose name is not "demo", use the following `where` parameter:

```json
{
  "where": {
    "name_not": "demo"
  }
}
```

#### Filtering by a field in a set

The `where` parameter also supports `_in` and `_not_in` based on whether the value is in or not in a given set. For example, to filter virtual machines whose name is "demo" or "demo2", use the following `where` parameter:

```json
{
  "where": {
    "name_in": ["demo", "demo2"]
  }
}
```

#### Derivied comparison conditions

Other comparison-based filter conditions exist for different fields. For example, for an int field, you can append `_gt`, `_gte`, `_lt`, or `_lte` to the field name to filter for values, which represent "greater than", "greater than and equal to", "less than", or "less than and equal to", respectively. For instance, to filter virtual machines with more than 2 CPUs, you can use the following `where` parameter:

```json
{
  "where": {
    "vcpu_gt": "2"
  }
}
```

Fields of different types have their own derived conditions. For example, for a string field, you can append `_contains`, `_starts_with`, `_ends_with`, `_not_contains`, `_not_starts_with`, or `_not_ends_with` to the field name. For details, refer to the API documentation.

#### Filtering by cascaded resources

##### Single related resource

If a resource field corresponds to only one related (cascaded) resource, filtering by this related resource is straightforward. It works similarly to filtering a field by a specific value. The difference is that the filter condition uses the WhereInput object of the related resource instead of a single value. For example, since each virtual machine can belong to only one cluster, but a cluster can contain multiple virtual machines. You can filter virtual machines that belong to the cluster named "clusterA" using the following `where` parameter:

```json
{
  "where": {
    "cluster": {
      "name": "clusterA"
    }
  }
}
```

##### Multiple related resources

From the previous example, we know that a cluster can contain multiple virtual machines. Can we filter clusters based on their virtual machines? The answer is yes, but we cannot filter directly by a single field.
Instead, you can use the field name appended with `_every`, `_some`, or `_none` to filter related sources. The filter condition is still the `WhereInput` object of the related cluster. These three operators indicate whether all, some, or none of the related resources satisfy the condition. For example, using the `/v2/api/get-cluster` API: if you want to filter clusters that have any virtual machine named "demo", you can use the following `where` parameter:

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

The previous examples used only a single condition. The `where` parameter is not limited to a single condition, and multiple conditions can be combined. For example, to filter virtual machines that belong to the cluster named "clusterA" and have a cpu greater than 2, you can use the following `where` parameter:

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

##### Combining with operators

For complex conditions, you can combine `where` with `OR`, `AND`, and `NOT`. These filter options are all arrays of the `WHEREInput` of the current resource.
For example, if you want to filter out clusters that belong to clusters named `clusterA` or `clusterB`, we can use the following combination of `where` parameters:

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