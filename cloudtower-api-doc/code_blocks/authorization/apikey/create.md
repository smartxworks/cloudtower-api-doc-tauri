import CodeBlock from '@theme/CodeBlock'
import CodeTerminology from '@site/code-terminology.json'

<CodeBlock language="bash">
{`curl -X POST \\
  -H "Content-Type: application/json" \\
  -H "Authorization: $TOKEN" \\
  --data-raw '{"query": "mutation createApiKey($name: String!) { createApiKey(data: { name: $name }) { id key roles { id preset }}}", "variables": {"name": "$NAME"}}' \\
  http://${CodeTerminology["endpoint_placeholder"]}/api/ | jq -r '.data.createApiKey.key'`}
</CodeBlock>


