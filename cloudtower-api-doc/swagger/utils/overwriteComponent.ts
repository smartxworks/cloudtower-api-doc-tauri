import _ from "lodash";
import { ISpec } from "./swagger";
export const overwriteSchemaTitle = (
  spec: ISpec,
  rend: {
    request: boolean;
    response: boolean;
  },
  isInit = true,
) => {
  const arraySchemaTitleCls = ".sc-giYglK.lkBzPA";
  const schemaContentCls = ".sc-fKVqWL.fODyVV";
  const arraySchemaContentWrapCls = ".sc-fXEqDS.klWWZq";
  const dataSectionCls = ".sc-FNXRL.gQPsjg";
  const togglePanelCls = '.sc-ehCJOs.sc-clIzBv'
  const panelCloseCls = '.cvfZZv'
  const responsePanelCls = ".sc-ehCJOs.sc-Galmp"
  const responseSchemaCls = ".sc-hiwPVj.feQjMb"
  const responseCodeTitleCls = ".sc-nVkyK.cDTdXH span"
  // get ]
  const getRef = (div: Element, responseCode?: string) => {
    const parentDiv = div.closest("[data-section-id]");
    if (!parentDiv) {
      return;
    }
    const sectionId = parentDiv
      .getAttribute("data-section-id")
      ?.split("/")
      ?.pop();
    const p = Object.values(spec.paths).find(
      (p) => p.post?.operationId === sectionId
    );
    if (!p) {
      return;
    }
    if (!responseCode) {
      const isArray =
        _.get(
          p,
          [
            "post",
            "requestBody",
            "content",
            "application/json",
            "schema",
            "type",
          ],
          null
        ) === "array";
      let requestRef: string;
      if (isArray) {
        requestRef = _.get(
          p,
          [
            "post",
            "requestBody",
            "content",
            "application/json",
            "schema",
            "items",
            "$ref",
          ],
          null
        );
      } else {
        requestRef = _.get(
          p,
          [
            "post",
            "requestBody",
            "content",
            "application/json",
            "schema",
            "$ref",
          ],
          null
        );
      }
      if (!requestRef) {
        return;
      }
      const ref = requestRef.split("/").pop();
      return ref;
    } else {
      const isArray =
        _.get(
          p,
          [
            "post",
            "responses",
            responseCode,
            "content",
            "application/json",
            "schema",
            "type",
          ],
          null
        ) === "array";
      let responseRef: string;
      if (isArray) {
        responseRef = _.get(
          p,
          [
            "post",
            "responses",
            responseCode,
            "content",
            "application/json",
            "schema",
            "items",
            "$ref",
          ],
          null
        );
      } else {
        responseRef = _.get(p, [
          "post",
          "responses",
          responseCode,
          "content",
          "application/json",
          "schema",
          "$ref",
        ]);
      }
      if (!responseRef) {
        return;
      }
      const ref = responseRef.split("/").pop();
      return ref;
    }
  };

  const appendSchemaName = (node: Element | Document, code?: string) => {
    const titles = node.querySelectorAll(arraySchemaTitleCls);
    titles.forEach((div) => {
      if(div.getAttribute('data-retitle')) { return; }
      const ref = getRef(div, code);
      if (ref) {
        div.textContent = div.textContent + `of ${ref}`;
        div.setAttribute('data-retitle', 'true')
      }
    });
    const objectSchemaDivs = node.querySelectorAll(schemaContentCls);
    objectSchemaDivs.forEach((div) => {
      if(div.firstElementChild.getAttribute('data-retitle')) { return; }
      if (
        div.closest(dataSectionCls) ||
        div.closest(arraySchemaContentWrapCls)
      ) {
        return;
      }
      const ref = getRef(div, code);
      if (ref) {
        const span = document.createElement("span");
        span.setAttribute('data-retitle', 'true');
        span.textContent = `${ref}:`
        div.insertBefore(span, div.firstChild);
      }
    });
  };

  const { request, response } = rend;
  if (request) {
    // add to request
    appendSchemaName(document);
  }
  if (response) {
    // add to response
    const responsePanel = document.querySelectorAll(responsePanelCls);
    responsePanel.forEach((div) => {
      const observer = new MutationObserver(() => {
        const responseSchema = div.querySelector(responseSchemaCls);
        if (!responseSchema) {
          return;
        }
        const code = div.querySelector(responseCodeTitleCls)?.textContent;
        if (!code) {
          return;
        }
        appendSchemaName(div, code);
      });
      observer.observe(div, { childList: true });
    });
  }
  
  if(isInit) {
    const togglePanels = document.querySelectorAll(togglePanelCls);
    if(!togglePanels) { return; }
    togglePanels.forEach(panel => {
      const observer = new MutationObserver(() => {
        if(!panel.previousElementSibling) { return; }
        const isResponse = togglePanelCls.split('.').filter(Boolean).find(cls => !panel.previousElementSibling.classList.contains(cls)) === undefined;
        const isClose = panel.querySelector(panelCloseCls) === null;
        if(!isClose) {
          overwriteSchemaTitle(spec, {request:!isResponse, response: isResponse}, false)
        }
      });
      observer.observe(panel, {childList: true})
    })
  }
};
