import React, { useEffect, useState, useCallback, useRef } from "react";
import { renderToString } from 'react-dom/server';
import _, { cloneDeep } from "lodash";
import {
  ProStore,
  RedoclyReferenceDocsStandalone,
  RedocProRawOptions,
  PanelToggleEvent
} from "@redocly/reference-docs";
import useDocusaurusContext from "@docusaurus/useDocusaurusContext";
import { useDocsVersion } from "@docusaurus/theme-common";
import i18next from "./i18n";
import { ISpec, specMap, wrapSpecWithI18n, translateComponent, splitSchema, overwriteSchemaTitle } from "./utils";
import Server from './components/Server';

const REDOC_CLASS = "redoc-container";

const RedocWrapper: React.FC<{spec:ISpec, onInit:RedocProRawOptions['hooks']['onInit']}> = (props) => {
  return props.spec ? (
    <RedoclyReferenceDocsStandalone
      definition={props.spec}
      options={{
        hooks: {
          onInit: props.onInit,
        },
        routingBasePath: 'api#',
        pagination: "section",
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
  const [servers, setServers] = useState<string[]>([]);
  const serversRef = useRef(servers);

  useEffect(() => {
    const lastVersion = specMap[version] ? version : Object.keys(specMap)[0];
    const swaggerSpec: ISpec = _.cloneDeep(specMap[lastVersion]);
    i18next.changeLanguage(i18n.currentLocale);
    const newSpec = splitSchema(wrapSpecWithI18n(swaggerSpec, i18n.currentLocale, version));
    serversRef.current = servers;
    newSpec['servers'] = servers.map(s => ({ url: s }));
    setSpec(newSpec);
  }, [version, i18n.currentLocale, servers]);

  useEffect(() => {
    specRef.current = spec;
  }, [spec])

  const transCom = useCallback(() => {
    translateComponent();
    overwriteSchemaTitle(specRef.current, { request: true, response: true});
  }, [])

  useEffect(() => {
    return () => {
      const docContainer = document.querySelector(
        "#__docusaurus > div.main-wrapper.docs-wrapper.docs-doc-page > div > main > div"
      );
      if (docContainer && docContainer.classList.contains(REDOC_CLASS)) {
        docContainer.classList.remove(REDOC_CLASS);
      }
    };
  }, []);


  const onReDocLoaded = useCallback((prop: { store: ProStore }) => {
    const docContainer = document.querySelector(
      "#__docusaurus > div.main-wrapper.docs-wrapper.docs-doc-page > div > main > div"
    );
    if (docContainer) {
      docContainer.classList.add(REDOC_CLASS);
    }
    const { store } = prop;
    store.l = new Promise((resolve) => resolve({
      local: true
    }));
    store.onDidMount = () => {
      const AuthPre = document.querySelector(
        ".sc-hKwDye.ikLhBf"
      );
      const exist = document.getElementById('server-input');
      if (AuthPre && !exist && !location.href.endsWith('/api')) {
        const div = document.createElement('div');
        div.innerHTML = renderToString(React.cloneElement(<Server/>))
        const observe = new MutationObserver(function (e) {
          if(e[0].addedNodes.length) {
            const input = document.getElementById('server-input');
            if(!input) { return; }
            const setUpOption = (list:string[], add?:string) => {
              const serverOption = list?.map(s => {
                const option = document.createElement('option');
                option.value = s;
                option.innerText=s;
                return option.outerHTML;
              })
              const serverSelect = document.getElementById('server-select');
              if(!serverSelect) { return; }
              serverSelect.innerHTML = serverOption.join('');
              (serverSelect as HTMLSelectElement).value = add || list[list.length - 1];
            }
            setUpOption(serversRef.current);
            (input as HTMLInputElement).onkeyup = (ev:KeyboardEvent) => {
              if (ev.keyCode === 13 || ev.key === 'Enter') {
                const toAddServer = (ev.target as HTMLInputElement).value;
                const newServers = [...serversRef.current, toAddServer];
                (input as HTMLInputElement).value = '';
                (input as HTMLInputElement).innerText = '';
                setUpOption(newServers, toAddServer);
                setServers(newServers);
              }
            }
          }
        });
        observe.observe(AuthPre, { childList: true });
        AuthPre.appendChild(div)
      }
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
