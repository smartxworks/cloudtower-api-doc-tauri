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

Based on the above response, the format for constructing the VNC URL is as follows:

<FormatVnc />

Finally, using noVNC as an example for the frontend, we can connect to the virtual machine terminal on the page through the following operation:

<OpenVnc /> 