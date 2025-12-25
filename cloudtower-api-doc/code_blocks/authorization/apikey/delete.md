import CodeBlock from '@theme/CodeBlock'
import CodeTerminology from '@site/code-terminology.json'

<CodeBlock language="bash">
{`curl -X POST \\
  -H "Content-Type: application/json" \\
  -H "Authorization: $TOKEN" \\
  --data-raw '{"query": "mutation deleteApiKey($key: String!) { deleteApiKey(where: { key: $key }) { id } }", "variables": { "key": "$KEY" }}' \\
  http://${CodeTerminology["endpoint_placeholder"]}/api/`}
</CodeBlock>

