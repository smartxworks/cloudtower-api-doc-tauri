---
title: Managing virtual machine power
sidebar_position: 44
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

import GoBatchRestart from '../../code_blocks/vm-operation/batch-restart/go.md'
import GoBatchResume from '../../code_blocks/vm-operation/batch-resume/go.md'
import GoBatchShutdown from '../../code_blocks/vm-operation/batch-shutdown/go.md'
import GoBatchStart from '../../code_blocks/vm-operation/batch-start/go.md'
import GoBatchSuspend from '../../code_blocks/vm-operation/batch-suspend/go.md'
import GoForceBatcvhRestart from '../../code_blocks/vm-operation/force-batch-restart/go.md'
import GoForceBatchShutdown from '../../code_blocks/vm-operation/force-batch-shutdown/go.md'
import GoForceRestart from '../../code_blocks/vm-operation/force-restart/go.md'
import GoForceShutdown from '../../code_blocks/vm-operation/force-shutdown/go.md'
import GoRestart from '../../code_blocks/vm-operation/restart/go.md'
import GoResume from '../../code_blocks/vm-operation/resume/go.md'
import GoShutdown from '../../code_blocks/vm-operation/shutdown/go.md'
import GoStart from '../../code_blocks/vm-operation/start/go.md'
import GoStartTo from '../../code_blocks/vm-operation/start-to/go.md'
import GoSuspend from '../../code_blocks/vm-operation/suspend/go.md'

import JavaBatchRestart from '../../code_blocks/vm-operation/batch-restart/java.md'
import JavaBatchResume from '../../code_blocks/vm-operation/batch-resume/java.md'
import JavaBatchShutdown from '../../code_blocks/vm-operation/batch-shutdown/java.md'
import JavaBatchStart from '../../code_blocks/vm-operation/batch-start/java.md'
import JavaBatchSuspend from '../../code_blocks/vm-operation/batch-suspend/java.md'
import JavaForceBatcvhRestart from '../../code_blocks/vm-operation/force-batch-restart/java.md'
import JavaForceBatchShutdown from '../../code_blocks/vm-operation/force-batch-shutdown/java.md'
import JavaForceRestart from '../../code_blocks/vm-operation/force-restart/java.md'
import JavaForceShutdown from '../../code_blocks/vm-operation/force-shutdown/java.md'
import JavaRestart from '../../code_blocks/vm-operation/restart/java.md'
import JavaResume from '../../code_blocks/vm-operation/resume/java.md'
import JavaShutdown from '../../code_blocks/vm-operation/shutdown/java.md'
import JavaStart from '../../code_blocks/vm-operation/start/java.md'
import JavaStartTo from '../../code_blocks/vm-operation/start-to/java.md'
import JavaSuspend from '../../code_blocks/vm-operation/suspend/java.md'

import PythonBatchRestart from '../../code_blocks/vm-operation/batch-restart/python.md'
import PythonBatchResume from '../../code_blocks/vm-operation/batch-resume/python.md'
import PythonBatchShutdown from '../../code_blocks/vm-operation/batch-shutdown/python.md'
import PythonBatchStart from '../../code_blocks/vm-operation/batch-start/python.md'
import PythonBatchSuspend from '../../code_blocks/vm-operation/batch-suspend/python.md'
import PythonForceBatcvhRestart from '../../code_blocks/vm-operation/force-batch-restart/python.md'
import PythonForceBatchShutdown from '../../code_blocks/vm-operation/force-batch-shutdown/python.md'
import PythonForceRestart from '../../code_blocks/vm-operation/force-restart/python.md'
import PythonForceShutdown from '../../code_blocks/vm-operation/force-shutdown/python.md'
import PythonRestart from '../../code_blocks/vm-operation/restart/python.md'
import PythonResume from '../../code_blocks/vm-operation/resume/python.md'
import PythonShutdown from '../../code_blocks/vm-operation/shutdown/python.md'
import PythonStart from '../../code_blocks/vm-operation/start/python.md'
import PythonStartTo from '../../code_blocks/vm-operation/start-to/python.md'
import PythonSuspend from '../../code_blocks/vm-operation/suspend/python.md'

## Powering on virtual machines

### Powering on a specific virtual machine and automatically scheduling it to a proper host

<Tabs>
<TabItem value="py" label="Python">
<PythonStart />
</TabItem>
<TabItem value="java" label="Java">
<JavaStart />
</TabItem>
<TabItem value="go" label="Go">
  <GoStart />
</TabItem>

</Tabs>

### Powering on virtual machines in batches and automatically scheduling them to a proper host

