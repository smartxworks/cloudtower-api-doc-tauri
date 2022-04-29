import "swagger-ui/dist/swagger-ui.css";
import React, { useRef, useEffect, useMemo } from "react";
import SwaggerUI from "swagger-ui/dist/swagger-ui-es-bundle";
import { useLocation } from "@docusaurus/router";
import useDocusaurusContext from "@docusaurus/useDocusaurusContext";
import { useDocsVersion } from "@docusaurus/theme-common";
import i18next from "./i18n";
import Loading from "../assets/loading-svgrepo-com.svg";
import CustomLayout from "./layout";
import {
  ISpec,
  specMap, 
  hideApiMap,
  splitPaths,
  splitSchema,
  wrapPathWithI18n,
  wrapSchemaWithI18n,
} from "./utils";
import _ from "lodash";


const App: React.FC = () => {
  const wrapper = useRef<HTMLDivElement>(null);
  const { pathname } = useLocation();
  const { version } = useDocsVersion();
  const { i18n, siteConfig } = useDocusaurusContext();
  const filter = pathname.replace(siteConfig.baseUrl, "").split('/').pop();

  const wrapSpecWithI18n = useMemo(() => {
    const lastVersion = specMap[version] ? version : Object.keys(specMap)[0];
    const swaggerSpec:ISpec = _.cloneDeep(specMap[lastVersion]);
    _.set(swaggerSpec, ['paths'], wrapPathWithI18n(swaggerSpec.paths, i18n.currentLocale));
    _.set(swaggerSpec, ['components', 'schemas'], wrapSchemaWithI18n(swaggerSpec.components.schemas, i18n.currentLocale));
    return swaggerSpec;
  }, [i18n.currentLocale, version]);

  useEffect(() => {
    i18next.changeLanguage(i18n.currentLocale);
    // split paths and schema
    const { paths, components } = wrapSpecWithI18n;
    _.set(wrapSpecWithI18n, ['paths'], splitPaths(filter, paths, hideApiMap[version]));
    _.set(wrapSpecWithI18n, ['components', 'schemas'], splitSchema(wrapSpecWithI18n.paths, components.schemas))
    SwaggerUI({
      dom_id: "#swagger-ui",
      spec: wrapSpecWithI18n,
      filter: true,
      presets: [SwaggerUI.presets.apis],
      layout: "CustomLayout",
      plugins: [
        () => ({
          components: { CustomLayout },
          fn: {
            opsFilter: (taggedOps, filter) => {
              const filters = filter.split(' ');
              return taggedOps.filter((val, key) => {
                const ops = val.get('operations');
                return filters.some(item => key.indexOf(item) > -1) || ops.some(op => {
                  return filters.some(item => op.get('path').includes(item) || op.get('operation').get('description').includes(item));
                })
              })
            }
          },
        }),
      ],
    });
  }, [filter, i18n.currentLocale, wrapSpecWithI18n]);

  useEffect(() => {
    window.onbeforeunload = () => {
      localStorage.removeItem('swagger-ui');
    }
  },[])
  return (
    <div id="swagger-ui" ref={wrapper}>
      <div id="swagger-loading">
        <Loading />
      </div>
    </div>
  );
};

export default App;
