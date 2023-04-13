import React from 'react';
import useDocusaurusContext from "@docusaurus/useDocusaurusContext";
import i18next from '../i18n';
import { specMap } from '../utils';


const Download = () => {
  const { i18n, siteMetadata } = useDocusaurusContext();
  const version = siteMetadata.docusaurusVersion;
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