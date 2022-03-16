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
  wrapSchemaWithI18n,
  TopBarSelection
} from "./utils";


const App: React.FC = (props) => {
  const wrapper = useRef<HTMLDivElement>(null);
  const { version } = useDocsVersion();
  const { i18n } = useDocusaurusContext();
  const [spec, setSpec] = useState<ISpec>();
  // const { filter } = props;
  const filter:TopBarSelection = "userManagement"

  useEffect(() => {
    const lastVersion = specMap[version] ? version : Object.keys(specMap)[0];
    const swaggerSpec: ISpec = _.cloneDeep(specMap[lastVersion]);
    const { paths, components } = swaggerSpec;
    // handle paths
    _.set(
      swaggerSpec,
      ["paths"],
      wrapPathWithI18n(swaggerSpec.paths, i18n.currentLocale)
    );
    _.set(swaggerSpec, ["paths"], splitPaths(filter, paths));
    // handle components and schemas
    _.set(
      swaggerSpec,
      ["components", "schemas"],
      wrapSchemaWithI18n(swaggerSpec.components.schemas, i18n.currentLocale)
    );
    _.set(
      swaggerSpec,
      ["components", "schemas"],
      splitSchema(swaggerSpec.paths, components.schemas)
    );
    setSpec(swaggerSpec)
  }, [filter, version, i18n.currentLocale])

  useEffect(() => {
    i18next.changeLanguage(i18n.currentLocale);
  }, [i18n.currentLocale]);

  const onReDocLoaded = useCallback(() => {
    const docContainer = document.querySelector('#__docusaurus > div.main-wrapper.docs-wrapper.docs-doc-page > div > main > div');
    if(docContainer) {
      docContainer.classList.add("redoc-container");
    }
  }, [])

  return (
    <div id="swagger-ui" ref={wrapper}>
      <RedocStandalone spec={spec} onLoaded={onReDocLoaded} options={{
        scrollYOffset: 60,
        hideDownloadButton: true,
      }}/>
    </div>
  );
};

export default App;
