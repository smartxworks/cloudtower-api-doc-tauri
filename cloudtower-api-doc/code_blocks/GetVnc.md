import CodeBlock from '@theme/CodeBlock'
import CodeTerminology from '@site/code-terminology.json'

<CodeBlock language="bash">
{`curl -X 'POST' 'http://${CodeTerminology["endpoint_placeholder"]}/api' \\
 -H 'accept: application/json' \\
 -H 'content-language: en-US' \\
 -H 'Authorization: YOUR_TOKEN' \\
 -H 'Content-Type: application/json' \\
 -d '{
  "operationName": "vnc",
  "variables": { "input": { "vm": { "id": $VM_ID } } },
  "query": "query vnc($input: VncInput!) { vnc(input: $input) { vm_uuid host_ip cluster_ip raw_token token}}"
}'`}
</CodeBlock>