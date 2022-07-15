import React from "react";
import { Form, useField } from "informed";
import _ from 'lodash';
import { JsonPointer, Server } from "@redocly/reference-docs/lib/redoc-lib";
import { observer } from "mobx-react";
import {
  Console as ConsoleComponent,
  ConsoleState,
  ConsoleProps,
  TryItPanel,
} from "@redocly/reference-docs/lib/components/console/Console";
import {
  Accordion
} from "@redocly/reference-docs/lib/components/Panel";
import {
  ResponsePanel,
} from "@redocly/reference-docs/lib/components/console/ResponsePanel";
import {
  AuthPanel,
  requiredValidator,
} from "@redocly/reference-docs/lib/components/console/AuthPanel";
import { RequestBody } from "@redocly/reference-docs/lib/components/console/RequestBody";
import { OperationParameters } from "@redocly/reference-docs/lib/components/console/OperationParameters";
import { OAuth2 } from "@redocly/reference-docs/lib/services/OAuth2";
import { l } from "@redocly/reference-docs/lib/redoc-lib/src/services/Labels";
import { RenderHook } from "@redocly/reference-docs/lib/redoc-lib/src/components/helper";
import { unescapeQueryParams, updateStorage } from '@redocly/reference-docs/lib/components/console/utils'
import { ServerChooser } from './ServerDropdown';
import { TrueRequest } from './TrueRequest';

@observer
export class Console extends ConsoleComponent {
  constructor(props: ConsoleProps) {
    super(props);
  }
  handleChange: ({ values, ...rest }: ConsoleState['form']) => void = (form) => {
    const { values, ...rest } = form;
    const newForm = {
      ...rest,
      values: {
        ...values,
        query: unescapeQueryParams(values.query || {})
      }
    }
    if(JSON.stringify(newForm) !== JSON.stringify(this.state.form)) {
      this.setState({
        form: newForm
      }, () => updateStorage(newForm))
    }
  }

  handleServerChange: (server: Server) => void = (server) => {
    const { resolvedRawSpec } = this.state
    this.setState({
      server,
      resolvedRawSpec: {
        ...resolvedRawSpec,
        servers: [
          server,
          ...resolvedRawSpec.servers,
        ]
      }
    });
    this.props.operation.setActiveServer(server);
  }

  renderResponse: () => JSX.Element = () => {
    const { response, error, time } = this.state
    return (
      <>
      <ResponsePanel response={response} error={error} time={time}/>
      <TrueRequest/>
      </>
    )
  }


  renderRequest: () => JSX.Element = () => {
    const { operation, store, securityDefaults, properties} = this.props;
    const { resolvedRawSpec, form, server } = this.state;
    const errors = form.errors || {};
    const maybeErrors = errors?.path || errors?.cookie || errors?.header || errors?.query;
    let hasValues = form.values && form.values.auth && Object(form.values.auth)[0];
    if(!hasValues || !form.values.auth[hasValues]) {
      hasValues = undefined;
    }
    if(!(!hasValues || (form.values.auth[hasValues].token && form.values.auth[hasValues].client_id && form.values.auth[hasValues].client_secret) ||
    (form.values.auth[hasValues].token && form.values.auth[hasValues].token.access_token))) {
      hasValues = undefined;
    }
    if(!(hasValues && !form.values.auth[hasValues].username && (form.values.auth[hasValues].usernmae && form.values.auth[hasValues].password))) {
      hasValues = undefined
    }
    const replaceSecurityPanel = store?.options?.hooks?.ReplaceTryItSecurityPanel;
    const requestJson = resolvedRawSpec && JsonPointer.get(resolvedRawSpec, operation.pointer);
    const func:any = () => {}
    const params = operation.parameters || [];
    return !resolvedRawSpec ? (
      <React.Fragment>Loading...</React.Fragment>
    ) : (
      <React.Fragment>
        <Form
          onChange={this.handleChange}
          getApi={this.setFormApi}
          style={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            margin: 0,
          }}
        >
          <Accordion
            initialActiveIdx={operation.security.length && hasValues ? 1 : 0}
          >
            {operation.security.length > 0 ? (
              <TryItPanel
                header={l("tryItAuth")}
                data-cy="security-trigger"
                renderChildrenHidden={true}
                error={!hasValues && form.errors?.auth}
                success={hasValues}
              >
                {replaceSecurityPanel ? (
                  <AuthPanelHook field="auth" validate={requiredValidator}>
                    {(e) => (
                      <RenderHook
                        Hook={store.options.hooks.ReplaceTryItSecurityPanel}
                        props={{
                          server,
                          operation,
                          onChange: e,
                          OAuth2,
                        }}
                      />
                    )}
                  </AuthPanelHook>
                ) : (
                  <AuthPanel
                    authCorsProxyUrl={store.options.authCorsProxyUrl}
                    securityDefaults={securityDefaults}
                    formApi={this.formApi}
                    form={form}
                    operation={operation}
                    activeServer={server.url}
                  />
                )}
              </TryItPanel>
            ) : null}
            {
              operation.requestBody && (
                <TryItPanel
                header={l('tryItBody')}
                data-cy="body-trigger"
                error={maybeErrors?.body}
                renderChildrenHidden={true}
                >
                  <RequestBody
                  id={operation.id}
                  body={operation.requestBody}
                  resolvedBody={(requestJson as any)?.requestBody}
                  properties={properties}
                  validate={func} 
                  console={this} />
                </TryItPanel>
              )
            }
            {
              params.length && (
                <TryItPanel
                header={l('tryItParameters')}
                data-cy="parameters-trigger"
                error={maybeErrors}
                renderChildrenHidden={true}
                >
                  <OperationParameters operation={operation} values={form.values} errors={form.errors || {}}/>
                </TryItPanel>
              )
            }
          </Accordion>
        </Form>
        <ServerChooser
          operation={operation}
          onChange={this.handleServerChange}
        />
      </React.Fragment>
    );
  };
}

const AuthPanelHook: React.FC<{
  field: string;
  validate(value: unknown): string | undefined;
}> = (props) => {
  const { fieldApi, render, userProps } = useField(props);
  const { setValue } = fieldApi;
  const { children } = userProps;
  return render(<React.Fragment>{children(setValue)}</React.Fragment>);
};
