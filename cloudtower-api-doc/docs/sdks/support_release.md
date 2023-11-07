---
title: 适配说明
sidebar_position: 41
---
import Download from '../../swagger/components/Download';

export const AddressWrapper = (props) => {
  const getUrl = (lng, version) => `https://github.com/smartxworks/cloudtower-${lng}-sdk/releases/tag/v${version}`
  return (
    <span>
      <a href={getUrl('java', props.version)}>Java</a> | <a href={getUrl('python', props.version)}>Python</a> |  <a href={getUrl('go', props.version)}>Go </a> {
        props.skip_node ? <></> : <> | <a href={getUrl('node', props.node_version || props.version)}>Node</a></> 
      } | <Download version={props.file_version} />
    </span>
  )
}


## 升级建议
CloudTower API SDK 支持向下兼容。即 SDK 2.9.0 最高支持至 CloudTower 3.0.0 的话，同样可以向下支持 CloudTower 2.8.0。
建议先升级 SDK 再升级 CloudTower。 

## 适配说明
以下罗列了搭配 CloudTower 升级的配套版本。SDK 2.0 之后的版本都修复了较多问题，较为稳定，更推荐大家使用。如需使用 SDK 2.0 之前的版本，或者 SDK 自身的修复版本，可以到对应的 SDK github relase 页面进行查看。

| SDK 版本 | 支持 CloudTower 版本 | SDK 发布日期 | 下载地址 |
| --- | --- | --- | --- |
| 2.13.0 | 3.4.0 | 2023.11.07 | <AddressWrapper version="2.13.0" file_version="3.4.0"/>|
| 2.12.0 | 3.3.0 | 2023.10.19 | <AddressWrapper version="2.12.0" file_version="3.3.0"/>|
| 2.11.0 | 3.2.0, 3.2.1 | 2023.09.01 | <AddressWrapper version="2.11.0" file_version="3.2.0"/>|
| 2.10.0 | 3.1.0 | 2023.08.01 | <AddressWrapper version="2.10.0" file_version="3.1.0"/>|
| 2.9.0 | 3.0.0 | 2023.07.03 | <AddressWrapper version="2.9.0" file_version="3.0.0"/>|
| 2.8.0 | 2.8.0 | 2023.05.04 | <AddressWrapper version="2.8.0" file_version="2.8.0"/>|
| 2.7.0 | 2.7.0 | 2023.03.22 | <AddressWrapper version="2.7.0" file_version="2.7.0"/>|
| 2.6.0 | 2.6.0 | 2023.02.20 | <AddressWrapper version="2.6.0" file_version="2.6.0"/>|
| 2.5.0 | 2.5.1 | 2023.01.03 | <AddressWrapper version="2.5.0" file_version="2.5.0"/>|
| 2.4.0 | 2.4.2 | 2022.11.18 | <AddressWrapper version="2.4.0" node_version="2.4.1" file_version="2.4.0"/>|
| 2.3.0 | 2.3.0 | 2022.09.05 | <AddressWrapper version="2.3.0" skip_node file_version="2.3.0"/>|
| 2.2.0 | 2.2.0 | 2022.08.12 | <AddressWrapper version="2.2.0" skip_node file_version="2.2.0"/>|
| 2.1.0 | 2.1.0 | 2022.07.08 | <AddressWrapper version="2.1.0" skip_node file_version="2.1.0"/>|

