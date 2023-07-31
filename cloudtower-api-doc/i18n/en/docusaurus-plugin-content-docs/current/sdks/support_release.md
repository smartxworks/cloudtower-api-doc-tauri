---
title: Support Release
sidebar_position: 41
---

import Download from '../../../../../swagger/components/Download';

export const AddressWrapper = (props) => {
  const getUrl = (lng, version) => `https://github.com/smartxworks/cloudtower-${lng}-sdk/releases/tag/v${version}`
  return (
    <span>
      <a href={getUrl('java', props.version)}>Java</a> | <a href={getUrl('python', props.version)}>Python</a> |  <a href={getUrl('go', props.version)}>Go </a> {
        props.skip_node ? <></> : <> | <a href={getUrl('node', props.node_version || props.version)}>Node</a></> 
      } | <Download version={props.version} />
    </span>
  )
}


## Upgrade Recommendations
CloudTower API SDK supports backward compatibility. That is, if SDK 2.9.0 supports up to CloudTower 3.0.0, it can also support CloudTower 2.8.0 downwards.
It is recommended to upgrade the SDK before upgrading the CloudTower.

## Compatibility Notes
The following are the compatible versions when upgrading with CloudTower. Versions after SDK 2.0 have fixed many issues and are more stable, so they are recommended for use. If you need to use versions before SDK 2.0 or the fixed version of the SDK itself, you can check the corresponding SDK GitHub release page.

| SDK Version | Supported CloudTower Version | SDK Release Date | Download Address |
| --- | --- | --- | --- |
| 2.9.0 | 3.0.0 | 2023.07.03 | <AddressWrapper version="2.9.0"/>|
| 2.8.0 | 2.8.0 | 2023.05.04 | <AddressWrapper version="2.8.0"/>|
| 2.7.0 | 2.7.0 | 2023.03.22 | <AddressWrapper version="2.7.0"/>|
| 2.6.0 | 2.6.0 | 2023.02.20 | <AddressWrapper version="2.6.0"/>|
| 2.5.0 | 2.5.1 | 2023.01.03 | <AddressWrapper version="2.5.0"/>|
| 2.4.0 | 2.4.2 | 2022.11.18 | <AddressWrapper version="2.4.0" node_version="2.4.1"/>|
| 2.3.0 | 2.3.0 | 2022.09.05 | <AddressWrapper version="2.3.0" skip_node/>|
| 2.2.0 | 2.2.0 | 2022.08.12 | <AddressWrapper version="2.2.0" skip_node/>|
| 2.1.0 | 2.1.0 | 2022.07.08 | <AddressWrapper version="2.1.0" skip_node/>|
