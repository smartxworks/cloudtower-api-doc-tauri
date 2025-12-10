---
title:  Token Authentication
---
import Terminology from '@site/terminology.json'
import GetToken from '@site/code_blocks/GetToken.md'
import GetTokenResponse from '@site/code_blocks/GetTokenResponse.md'

<>From the quick start example, you can see that using the {Terminology['terminology']['en-US']['PRODUCT']} API consists of 2 steps: first, obtain an authentication token by logging in; second, carry the token in the Authorization header and call the corresponding API to perform operations.</>

The token obtained in the first step does not have an expiration time and can be used indefinitely, so you only need to obtain the token once for a series of operations

> Except for login, all the requests need to add the authentication field.

<>The {Terminology['terminology']['en-US']['PRODUCT']} API makes authentication by passing the Authorization field in the headers. Here is how to get a token, using cURL as an example:</>

<GetToken />

And here is what can be obtained:

<GetTokenResponse />

The `data.token` is the authentication field to be used, you can just add it to `header.Authorization`.
* If called via cURL, add `-H 'Authorization: token-string'`.
* If called via the swagger api documentation page, click the `Authorization` button and add `data.token` to `value`.