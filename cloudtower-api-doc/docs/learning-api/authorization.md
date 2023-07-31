---
title: 鉴权
sidebar_position: 31
---
import GetToken from '../../code_blocks/GetToken.md'
import GetTokenResponse from '../../code_blocks/GetTokenResponse.md'

从快速开始的样例中，可以看到 CloudTower API 的使用一共分为 2 步，第一步是通过登陆获取鉴权用的 token，第二步是通过 Authorization header 携带 token，并调用对应的 API 来进行操作。其中第一步获取的 token 并没有过期时间，可以一直使用，所以在一系列的操作中，只需要获取一次 token 即可。

> 除了登录以外，所有的请求都需要加上鉴权字段。

​
CloudTower API 通过在 headers 中传递 `Authorization` 字段进行鉴权，token 的获取方式如下, 以 cURL 为例：

<GetToken />

获取到

<GetTokenResponse />

其中  `data.token` 是需要用到的鉴权字段，加入到 `header.Authorization ` 即可。
* 如果通过 cURL 调用， 则加入 `-H 'Authorization: token-string'`。
* 如果通过 swagger api 文档页面调用，则点击 `Authorization` 按钮，将`data.token` 填入到 `value` 中即可。