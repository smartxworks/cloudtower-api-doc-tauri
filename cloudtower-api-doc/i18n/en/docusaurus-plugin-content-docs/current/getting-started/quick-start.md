---
title: Quick start
sidebar_position: 12
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';
import CodeTerminology from '@site/code-terminology.json';
import QuickStartShell from '@site/code_blocks/getting-started/quick-start/shell.md';

Here, `curl` is used as an example to create a simple script that retrieves a list of all virtual machines in the environment. You can copy the code and run it in your local environment. To process JSON data in this example, we use the `jq` tool. Make sure that both `curl` and `jq` are preinstalled in your local environment. Run the following script with: `./test.sh -u <username> -p <password> -e <endpoint>`.

<Tabs>
<TabItem value="shell" label="Shell">
<QuickStartShell/>
</TabItem>
</Tabs>

If you prefer to use an SDK, refer to the following:

- [Go SDK](/sdks/go)
- [Python SDK](/sdks/python)
- [Java SDK](/sdks/java)
- <a href={`https://github.com/${CodeTerminology["node_github_address"]}`}>Node SDK</a>