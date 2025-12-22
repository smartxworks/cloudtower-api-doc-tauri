---
title: 删除虚拟机
sidebar_position: 45
---
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

import GoDelete from '@site/code_blocks/delete-vm/delete/go.md'
import GoToRecycleBin from '@site/code_blocks/delete-vm/to-recycle-bin/go.md'
import GoRecoverFromRecycleBin from '@site/code_blocks/delete-vm/recover-from-recycle-bin/go.md'

import JavaDelete from '@site/code_blocks/delete-vm/delete/java.md'
import JavaToRecycleBin from '@site/code_blocks/delete-vm/to-recycle-bin/java.md'
import JavaRecoverFromRecycleBin from '@site/code_blocks/delete-vm/recover-from-recycle-bin/java.md'

import PythonDelete from '@site/code_blocks/delete-vm/delete/python.md'
import PythonToRecycleBin from '@site/code_blocks/delete-vm/to-recycle-bin/python.md'
import PythonRecoverFromRecycleBin from '@site/code_blocks/delete-vm/recover-from-recycle-bin/python.md'

## 回收站

### 移入回收站

<Tabs>
<TabItem value="py" label="Python">
<PythonToRecycleBin/>
</TabItem>
<TabItem value="java" label="Java">
<JavaToRecycleBin/>
</TabItem>
<TabItem value="go" label="Go">
  <GoToRecycleBin />
</TabItem>

</Tabs>

### 从回收站恢复
<Tabs>
<TabItem value="py" label="Python">
<PythonRecoverFromRecycleBin/>
</TabItem>
<TabItem value="java" label="Java">
<JavaRecoverFromRecycleBin />
</TabItem>
<TabItem value="go" label="Go">
  <GoRecoverFromRecycleBin />
</TabItem>

</Tabs>

## 永久删除

<Tabs>
<TabItem value="py" label="Python">
<PythonDelete/>
</TabItem>
<TabItem value="java" label="Java">
<JavaDelete/>
</TabItem>
<TabItem value="go" label="Go">
  <GoDelete />
</TabItem>
</Tabs>