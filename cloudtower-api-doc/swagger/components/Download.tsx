import React from 'react';
import useDocusaurusContext from "@docusaurus/useDocusaurusContext";
import i18next from '../i18n';
import { specMap } from '../utils';


const Download = (props: {
  version: string
}) => {
  const { i18n } = useDocusaurusContext();
  const { version } = props;
  const swaggerSpec = version && specMap[version] ? specMap[version] : specMap[Object.keys(specMap)[0]];
  const href = "data:text/plain;charset=utf-8," + encodeURIComponent(JSON.stringify(swaggerSpec, null, 2));
  const name = `cloudtower-api-${swaggerSpec.info.version}`;
  return (
    <a href={href} download={`${name}.json`}>Swagger Json</a>
  )
}

export default Download;