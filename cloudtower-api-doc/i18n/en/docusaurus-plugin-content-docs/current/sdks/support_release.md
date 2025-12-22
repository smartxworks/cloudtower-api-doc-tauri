---
title: Adaptation notes
sidebar_position: 41
---

import Terminology from '@site/terminology.json'
import Download from '@site/swagger/components/Download';

export const AddressWrapper = (props) => {
const getUrl = (lng, version) => `https://github.com/smartxworks/cloudtower-${lng}-sdk/releases/tag/v${version}`
return ( <span>
<a href={getUrl('java', props.version)}>Java</a> | <a href={getUrl('python', props.version)}>Python</a> |  <a href={getUrl('go', props.version)}>Go </a> {
props.skip_node ? <></> : <> | <a href={getUrl('node', props.node_version || props.version)}>Node</a></>
} | <Download version={props.file_version} /> </span>
)
}

## Upgrade recommendation

<>The {Terminology['terminology']['en-US']['PRODUCT']} API SDK supports backward compatibility.If SDK 2.9.0 supports up to {Terminology['terminology']['en-US']['PRODUCT']} 3.0.0, it can also support {Terminology['terminology']['en-US']['PRODUCT']} 2.8.0.
It is recommended to upgrade the SDK first, and then upgrade {Terminology['terminology']['en-US']['PRODUCT']}.  </>

## Compatibility

<>The following lists the compatible versions that can be upgraded with {Terminology['terminology']['en-US']['PRODUCT']}. Versions after SDK 2.0 are recommended because these versions have more issues fixed and are more stable. If you need to use SDK versions earlier than 2.0 or specific SDK patch releases, you can check the corresponding SDK GitHub release pages. </>

| <strong>SDK version</strong>           | Product version                                                                                                                                            | <strong>SDK release date</strong>          | <strong>Download</strong>                                                     |
| -------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------ | ----------------------------------------------------------------------------- |
| 2.21.0 | 4.7.0                                                                                                                      | 2025.10.14 | <AddressWrapper version="2.21.0" file_version="4.7.0"/>                       |
| 2.20.0 | 4.6.x                                                                                                                      | 2025.06.09 | <AddressWrapper version="2.20.0" file_version="4.6.0"/>                       |
| 2.19.0 | 4.5.0                                                                                                                      | 2025.02.17 | <AddressWrapper version="2.19.0" file_version="4.5.0"/>                       |
| 2.18.0 | 4.4.0, 4.4.1, 4.4.2                                        | 2024.10.14 | <AddressWrapper version="2.18.0" file_version="4.4.0" node_version="2.18.0"/> |
| 2.17.0 | 4.3.0                                                                                                                      | 2024.08.21 | <AddressWrapper version="2.17.0" file_version="4.3.0" node_version="2.17.0"/> |
| 2.16.0 | 4.2.0, 4.2.1, 4.2.2                                        | 2024.07.16 | <AddressWrapper version="2.16.0" file_version="4.2.0" node_version="2.16.0"/> |
| 2.15.1 | 4.1.0                                                                                                                      | 2024.05.31 | <AddressWrapper version="2.15.1" file_version="4.1.0" node_version="2.15.0"/> |
| 2.14.0 | 4.0.0                                                                                                                      | 2024.01.02 | <AddressWrapper version="2.14.0" file_version="4.0.0"/>                       |
| 2.13.1 | 3.4.4                                                                                                                      | 2024.10.10 | <AddressWrapper version="2.13.1" file_version="3.4.4"/>                       |
| 2.13.0 | 3.4.0, 3.4.1, 3.4.2, 3.4.3 | 2023.11.7  | <AddressWrapper version="2.13.0" file_version="3.4.0"/>                       |
| 2.12.0 | 3.3.0                                                                                                                      | 2023.10.19 | <AddressWrapper version="2.12.0" file_version="3.3.0"/>                       |
| 2.11.0 | 3.2.0, 3.2.1                                                                               | 2023.09.01 | <AddressWrapper version="2.11.0" file_version="3.2.0"/>                       |
| 2.10.0 | 3.1.0                                                                                                                      | 2023.08.01 | <AddressWrapper version="2.10.0" file_version="3.1.0"/>                       |
| 2.9.0  | 3.0.0                                                                                                                      | 2023.07.03 | <AddressWrapper version="2.9.0" file_version="3.0.0"/>                        |
| 2.8.0  | 2.8.0                                                                                                                      | 2023.05.04 | <AddressWrapper version="2.8.0" file_version="2.8.0"/>                        |
| 2.7.0  | 2.7.0                                                                                                                      | 2023.03.22 | <AddressWrapper version="2.7.0" file_version="2.7.0"/>                        |
| 2.6.0  | 2.6.0                                                                                                                      | 2023.02.20 | <AddressWrapper version="2.6.0" file_version="2.6.0"/>                        |
| 2.5.0  | 2.5.1                                                                                                                      | 2023.01.03 | <AddressWrapper version="2.5.0" file_version="2.5.0"/>                        |
| 2.4.0  | 2.4.2                                                                                                                      | 2022.11.18 | <AddressWrapper version="2.4.0" node_version="2.4.1" file_version="2.4.0"/>   |
| 2.3.0  | 2.3.0                                                                                                                      | 2022.09.05 | <AddressWrapper version="2.3.0" skip_node file_version="2.3.0"/>              |
| 2.2.0  | 2.2.0                                                                                                                      | 2022.08.12 | <AddressWrapper version="2.2.0" skip_node file_version="2.2.0"/>              |
| 2.1.0  | 2.1.0                                                                                                                      | 2022.07.08 | <AddressWrapper version="2.1.0" skip_node file_version="2.1.0"/>              |

