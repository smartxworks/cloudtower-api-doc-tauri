---
title: Delete VM(s)
sidebar_position: 45
---
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

import GoDelete from '../../../../../code_blocks/delete-vm/delete/go.md'
import GoToRecycleBin from '../../../../../code_blocks/delete-vm/to-recycle-bin/go.md'
import GoRecoverFromRecycleBin from '../../../../../code_blocks/delete-vm/recover-from-recycle-bin/go.md'

import JavaDelete from '../../../../../code_blocks/delete-vm/delete/java.md'
import JavaToRecycleBin from '../../../../../code_blocks/delete-vm/to-recycle-bin/java.md'
import JavaRecoverFromRecycleBin from '../../../../../code_blocks/delete-vm/recover-from-recycle-bin/java.md'

import PythonDelete from '../../../../../code_blocks/delete-vm/delete/python.md'
import PythonToRecycleBin from '../../../../../code_blocks/delete-vm/to-recycle-bin/python.md'
import PythonRecoverFromRecycleBin from '../../../../../code_blocks/delete-vm/recover-from-recycle-bin/python.md'

## Recycle bin

### Move to recycle bin

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

### Recover from recycle bin
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

## Delete permanently

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