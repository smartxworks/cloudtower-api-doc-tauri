import React from 'react';
import i18next from '../i18n';

const Server = () => {
  return (
    <div id="server-wrapper">
    <span className="servers-title">{i18next.t('components.servers')}</span>
    <div className="servers">
      <label htmlFor="servers">
        <select id="server-select">
        </select>
      </label>
      <div className="add-server">
        <input
          id="server-input"
          placeholder={i18next.t('components.server_placeholder')}
        />
      </div>
    </div>
  </div>
  )
}

export default Server;