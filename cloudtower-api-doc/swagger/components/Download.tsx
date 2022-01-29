import React from 'react';
import i18next from '../i18n';
import { specMap } from '../utils';
import { useDocsVersion  } from '@docusaurus/theme-common';

const Download = () => {
  const { version} = useDocsVersion();
  const swaggerSpec = version && specMap[version] ? specMap[version] : specMap[Object.keys(specMap)[0]];
  const href = "data:text/plain;charset=utf-8," + encodeURIComponent(JSON.stringify(swaggerSpec, null, 2));
  const name = `cloudtower-api-${swaggerSpec.info.version}`;
  return (
    <a href={href} download={`${name}.json`}>{i18next.t('components.download')}</a>
  )
}

export default Download;