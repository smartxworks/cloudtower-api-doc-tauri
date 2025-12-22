---
title: Fetching the VNC information
---

import Terminology from '@site/terminology.json'
import FormatVnc from '@site/code_blocks/FormatVnc.md'
import FormatVncProxy from '@site/code_blocks/FormatVncProxy.md'
import GetVnc from '@site/code_blocks/GetVnc.md'
import GetVncResponse from '@site/code_blocks/GetVncResponse.md'

<>Currently, the {Terminology['terminology']['en-US']['PRODUCT']} API and related SDKs do not provide APIs for obtaining VNC information. If you need to fetch the VNC information or perform operations such as opening a virtual machine console, you can send the following request token and construct a noVNC link. </>

<GetVnc />

Here, `$VM_ID` represents the virtual machine ID, and endpoint refers to `/api`.
An example response is shown below:

<GetVncResponse />

If your current environment can directly connect to the cluster, you can construct a direct noVNC link to the cluster using the following fields: `cluster_ip`, `vm_uuid`, `raw_token`, and `host_ip`.

<FormatVnc />

Alternatively, you can construct a noVNC link via the management platform's proxy using `token`, `vm_uuid`, and `host_ip`. Since `token` is a base64-encoded string, it may contain characters that cannot be included in a URL (for example, `/`, `+`, and `=`). In such cases, you need to escape them into hexadecimal values.

<FormatVncProxy />

For the usage of the link, refer to the usage of noVNC in [react-vnc](https://github.com/roerohan/react-vnc).

The following is an example:

Suppose that you received the following response:

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

If you want to establish a direct connection, you can construct the following URL:

```bash
wss://192.168.5.2/websockify/?uuid=00000000-0000-0000-0000-000000000000&token=1a2bc3d4567e89f0a1b2c3d4e5f6a7b8&host=192.168.5.4
```

<>If you want to forward via {Terminology['terminology']['en-US']['PRODUCT']}, you need to process the token first. </>

Suppose that the token is `MTIzNDU2Nzg5YWJjZGVmZ2hpamtsbW5vcHFyc3R1dnd4eXo=` (base64-encoded from `123456789abcdefghijklmnopqrstuvwxyz`). You need to escape special characters such as `/`, `+`, and `=`.

```typescript
token = "MTIzNDU2Nzg5YWJjZGVmZ2hpamtsbW5vcHFyc3R1dnd4eXo="
encodeURIComponent(token) = "MTIzNDU2Nzg5YWJjZGVmZ2hpamtsbW5vcHFyc3R1dnd4eXo="%3D"
```

<>Assume that the address of {Terminology['terminology']['en-US']['PRODUCT']} is 192.168.5.1, the final URL will be: </>

```bash
wss://192.168.5.1/websockify/?token=MTIzNDU2Nzg5YWJjZGVmZ2hpamtsbW5vcHFyc3R1dnd4eXo%3D&uuid=00000000-0000-0000-0000-000000000000&host=192.168.5.4
```
