import React, { useEffect, useState, useCallback, useRef } from "react";
import _, { cloneDeep } from "lodash";
import {
  ProStore,
  RedocProRawOptions,
} from "@redocly/reference-docs";
import useDocusaurusContext from "@docusaurus/useDocusaurusContext";
import { useDocsVersion } from "@docusaurus/theme-common";
import i18next from "./i18n";
import { ISpec, specMap, wrapSpecWithI18n, translateComponent, splitSchema, overwriteSchemaTitle } from "./utils";
import Redocly from './redoc/Redoc';
import { LOCAL_STORAGE_SERVERS_KEY } from './redoc/Console/ServerDropdown';

const REDOC_CLASS = "redoc-container";

const RedocWrapper: React.FC<{spec:ISpec, onInit:RedocProRawOptions['hooks']['onInit']}> = (props) => {
  return props.spec ? (
    <Redocly
      definition={props.spec}
      options={{
        hooks: {
          onInit: props.onInit,
        },
        routingBasePath: 'api#',
        pagination: "section",
        ctrlFHijack: false,
        expandDefaultServerVariables: true,
        scrollYOffset: 60,
        nativeScrollbars: true,
        hideDownloadButton: true,
        disableSearch: true,
      }}
    />
  ) : <></>
}

const Redoc = React.memo(RedocWrapper, (prev, next) => {
  return JSON.stringify({tags: prev.spec?.tags, servers: prev.spec?.servers}) === JSON.stringify({tags: next.spec?.tags, servers: next.spec?.servers})
});

const App: React.FC = () => {
  const { version } = useDocsVersion();
  const { i18n } = useDocusaurusContext();
  const [spec, setSpec] = useState<ISpec>();
  const specRef = useRef<ISpec>(spec)

  useEffect(() => {
    const lastVersion = specMap[version] ? version : Object.keys(specMap)[0];
    const swaggerSpec: ISpec = _.cloneDeep(specMap[lastVersion]);
    i18next.changeLanguage(i18n.currentLocale);
    const newSpec = splitSchema(wrapSpecWithI18n(swaggerSpec, i18n.currentLocale, version));
    setSpec(newSpec);
  }, [version, i18n.currentLocale]);

  useEffect(() => {
    specRef.current = spec;
  }, [spec])


  useEffect(() => {
    return () => {
      const docContainer = document.querySelector(
        "#__docusaurus > div.main-wrapper.docs-wrapper.docs-doc-page > div > main > div"
      );
      if (docContainer && docContainer.classList.contains(REDOC_CLASS)) {
        docContainer.classList.remove(REDOC_CLASS);
      }
      localStorage.removeItem(LOCAL_STORAGE_SERVERS_KEY)
    };
  }, []);


  const transCom = useCallback(() => {
    translateComponent();
    overwriteSchemaTitle(specRef.current, { request: true, response: true});
  }, [])

  const onReDocLoaded = useCallback((prop: { store: ProStore }) => {
    const docContainer = document.querySelector(
      "#__docusaurus > div.main-wrapper.docs-wrapper.docs-doc-page > div > main > div"
    );
    if (docContainer) {
      docContainer.classList.add(REDOC_CLASS);
    }
    const { store } = prop;
    store.onDidMount = () => {
      if(location.hash) {
        const ids = location.hash.split('#').filter(Boolean);
        const item = store.menu.getItemById(ids.join('/').replace('/tag', 'tag'))
        store.menu.activateAndScroll(item);
      } 
      transCom();
    };
  }, []);



  return (
    <div id="swagger-ui">
      <Redoc spec={cloneDeep(spec)} onInit={onReDocLoaded}/>
    </div>
  );
};

export default App;
