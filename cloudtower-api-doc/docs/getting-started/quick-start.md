---
title: 快速开始
sidebar_position: 12
---
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';
import CodeTerminology from '@site/code-terminology.json';
import QuickStartShell from '@site/code_blocks/getting-started/quick-start/shell.md';

这里我们以 curl 为例，做一个简单的样例，用于获取环境内所有虚拟机的列表，可以复制代码到本地环境内使用。为处理 json 数据，在样例中我们使用了 jq 工具，请确保本地环境中已经预装了 curl 与 jq。
可以通过 `./test.sh -u <username> -p <password> -e <endpoint>` 执行下面的脚本。

<Tabs>
<TabItem value="shell" label="Shell">
<QuickStartShell/>
</TabItem>
</Tabs>


如果希望使用 sdk，可以参考：

- [Go SDK](/sdks/go)
- [Python SDK](/sdks/python)
- [Java SDK](/sdks/java)
- <a href={`https://github.com/${CodeTerminology["node_github_address"]}`}>Node SDK</a>