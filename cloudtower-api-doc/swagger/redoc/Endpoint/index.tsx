import { AnalyticsEventType, OptionsConsumer, StoreConsumer, StoreContext } from '@redocly/reference-docs';
import { EndpointProps } from '@redocly/reference-docs/lib/components/Endpoint';
import { Summary } from '@redocly/reference-docs/lib/components/Endpoint/Summary';
import { ServerList } from '@redocly/reference-docs/lib/components/Endpoint/ServerList';
import { CodePanel } from '@redocly/reference-docs/lib/components/Panel';
import React, { useContext, useState } from 'react';
import { Console } from '../Console'

const Endpoint:React.FC<EndpointProps> = ({ operation, hideHostname }) => {
  const [display, setDisplay] = useState<boolean>(false);
  const store = useContext(StoreContext);
  const toggle = () => {
    setDisplay(!display);
    if(store.options.events.tryItOpen) {
      store.options.events.tryItOpen({
        eventType: AnalyticsEventType.TryItOpen,
        resource: 'Redocly_OperationTryIt',
        action: store.options.unstable_tryItButtonOverride ? "NavigatedOverrideLink" : "Opened",
        operationId: operation.operationId,
        operationPath: operation.path,
        operationHttpVerb: operation.httpVerb,
        operationSummary: operation.description,
      })
    }
  }

  return (
    <React.Fragment>
      {
        display ? 
        <StoreConsumer>
          {
            (store) => <Console store={store} operation={operation} onClose={toggle}></Console>
          }
        </StoreConsumer>
        :
        <CodePanel header={
          (e) => {
            return (
              <Summary 
              showConsole={store.options.showConsole}
              onToggleConsole={toggle}
              tryItOverride={store.options.unstable_tryItButtonOverride}
              operation={operation} expanded={e.expanded} toggle={e.toggle}/>
            )
          }
        } expanded={false}>
          <OptionsConsumer>
            {
              (e) => <ServerList operation={operation} expandVariables={e.expandDefaultServerVariables} hideHostname={hideHostname || e.hideHostname}/>
            }
          </OptionsConsumer>
        </CodePanel>
      }
    </React.Fragment>
  )
}

export default Endpoint