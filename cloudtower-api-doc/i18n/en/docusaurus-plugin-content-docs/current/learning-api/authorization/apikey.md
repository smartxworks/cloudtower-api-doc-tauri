---
title: API key authentication
---

import Terminology from '@site/terminology.json'

In the default environment, you can log in with your username and password to obtain a token, which can then be used for authentication. However, when two-factor authentication is enabled, you cannot obtain a token using only your username and password. An additional second-factor verification is required. Since API operations are non-interactive, the second-factor verification cannot be performed in this scenario.

<>To enable the use of the {Terminology['terminology']['en-US']['PRODUCT']} API in such environments, {Terminology['terminology']['en-US']['PRODUCT']} introduces an API Key to replace the token for authentication. </>

### Issuing an API key

An API key requires token-based authentication to be issued. You need to manually log in to obtain a token before creating an API key.

```bash
curl -X POST \
  -H "Content-Type: application/json" \
  -H "Authorization: $TOKEN" \
  --data-raw '{"query": "mutation createApiKey($name: String!) { createApiKey(data: { name: $name }) { id key roles { id preset }}}", "variables": {"name": "$NAME"}}' \
  http://$CLOUDTOWER_IP/api/ | jq -r '.data.createApiKey.key'
```

After execution, an API key with the same permissions as the current user will be created. The response body includes the `key` field, which is the value of the generated API key.

### Using an API key

An API key is used in the same way as a token. Include it in the `Authorization` header.

```bash
curl \
  -X POST \
  -H "Content-Type: application/json" \
  -H "Authorization: $KEY" \
  --data-raw '{"where":{}}' \
  http://CLOUDTOWER_IP/v2/api/get-vms | jq ".[]"
```

### Deleting an API key

The advantage of an API key over a token is that it can be released at any time. A token represents a user, and as long as the user exists, the corresponding token remains valid. In contrast, an API key can be deleted through the API.

```bash
curl -X POST \
  -H "Content-Type: application/json" \
  -H "Authorization: $TOKEN" \
  --data-raw '{"query": "mutation deleteApiKey($key: String!) { deleteApiKey(where: { key: $key }) { id } }", "variables": { "key": "$KEY" }}' \
  http://CLOUDTOWER_IP/api/
```

After execution, the API key associated with the specified key will be deleted.
