import React from 'react';
import i18next from '../i18n';
import { CommonSwaggerProps } from '../utils';

interface IServerState {
  value: string;
}
interface IServerProps {
  addServer: (server: string) => void;
}

export default class Server extends React.Component<
  CommonSwaggerProps & IServerProps,
  IServerState
> {
  constructor(props: CommonSwaggerProps & IServerProps) {
    super(props);
    this.state = {
      value: '',
    };
  }

  componentDidMount() {
    let { oas3Selectors } = this.props;
    if (oas3Selectors.selectedServer()) {
      return;
    }
  }

  componentWillReceiveProps(nextProps: CommonSwaggerProps) {
    let servers = nextProps.specSelectors.servers();
    if (
      this.props.oas3Selectors.selectedServer !==
        nextProps.oas3Selectors.selectedServer ||
      this.props.specSelectors.servers() !== nextProps.specSelectors.servers()
    ) {
      this.setServer(servers.first().get('url'));
    }
  }

  setServer = (value: string) => {
    this.props.oas3Actions.setSelectedServer(value);
  };

  onServerChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    this.setServer(e.target.value);
  };

  onInputKeyUp = (ev: React.KeyboardEvent<HTMLInputElement>) => {
    if (ev.keyCode === 13 || ev.key === 'Enter') {
      const toAddServer = (ev.target as HTMLInputElement).value;
      this.props.addServer(toAddServer);
      this.setServer(toAddServer);
      this.setState({ value: '' });
    }
  };

  render() {
    const { specSelectors, oas3Selectors } = this.props;
    const { value } = this.state;
    return (
      <div>
        <span className="servers-title">{i18next.t('components.servers')}</span>
        <div className="servers">
          <label htmlFor="servers">
            <select
              onChange={this.onServerChange}
              value={oas3Selectors.selectedServer()}>
              {specSelectors
                .servers()
                .valueSeq()
                .map(server => (
                  <option value={server?.get('url')} key={server?.get('url')}>
                    {server?.get('url')}
                    {server?.get('description') &&
                      ` - ${server.get('description')}`}
                  </option>
                ))
                .toArray()}
            </select>
          </label>
          <div className="add-server">
            <input
              placeholder={i18next.t('components.server_placeholder')}
              onChange={ev =>
                this.setState({
                  value: ev.target.value,
                })
              }
              value={value}
              onKeyUp={this.onInputKeyUp}
            />
          </div>
        </div>
      </div>
    );
  }
}
