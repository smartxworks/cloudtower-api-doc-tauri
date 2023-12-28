---
title: Get VNC Information
---

import FormatVnc from '../../../../../code_blocks/FormatVnc.md'
import GetVnc from '../../../../../code_blocks/GetVnc.md'
import GetVncResponse from '../../../../../code_blocks/GetVncResponse.md'
import OpenVnc from '../../../../../code_blocks/OpenVnc.md'

Currently, CloudTower API and related SDK do not provide APIs for obtaining VNC information. If users need to obtain VNC information or perform operations such as opening a virtual machine terminal, they can obtain it by sending the following request:

<GetVnc />

Where $VM_ID is the ID of the virtual machine, and the endpoint is /api. The sample response is as follows:

<GetVncResponse />

If the current environment can be directly connected to the cluster, you can choose to use `cluster_ip`, `vm_uuid`, `raw_token` and `host_ip` to build a noVnc URL that directly connects to the cluster:

<FormatVnc />

Or you can choose to use `token`, `vm_uuid` and `host_ip` to build a noVnc URL forwarded through CloudTower. Since the token may contain some characters that cannot be included in the URL, such as `/`, `+`, etc., it needs to be converted into hexadecimal digits:

<FormatVncProxy />

To use the link, you can refer to how [react-vnc](https://github.com/roerohan/react-vnc) use noVnc URL to create a vnc client.

Specific examples:

Take the return value above as an example. If we want to connect directly, we will finally build a URL like this:

```
wss://172.20.128.106/websockify/?uuid=56ee1229-9f37-4fd3-94e0-8e2202b15052&token=a97ee2b12ee54742a2358b155c091de6&host=172.20.128.104
```

If we want to forward through CloudTower, we need to process the token first:

```
token = "U2FsdGVkX19Tb5CKbhxb1UiuFLFHg2nrPM2UxEHRjsLwfQTPuh780R03iJCB4EEmlRS0i2WZTK5Spb4yokCz3g=="
encodeURIComponent(token) = "U2FsdGVkX19Tb5CKbhxb1UiuFLFHg2nrPM2UxEHRjsLwfQTPuh780R03iJCB4EEmlRS0i2WZTK5Spb4yokCz3g%3D%3D"
```

Assuming that the CloudTower address is 172.20.128.127, the final URL is constructed as follows:

```
wss://172.20.128.127/websockify/?token=U2FsdGVkX19Tb5CKbhxb1UiuFLFHg2nrPM2UxEHRjsLwfQTPuh780R03iJCB4EEmlRS0i2WZTK5Spb4yokCz3g%3D%3D&uuid=56ee1229-9f37-4fd3-94e0-8e2202b15052&host=172.20.128.104
```