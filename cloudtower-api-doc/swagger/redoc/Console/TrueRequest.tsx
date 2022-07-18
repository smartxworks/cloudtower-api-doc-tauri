import React, { useEffect,  useState } from 'react';
import { useStore } from '@redocly/reference-docs'
import httpSnippet from 'httpsnippet';
import {
  ResponseHeader
} from '@redocly/reference-docs/lib/components/console/ResponsePanel'
import { JsonViewer, RequestType } from './JsonViewer';
import i18next from '../../i18n';


export const TrueRequest = () => {
  const store = useStore();
  const [rawRequest, setRawRequest] = useState<Request>()
  const [data, setData] = useState<object | string>()
  const [ requestAsType, setRawRequestAsType ] = useState<RequestType>()

  useEffect(() => {
    const originInterceptor = store.options.requestInterceptor?.bind(store.options);
    store.options.requestInterceptor = (request) => {
      if(originInterceptor) {
        originInterceptor(request)
      }
      setRawRequest(request);
      setData(request);
      setRawRequestAsType(RequestType.JSON)
    }
  }, [])

  useEffect(() => {
    if(!rawRequest) { return; }
    const httpsnippet = new httpSnippet({
      method: rawRequest.method,
      url:  rawRequest.url,
      headers: Object.keys(rawRequest.headers).map(key => ({
        name: key,
        value: rawRequest.headers[key],
      })),
      postData: {
        mimeType: "application/json",
        text: rawRequest.body,
      },
    } as httpSnippet.Data)
    switch(requestAsType) {
      case RequestType.CURL:
        const snippet = httpsnippet.convert('shell', 'curl', {
          indent: "\t",
          short: true,
        }) || '';
        setData(snippet.replace('-X', '-k -X'));break;
      default:
        setData(rawRequest);
        break;
    }
  }, [requestAsType])

  return (
    <React.Fragment>
      <ResponseHeader>{i18next.t('components.actualRequest')}</ResponseHeader>
      <JsonViewer data={data} requestAsType={requestAsType} onTypeSelect={setRawRequestAsType}/>
    </React.Fragment>
  )
}