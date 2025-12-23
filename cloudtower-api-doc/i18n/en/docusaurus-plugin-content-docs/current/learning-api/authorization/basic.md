---
title: Token authentication
---

import Terminology from '@site/terminology.json'
import GetToken from '@site/code_blocks/GetToken.md'
import GetTokenResponse from '@site/code_blocks/GetTokenResponse.md'

<>From the example in <strong>Quick start</strong>, you can see that using the {Terminology['terminology']['en-US']['PRODUCT']} API involves two main steps. First, log in to obtain a token used for authentication. Second, include the token in the <code>Authorization</code> header when calling the corresponding API to perform operations. The token obtained in the first step does not have an expiration time and can be used indefinitely. Therefore, for a series of operations, you only need to obtain the token once. </>

> Except for the login request, all requests must include the field for authentication.

<>{Terminology['terminology']['en-US']['PRODUCT']} API authenticates requests by passing the <code>Authorization</code> field in the headers. You can obtain the token as follows using <code>cURL</code>: </>

<GetToken />

The following result is obtained:

<GetTokenResponse />

After execution, the token for authentication can be found as the `data.token` field. Include it in `header.Authorization`.

- When calling the API with `curl`, include `-H 'Authorization: token-string'` in your request.
- When calling the API from the Swagger API documentation page, click the `Authorization` button and enter `data.token` into the `value` field.