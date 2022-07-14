import React from 'react';
import { OpenAPIServer } from '@redocly/reference-docs'
import { FormControl, FormLabel } from "@redocly/reference-docs";
import styled from "@redocly/reference-docs/lib/redoc-lib/src/styled-components";
import { ServerChooser as ServerChooserCompoennt } from "@redocly/reference-docs/lib/components/console/ServerDropdown";
import { fromSessionStorage } from '@redocly/reference-docs/lib/utils'
import {
  expandDefaultServerVariables,
  expandVariables,
} from "@redocly/reference-docs/lib/components/console/utils";
import ServerVariable from "@redocly/reference-docs/lib/components/console/ServerVariable";
import { observer } from "mobx-react";
import i18next from '../../i18n';
import { Dropdown } from './Dropdown';

const ServerDropdownWrap = styled.div`
  margin-top: 20px;
`;


export const LOCAL_STORAGE_SERVERS_KEY = 'redoc_local_server'

@observer
export class ServerChooser extends ServerChooserCompoennt {
  constructor(props) {
    super(props);
    const localServers:OpenAPIServer[] = JSON.parse(localStorage.getItem(LOCAL_STORAGE_SERVERS_KEY) || '[]')
    this.state = {
      ...this.state,
      localServers,
    } as any
  }

  handleAddServer(server:string) {
    const newServer:OpenAPIServer = {
      url: server,
    }
    this.setState({
      localServers: [...(this.state as any).localServers, newServer],
    } as any, () => {
      localStorage.setItem(LOCAL_STORAGE_SERVERS_KEY, JSON.stringify((this.state as any).localServers))
      this.handleServerChange({
        serverUrl: server,
        value: server
      });
    })
  }
  render(): JSX.Element {
    const { variables } = this.state;
    const totalServers = [...this.props.operation.servers, ...(this.state as any).localServers]
    const serverUrl = fromSessionStorage("serverUrl");
    const idx =  totalServers.findIndex(function (e) {
      return e.url === serverUrl;
    })
    const activeIdx = idx > 0 ? idx : 0;
    const servers = totalServers.map((value, idx) => ({
      idx,
      serverUrl: value.url,
      value: `
      ${expandDefaultServerVariables(
        expandVariables(value.url, variables),
        value.variables
      )}    - ${value.description || "Default"}`,
    }));
    const vars = Object.keys(variables);
    return (
      <ServerDropdownWrap>
        <FormLabel>
          Add new server
        </FormLabel>
        <FormControl>
        <input
          onKeyUp={(e) => {
            if(e.key === 'Enter') {
              const value = (e.target as HTMLInputElement).value;
              if(Boolean(value)) {
                this.handleAddServer(value);
                (e.target as HTMLInputElement).value = "";
              }
            }
          }}
          placeholder={i18next.t('components.server_placeholder')}
        />
        </FormControl>
        <FormLabel htmlFor="server">Target server:</FormLabel>
        <FormControl>
          <Dropdown
            variant="dark"
            fullWidth={true}
            onChange={this.handleServerChange}
            value={servers[activeIdx].value}
            options={servers}
          />
          {vars.length
            ? vars.map((v) => {
                const active =
                  this.props.operation.servers[this.state.activeIdx]
                    .variables;
                const activeVar = active[v];
                if (activeVar) {
                  return (
                    <ServerVariable
                      key={v}
                      name={v}
                      value={this.state.variables[v]}
                      defaultValue={activeVar.default}
                      variableEnum={activeVar.enum}
                      description={activeVar.description}
                      onChange={(a) => {
                        return this.handleVariableChange(v, a);
                      }}
                    />
                  );
                }
              })
            : null}
        </FormControl>
      </ServerDropdownWrap>
    );
  }
}
