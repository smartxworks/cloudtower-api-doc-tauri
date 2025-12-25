import CodeBlock from '@theme/CodeBlock'
import CodeTerminology from '@site/code-terminology.json'

<CodeBlock language="bash">
{`curl \\
  -X POST \\
  -H "Content-Type: application/json" \\
  -H "Authorization: $KEY" \\
  --data-raw '{"where":{}}' \\
  http://${CodeTerminology["endpoint_placeholder"]}/v2/api/get-vms | jq ".[]"`}
</CodeBlock>

