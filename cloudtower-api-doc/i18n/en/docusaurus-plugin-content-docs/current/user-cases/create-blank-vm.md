---
title: Create Blank VM(s)
sidebar_position: 42
---
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';


import GoSimpleCreate from '../../../../../code_blocks/create-blank-vm/simple-create/go.md'
import GoCreateWithCDROM from '../../../../../code_blocks/create-blank-vm/create-with-cdrom/go.md'
import GoCreateWithVolume from '../../../../../code_blocks/create-blank-vm/create-with-volume/go.md'
import GoCreateWithNewVolume from '../../../../../code_blocks/create-blank-vm/create-with-new-volume/go.md'
import GoCreateWithNic from '../../../../../code_blocks/create-blank-vm/create-with-new-volume/go.md'


import JavaSimpleCreate from '../../../../../code_blocks/create-blank-vm/simple-create/java.md'
import JavaCreateWithCDROM from '../../../../../code_blocks/create-blank-vm/create-with-cdrom/java.md'
import JavaCreateWithVolume from '../../../../../code_blocks/create-blank-vm/create-with-volume/java.md'
import JavaCreateWithNewVolume from '../../../../../code_blocks/create-blank-vm/create-with-new-volume/java.md'
import JavaCreateWithNic from '../../../../../code_blocks/create-blank-vm/create-with-new-volume/java.md'


import PythonSimpleCreate from '../../../../../code_blocks/create-blank-vm/simple-create/python.md'
import PythonCreateWithCDROM from '../../../../../code_blocks/create-blank-vm/create-with-cdrom/python.md'
import PythonCreateWithVolume from '../../../../../code_blocks/create-blank-vm/create-with-volume/python.md'
import PythonCreateWithNewVolume from '../../../../../code_blocks/create-blank-vm/create-with-new-volume/python.md'
import PythonCreateWithNic from '../../../../../code_blocks/create-blank-vm/create-with-new-volume/python.md'

## Create a virtual machine simply

<Tabs>
<TabItem value="py" label="Python">
<PythonSimpleCreate/>
</TabItem>
<TabItem value="java" label="Java">
<JavaSimpleCreate/>
</TabItem>
<TabItem value="go" label="Go">
  <GoSimpleCreate />
</TabItem>

</Tabs>


## Configure a virtual disk during creation

### Load an ISO from CD-ROM

<Tabs>
<TabItem value="py" label="Python">
<PythonCreateWithCDROM />
</TabItem>
<TabItem value="java" label="Java">
<JavaCreateWithCDROM />
</TabItem>
<TabItem value="go" label="Go">
<GoCreateWithCDROM />
</TabItem>
</Tabs>


### Mount a virtual volume as a virtual disk

<Tabs>
<TabItem value="py" label="Python">
<PythonCreateWithVolume />
</TabItem>
<TabItem value="java" label="Java">
<JavaCreateWithVolume />
</TabItem>
<TabItem value="go" label="Go">
<GoCreateWithVolume />
</TabItem>
</Tabs>


### Add and mount a virtual disk

<Tabs>
<TabItem value="py" label="Python">
<PythonCreateWithNewVolume />
</TabItem>
<TabItem value="java" label="Java">
<JavaCreateWithNewVolume />
</TabItem>
<TabItem value="go" label="Go">
<GoCreateWithNewVolume />
</TabItem>
</Tabs>


## Configure a virtual NIC during creation


<Tabs>
<TabItem value="py" label="Python">
<PythonCreateWithNic />
</TabItem>
<TabItem value="java" label="Java">
<JavaCreateWithNic />
</TabItem>
<TabItem value="go" label="Go">
<GoCreateWithNic />
</TabItem>
</Tabs>