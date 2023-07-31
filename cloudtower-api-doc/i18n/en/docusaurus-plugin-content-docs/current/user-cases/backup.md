---
title: VM Backup
---
# Virtual Machine Backup via the CloudTower API

import GetVm from '../../../../../code_blocks/GetVm.md'
import CreateVmSnapshot from '../../../../../code_blocks/CreateVmSnapshot.md'
import GetTask from '../../../../../code_blocks/GetTask.md'
import GetVmSnapshot from '../../../../../code_blocks/GetVmSnapshot.md'
import GetLunSnapshot from '../../../../../code_blocks/GetLunSnapshot.md'


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

<GetVm />

### Create VM Snapshot
Before backing up the VM data, you need first to create a VM snapshot and then back up data contained in this snapshot.

The VM will create a crash-consistent snapshot by default. If you have installed VM tools in the VM, you can create a file-consistent snapshot. Specifically, pass data.consistent_type = FILE_SYSTEM_CONSISTENT. 

This step will return the task id and the snapshot id.

<CreateVmSnapshot />

Then you need to check the task via the loop based on the task id. For details, please refer to Asynchronous Task.

<GetTask />

### Query Snapshot Using Snapshot id in Step 2.
The returned value contains the necessary information to help find the association between the VM snapshot and the storage object.

The virtual disks included in the snapshot are listed under vm_disks in the returned value. If the type is DISK, it means that the virtual disk corresponds to a volume, and if the type is CD_ROM, it can be ignored.

The snapshot_local_id of vm_disk is the name of the LUN snapshot corresponding to the snapshot.

<GetVmSnapshot />

### Query LUN Snapshot Using the LUN Name 

Through the API, you can query the LUN snapshot information corresponding to a group of LUN snapshot names.

<GetLunSnapshot />

The local_id field of each LUN snapshot is the identifier in ZBS and can be further interacted with through the ZBS API.