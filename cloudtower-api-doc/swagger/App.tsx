import React, { useEffect, useState, useCallback, useRef } from "react";
import _, { cloneDeep } from "lodash";
import { ProStore, RedocProRawOptions } from "@redocly/reference-docs";
import useDocusaurusContext from "@docusaurus/useDocusaurusContext";
import { Badge } from "@redocly/reference-docs/lib/redoc-lib/src/common-elements";
import i18next from "./i18n";
import {
  ISpec,
  specMap,
  wrapSpecWithI18n,
  overwriteSchemaTitle,
  APIVersionToSDKVersionMap
} from "./utils";
import Redocly from "./redoc/Redoc";
import { LOCAL_STORAGE_SERVERS_KEY } from "./redoc/Console/ServerDropdown";
import { DeepSearchStore } from "./redoc/services/SearchStore";
import { useLocation } from "@docusaurus/router";
const REDOC_CLASS = "redoc-container";

const ApiTag: React.FC<{
  operationId: string;
  rawSpec: ISpec;
}> = ({ operationId, rawSpec }) => {
  const findRawTags = useCallback(
    (operation_id) => {
      const rawPath = Object.values(rawSpec.paths).find(
        (p) => (p.post || p.get).operationId === operation_id
      );
      return (rawPath?.post || rawPath?.get)?.tags?.join("-");
    },
    [rawSpec]
  );
  return <Badge type="secondary">{findRawTags(operationId)}</Badge>;
};
const Redoc: React.FC<{
  spec: ISpec;
  rawSpec: ISpec;
  onInit: RedocProRawOptions["hooks"]["onInit"];
}> = (props) => {
  return props.spec ? (
    <Redocly
      definition={props.spec}
      options={{
        hooks: {
          onInit: props.onInit,
          AfterOperationSummary: ({ operation }) => (
            <ApiTag
              operationId={operation.operationId}
              rawSpec={props.rawSpec}
            />
          ),
        },
        routingBasePath: "api/#",
        pagination: "section",
        ctrlFHijack: false,
        expandDefaultServerVariables: true,
        scrollYOffset: 60,
        minCharacterLengthToInitSearch: 2,
        nativeScrollbars: true,
        hideDownloadButton: true,
        disableSearch: true,
      }}
    />
  ) : (
    <></>
  );
};

const App: React.FC = () => {
  const { i18n } = useDocusaurusContext();
  const { search } = useLocation();
  const version = new URLSearchParams(search).get('version') || Object.keys(specMap)[0]
  const [spec, setSpec] = useState<ISpec>();
  const [rawSpec, setRawSpec] = useState<ISpec>();
  const specRef = useRef<ISpec>(spec);
  useEffect(() => {
    const lastVersion = specMap[version] ? version : Object.keys(specMap)[0];
    specMap[lastVersion].then(data => {
      const swaggerSpec: ISpec = _.cloneDeep(data.default);
      setRawSpec(swaggerSpec);
      i18next.changeLanguage(i18n.currentLocale);
      const newSpec = wrapSpecWithI18n(swaggerSpec, i18n.currentLocale, version);
      setSpec(newSpec);
    })

  }, [version, i18n.currentLocale]);

  useEffect(() => {
    const updateDownloadLinks = () => {
      const desktopLink = document.getElementById('desktop-download-link');
      const pdfLink = document.getElementById('pdf-download-link');
      const sdkVersion = APIVersionToSDKVersionMap.get(version);
      if (desktopLink && sdkVersion) {
        (desktopLink as HTMLAnchorElement).href = `https://github.com/smartxworks/cloudtower-api-doc-tauri/releases/tag/app-v${sdkVersion}`;
      }

      if (pdfLink) {
        (pdfLink as HTMLAnchorElement).href = `/pdfs/CloudTower-API-${version}-pdf.tar.gz`;
        (pdfLink as HTMLAnchorElement).download = `CloudTower-API-${version}-pdf.tar.gz`;
      }
    };

    updateDownloadLinks();
  }, [version]);

  useEffect(() => {
    specRef.current = spec;
  }, [spec]);

  useEffect(() => {
    localStorage.removeItem(LOCAL_STORAGE_SERVERS_KEY);
    return () => {
      const docContainer = document.querySelector(
        "#__docusaurus > div.main-wrapper.docs-wrapper.docs-doc-page > div > main > div"
      );
      if (docContainer && docContainer.classList.contains(REDOC_CLASS)) {
        docContainer.classList.remove(REDOC_CLASS);
      }
    };
  }, []);

  const transCom = useCallback(() => {
    overwriteSchemaTitle(specRef.current, { request: true, response: true });
  }, []);

  const onReDocLoaded = useCallback((prop: { store: ProStore }) => {
    const docContainer = document.querySelector(
      "#__docusaurus > div.main-wrapper.docs-wrapper.docs-doc-page > div > main > div"
    );
    if (docContainer) {
      docContainer.classList.add(REDOC_CLASS);
    }
    const { store } = prop;
    store.search = new DeepSearchStore(store.options as any);
    setTimeout(() => {
      store.search.indexItems(store.menu.items);
    }, 50);
    store.observeAllAndRemark();
    store.onDidMount = () => {
      if (location.hash) {
        const ids = location.hash.split("#").filter(Boolean);
        const item = store.menu.getItemById(
          ids.join("/").replace("/tag", "tag")
        );
        store.menu.activateAndScroll(item);
      }
      transCom();
    };
  }, []);

  return (
    <div id="swagger-ui">
      <Redoc spec={cloneDeep(spec)} rawSpec={rawSpec} onInit={onReDocLoaded} />
    </div>
  );
};

export default App;
