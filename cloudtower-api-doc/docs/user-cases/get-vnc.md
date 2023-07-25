---
title: 获取 VNC 信息
---
import FormatVnc from '../../code_blocks/FormatVnc.md'
import GetVnc from '../../code_blocks/GetVnc.md'
import GetVncResponse from '../../code_blocks/GetVncResponse.md'
import OpenVnc from '../../code_blocks/OpenVnc.md'


目前 CloudTower API 及相关 SDK 暂不提供获取 VNC 信息相关的 API。如果使用者需要获取 VNC 信息，打开虚拟机终端等相关操作的话，可以通过发送以下请求获取：


<GetVnc />

其中 $VM_ID 为虚拟机 id , endpoint 为 `/api`。
返回结果的示例如下:

<GetVncResponse />

通过以上返回信息，VNC URL 构造格式如下：

<FormatVnc />

最后，以前端使用的 noVNC 为例，我们可以通过以下操作，在页面上连接到虚拟机终端：

<OpenVnc /> 