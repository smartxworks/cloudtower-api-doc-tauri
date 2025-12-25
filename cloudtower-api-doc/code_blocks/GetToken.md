import CodeBlock from '@theme/CodeBlock'
import CodeTerminology from '@site/code-terminology.json'

<CodeBlock language="bash">
{`curl -X 'POST' \
 'http://${CodeTerminology["endpoint_placeholder"]}/v2/api/login' \
 -H 'accept: application/json' \
 -H 'content-language: en-US' \
 -H 'Content-Type: application/json' \
 -d '{
 "username": "string",
 "source": "LOCAL",
 "password": "string"
}'`}
</CodeBlock>