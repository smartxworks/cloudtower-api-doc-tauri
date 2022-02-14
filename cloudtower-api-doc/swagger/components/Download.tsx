import React from 'react';
import { useDocsVersion  } from '@docusaurus/theme-common';
import useDocusaurusContext from "@docusaurus/useDocusaurusContext";
import i18next from '../i18n';
import { specMap } from '../utils';


const Download = () => {
  const { version} = useDocsVersion();
  const { i18n } = useDocusaurusContext();
  const swaggerSpec = version && specMap[version] ? specMap[version] : specMap[Object.keys(specMap)[0]];
  const href = "data:text/plain;charset=utf-8," + encodeURIComponent(JSON.stringify(swaggerSpec, null, 2));
  const name = `cloudtower-api-${swaggerSpec.info.version}`;
  return (
    <a href={href} download={`${name}.json`}>{i18next.t('components.download', {
      lng: i18n.currentLocale,
    })}</a>
  )
}

export default Download;