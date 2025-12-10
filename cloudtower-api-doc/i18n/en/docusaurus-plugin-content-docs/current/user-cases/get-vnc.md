---
title: Get VNC Information
---

import Terminology from '@site/terminology.json'
import FormatVnc from '../../../../../code_blocks/FormatVnc.md'
import GetVnc from '../../../../../code_blocks/GetVnc.md'
import GetVncResponse from '../../../../../code_blocks/GetVncResponse.md'
import OpenVnc from '../../../../../code_blocks/OpenVnc.md'

<>Currently, {Terminology['terminology']['en-US']['PRODUCT']} API and related SDK do not provide APIs for obtaining VNC information. If users need to obtain VNC information or perform operations such as opening a virtual machine terminal, they can obtain it by sending the following request:</>

<GetVnc />

Where $VM_ID is the ID of the virtual machine, and the endpoint is /api. The sample response is as follows:

<GetVncResponse />

If the current environment can be directly connected to the cluster, you can choose to use `cluster_ip`, `vm_uuid`, `raw_token` and `host_ip` to build a noVnc URL that directly connects to the cluster:

<FormatVnc />

Or you can choose to use `token`, `vm_uuid` and `host_ip` to build a noVnc URL forwarded through the management platform. Since the token may contain some characters that cannot be included in the URL, such as `/`, `+`, etc., it needs to be converted into hexadecimal digits:

<FormatVncProxy />

To use the link, you can refer to how [react-vnc](https://github.com/roerohan/react-vnc) use noVnc URL to create a vnc client.

Specific examples:

Assuming we receive a return like this:

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

If we want to connect directly, we will finally construct a URL like this:

```bash
wss://192.168.5.2/websockify/?uuid=00000000-0000-0000-0000-000000000000&token=1a2bc3d4567e89f0a1b2c3d4e5f6a7b8&host=192.168.5.4
```

<>If we want to forward through {Terminology['terminology']['en-US']['PRODUCT']}, we need to process the token first.</> 

Assuming our token is `MTIzNDU2Nzg5YWJjZGVmZ2hpamtsbW5vcHFyc3R1dnd4eXo=` (obtained by base64 encryption based on `123456789abcdefghijklmnopqrstuvwxyz`), we need to escape characters such as `/`, `+` and `=`

```typescript
token = "MTIzNDU2Nzg5YWJjZGVmZ2hpamtsbW5vcHFyc3R1dnd4eXo="
encodeURIComponent(token) = "MTIzNDU2Nzg5YWJjZGVmZ2hpamtsbW5vcHFyc3R1dnd4eXo%3D"
```

<>Assuming the {Terminology['terminology']['en-US']['PRODUCT']} address is 192.168.5.1, we will finally construct a URL like this:</>

```bash
wss://192.168.5.1/websockify/?token=MTIzNDU2Nzg5YWJjZGVmZ2hpamtsbW5vcHFyc3R1dnd4eXo%3D&uuid=00000000-0000-0000-0000-000000000000&host=192.168.5.4
```
