---
title:  Authorization
sidebar_position: 31
---

import GetToken from '../../../../../code_blocks/GetToken.md'
import GetTokenResponse from '../../../../../code_blocks/GetTokenResponse.md'


> Except for login, all the requests need to add the authentication field.

The CloudTower API makes authentication by passing the `Authorization` field in the headers. Here is how to get a token, using cURL as an example:

<GetToken />

And here is what can be obtained:

<GetTokenResponse />

The `data.token` is the authentication field to be used, you can just add it to `header.Authorization`.
* If called via cURL, add `-H 'Authorization: token-string'`.
* If called via the swagger api documentation page, click the `Authorization` button and add `data.token` to `value`.