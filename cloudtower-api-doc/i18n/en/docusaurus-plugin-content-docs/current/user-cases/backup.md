---
title: Backing up a virtual machine
---

import Terminology from '@site/terminology'
import GetVm from '../../code_blocks/GetVm.md'
import CreateVmSnapshot from '../../code_blocks/CreateVmSnapshot.md'
import GetTask from '../../code_blocks/GetTask.md'
import GetVmSnapshot from '../../code_blocks/GetVmSnapshot.md'
import GetLunSnapshot from '../../code_blocks/GetLunSnapshot.md'

The backup of a virtual machine can be divided into two parts:

1. Backing up  the virtual machine configuration, such as the virtual machine name, number of vCPUs, etc.
2. <>Backing up the virtual machine's data. In {Terminology['terminology']['en-US']['HCI_OS']}, this refers to backing up the storage used by the virtual machine.
   Before backing up virtual machine data, it is necessary to understand the resource relationships on the virtual machine in {Terminology['terminology']['en-US']['HCI_OS']}. An example relationship between a virtual machine and the final storage is as follows: </>

- Virtual machine
  - Virtual disk (CD-ROM)
  - Virtual disk (data disk 1)
    - Virtual volume
      - iSCSI LUN
        - <>{Terminology['terminology']['en-US']['STORAGE_PRODUCT']}</> volume
  - Virtual disk (data disk 2)
    - Virtual volume
      - iSCSI LUN
        - <>{Terminology['terminology']['en-US']['STORAGE_PRODUCT']}</> volume

Similarly, when taking a snapshot of a virtual machine, an example of the snapshot's relationship with its final storage is as follows:

- Virtual machine snapshot
  - Virtual disk (CD-ROM)
  - Virtual disk (data disk 1)
    - iSCSI LUN snapshot
      - <>{Terminology['terminology']['en-US']['STORAGE_PRODUCT']}</> volume
  - Virtual disk (data disk 2)
    - iSCSI LUN snapshot
      - <>{Terminology['terminology']['en-US']['STORAGE_PRODUCT']}</> volume

<>The {Terminology['terminology']['en-US']['STORAGE_PRODUCT']}</> volume refers to the final storage object. You can use ZADP to interact with the <>{Terminology['terminology']['en-US']['STORAGE_PRODUCT']}</> volume for data backup and recovery.

### Retrieving basic information of the target virtual machine

The following example queries by the virtual machine name. You can also use other filtering criteria based on your actual scenario. For the complete set of query options, refer to the API document.
After querying the target virtual machine by name, the return value includes its ID and other configuration information. Use this value if you plan to back up the virtual machine's configuration.

<GetVm />

### Creating a virtual machine snapshot

When backing up data, you need to first create a virtual machine snapshot, and then back up the storage objects contained in the snapshot.
By default, the virtual machine snapshot is crash-consistent. If VMTools is installed and running on the virtual machine, set `consistent_type` to `FILE_SYSTEM_CONSISTENT` in the API body to create a file-system-consistent snapshot.
This operation returns a `task_id`, which is the asynchronous task ID. It also returns a `snapshot_id`, which is the snapshot ID.

<CreateVmSnapshot />

You need to poll using the task ID until the task is complete. For details, refer to the _Asynchronous tasks_ example.

<GetTask />

### Querying the snapshot by snapshot ID

The return value contains the necessary information to identify the association between the virtual machine snapshot and its storage objects.
Under the `vm_disks` field in the return value are the virtual disks contained in the snapshot. A disk with `type` set to `DISK` corresponds to a volume, while a disk with `type` set to `CD_ROM` can be ignored.
The `snapshot_local_id` of a `vm_disk` represents the corresponding LUN snapshot name.

<GetVmSnapshot />

### Querying LUN snapshots by name

You can use the API to retrieve information for a set of LUN snapshots by their names.

<GetLunSnapshot />

The `local_id` field of each LUN snapshot is the identifier in {Terminology['terminology']['en-US']['STORAGE_PRODUCT']}, which can be further interacted with through the {Terminology['terminology']['en-US']['STORAGE_PRODUCT']} API. </>