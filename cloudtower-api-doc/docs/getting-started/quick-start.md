---
title: 快速开始
sidebar_position: 12
---
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

这里我们以 curl 为例，做一个简单的样例，用于获取环境内所有虚拟机的列表，可以复制代码到本地环境内使用。为处理 json 数据，在样例中我们使用了 jq 工具，请确保本地环境中已经预装了 curl 与 jq。
可以通过 `./test.sh -u <username> -p <password> -e <endpoint>` 执行下面的脚本。

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
        # 登陆 cloudtower 的用户名
        username=$val
        ;;
    --password) ;&
    -p)
        # 登陆 cloudtower 的密码
        password=$val
        ;;
    --endpoint) ;&
    -e)
        # cloudtower api 的地址，举例 http://tower.smartx.com
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

# 通过 /v2/api/login 进行登录，并获取 token
token = curl \
    -X POST \
    -H "Content-Type: application/json" \
    -d '{"username":"'$username'","password":"'$password'","source":"LOCAL"}' $endpoint/v2/api/login | jq ".data.token" -r

# 通过 Authorization header 携带 token 并为请求完成鉴权, 通过 /v2/api/get-vms 来获取虚拟机列表
curl \
    -X POST \
    -H "Content-Type: application/json" \
    -H "Authorization: $token" \
    -d '{"where":}' $endpoint/v2/api/get-vms | jq ".data.vms"

```
</TabItem>
</Tabs>


如果希望使用 sdk，可以参考：

- [Go SDK](/sdks/go)
- [Python SDK](/sdks/python)
- [Java SDK](/sdks/java)
- [Node SDK](https://github.com/smartxworks/cloudtower-node-sdk)