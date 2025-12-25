---
title: API key authentication
---
import CodeTerminology from '@site/code-terminology.json'
import Terminology from '@site/terminology.json'
import CreateApiKey from '@site/code_blocks/authorization/apikey/create.md'
import UseApiKey from '@site/code_blocks/authorization/apikey/use.md'
import DeleteApiKey from '@site/code_blocks/authorization/apikey/delete.md'

In the default environment, you can log in with your username and password to obtain a token, which can then be used for authentication. However, when two-factor authentication is enabled, you cannot obtain a token using only your username and password. An additional second-factor verification is required. Since API operations are non-interactive, the second-factor verification cannot be performed in this scenario.

<>To enable the use of the {Terminology['terminology']['en-US']['PRODUCT']} API in such environments, {Terminology['terminology']['en-US']['PRODUCT']} introduces an API Key to replace the token for authentication. </>

### Issuing an API key

An API key requires token-based authentication to be issued. You need to manually log in to obtain a token before creating an API key.

<CreateApiKey />

After execution, an API key with the same permissions as the current user will be created. The response body includes the `key` field, which is the value of the generated API key.

### Using an API key

An API key is used in the same way as a token. Include it in the `Authorization` header.

<UseApiKey />

### Deleting an API key

The advantage of an API key over a token is that it can be released at any time. A token represents a user, and as long as the user exists, the corresponding token remains valid. In contrast, an API key can be deleted through the API.

<DeleteApiKey />

After execution, the API key associated with the specified key will be deleted.
