import CodeBlock from '@theme/CodeBlock'
import CodeTerminology from '@site/code-terminology.json'

<CodeBlock language="bash">
{`curl --location --request POST 'http://${CodeTerminology["endpoint_placeholder"]}/v2/api/get-vms' \\ 
--header 'Authorization: YOUR_TOKEN' \\
--header 'Content-Type: application/json' \\
--data-raw '{
"where": {
"name": "YOUR_VM_NAME"
} }'`}
</CodeBlock>