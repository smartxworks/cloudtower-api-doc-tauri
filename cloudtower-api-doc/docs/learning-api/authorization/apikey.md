---
title: API Key 鉴权
---

在默认环境中，使用用户名，密码登录后即可换回 token，可以正常使用 token 进行鉴权，但是在开启了双因子认证后，无法单纯通过用户名，密码换回 token，会需要一个额外的第二因子验证，而在 API 的业务场景中，执行是无交互的，无法进行第二因子验证。

为了在此类环境下可以使用 CloudTower API，CloudTower 引入了 API Key ，以代替 token 进行鉴权。

### 签发 API Key

API Key 的签发依旧需要依赖 token 鉴权，需要手动登录后获取 token 以后进行创建。

```bash
curl -X POST \
  -H "Content-Type: application/json" \
  -H "Authorization: $TOKEN" \
  --data-raw '{"query": "mutation createApiKey($name: String!) { createApiKey(data: { name: $name }) { id key roles { id preset }}}", "variables": {"name": "$NAME"}}' \
  http://$CLOUDTOWER_DOMAIN/api/ | jq -r '.data.createApiKey.key'

```

执行后将会创建一个权限等同于当前用户的 API Key，返回体中会包含 `key` 字段，即是生成的 API Key 的值。

### 使用 API Key

API Key 的使用方式和 token 一致，将其放入 `Authorization` header 中即可。

```bash
curl \
  -X POST \
  -H "Content-Type: application/json" \
  -H "Authorization: $KEY" \
  --data-raw '{"where":{}}' \
  http://$CLOUDTOWER_DOMAIN/v2/api/get-vms | jq ".[]"
```

### 删除 API Key

API Key 相比于 token 的优势在于可以随时释放。token 指代的是一个用户，只要用户存在，对应的 token 就一直有效。而 API Key 可以通过 API 进行删除。

```bash
curl -X POST \
  -H "Content-Type: application/json" \
  -H "Authorization: $TOKEN" \
  --data-raw '{"query": "mutation deleteApiKey($key: String!) { deleteApiKey(where: { key: $key }) { id } }", "variables": { "key": "$KEY" }}' \
  http://$CLOUDTOWER_DOMAIN/api/
```

执行后将会删除对应 key 的 API Key。
