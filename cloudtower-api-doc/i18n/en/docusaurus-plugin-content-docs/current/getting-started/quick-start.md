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


# 通过 /v2/api/login 进行登录，并获取 token
token=$(curl -X POST -H "Content-Type: application/json" -d '{"username":"'$username'","password":"'$password'","source":"LOCAL"}' $endpoint/v2/api/login | jq -r ".data.token")

# 通过 Authorization header 携带 token 并为请求完成鉴权, 通过 /v2/api/get-vms 来获取虚拟机列表
curl \
    -X POST \
    -H "Content-Type: application/json" \
    -H "Authorization: $token" \
    -d '{"where":{}}' http://192.168.27.57/v2/api/get-vms | jq ".[]"

```

</TabItem>
</Tabs>


如果希望使用 sdk，可以参考：

- [Go SDK](/en/sdks/go)
- [Python SDK](/en/sdks/python)
- [Java SDK](/en/sdks/java)
- [Node SDK](https://github.com/smartxworks/cloudtower-node-sdk)