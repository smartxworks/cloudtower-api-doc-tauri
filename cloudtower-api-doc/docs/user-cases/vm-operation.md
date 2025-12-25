---
title: 虚拟机电源操作
sidebar_position: 44
---
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

import GoBatchRestart from '@site/code_blocks/vm-operation/batch-restart/go.md'
import GoBatchResume from '@site/code_blocks/vm-operation/batch-resume/go.md'
import GoBatchShutdown from '@site/code_blocks/vm-operation/batch-shutdown/go.md'
import GoBatchStart from '@site/code_blocks/vm-operation/batch-start/go.md'
import GoBatchSuspend from '@site/code_blocks/vm-operation/batch-suspend/go.md'
import GoForceBatchRestart from '@site/code_blocks/vm-operation/force-batch-restart/go.md'
import GoForceBatchShutdown from '@site/code_blocks/vm-operation/force-batch-shutdown/go.md'
import GoForceRestart from '@site/code_blocks/vm-operation/force-restart/go.md'
import GoForceShutdown from '@site/code_blocks/vm-operation/force-shutdown/go.md'
import GoRestart from '@site/code_blocks/vm-operation/restart/go.md'
import GoResume from '@site/code_blocks/vm-operation/resume/go.md'
import GoShutdown from '@site/code_blocks/vm-operation/shutdown/go.md'
import GoStart from '@site/code_blocks/vm-operation/start/go.md'
import GoStartTo from '@site/code_blocks/vm-operation/start-to/go.md'
import GoSuspend from '@site/code_blocks/vm-operation/suspend/go.md'

import JavaBatchRestart from '@site/code_blocks/vm-operation/batch-restart/java.md'
import JavaBatchResume from '@site/code_blocks/vm-operation/batch-resume/java.md'
import JavaBatchShutdown from '@site/code_blocks/vm-operation/batch-shutdown/java.md'
import JavaBatchStart from '@site/code_blocks/vm-operation/batch-start/java.md'
import JavaBatchSuspend from '@site/code_blocks/vm-operation/batch-suspend/java.md'
import JavaForceBatchRestart from '@site/code_blocks/vm-operation/force-batch-restart/java.md'
import JavaForceBatchShutdown from '@site/code_blocks/vm-operation/force-batch-shutdown/java.md'
import JavaForceRestart from '@site/code_blocks/vm-operation/force-restart/java.md'
import JavaForceShutdown from '@site/code_blocks/vm-operation/force-shutdown/java.md'
import JavaRestart from '@site/code_blocks/vm-operation/restart/java.md'
import JavaResume from '@site/code_blocks/vm-operation/resume/java.md'
import JavaShutdown from '@site/code_blocks/vm-operation/shutdown/java.md'
import JavaStart from '@site/code_blocks/vm-operation/start/java.md'
import JavaStartTo from '@site/code_blocks/vm-operation/start-to/java.md'
import JavaSuspend from '@site/code_blocks/vm-operation/suspend/java.md'

import PythonBatchRestart from '@site/code_blocks/vm-operation/batch-restart/python.md'
import PythonBatchResume from '@site/code_blocks/vm-operation/batch-resume/python.md'
import PythonBatchShutdown from '@site/code_blocks/vm-operation/batch-shutdown/python.md'
import PythonBatchStart from '@site/code_blocks/vm-operation/batch-start/python.md'
import PythonBatchSuspend from '@site/code_blocks/vm-operation/batch-suspend/python.md'
import PythonForceBatchRestart from '@site/code_blocks/vm-operation/force-batch-restart/python.md'
import PythonForceBatchShutdown from '@site/code_blocks/vm-operation/force-batch-shutdown/python.md'
import PythonForceRestart from '@site/code_blocks/vm-operation/force-restart/python.md'
import PythonForceShutdown from '@site/code_blocks/vm-operation/force-shutdown/python.md'
import PythonRestart from '@site/code_blocks/vm-operation/restart/python.md'
import PythonResume from '@site/code_blocks/vm-operation/resume/python.md'
import PythonShutdown from '@site/code_blocks/vm-operation/shutdown/python.md'
import PythonStart from '@site/code_blocks/vm-operation/start/python.md'
import PythonStartTo from '@site/code_blocks/vm-operation/start-to/python.md'
import PythonSuspend from '@site/code_blocks/vm-operation/suspend/python.md'


## 虚拟机开机

### 指定虚拟机开机，自动调度到合适的主机

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

### 批量虚拟机开机，自动调度到合适的主机

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


### 开机至指定主机

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

## 虚拟机关机

### 指定虚拟机关机

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

### 批量虚拟机关机

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

### 强制关机指定虚拟机

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

### 强制关机批量虚拟机

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

## 虚拟机重启

### 重启指定虚拟机

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

### 重启批量虚拟机

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

### 强制重启指定虚拟机

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

### 强制重启批量虚拟机

<Tabs>
<TabItem value="py" label="Python">
<PythonForceBatchRestart />
</TabItem>
<TabItem value="java" label="Java">
<JavaForceBatchRestart />
</TabItem>
<TabItem value="go" label="Go">
  <GoForceBatchRestart />
</TabItem>

</Tabs>

## 虚拟机暂停

### 暂停指定虚拟机

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

### 暂停批量虚拟机

<Tabs>
<TabItem value="py" label="Python">
<PythonBatchSuspend/>
</TabItem>
<TabItem value="java" label="Java">
<JavaBatchSuspend/>
</TabItem>
<TabItem value="go" label="Python">
  <GoBatchSuspend />
</TabItem>

</Tabs>

## 虚拟机恢复

### 恢复指定虚拟机

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

### 恢复批量虚拟机

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