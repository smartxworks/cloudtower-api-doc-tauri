import React, { ChangeEvent } from "react";
import styled from "@redocly/reference-docs/lib/redoc-lib/src/styled-components";
import {
  SampleControls,
  SamplesControlButton,
} from "@redocly/reference-docs/lib/redoc-lib/src/common-elements";
import { PrismDiv } from "@redocly/reference-docs/lib/redoc-lib/src/common-elements/PrismDiv";
import { OptionsContext } from "@redocly/reference-docs/lib/redoc-lib/src/components/OptionsProvider";
import { JsonProps } from "@redocly/reference-docs/lib/redoc-lib";
import { jsonStyles } from "@redocly/reference-docs/lib/redoc-lib/src/components/JsonViewer/style";
import { jsonToHTML } from "@redocly/reference-docs/lib/redoc-lib/src/utils/jsonToHtml";
import { CopyButtonWrapper } from "@redocly/reference-docs/lib/redoc-lib/src/common-elements/CopyButtonWrapper";

const JsonViewerWrap = styled.div`
  display: flex;
  flex-direction: column;
  flex: 1;
  &:hover > ${SampleControls} {
    opacity: 1;
  }
`;
const PrismFlex = styled(PrismDiv)`
  flex: 1;
  code {
    font-family: ${(prop) => prop.theme.typography.code.fontFamily};
    font-size: 14px;
    line-height: 18px;
  }
`;

const LngSelect = styled.select`
  background: transparent;
  border: none;
  color: inherit;
`;

export enum RequestType {
  JSON = 'json',
  CURL = 'curl'
}
class Json extends React.PureComponent<JsonProps & {
  requestAsType: RequestType,
  onTypeSelect: (type: RequestType) => void,
}> {
  node: HTMLDivElement | null;
  constructor(props) {
    super(props);
    this.collapseAll = this.collapseAll.bind(this);
    this.expandAll = this.expandAll.bind(this);
    this.collapseElement = this.collapseElement.bind(this);
    this.clickListener = this.clickListener.bind(this);
    this.focusListener = this.focusListener.bind(this);
    this.renderInner = this.renderInner.bind(this);
    this.handleLngChange = this.handleLngChange.bind(this);
  }

  expandAll() {
    const nodes = this.node?.getElementsByClassName("collapsible");
    const nodesArr = Array.from(nodes);
    for (let i = 0; i < nodesArr.length; i++) {
      const parentNode = nodesArr[i].parentNode;
      (parentNode as Element).classList.remove("collapsed");
      if (parentNode.querySelector(".collapser")) {
        (parentNode as Element).setAttribute("aria-label", "collapse");
      }
    }
  }

  collapseAll() {
    const nodes = this.node?.getElementsByClassName("collapsible");
    const nodesArr = Array.from(nodes);
    for (let i = 0; i < nodesArr.length; i++) {
      const parentNode = nodesArr[i].parentNode;
      (parentNode as Element).classList.add("collapsed");
      if (parentNode.querySelector(".collapser")) {
        (parentNode as Element).setAttribute("aria-label", "expand");
      }
    }
  }

  collapseElement(target: HTMLElement) {
    if (target.className === "collapser") {
      const parentNode = target.parentNode;
      if (
        parentNode &&
        (parentNode as Element)
          .getElementsByClassName("collapsible")[0]
          .parentElement.classList.contains("collapsed")
      ) {
        parentNode.parentElement.classList.remove("collapsed");
        target.setAttribute("aria-label", "collapse");
      } else {
        parentNode.parentElement.classList.add("collapsed");
        target.setAttribute("aria-label", "expand");
      }
    }
  }

  clickListener(event: MouseEvent) {
    this.collapseElement(event.target as HTMLElement);
  }
  focusListener(event: KeyboardEvent) {
    event.key === "Enter" && this.collapseElement(event.target as HTMLElement);
  }

  handleLngChange(event: ChangeEvent<HTMLSelectElement>) {
    this.props.onTypeSelect(event.target.value as RequestType);
  }
  componentDidMount() {
    if (this.node) {
      this.node.addEventListener("click", this.clickListener);
      this.node.addEventListener("focus", this.focusListener);
    }
  }
  componentWillUnmount() {
    if (this.node) {
      this.node.removeEventListener("click", this.clickListener);
      this.node.removeEventListener("focus", this.focusListener);
    }
  }

  renderInner(props: { renderCopyButton: any }) {
    const objData =
      this.props.data &&
      Object.values(this.props.data).some((e) => {
        return typeof e === "object" && e !== null;
      });
    return (
      <JsonViewerWrap>
        <SampleControls>
          <SamplesControlButton onClick={this.expandAll}>
            <LngSelect onChange={this.handleLngChange} value={this.props.requestAsType}>
              <option value={RequestType.JSON}>Json</option>
              <option value={RequestType.CURL}>curl</option>
            </LngSelect>
          </SamplesControlButton>
          {props.renderCopyButton()}
          {objData && (
            <React.Fragment>
              <SamplesControlButton onClick={this.expandAll}>
                Expand all
              </SamplesControlButton>
              <SamplesControlButton onClick={this.collapseAll}>
                Collapse all
              </SamplesControlButton>
            </React.Fragment>
          )}
        </SampleControls>
        <OptionsContext.Consumer>
          {(e) => (
            <PrismFlex
              ref={(e) => (this.node = e)}
              dangerouslySetInnerHTML={{
                __html: jsonToHTML(this.props.data, e.jsonSampleExpandLevel),
              }}
              className={this.props.className}
            />
          )}
        </OptionsContext.Consumer>
      </JsonViewerWrap>
    );
  }

  render(): React.ReactNode {
    return (
      <CopyButtonWrapper data={this.props.data}>
        {(e) => this.renderInner(e)}
      </CopyButtonWrapper>
    );
  }
}

export const JsonViewer = styled(Json)`
  ${jsonStyles}
`;
