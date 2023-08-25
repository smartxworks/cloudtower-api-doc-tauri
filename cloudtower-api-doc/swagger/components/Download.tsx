import React from 'react';
import useBaseUrl from '@docusaurus/useBaseUrl'

const Download = (props: {
  version: string
}) => {
  const { version } = props;
  const name = `cloudtower-api-${props.version}`;
  return (
    <a href={useBaseUrl(`/specs/${version}-swagger.json`)} download={`${name}.json`}>Swagger Json</a>
  )
}

export default Download;