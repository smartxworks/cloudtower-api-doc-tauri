import CodeBlock from '@theme/CodeBlock'
import CodeTerminology from '@site/code-terminology.json'

<CodeBlock language="bash">
{`#!/bin/bash
while getopts u:p:e: flag
do
    case "\${flag}" in
        u) username=\${OPTARG};;
        p) password=\${OPTARG};;
        e) endpoint=\${OPTARG};;
    esac
done
if [ -z "$username" ]; then
    echo "-u username is required"
    exit 1
fi
if [ -z "$password" ]; then
    echo "-p password is required"
    exit 1
fi
if [ -z "$endpoint" ]; then
    echo "-e endpoint is required"
    exit 1
fi
# Log in via /v2/api/login and obtain a token
token=$(curl -X POST -H "Content-Type: application/json" -d '{"username":"'$username'","password":"'$password'","source":"LOCAL"}' $endpoint/v2/api/login | jq -r ".data.token")
# Use the token in the Authorization header for authentication,
# and retrieve the virtual machine list via /v2/api/get-vms
curl \\
    -X POST \\
    -H "Content-Type: application/json" \\
    -H "Authorization: $token" \\
    -d '{"where":{}}' http://192.168.27.57/v2/api/get-vms | jq ".[]"`}
</CodeBlock>

