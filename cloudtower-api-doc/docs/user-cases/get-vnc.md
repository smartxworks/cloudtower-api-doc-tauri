---
title: 获取 VNC 信息
---
import Terminology from '@site/terminology.json'
import FormatVnc from '@site/code_blocks/FormatVnc.md'
import FormatVncProxy from '@site/code_blocks/FormatVncProxy.md'
import GetVnc from '@site/code_blocks/GetVnc.md'
import GetVncResponse from '@site/code_blocks/GetVncResponse.md'

<>目前 {Terminology['zh-CN']['PRODUCT']} API 及相关 SDK 暂不提供获取 VNC 信息相关的 API。如果使用者需要获取 VNC 信息，打开虚拟机终端等相关操作的话，可以通过发送以下请求 token 并构建 noVnc 链接</>

<GetVnc />

其中 $VM_ID 为虚拟机 id , endpoint 为 `/api`。
返回结果的示例如下:

<GetVncResponse />

如果当前环境可以直连集群，可以选择使用 `cluster_ip`, `vm_uuid`, `raw_token` 和 `host_ip` 构建直连集群的 noVnc 链接：

<FormatVnc />

或者可以选择使用 `token`, `vm_uuid` 和 `host_ip` 以构建通过管理平台 转发的 noVnc 链接，由于 token 是一个被 base64 处理后的字符串，因此中可能包含一部分不能包含在 URL 的字符，例如 `/`，`+`，`=` 等，需要转义成十六进制数字：

<FormatVncProxy />

链接的使用可以参考 [react-vnc](https://github.com/roerohan/react-vnc) 对 noVnc 的使用

具体示例：

假设我们接收到了这样的一个返回：

```json
{
  "data": {
    "vnc": {
      "raw_token": "1a2bc3d4567e89f0a1b2c3d4e5f6a7b8",
      "token": "MTIzNDU2Nzg5YWJjZGVmZ2hpamtsbW5vcHFyc3R1dnd4eXo=",
      "vm_uuid": "00000000-0000-0000-0000-000000000000",
      "cluster_ip": "192.168.5.2",
      "host_ip": "192.168.5.4"
    }
  }
}
```

如果希望直连，我们最后会构建出这样的一个 URL

```bash
wss://192.168.5.2/websockify/?uuid=00000000-0000-0000-0000-000000000000&token=1a2bc3d4567e89f0a1b2c3d4e5f6a7b8&host=192.168.5.4
```

<>如果希望通过 {Terminology['zh-CN']['PRODUCT']} 转发，我们需要先处理 token。</>

假设我们的 token 是 `MTIzNDU2Nzg5YWJjZGVmZ2hpamtsbW5vcHFyc3R1dnd4eXo=` （基于 `123456789abcdefghijklmnopqrstuvwxyz` base64 加密获得），我们需要将 `/`，`+`，`=` 等字符转义。

```typescript
token = "MTIzNDU2Nzg5YWJjZGVmZ2hpamtsbW5vcHFyc3R1dnd4eXo="
encodeURIComponent(token) = "MTIzNDU2Nzg5YWJjZGVmZ2hpamtsbW5vcHFyc3R1dnd4eXo%3D"
```

<>假设 {Terminology['zh-CN']['PRODUCT']} 地址是 192.168.5.1 URL 最后会是：</>

```bash
wss://192.168.5.1/websockify/?token=MTIzNDU2Nzg5YWJjZGVmZ2hpamtsbW5vcHFyc3R1dnd4eXo%3D&uuid=00000000-0000-0000-0000-000000000000&host=192.168.5.4
```
