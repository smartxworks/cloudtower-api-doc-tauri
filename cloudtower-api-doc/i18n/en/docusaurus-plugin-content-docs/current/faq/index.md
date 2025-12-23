---
title: FAQ
---

import Terminology from '@site/terminology.json'

## Why do the IDs of some resources keep changing?

<>In {Terminology['terminology']['en-US']['PRODUCT']}</>, virtual disks and virtual NICs are virtual resources that do not correspond to any physical entities. They represent the connections between two types of resources. For example, a virtual disk represents the connection between a virtual machine and a virtual disk or a virtual CD-ROM.
Since these resources cannot be uniquely identified during updates or synchronizations, each update or synchronization will delete the existing virtual resources and recreate them, which results in ID changes.
When querying these resources, use other attributes instead of directly using IDs to accurately locate these resources.
For example, you can query a virtual-volume-type virtual disk by using the IDs of the virtual machine and the corresponding virtual volume. The resulting virtual disk will be stable because both IDs used are stable.

```json
// VmDiskWhereInput
{
  "where": {
    "vm": {
      "id": "vm_id"
    },
    "vm_volume": {
      "id": "volume_id"
    }
  }
}
```

For virtual NICs, you can use the MAC address as an additional identifier.

```json
// VmNicWhereInput
{
  "where": {
    "vm": {
      "id": "vm_id"
    },
    "mac_address": "aa:bb:cc:dd:ee:ff"
  }
}
```

## connect_vlan_id

This parameter may be confused with a VLAN ID. However, in this context, `connect_vlan_id` does not refer to a VLAN ID ranges from 0 to 4095. Instead, it specifies the CUID of the VLAN to be used.

## How to configure networks?

The only way to configure networks when creating a virtual machine is through cloud-init. You must create a virtual machine from a template that already has cloud-init preinstalled.
You can configure the network of a NIC, including setting the static IP addresses, gateways, and DNS servers, in the cloud-init configuration file.

```json
// VmCreateVmFromContentLibraryTemplateParams[]
[
  {
    "template_id": "template_id",
    "cluster_id": "cluster_id",
    "name": "vm_name",
    "is_full_copy": false,
    "cloud_init": {
      "nameservers": ["114.114.114.114"],
      "networks": [
        {
          "ip_address": "192.168.20.1", //  Static IP
          "netmask": "255.255.240.0", // Subnet
          "nic_index": 0,
          "type": "IPV4",
          "routes": [
            {
              "gateway": "192.168.16.1", // Default gateway
              "network": "0.0.0.0",
              "netmask": "0.0.0.0"
            }
          ]
        }
      ]
    }
  }
]
```

For running virtual machines, modifying network settings such as static IP addresses, subnet masks, and gateways requires that you install and run the VMTools package inside the virtual machine's system. Then you can run `/update-vm-nic-basic-info` to update the network configuration.

```json
// VmUpdateNicBasicInfoParams
{
    "where":{
        "vm":{
            "id":"vm_id"
        },
        "mac_address":"aa:bb:cc:dd:ee:ff"
    },
    "data":{
        "ip_address":"192.168.1.2",
        "subnet_mask":"255.255.255.0",
        "gateway":"192.168.1.1"
    }
}
```

## ResourceLockedError

<>Although the {Terminology['terminology']['en-US']['PRODUCT']} API is presented as an imperative API, the imperative API is actually converted into a declarative API. Repeating operations on the same resource may therefore cause dirty data conflicts. </>

For example, assume that request A attempts to expand an existing volume of a virtual machine from 10 GB to 20 GB, while request B attempts to mount a new 10 GB volume to the same virtual machine.

<>Since the {Terminology['terminology']['en-US']['PRODUCT']} API requires additional processing of requests, it is possible that requests A and B read the original data and obtain consistent values, each encapsulating its own request. In this case, the declarative data will not include the changes made by the other request. When submitting requests, if one request is received first and locks the resource, the other request will fail due to resource contention if it arrives before the lock is released. </>

Conversely, if the latter request arrives after the lock is released, it may overwrite the results of the earlier request, causing unexpected impacts and dirty data.

<>To prevent such issues, since {Terminology['terminology']['en-US']['PRODUCT']} API 3.3.0, an additional resource-locking mechanism has been implemented. When receiving a response with the status code <code>400</code>: </>

```json
{
  "path":"/remove-vm-disk",
  "status":400,
  "message":"Resource [VM-clny8ylbd19q0958o3avqavm] locked",
  "props": {
    "locked_resources": [
      {
        "id": "clny8ylbd19q0958o3avqavm",
        "type": "VM"
      }
    ]
  },
  "code":"ResourceLocked"
}
```

You can identify this type of error by checking whether the code is `ResourceLocked`. In this case, you can obtain information about the locked resources from `props.locked_resources`. The `type` field indicates the type of the locked resources, which can be virtual machines (`VM`) or virtual volumes (`VM_VOLUME`). The `id` field represents the corresponding resource ID.

You can check the resource status through the corresponding API. The `entityAsyncStatus` field indicates whether the resource is still locked. If `entityAsyncStatus` is `null`, the resource is available for operations. Any other value indicates that the resource is undergoing changes, and you need to wait until the changes are completed before performing operations.