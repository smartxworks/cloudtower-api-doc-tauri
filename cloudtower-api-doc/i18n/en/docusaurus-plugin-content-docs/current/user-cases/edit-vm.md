---
title: Edit VM(s)
sidebar_position: 43
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

import GoAddCDROM from '../../../../../code_blocks/edit-vm/add-cd-rom/go.md'
import GoAddExistVolume from '../../../../../code_blocks/edit-vm/add-exist-volume/go.md'
import GoAddNewVolume from '../../../../../code_blocks/edit-vm/add-new-volume/go.md'
import GoAddNic from '../../../../../code_blocks/edit-vm/add-nic/go.md'
import GoAutoMigrate from '../../../../../code_blocks/edit-vm/auto-migrate/go.md'
import GoDeleteCDROM from '../../../../../code_blocks/edit-vm/delete-cd-rom/go.md'
import GoEditBasicInfo  from '../../../../../code_blocks/edit-vm/edit-basic-info/go.md'
import GoEdit from '../../../../../code_blocks/edit-vm/edit-nic/go.md'
import GoMigrateToHost from '../../../../../code_blocks/edit-vm/migrate-to-host/go.md'
import GoRemoveDisk from '../../../../../code_blocks/edit-vm/remove-disk/go.md'
import GoRemoveNic from '../../../../../code_blocks/edit-vm/remove-nic/go.md'

import PythonAddCDROM from '../../../../../code_blocks/edit-vm/add-cd-rom/python.md'
import PythonAddExistVolume from '../../../../../code_blocks/edit-vm/add-exist-volume/python.md'
import PythonAddNewVolume from '../../../../../code_blocks/edit-vm/add-new-volume/python.md'
import PythonAddNic from '../../../../../code_blocks/edit-vm/add-nic/python.md'
import PythonAutoMigrate from '../../../../../code_blocks/edit-vm/auto-migrate/python.md'
import PythonDeleteCDROM from '../../../../../code_blocks/edit-vm/delete-cd-rom/python.md'
import PythonEdit from '../../../../../code_blocks/edit-vm/edit-nic/python.md'
import PythonMigrateToHost from '../../../../../code_blocks/edit-vm/migrate-to-host/python.md'
import PythonRemoveDisk from '../../../../../code_blocks/edit-vm/remove-disk/python.md'
import PythonRemoveNic from '../../../../../code_blocks/edit-vm/remove-nic/python.md'

import JavaAddCDROM from '../../../../../code_blocks/edit-vm/add-cd-rom/java.md'
import JavaAddExistVolume from '../../../../../code_blocks/edit-vm/add-exist-volume/java.md'
import JavaAddNewVolume from '../../../../../code_blocks/edit-vm/add-new-volume/java.md'
import JavaAddNic from '../../../../../code_blocks/edit-vm/add-nic/java.md'
import JavaAutoMigrate from '../../../../../code_blocks/edit-vm/auto-migrate/java.md'
import JavaDeleteCDROM from '../../../../../code_blocks/edit-vm/delete-cd-rom/java.md'
import JavaEditAdvanceInfo from '../../../../../code_blocks/edit-vm/edit-advance-info/java.md'
import JavaEditBasicInfo  from '../../../../../code_blocks/edit-vm/edit-basic-info/java.md'
import JavaEdit from '../../../../../code_blocks/edit-vm/edit-nic/java.md'
import JavaEditNicAdvanceInfo from '../../../../../code_blocks/edit-vm/edit-nic-advance-info/java.md'
import JavaEditNicBasicInf from '../../../../../code_blocks/edit-vm/edit-nic-basic-info/java.md'
import JavaMigrateToHost from '../../../../../code_blocks/edit-vm/migrate-to-host/java.md'
import JavaRemoveDisk from '../../../../../code_blocks/edit-vm/remove-disk/java.md'
import JavaRemoveNic from '../../../../../code_blocks/edit-vm/remove-nic/java.md'



