---
title: 鉴权
---
import GetToken from '../../code_blocks/GetToken.md'
import GetTokenResponse from '../../code_blocks/GetTokenResponse.md'

> 除了登录以外，所有的请求都需要加上鉴权字段。

​
CloudTower API 通过在 headers 中传递 `Authorization` 字段进行鉴权，token 的获取方式如下, 以 cURL 为例：

<GetToken />

获取到

<GetTokenResponse />

其中  `data.token` 是需要用到的鉴权字段，加入到 `header.Authorization ` 即可。
* 如果通过 cURL 调用， 则加入 `-H 'Authorization: token-string'`。
* 如果通过 swagger api 文档页面调用，则点击 `Authorization` 按钮，将`data.token` 填入到 `value` 中即可。