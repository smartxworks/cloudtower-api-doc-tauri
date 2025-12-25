import CodeBlock from '@theme/CodeBlock'
import CodeTerminology from '@site/code-terminology.json'

<CodeBlock language="bash">
{`curl --location --request POST 'http://${CodeTerminology["endpoint_placeholder"]}/v2/api/get-vm-snapshots' \\
--header 'Authorization: YOUR_TOKEN' \\
--header 'Content-Type: application/json' \\
--data-raw '{ "where": {
"id": "STEP_2_SNAPSHOT_ID" }
}'`}
</CodeBlock>