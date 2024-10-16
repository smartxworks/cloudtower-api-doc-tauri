import React, { useContext } from 'react';
import { observer } from 'mobx-react';
import { LayoutVariant, OperationProps, RequestSamples, ResponseSamples, ResponsesList, StoreContext } from '@redocly/reference-docs';
import { creatPanelToggleEvent } from '@redocly/reference-docs/lib/redoc-lib/src/components/RequestSamples/languageSwitchEvent';
import styled from '@redocly/reference-docs/lib/redoc-lib/src/styled-components'
import { ScrollableContentPanel } from '@redocly/reference-docs/lib/components/Panel'
import { Markdown } from '@redocly/reference-docs/lib/redoc-lib/src/components/Markdown/Markdown'
import { Extensions } from '@redocly/reference-docs/lib/redoc-lib/src/components/Fields/Extensions'
import { ExternalDocumentation } from '@redocly/reference-docs/lib/redoc-lib/src/components/ExternalDocumentation/ExternalDocumentation';
import { Row, MiddlePanel, H2, Badge, RightPanel, ShareLink } from '@redocly/reference-docs/lib/redoc-lib/src/common-elements'
import { l } from '@redocly/reference-docs/lib/redoc-lib/src/services/Labels';
import { CallbacksList } from '@redocly/reference-docs/lib/redoc-lib/src/components/Callbacks'
import { CallbackSamples } from '@redocly/reference-docs/lib/redoc-lib/src/components/CallbackSamples/CallbackSamples'
import { SecurityRequirements } from '@redocly/reference-docs/lib/redoc-lib/src/components/SecurityRequirement/SecurityRequirement'
import { Parameters } from '@redocly/reference-docs/lib/redoc-lib/src/components/Parameters/Parameters';
import { RenderHook } from '@redocly/reference-docs/lib/redoc-lib/src/components/helper'
import Endpoint from '../Endpoint';

const OperationRow = styled(Row)`
backface-visibility: hidden;
contain: content;
overflow: hidden;
`
const Description = styled.div`
  margin-bottom: ${props => props.theme.spacing.unit * 4} px;
`
const Operation:React.FC<OperationProps> = observer((props) => {
  const { operation, layout } = props;
  const { name, description, deprecated, externalDocs, isWebhook } = operation;
  const store = useContext(StoreContext);
  const des = description || externalDocs;
  const events = store?.options?.events;
  const hooks = store?.options?.hooks;
  const toggleResponse = React.useCallback((isExpanded:boolean) => {
    const panelToggleEvent = creatPanelToggleEvent({
      operation,
      isExpanded,
      panelType: 'responses'
    })    
    if(events.panelToggle) {
      events.panelToggle.call(events, panelToggleEvent);
    }
  }, [events])
  const toggleRequest = React.useCallback((isExpanded: boolean) => {
    const panelToggleEvent = creatPanelToggleEvent({
      isExpanded,
      operation,
      panelType: 'request'
    });
    if(events.panelToggle) {
      events.panelToggle.call(events, panelToggleEvent)
    }
  }, [events])
  return (
    <OperationRow layout={layout}>
      <MiddlePanel isStacked={layout === LayoutVariant.STACKED}>
        <RenderHook Hook={hooks.BeforeOperation} props={{ operation }}/>
        <H2>
          <ShareLink to={operation.id}/>
          <RenderHook Hook={hooks.BeforeOperationSummary} props={{ operation }}/>
          { name }
          <RenderHook Hook={hooks.AfterOperationSummary} props={{ operation }}/>
          { deprecated && <Badge type="warning">Deprecated</Badge>}
        </H2>
        {
          store.options.pathInMiddlePanel && !isWebhook && (
            <Endpoint operation={operation}/>
          )
        }
        {
          des && (
            <Description>
              { description && <Markdown source={description}/>}
              { externalDocs && <ExternalDocumentation externalDocs={externalDocs}/> }
              { Object.keys(operation.extensions || {}).length ? (
                <Extensions extensions={operation.extensions}/>
              ) : null}
            </Description>
          )
        }
        {
          (operation?.security?.length || operation.parameters?.length || operation.requestBody) ? (
            <ScrollableContentPanel header={l('request')} onToggle={toggleRequest} expanded={store.options.expandDefaultResponse}>
               <SecurityRequirements securities={operation.security}/>
               <Parameters parameters={operation.parameters} body={operation.requestBody}/>
            </ScrollableContentPanel>
          ) : null
        }
        {
          operation.responses.length > 0 ? 
          (<ScrollableContentPanel header={l('responses')} onToggle={toggleResponse} expanded={store.options.expandDefaultResponse}>
            <ResponsesList responses={operation.responses}/>
          </ScrollableContentPanel>) : null
        }
        {
          operation.callbacks.length > 0 ? 
          (
            <ScrollableContentPanel header={l('callbacks')}>
              <CallbacksList callbacks={operation.callbacks}/>
            </ScrollableContentPanel>
          ) : null
        }
        <RenderHook Hook={hooks.AfterOperation} props={{operation}}/>
      </MiddlePanel>
      {
          store.showRightPanel ?
          (
            <RightPanel data-cy="samples-block">
            { !store.options.pathInMiddlePanel && !isWebhook ? (<Endpoint operation={operation}/>) : null}
            <RequestSamples operation={operation} defaultLanguage='payload'/>
            <ResponseSamples operation={operation}/>
            <CallbackSamples callbacks={operation.callbacks}/>
          </RightPanel>
          ) : null
        }
    </OperationRow>
  )
})

export default Operation;