import React, { useEffect, useState, useCallback, useMemo, useRef } from "react";
import { Loading, ProStore, RedocProRawOptions } from "@redocly/reference-docs";
import useDocusaurusContext from "@docusaurus/useDocusaurusContext";
import { Badge } from "@redocly/reference-docs/lib/redoc-lib/src/common-elements";
import i18next from "./i18n";
import {
  ISpec,
  useSpecMap,
  wrapSpecWithI18n,
  overwriteSchemaTitle,
} from "./utils";
import Redocly from "./redoc/Redoc";
import { LOCAL_STORAGE_SERVERS_KEY } from "./redoc/Console/ServerDropdown";
import { DeepSearchStore } from "./redoc/services/SearchStore";
import { useLocation } from "@docusaurus/router";
const REDOC_CLASS = "redoc-container";

type LoadedSpec = {
  version: string;
  rawSpec: ISpec;
  spec: ISpec;
};

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
const Redoc = React.memo((props: {
  spec: ISpec;
  rawSpec: ISpec;
  onInit: RedocProRawOptions["hooks"]["onInit"];
}) => {
  // ProStoreProvider rebuilds when the options reference changes. Keep it stable
  // while the next version's spec is being fetched, so the current docs stay visible.
  const options = useMemo(
    () => ({
      hooks: {
        onInit: props.onInit,
        AfterOperationSummary: ({ operation }) => (
          <ApiTag operationId={operation.operationId} rawSpec={props.rawSpec} />
        ),
      },
      routingBasePath: "api/#",
      pagination: "section" as const,
      ctrlFHijack: false,
      expandDefaultServerVariables: true,
      scrollYOffset: 60,
      minCharacterLengthToInitSearch: 2,
      nativeScrollbars: true,
      hideDownloadButton: true,
      disableSearch: true,
    }),
    [props.onInit, props.rawSpec]
  );

  return props.spec ? (
    <Redocly
      definition={props.spec}
      options={options}
    />
  ) : (
    <></>
  );
});

const App: React.FC = () => {
  const { i18n, siteConfig } = useDocusaurusContext();
  const { search } = useLocation();
  const specMap = useSpecMap();
  const version = new URLSearchParams(search).get('version') || Object.keys(specMap)[0];
  const requestedVersion = specMap[version] ? version : Object.keys(specMap)[0];
  const [loadedSpec, setLoadedSpec] = useState<LoadedSpec>();
  const specRef = useRef<ISpec>();
  const specCacheRef = useRef(new Map<string, ISpec>());
  useEffect(() => {
    const controller = new AbortController();
    const specUrl = `${siteConfig.baseUrl}${specMap[requestedVersion]}`;
    const applySpec = (swaggerSpec: ISpec) => {
      i18next.changeLanguage(i18n.currentLocale);
      // wrapSpecWithI18n 内部已做 cloneDeep，无需提前复制
      setLoadedSpec({
        version: requestedVersion,
        rawSpec: swaggerSpec,
        spec: wrapSpecWithI18n(swaggerSpec, i18n.currentLocale, requestedVersion),
      });
    };
    const cachedSpec = specCacheRef.current.get(specUrl);

    if (cachedSpec) {
      applySpec(cachedSpec);
      return () => controller.abort();
    }

    fetch(specUrl, { signal: controller.signal })
      .then((response) => {
        if (!response.ok) {
          throw new Error(`Failed to load Swagger spec: ${response.status}`);
        }
        return response.json() as Promise<ISpec>;
      })
      .then((swaggerSpec) => {
        if (controller.signal.aborted) {
          return;
        }
        specCacheRef.current.set(specUrl, swaggerSpec);
        applySpec(swaggerSpec);
      })
      .catch((error) => {
        if (error.name !== 'AbortError') {
          console.error(error);
        }
      });

    return () => controller.abort();

  }, [requestedVersion, i18n.currentLocale, siteConfig.baseUrl, specMap]);

  useEffect(() => {
    specRef.current = loadedSpec?.spec;
  }, [loadedSpec]);

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

  const displayedSpec =
    loadedSpec?.version === requestedVersion ? loadedSpec : undefined;

  return (
    <div id="swagger-ui">
      {displayedSpec ? (
        <Redoc
          key={displayedSpec.version}
          spec={displayedSpec.spec}
          rawSpec={displayedSpec.rawSpec}
          onInit={onReDocLoaded}
        />
      ) : (
        <Loading color="#2c3852" />
      )}
    </div>
  );
};

export default App;
