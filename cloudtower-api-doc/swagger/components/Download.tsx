import React from 'react';
import useBaseUrl from '@docusaurus/useBaseUrl'
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import Terminlogy from '../../terminology.json';
import { LngMap } from "../utils/swagger";

const Download = (props: {
  version: string
}) => {
  const { version } = props;
  const {i18n} = useDocusaurusContext();
  const name = `${Terminlogy['terminology'][LngMap[i18n.currentLocale]]['PRODUCT']}-API-${version}`;
  return (
    <a href={useBaseUrl(`/specs/${version}-swagger.json`)} download={`${name}.json`}>Swagger Json</a>
  )
}

export default Download;