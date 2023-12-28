---
title: 获取 VNC 信息
---
import FormatVnc from '../../code_blocks/FormatVnc.md'
import FormatVncProxy from '../../code_blocks/FormatVncProxy.md'
import GetVnc from '../../code_blocks/GetVnc.md'
import GetVncResponse from '../../code_blocks/GetVncResponse.md'


目前 CloudTower API 及相关 SDK 暂不提供获取 VNC 信息相关的 API。如果使用者需要获取 VNC 信息，打开虚拟机终端等相关操作的话，可以通过发送以下请求 token 并构建 noVnc 链接

<GetVnc />

其中 $VM_ID 为虚拟机 id , endpoint 为 `/api`。
返回结果的示例如下:

<GetVncResponse />

如果当前环境可以直连集群，可以选择使用 `cluster_ip`, `vm_uuid`, `raw_token` 和 `host_ip` 构建直连集群的 noVnc 链接：

<FormatVnc />

或者可以选择使用 `token`, `vm_uuid` 和 `host_ip`以构建通过 CloudTower 转发的 noVnc 链接，由于 token 中可能包含一部分不能包含在 URL 的字符，例如 `/`，`+` 等，需要转移成十六进制数字：

<FormatVncProxy />

链接的使用可以参考 [react-vnc](https://github.com/roerohan/react-vnc) 对 noVnc 的使用

具体示例：

以上文拿到的返回值举例，如果希望直连，我们最后会构建出这样的一个 URL

```
wss://172.20.128.106/websockify/?uuid=56ee1229-9f37-4fd3-94e0-8e2202b15052&token=a97ee2b12ee54742a2358b155c091de6&host=172.20.128.104
```

如果希望通过 CloudTower 转发，我们需要先处理 token

```
token = "U2FsdGVkX19Tb5CKbhxb1UiuFLFHg2nrPM2UxEHRjsLwfQTPuh780R03iJCB4EEmlRS0i2WZTK5Spb4yokCz3g=="
encodeURIComponent(token) = "U2FsdGVkX19Tb5CKbhxb1UiuFLFHg2nrPM2UxEHRjsLwfQTPuh780R03iJCB4EEmlRS0i2WZTK5Spb4yokCz3g%3D%3D"
```

假设 CloudTower 地址是 172.20.128.127，最后构建出这样的一个 URL

```
wss://172.20.128.127/websockify/?token=U2FsdGVkX19Tb5CKbhxb1UiuFLFHg2nrPM2UxEHRjsLwfQTPuh780R03iJCB4EEmlRS0i2WZTK5Spb4yokCz3g%3D%3D&uuid=56ee1229-9f37-4fd3-94e0-8e2202b15052&host=172.20.128.104
```
