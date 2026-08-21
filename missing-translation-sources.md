# Missing translation field sources

This PR records source links for CloudTower API documentation fields whose translations are currently missing.

## Method

- Missing keys were collected from `cloudtower-api-doc-oem/api-doc-src/cloudtower-api-doc/swagger/locales`.
- Operation API / Tower MR descriptions were read via GitLab API.
- Google Docs linked from those MR descriptions were read via the Google Workspace MCP.
- `high` means the field appears as a standalone field/table row in a design doc.
- `mention` means the field name appears in the document body but still needs manual confirmation.
- `no` means none of the 12 Google Docs found a match.

## Summary

| Status | Count |
|---|---:|
| high | 201 |
| mention | 1302 |
| no | 742 |
| total | 2245 |

## Design documents included

| Document | MRs that reference it |
|---|---|
| [OApi Label 添加 Key Value 自测](https://docs.google.com/document/d/17NoW1HrIPD3EKc9ujYE8ZZVcbiyBW4edGYfB390mNIw/edit) | [!14](http://gitlab.smartx.com/frontend/operation-api/-/merge_requests/14) |
| [VM 相关操作支持 VPC API](https://docs.google.com/document/d/1AIpK5l_-DVR98tucAVfI_6MhgPO2kVNBySSUeVC2ZkY/edit) | [!50](http://gitlab.smartx.com/frontend/operation-api/-/merge_requests/50) |
| [可观测性服务-取消系统服务关联 API](https://docs.google.com/document/d/1hc3kzOvWe8kzfRgF4hjM08wK60eANLnAwGh5iqYXjkk/edit) | [!67](http://gitlab.smartx.com/frontend/operation-api/-/merge_requests/67) |
| [备份计划 API](https://docs.google.com/document/d/1J3rm7Llu2ANLKHrkagAK3NanaVgPDpS2XgPwWKbjNO4/edit) | [!69](http://gitlab.smartx.com/frontend/operation-api/-/merge_requests/69) |
| [OApi 添加独占逻辑容量自测](https://docs.google.com/document/d/1NTIecYSBo7TKmKaQufUf0pmYFJQe240-A87LDpXbvwU/edit) | [!18](http://gitlab.smartx.com/frontend/operation-api/-/merge_requests/18) |
| [VPC 网关服务 API](https://docs.google.com/document/d/1nwP2Wa0a5IPb7JTDWCFTQ98PEkuiO5bpWfEOwZaUVDs/edit) | [!31](http://gitlab.smartx.com/frontend/operation-api/-/merge_requests/31), [!34](http://gitlab.smartx.com/frontend/operation-api/-/merge_requests/34), [!35](http://gitlab.smartx.com/frontend/operation-api/-/merge_requests/35) |
| [从内容库模版批量创建虚拟机 API](https://docs.google.com/document/d/1oAdA59G69GYIct5xro0XWo9lcOXzrC1rTd7Knq3PvJ8/edit) | [!68](http://gitlab.smartx.com/frontend/operation-api/-/merge_requests/68), [!79](http://gitlab.smartx.com/frontend/operation-api/-/merge_requests/79) |
| [Everoute API](https://docs.google.com/document/d/1P5TiMlKw2Q4R_WtC7BMnRVg4b43qpXNrKQBHGze1sK8/edit) | [!130](http://gitlab.smartx.com/frontend/operation-api/-/merge_requests/130), [!131](http://gitlab.smartx.com/frontend/operation-api/-/merge_requests/131), [!132](http://gitlab.smartx.com/frontend/operation-api/-/merge_requests/132), [!133](http://gitlab.smartx.com/frontend/operation-api/-/merge_requests/133), [!134](http://gitlab.smartx.com/frontend/operation-api/-/merge_requests/134) |
| [清理系统服务的报警通知配置 API](https://docs.google.com/document/d/1pH1bjY3sJTb3a_qLVdirZwnadOucY5Hu6D_Ky6G7SYk/edit) | [!108](http://gitlab.smartx.com/frontend/operation-api/-/merge_requests/108) |
| [获取 TOWER NTP 服务](https://docs.google.com/document/d/1-SNE1Be2RgUaPuY0-Rc4U4XDR1hq6L3yYfExswHQvh0/edit) | [!115](http://gitlab.smartx.com/frontend/operation-api/-/merge_requests/115) |
| [VPC/VPC子网/路由表 API](https://docs.google.com/document/d/1Y6v8qWl3Js8S-sc4cYkwsT8dDXI8rB2nErKnjZUlr74/edit) | [!25](http://gitlab.smartx.com/frontend/operation-api/-/merge_requests/25), [!26](http://gitlab.smartx.com/frontend/operation-api/-/merge_requests/26), [!29](http://gitlab.smartx.com/frontend/operation-api/-/merge_requests/29) |
| [VPC 安全服务 API](https://docs.google.com/document/d/1Yh1wFd8xgb5Z_6APRJE3jXBDZKtfUzMRmRyJwRHPPeg/edit) | [!28](http://gitlab.smartx.com/frontend/operation-api/-/merge_requests/28), [!32](http://gitlab.smartx.com/frontend/operation-api/-/merge_requests/32) |

## High-confidence examples

| Version | Field | Source |
|---|---|---|
| 4.9.0 | SyncReplicationPlan.status | [从内容库模版批量创建虚拟机 API](https://docs.google.com/document/d/1oAdA59G69GYIct5xro0XWo9lcOXzrC1rTd7Knq3PvJ8/edit) |
| 4.9.0 | SyncReplicationPlan.vms | [备份计划 API](https://docs.google.com/document/d/1J3rm7Llu2ANLKHrkagAK3NanaVgPDpS2XgPwWKbjNO4/edit), [VPC 安全服务 API](https://docs.google.com/document/d/1Yh1wFd8xgb5Z_6APRJE3jXBDZKtfUzMRmRyJwRHPPeg/edit), [从内容库模版批量创建虚拟机 API](https://docs.google.com/document/d/1oAdA59G69GYIct5xro0XWo9lcOXzrC1rTd7Knq3PvJ8/edit) |
| 4.7.0 | DiskPoolWhereInput.status | [从内容库模版批量创建虚拟机 API](https://docs.google.com/document/d/1oAdA59G69GYIct5xro0XWo9lcOXzrC1rTd7Knq3PvJ8/edit) |
| 4.7.0 | DiskPool.status | [从内容库模版批量创建虚拟机 API](https://docs.google.com/document/d/1oAdA59G69GYIct5xro0XWo9lcOXzrC1rTd7Knq3PvJ8/edit) |
| 4.7.0 | NestedReplicationServiceNetwork.gateway | [VPC/VPC子网/路由表 API](https://docs.google.com/document/d/1Y6v8qWl3Js8S-sc4cYkwsT8dDXI8rB2nErKnjZUlr74/edit) |
| 4.6.0 | NestedVpcGatewaysCommonExternalIpsType.external_ip | [VPC 网关服务 API](https://docs.google.com/document/d/1nwP2Wa0a5IPb7JTDWCFTQ98PEkuiO5bpWfEOwZaUVDs/edit) |
| 4.6.0 | ReplicationPlanWhereInput.status | [从内容库模版批量创建虚拟机 API](https://docs.google.com/document/d/1oAdA59G69GYIct5xro0XWo9lcOXzrC1rTd7Knq3PvJ8/edit) |
| 4.6.0 | NestedReplicationNetworkConfigure.gateway | [VPC/VPC子网/路由表 API](https://docs.google.com/document/d/1Y6v8qWl3Js8S-sc4cYkwsT8dDXI8rB2nErKnjZUlr74/edit) |
| 4.6.0 | ReplicationPlan.status | [从内容库模版批量创建虚拟机 API](https://docs.google.com/document/d/1oAdA59G69GYIct5xro0XWo9lcOXzrC1rTd7Knq3PvJ8/edit) |
| 4.6.0 | ReplicationPlan.vms | [备份计划 API](https://docs.google.com/document/d/1J3rm7Llu2ANLKHrkagAK3NanaVgPDpS2XgPwWKbjNO4/edit), [VPC 安全服务 API](https://docs.google.com/document/d/1Yh1wFd8xgb5Z_6APRJE3jXBDZKtfUzMRmRyJwRHPPeg/edit), [从内容库模版批量创建虚拟机 API](https://docs.google.com/document/d/1oAdA59G69GYIct5xro0XWo9lcOXzrC1rTd7Knq3PvJ8/edit) |
| 4.4.0 | /update-backup-plan | [备份计划 API](https://docs.google.com/document/d/1J3rm7Llu2ANLKHrkagAK3NanaVgPDpS2XgPwWKbjNO4/edit) |
| 4.4.0 | VirtualPrivateCloudEdgeGatewayWhereInput.gateway | [VPC/VPC子网/路由表 API](https://docs.google.com/document/d/1Y6v8qWl3Js8S-sc4cYkwsT8dDXI8rB2nErKnjZUlr74/edit) |
| 4.4.0 | VmCreateVmFromContentLibraryTemplateBatchVmParams.cloud_init | [从内容库模版批量创建虚拟机 API](https://docs.google.com/document/d/1oAdA59G69GYIct5xro0XWo9lcOXzrC1rTd7Knq3PvJ8/edit) |
| 4.4.0 | VmCreateVmFromContentLibraryTemplateBatchVmParams.max_bandwidth_policy | [从内容库模版批量创建虚拟机 API](https://docs.google.com/document/d/1oAdA59G69GYIct5xro0XWo9lcOXzrC1rTd7Knq3PvJ8/edit) |
| 4.4.0 | VmCreateVmFromContentLibraryTemplateBatchVmParams.status | [从内容库模版批量创建虚拟机 API](https://docs.google.com/document/d/1oAdA59G69GYIct5xro0XWo9lcOXzrC1rTd7Knq3PvJ8/edit) |
| 4.4.0 | VmCreateVmFromContentLibraryTemplateBatchVmParams.firmware | [从内容库模版批量创建虚拟机 API](https://docs.google.com/document/d/1oAdA59G69GYIct5xro0XWo9lcOXzrC1rTd7Knq3PvJ8/edit) |
| 4.4.0 | DisassociateSystemServiceFromObsServiceParams.system_service_id | [可观测性服务-取消系统服务关联 API](https://docs.google.com/document/d/1hc3kzOvWe8kzfRgF4hjM08wK60eANLnAwGh5iqYXjkk/edit), [清理系统服务的报警通知配置 API](https://docs.google.com/document/d/1pH1bjY3sJTb3a_qLVdirZwnadOucY5Hu6D_Ky6G7SYk/edit) |
| 4.4.0 | NestedBackupServiceNetworkStatus.status | [从内容库模版批量创建虚拟机 API](https://docs.google.com/document/d/1oAdA59G69GYIct5xro0XWo9lcOXzrC1rTd7Knq3PvJ8/edit) |
| 4.3.0 | /create-virtual-private-cloud-floating-ip | [VPC 网关服务 API](https://docs.google.com/document/d/1nwP2Wa0a5IPb7JTDWCFTQ98PEkuiO5bpWfEOwZaUVDs/edit) |
| 4.3.0 | /create-virtual-private-cloud-nat-gateway | [VPC 网关服务 API](https://docs.google.com/document/d/1nwP2Wa0a5IPb7JTDWCFTQ98PEkuiO5bpWfEOwZaUVDs/edit) |
| 4.3.0 | /update-virtual-private-cloud-nat-gateway | [VPC 网关服务 API](https://docs.google.com/document/d/1nwP2Wa0a5IPb7JTDWCFTQ98PEkuiO5bpWfEOwZaUVDs/edit) |
| 4.3.0 | /create-virtual-private-cloud-router-gateway | [VPC 网关服务 API](https://docs.google.com/document/d/1nwP2Wa0a5IPb7JTDWCFTQ98PEkuiO5bpWfEOwZaUVDs/edit) |
| 4.3.0 | /update-virtual-private-cloud-router-gateway | [VPC 网关服务 API](https://docs.google.com/document/d/1nwP2Wa0a5IPb7JTDWCFTQ98PEkuiO5bpWfEOwZaUVDs/edit) |
| 4.3.0 | /delete-virtual-private-cloud-router-gateway | [VPC 网关服务 API](https://docs.google.com/document/d/1nwP2Wa0a5IPb7JTDWCFTQ98PEkuiO5bpWfEOwZaUVDs/edit) |
| 4.3.0 | /create-virtual-private-cloud-security-policy | [VPC 安全服务 API](https://docs.google.com/document/d/1Yh1wFd8xgb5Z_6APRJE3jXBDZKtfUzMRmRyJwRHPPeg/edit) |
| 4.3.0 | /delete-virtual-private-cloud-security-policy | [VPC 安全服务 API](https://docs.google.com/document/d/1Yh1wFd8xgb5Z_6APRJE3jXBDZKtfUzMRmRyJwRHPPeg/edit) |
| 4.3.0 | /update-virtual-private-cloud-security-policy | [VPC 安全服务 API](https://docs.google.com/document/d/1Yh1wFd8xgb5Z_6APRJE3jXBDZKtfUzMRmRyJwRHPPeg/edit) |
| 4.3.0 | /create-virtual-private-cloud-subnet | [VPC/VPC子网/路由表 API](https://docs.google.com/document/d/1Y6v8qWl3Js8S-sc4cYkwsT8dDXI8rB2nErKnjZUlr74/edit) |
| 4.3.0 | /delete-virtual-private-cloud-subnet | [VPC/VPC子网/路由表 API](https://docs.google.com/document/d/1Y6v8qWl3Js8S-sc4cYkwsT8dDXI8rB2nErKnjZUlr74/edit) |
| 4.3.0 | /create-virtual-private-cloud | [VPC/VPC子网/路由表 API](https://docs.google.com/document/d/1Y6v8qWl3Js8S-sc4cYkwsT8dDXI8rB2nErKnjZUlr74/edit), [VPC 安全服务 API](https://docs.google.com/document/d/1Yh1wFd8xgb5Z_6APRJE3jXBDZKtfUzMRmRyJwRHPPeg/edit), [VPC 网关服务 API](https://docs.google.com/document/d/1nwP2Wa0a5IPb7JTDWCFTQ98PEkuiO5bpWfEOwZaUVDs/edit) |
| 4.3.0 | /update-virtual-private-cloud | [VPC/VPC子网/路由表 API](https://docs.google.com/document/d/1Y6v8qWl3Js8S-sc4cYkwsT8dDXI8rB2nErKnjZUlr74/edit), [VPC 安全服务 API](https://docs.google.com/document/d/1Yh1wFd8xgb5Z_6APRJE3jXBDZKtfUzMRmRyJwRHPPeg/edit), [VPC 网关服务 API](https://docs.google.com/document/d/1nwP2Wa0a5IPb7JTDWCFTQ98PEkuiO5bpWfEOwZaUVDs/edit) |
| 4.3.0 | /delete-virtual-private-cloud | [VPC/VPC子网/路由表 API](https://docs.google.com/document/d/1Y6v8qWl3Js8S-sc4cYkwsT8dDXI8rB2nErKnjZUlr74/edit), [VPC 安全服务 API](https://docs.google.com/document/d/1Yh1wFd8xgb5Z_6APRJE3jXBDZKtfUzMRmRyJwRHPPeg/edit), [VPC 网关服务 API](https://docs.google.com/document/d/1nwP2Wa0a5IPb7JTDWCFTQ98PEkuiO5bpWfEOwZaUVDs/edit) |
| 4.3.0 | NestedVirtualPrivateCloudNic.ip_addresses | [VM 相关操作支持 VPC API](https://docs.google.com/document/d/1AIpK5l_-DVR98tucAVfI_6MhgPO2kVNBySSUeVC2ZkY/edit), [VPC 网关服务 API](https://docs.google.com/document/d/1nwP2Wa0a5IPb7JTDWCFTQ98PEkuiO5bpWfEOwZaUVDs/edit) |
| 4.2.0 | VirtualPrivateCloudSubnetIpPoolParams.end | [VPC/VPC子网/路由表 API](https://docs.google.com/document/d/1Y6v8qWl3Js8S-sc4cYkwsT8dDXI8rB2nErKnjZUlr74/edit) |
| 4.2.0 | VirtualPrivateCloudSubnetIpPoolParams.start | [VPC/VPC子网/路由表 API](https://docs.google.com/document/d/1Y6v8qWl3Js8S-sc4cYkwsT8dDXI8rB2nErKnjZUlr74/edit) |
| 3.4.4 | /add-vm-nic | [VM 相关操作支持 VPC API](https://docs.google.com/document/d/1AIpK5l_-DVR98tucAVfI_6MhgPO2kVNBySSUeVC2ZkY/edit) |
| 3.4.4 | /clone-vm | [VM 相关操作支持 VPC API](https://docs.google.com/document/d/1AIpK5l_-DVR98tucAVfI_6MhgPO2kVNBySSUeVC2ZkY/edit), [OApi 添加独占逻辑容量自测](https://docs.google.com/document/d/1NTIecYSBo7TKmKaQufUf0pmYFJQe240-A87LDpXbvwU/edit) |
| 3.4.4 | /convert-vm-template-to-vm | [VM 相关操作支持 VPC API](https://docs.google.com/document/d/1AIpK5l_-DVR98tucAVfI_6MhgPO2kVNBySSUeVC2ZkY/edit) |
| 3.4.4 | /create-vm | [VM 相关操作支持 VPC API](https://docs.google.com/document/d/1AIpK5l_-DVR98tucAVfI_6MhgPO2kVNBySSUeVC2ZkY/edit), [OApi 添加独占逻辑容量自测](https://docs.google.com/document/d/1NTIecYSBo7TKmKaQufUf0pmYFJQe240-A87LDpXbvwU/edit), [从内容库模版批量创建虚拟机 API](https://docs.google.com/document/d/1oAdA59G69GYIct5xro0XWo9lcOXzrC1rTd7Knq3PvJ8/edit) |
| 3.4.4 | /get-vm-volumes | [OApi Label 添加 Key Value 自测](https://docs.google.com/document/d/17NoW1HrIPD3EKc9ujYE8ZZVcbiyBW4edGYfB390mNIw/edit), [OApi 添加独占逻辑容量自测](https://docs.google.com/document/d/1NTIecYSBo7TKmKaQufUf0pmYFJQe240-A87LDpXbvwU/edit) |

Full row-level data is in `missing-translation-sources.csv`.
