import { OperationModel, ProStore } from '@redocly/reference-docs';
import React, { useEffect, useRef, useState } from 'react';
import i18next from '../i18n';


const Server:React.FC<{
  operation: OperationModel
  store:ProStore
}> = (prop) => {
  const { store } = prop;
  const [ servers, setServers ] = useState<string[]>([])
  const serversRef = useRef(servers);

  useEffect(() => {
    serversRef.current = servers;
  }, [servers]);


  useEffect(() => {
    if(store) {
      const deRefFunc = store.dereferenceSpecForTryIt.bind(store);
      store.dereferenceSpecForTryIt = async (operation) => {
        const servers = serversRef.current.map(s => ({url: s}))
        if(serversRef.current.length) {
          operation.servers = servers;
        }
        const spec = await deRefFunc(operation)
        spec.servers = servers;
        return spec;
      }
    }
  }, [store])


  return (
    <div style={{
      fontSize: '14px',
      fontWeight: 'normal',
      display: 'flex',
      marginTop: '20px'
    }}>
    <span className="servers-title">{i18next.t('components.servers')}</span>
    <div className="servers">
      <label htmlFor="servers">
        <select>
          {
            servers.map(s => <option key={s} value={s}>{s}</option>)
          }
        </select>
      </label>
      <div className="add-server">
        <input
          onKeyUp={(e) => {
            if(e.key === 'Enter') {
              console.log((e.target as HTMLInputElement).value);
              setServers([...servers, (e.target as HTMLInputElement).value]);
              (e.target as HTMLInputElement).value = ''
            }
          }}
          placeholder={i18next.t('components.server_placeholder')}
        />
      </div>
    </div>
  </div>
  )
}

export default Server;