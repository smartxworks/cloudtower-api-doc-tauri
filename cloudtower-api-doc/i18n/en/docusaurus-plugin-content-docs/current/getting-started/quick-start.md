---
title: Quick start
sidebar_position: 12
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

Here, `curl` is used as an example to create a simple script that retrieves a list of all virtual machines in the environment. You can copy the code and run it in your local environment. To process JSON data in this example, we use the `jq` tool. Make sure that both `curl` and `jq` are preinstalled in your local environment. Run the following script with: `./test.sh -u <username> -p <password> -e <endpoint>`.

<Tabs>
<TabItem value="shell" label="Shell">

```bash
#!/bin/bash
while getopts u:p:e: flag
do
    case "${flag}" in
        u) username=${OPTARG};;
        p) password=${OPTARG};;
        e) endpoint=${OPTARG};;
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
curl \
    -X POST \
    -H "Content-Type: application/json" \
    -H "Authorization: $token" \
    -d '{"where":{}}' http://192.168.27.57/v2/api/get-vms | jq ".[]"
```

</TabItem>
</Tabs>

If you prefer to use an SDK, refer to the following:

- [Go SDK](/sdks/go)
- [Python SDK](/sdks/python)
- [Java SDK](/sdks/java)
- [Node SDK](https://github.com/smartxworks/cloudtower-node-sdk)