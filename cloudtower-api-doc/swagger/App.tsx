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
  splitSchema,
  wrapPathWithI18n,
  wrapPathWithExamples,
  wrapSchemaWithI18n,
  TopBarSelection,
  wrapTagsWithI18n
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
    const { paths, components } = swaggerSpec;
    // handle paths
    _.set(swaggerSpec, ["paths"], splitPaths(filter, paths));
    _.set(swaggerSpec, ["tags"], wrapTagsWithI18n(swaggerSpec.paths, i18n.currentLocale))
    _.set(
      swaggerSpec,
      ["paths"],
      wrapPathWithI18n(swaggerSpec.paths, i18n.currentLocale)
    );
    _.set(swaggerSpec, ["paths"], wrapPathWithExamples(swaggerSpec, i18n.currentLocale))
    // handle components and schemas
    _.set(
      swaggerSpec,
      ["components", "schemas"],
      splitSchema(swaggerSpec.paths, components.schemas)
    );
    _.set(
      swaggerSpec,
      ["components", "schemas"],
      wrapSchemaWithI18n(swaggerSpec.components.schemas, i18n.currentLocale)
    );

    setSpec(swaggerSpec)
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
