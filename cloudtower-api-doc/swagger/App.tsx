import React, { useRef, useEffect, useState, useCallback } from "react";
import _ from "lodash";
import { RedocStandalone } from "redoc";
import useDocusaurusContext from "@docusaurus/useDocusaurusContext";
import { useDocsVersion } from "@docusaurus/theme-common";
import i18next from "./i18n";
import {
  ISpec,
  specMap,
  splitPaths,
  wrapSpecWithI18n,
  // wrapPathWithExamples,
  // wrapSchemaWithI18n,
  TopBarSelection,
  // wrapTagsWithI18n
} from "./utils";

const REDOC_CLASS = 'redoc-container'
const App: React.FC = (props) => {
  const wrapper = useRef<HTMLDivElement>(null);
  const { version } = useDocsVersion();
  const { i18n } = useDocusaurusContext();
  const [spec, setSpec] = useState<ISpec>();
  // TODO: remove later
  const filter:TopBarSelection = "userManagement"

  useEffect(() => {
    const lastVersion = specMap[version] ? version : Object.keys(specMap)[0];
    const swaggerSpec: ISpec = _.cloneDeep(specMap[lastVersion]);
    const { paths } = swaggerSpec;
    // handle paths
    // TODO remove this later
    _.set(swaggerSpec, ["paths"], splitPaths(filter, paths));
    setSpec(wrapSpecWithI18n(swaggerSpec, i18n.currentLocale))
  }, [filter, version, i18n.currentLocale])

  useEffect(() => {
    i18next.changeLanguage(i18n.currentLocale);
  }, [i18n.currentLocale]);

  useEffect(() => {
    return () => {
      const docContainer = document.querySelector('#__docusaurus > div.main-wrapper.docs-wrapper.docs-doc-page > div > main > div');
      if(docContainer && docContainer.classList.contains(REDOC_CLASS)) {
        docContainer.classList.remove(REDOC_CLASS);
      }
    }
  }, [])

  const onReDocLoaded = useCallback(() => {
    const docContainer = document.querySelector('#__docusaurus > div.main-wrapper.docs-wrapper.docs-doc-page > div > main > div');
    if(docContainer) {
      docContainer.classList.add(REDOC_CLASS);
    }
  }, [])

  return (
    <div id="swagger-ui" ref={wrapper}>
      <RedocStandalone 
      spec={spec} 
      onLoaded={onReDocLoaded} 
      options={{
        theme: {
          rightPanel: {
            backgroundColor: "transparent"
          },
          typography: {
            code: {
              backgroundColor:  "#11171a"
            }
          },
          codeBlock: {
            backgroundColor: "#11171a"
          }
          
        },
        scrollYOffset: 60,
        nativeScrollbars: true,
        hideDownloadButton: true,
      }}/>
    </div>
  );
};

export default App;