<Tabs>
<TabItem value="py" label="Python">
<PythonBatchRestart/>
</TabItem>
<TabItem value="java" label="Java">
<JavaBatchRestart/>
</TabItem>
<TabItem value="go" label="Go">
  <GoBatchRestart />
</TabItem>

</Tabs>

### Powering on a virtual machine and placing it on a specified host

<Tabs>
<TabItem value="py" label="Python">
<PythonStartTo />
</TabItem>
<TabItem value="java" label="Java">
<JavaStartTo />
</TabItem>
<TabItem value="go" label="Go">
  <GoStartTo />
</TabItem>

</Tabs>

## Shutting down virtual machines

### Shutting down a specific virtual machine

<Tabs>
<TabItem value="py" label="Python">
 <PythonShutdown />
</TabItem>
<TabItem value="java" label="Java">
 <JavaShutdown />
</TabItem>
<TabItem value="go" label="Go">
  <GoShutdown />
</TabItem>

</Tabs>

### Shutting down virtual machines in batches

<Tabs>
<TabItem value="py" label="Python">
<PythonBatchShutdown />
</TabItem>
<TabItem value="java" label="Java">
<JavaBatchShutdown />
</TabItem>
<TabItem value="go" label="Go">
  <GoBatchShutdown />
</TabItem>

</Tabs>

### Forcibly powering off a specific virtual machine

<Tabs>
<TabItem value="py" label="Python">
<PythonForceShutdown />
</TabItem>
<TabItem value="java" label="Java">
<JavaForceShutdown />
</TabItem>
<TabItem value="go" label="Go">
  <GoForceShutdown />
</TabItem>

</Tabs>

### Forcibly powering off virtual machines in batches

<Tabs>
<TabItem value="py" label="Python">
<PythonForceBatchShutdown />
</TabItem>
<TabItem value="java" label="Java">
<JavaForceBatchShutdown />
</TabItem>
<TabItem value="go" label="Go">
  <GoForceBatchShutdown />
</TabItem>

</Tabs>

## Restrating virtual machines

### Restarting a specific virtual machine

<Tabs>
<TabItem value="py" label="Python">
  <PythonRestart />
</TabItem>
<TabItem value="java" label="Java">
<JavaRestart />
</TabItem>
<TabItem value="go" label="Go">
  <GoRestart />
</TabItem>

</Tabs>

### Restarting virtual machines in batches

<Tabs>
<TabItem value="py" label="Python">
<PythonBatchRestart />
</TabItem>
<TabItem value="java" label="Java">
<JavaBatchRestart />
</TabItem>
<TabItem value="go" label="Go">
  <GoBatchRestart />
</TabItem>

</Tabs>

### Forcibly restarting a specific virtual machine

<Tabs>
<TabItem value="py" label="Python">
<PythonForceRestart />
</TabItem>
<TabItem value="java" label="Java">
<JavaForceRestart />
</TabItem>
<TabItem value="go" label="Go">
  <GoForceRestart />
</TabItem>

</Tabs>

### Forcibly restarting virtual machines in batches

<Tabs>
<TabItem value="py" label="Python">
<PythonBatchSuspend />
</TabItem>
<TabItem value="java" label="Java">
<JavaBatchSuspend />
</TabItem>
<TabItem value="go" label="Go">
  <GoBatchSuspend />
</TabItem>

</Tabs>

## Suspending virtual machines

### Suspending a specific virtual machine

<Tabs>
<TabItem value="py" label="Python">
  <PythonSuspend/>
</TabItem>
<TabItem value="java" label="Java">
  <JavaSuspend/>
</TabItem>
<TabItem value="go" label="Go">
  <GoSuspend />
</TabItem>

</Tabs>

### Suspending virtual machines in batches

<Tabs>
<TabItem value="py" label="Python">
<PythonSimpleCreate/>
</TabItem>
<TabItem value="java" label="Java">
<JavaSimpleCreate/>
</TabItem>
<TabItem value="go" label="Python">
  <GoSimpleCreate />
</TabItem>

</Tabs>

## Resuming virtual machines

### Resuming a specific virtual machine

<Tabs>
<TabItem value="py" label="Python">
<PythonResume />
</TabItem>
<TabItem value="java" label="Java">
<JavaResume />
</TabItem>
<TabItem value="go" label="Go">
  <GoResume />
</TabItem>

</Tabs>

### Resuming virtual machines in batches

<Tabs>
<TabItem value="py" label="Python">
<PythonBatchResume />
</TabItem>
<TabItem value="java" label="Java">
<JavaBatchResume />
</TabItem>
<TabItem value="go" label="Go">
  <GoBatchResume />
</TabItem>

</Tabs>