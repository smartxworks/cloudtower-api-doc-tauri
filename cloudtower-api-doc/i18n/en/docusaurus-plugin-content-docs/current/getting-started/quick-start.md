---
title: Quick Start
sidebar_position: 12
---

Here is an example using curl to obtain a list of all virtual machines in the environment. You can copy the code to your local environment. In order to process JSON data, we use the jq tool in the example. Please make sure that curl and jq are installed in your local environment.
You can execute the following script by running `./test.sh -u <username> -p <password> -e <endpoint>`.

<Tabs>
<TabItem value="shell" label="Shell">

```bash
#!/bin/bash
for arg in "$@"; do
    index=$(echo $arg | cut -f1 -d=)
    val=$(echo $arg | cut -f2 -d=)
    case $index in
    --username) ;&
    -u)
        # username for loginning cloudtower
        username=$val
        ;;
    --password) ;&
    -p)
        # password for loginning cloudtower
        password=$val
        ;;
    --endpoint) ;&
    -e)
        # api address of cloudtower api , for example http://tower.smartx.com
        endpoint=$val
        ;;
    *) ;;
    esac
done

if [ -z "$username" ]; then
    echo "username is required"
    exit 1
fi
if [ -z "$password" ]; then
    echo "password is required"
    exit 1
fi
if [ -z "$endpoint" ]; then
    echo "endpoint is required"
    exit 1
fi

# use /v2/api/login to login and get token
token = curl \
    -X POST \
    -H "Content-Type: application/json" \
    -d '{"username":"'$username'","password":"'$password'","source":"LOCAL"}' $endpoint/v2/api/login | jq ".data.token" -r

# You can obtain a list of virtual machines by using the /v2/api/get-vms endpoint and including the token in the Authorization header for authentication.
curl \
    -X POST \
    -H "Content-Type: application/json" \
    -H "Authorization: $token" \
    -d '{"where":}' $endpoint/v2/api/get-vms | jq ".data.vms"

```

</TabItem>
</Tabs>


如果希望使用 sdk，可以参考：

- [Go SDK](/en/sdks/go)
- [Python SDK](/en/sdks/python)
- [Java SDK](/en/sdks/java)
- [Node SDK](https://github.com/smartxworks/cloudtower-node-sdk)