---
title: Editing a virtual machine
sidebar_position: 43
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

import GoAddCDROM from '@site/code_blocks/edit-vm/add-cd-rom/go.md'
import GoAddExistVolume from '@site/code_blocks/edit-vm/add-exist-volume/go.md'
import GoAddNewVolume from '@site/code_blocks/edit-vm/add-new-volume/go.md'
import GoAddNic from '@site/code_blocks/edit-vm/add-nic/go.md'
import GoAutoMigrate from '@site/code_blocks/edit-vm/auto-migrate/go.md'
import GoDeleteCDROM from '@site/code_blocks/edit-vm/delete-cd-rom/go.md'
import GoEditBasicInfo from '@site/code_blocks/edit-vm/edit-basic-info/go.md'
import GoEdit from '@site/code_blocks/edit-vm/edit-nic/go.md'
import GoMigrateToHost from '@site/code_blocks/edit-vm/migrate-to-host/go.md'
import GoRemoveDisk from '@site/code_blocks/edit-vm/remove-disk/go.md'
import GoRemoveNic from '@site/code_blocks/edit-vm/remove-nic/go.md'

import PythonAddCDROM from '@site/code_blocks/edit-vm/add-cd-rom/python.md'
import PythonAddExistVolume from '@site/code_blocks/edit-vm/add-exist-volume/python.md'
import PythonAddNewVolume from '@site/code_blocks/edit-vm/add-new-volume/python.md'
import PythonAddNic from '@site/code_blocks/edit-vm/add-nic/python.md'
import PythonAutoMigrate from '@site/code_blocks/edit-vm/auto-migrate/python.md'
import PythonDeleteCDROM from '@site/code_blocks/edit-vm/delete-cd-rom/python.md'
import PythonEdit from '@site/code_blocks/edit-vm/edit-nic/python.md'
import PythonMigrateToHost from '@site/code_blocks/edit-vm/migrate-to-host/python.md'
import PythonRemoveDisk from '@site/code_blocks/edit-vm/remove-disk/python.md'
import PythonRemoveNic from '@site/code_blocks/edit-vm/remove-nic/python.md'

import JavaAddCDROM from '@site/code_blocks/edit-vm/add-cd-rom/java.md'
import JavaAddExistVolume from '@site/code_blocks/edit-vm/add-exist-volume/java.md'
import JavaAddNewVolume from '@site/code_blocks/edit-vm/add-new-volume/java.md'
import JavaAddNic from '@site/code_blocks/edit-vm/add-nic/java.md'
import JavaAutoMigrate from '@site/code_blocks/edit-vm/auto-migrate/java.md'
import JavaDeleteCDROM from '@site/code_blocks/edit-vm/delete-cd-rom/java.md'
import JavaEditAdvanceInfo from '@site/code_blocks/edit-vm/edit-advance-info/java.md'
import JavaEditBasicInfo from '@site/code_blocks/edit-vm/edit-basic-info/java.md'
import JavaEdit from '@site/code_blocks/edit-vm/edit-nic/java.md'
import JavaEditNicAdvanceInfo from '@site/code_blocks/edit-vm/edit-nic-advance-info/java.md'
import JavaEditNicBasicInf from '@site/code_blocks/edit-vm/edit-nic-basic-info/java.md'
import JavaMigrateToHost from '@site/code_blocks/edit-vm/migrate-to-host/java.md'
import JavaRemoveDisk from '@site/code_blocks/edit-vm/remove-disk/java.md'
import JavaRemoveNic from '@site/code_blocks/edit-vm/remove-nic/java.md'

## Editing basic information

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

## Editing advanced attributes

<Tabs>

<TabItem value="java" label="Java">
  <JavaEditAdvanceInfo />
</TabItem>
</Tabs>

## Editing CD-ROMs

### Adding a CD-ROM

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

### Deleting a CD-ROM

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

## Managing virtual volumes

### Adding a new virtual volume

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

### Mounting an existing virtual volume as a virtual disk

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

### Unmounting a virtual disk

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

## Managing NICs

### Adding a NIC

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

### Editing basic NIC information

<Tabs>
<TabItem value="java" label="Java">
  <JavaEditBasicInfo />
</TabItem>
</Tabs>

### Editing advanced NIC attributes

<Tabs>
<TabItem value="java" label="Java">
  <JavaEditAdvanceInfo />
</TabItem>
</Tabs>

### Removing a NIC

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

## Migrating a virtual machine

### Migrating a virtual machine to a specific host

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

### Automatically placing a virtual machine on a proper host

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