## Edit basic information
<Tabs>
<TabItem value="py" label="Python">
  <PythonEditBasicInfo  />
</TabItem>
<TabItem value="java" label="Java">
  <JavaEditBasicInfo  />
</TabItem>
<TabItem value="go" label="Go">
  <GoEditBasicInfo  />
</TabItem>

</Tabs>

## Edit vm advance options

<Tabs>

<TabItem value="java" label="Java">
  <JavaEditAdvanceInfo />
</TabItem>
</Tabs>

## Edit a CD-ROM

### Add a CD-ROM

<Tabs>
<TabItem value="py" label="Python">
  <PythonAddCDROM />
</TabItem>
<TabItem value="java" label="Java">
  <JavaAddCDROM />
</TabItem>
<TabItem value="go" label="Go">
  <GoAddCDROM />
</TabItem>

</Tabs>

### Delete a CD-ROM

<Tabs>
<TabItem value="py" label="Python">
  <PythonDeleteCDROM/>
</TabItem>
<TabItem value="java" label="Java">
  <JavaDeleteCDROM/>
</TabItem>
<TabItem value="go" label="Go">
  <GoDeleteCDROM/>
</TabItem>

</Tabs>

## Virtual volume operations

### Add a new virtual volume

<Tabs>
<TabItem value="py" label="Python">
  <PythonAddNewVolume />
</TabItem>
<TabItem value="java" label="Java">
  <JavaAddNewVolume />
</TabItem>
<TabItem value="go" label="Go">
  <GoAddNewVolume />
</TabItem>

</Tabs>

### Mount an existing virtual volume as a virtual disk

<Tabs>
<TabItem value="py" label="Python">
  <PythonAddExistVolume />
</TabItem>
<TabItem value="java" label="Java">
  <JavaAddExistVolume />
</TabItem>
<TabItem value="go" label="Go">
  <GoAddExistVolume />
</TabItem>

</Tabs>

### Unmount a virtual disk

<Tabs>
<TabItem value="py" label="Python">
  <PythonRemoveDisk />
</TabItem>
<TabItem value="java" label="Java">
  <JavaRemoveDisk />
</TabItem>
<TabItem value="go" label="Go">
  <GoRemoveDisk />
</TabItem>

</Tabs>

## NIC operations

### Add a NIC

<Tabs>
<TabItem value="py" label="Python">
  <PythonAddNic />
</TabItem>
<TabItem value="java" label="Java">
  <JavaAddNic />
</TabItem>
<TabItem value="go" label="Go">
  <GoAddNic />
</TabItem>

</Tabs>

### Edit basic information of a nic

<Tabs>
<TabItem value="java" label="Java">
  <JavaEditBasicInfo />
</TabItem>
</Tabs>

### Edit advance information of a nic

<Tabs>
<TabItem value="java" label="Java">
  <JavaEditAdvanceInfo />
</TabItem>
</Tabs>

### Delete a NIC

<Tabs>
<TabItem value="py" label="Python">
  <PythonRemoveNic />
</TabItem>
<TabItem value="java" label="Java">
  <JavaRemoveNic />
</TabItem>
<TabItem value="go" label="Go">
  <GoRemoveNic />
</TabItem>

</Tabs>

## Virtual machine migration

### Migrate to a specified host

<Tabs>
<TabItem value="py" label="Python">
  <PythonMigrateToHost />
</TabItem>
<TabItem value="java" label="Java">
  <JavaMigrateToHost />
</TabItem>
<TabItem value="go" label="Go">
  <GoMigrateToHost />
</TabItem>

</Tabs>

### Schedule to an appropriate host automatically

<Tabs>
<TabItem value="py" label="Python">
  <PythonAutoMigrate />
</TabItem>
<TabItem value="java" label="Java">
  <JavaAutoMigrate />
</TabItem>
<TabItem value="go" label="Go">
  <GoAutoMigrate />
</TabItem>

</Tabs>
