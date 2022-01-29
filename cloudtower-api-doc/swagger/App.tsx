import "swagger-ui/dist/swagger-ui.css";
import React, { useRef, useEffect } from "react";
import { cloneDeep, pickBy, set, unset } from "lodash";
import SwaggerUI from "swagger-ui/dist/swagger-ui-es-bundle";
import { useLocation } from "@docusaurus/router";
import useDocusaurusContext from "@docusaurus/useDocusaurusContext";
import { useDocsVersion } from "@docusaurus/theme-common";
import i18next from "./i18n";
import Loading from "../assets/loading-svgrepo-com.svg";
import CustomLayout from "./layout";
import { SwaggerTopBar, specMap } from "./utils";

type Property = Record<
string,
{
  allOf?: [{ $ref?: string }];
  $ref?: string;
  items?: { $ref?: string };
  type?: 'object' | 'string';
  propertis?: Property
}
>
interface Schema {
  type?: "object" | "string";
  enum?: string[]
  properties?: Record<
    string,
    {
      allOf?: [{ $ref?: string }];
      $ref?: string;
      items?: { $ref?: string };
      type?: 'object' | 'string';
      propertis?: Property
    }
  >;
}
interface ISpec {
  components: {
    schemas: Record<string, Schema>;
    securitySchemes: Record<
      string,
      {
        type: string;
        name: string;
        in: "header";
        description: string;
      }
    >;
  };
  paths: Record<
    string,
    {
      post: {
        tags: string[];
        description: string;
        parameters?: {
          name: string;
          in: string;
          description: string;
        }[];
        responses: {
          200: {
            content: {
              "application/json": {
                schema: {
                  items?: {
                    $ref?: string;
                    properties?: {
                      data?: {
                        allOf?: [{ $ref?: string }];
                      };
                    };
                  };
                  $ref?: string;
                };
              };
            };
          };
        };
        requestBody: {
          content: {
            "application/json"?: {
              schema: {
                $ref?: string;
                items?: {
                  $ref?: string;
                };
              };
            };
          };
        };
      };
    }
  >;
}

const App: React.FC = () => {
  const wrapper = useRef<HTMLDivElement>(null);
  const { pathname } = useLocation();
  const { version } = useDocsVersion();
  const { i18n, siteConfig } = useDocusaurusContext();
  const filter = pathname.replace(siteConfig.baseUrl, "");

  // get paths we need and add translate tags and description
  const splitPaths = (filter: string, spec: ISpec) => {
    const allPaths = spec.paths;
    const tags: string[] = SwaggerTopBar[filter];
    const paths =
      !tags || tags[0] === "*"
        ? allPaths
        : pickBy(allPaths, (p) => p.post.tags && tags.includes(p.post.tags[0]));
    const clonedPaths = cloneDeep(paths);
    Object.keys(clonedPaths).forEach((p) => {
      const tags = clonedPaths[p].post.tags;
      if (tags) {
        clonedPaths[p].post.tags = tags.map((tag) => i18next.t(`tags.${tag}`));
        clonedPaths[p].post.description = i18next.exists(`description.${p}`)
          ? i18next.t(`description.${p}`)
          : undefined;
        clonedPaths[p].post.parameters = clonedPaths[p].post.parameters?.map(
          (param) => {
            if (i18next.exists(`parameters.${param.name}`, { lng: "zh" })) {
              return {
                ...param,
                description: i18next.t(`parameters.${param.name}`),
              };
            }
            return param;
          }
        );
      }
    });
    return clonedPaths;
  };

  // get schemas we need
  const splitSchema = (paths: ISpec["paths"], spec: ISpec) => {
    const schemas = {};
    for (const pt in paths) {
      const responsetRef =
        paths[pt].post.responses[200].content["application/json"].schema;
      const responseSchema = (
        responsetRef.items?.$ref ||
        responsetRef.items?.properties?.data?.allOf?.[0]?.$ref ||
        responsetRef.$ref
      )
        .split("/")
        .pop();
      schemas[responseSchema] = spec.components.schemas[responseSchema];
      const requestRef =
        paths[pt].post.requestBody.content["application/json"]?.schema;
      const requestSchema = (requestRef?.$ref || requestRef?.items?.$ref || "")
        .split("/")
        .pop();
      if (requestSchema) {
        schemas[requestSchema] = spec.components.schemas[requestSchema];
      }
    }
    const traverseProperties = (schema: Schema, schema_name: string, sub_path?:string) => {
      if (schema.type === "object") {
        schema.properties &&
          Object.keys(schema.properties).forEach((p) => {
  
            const prop = schema.properties[p];
            // ignore large params
            if (
              schema_name.endsWith("WhereInput") &&
              prop.allOf &&
              prop.allOf.length &&
              prop.allOf[0]["$ref"] &&
              prop.allOf[0]["$ref"].endsWith("WhereInput")
            ) {
              return unset(schemas, [schema_name, "properties", p]);
            }
            if (p === "AND" || p === "NOT" || p === "OR") {
              return unset(schemas, [schema_name, "properties", p]);
            }
            const ref =
              schema.properties[p].items?.$ref ||
              schema.properties[p].$ref ||
              schema.properties[p].allOf?.[0]?.$ref;
            if (ref) {
              const split_ref = ref.split("/").pop();
              if (!schemas[split_ref]) {
                const target_schema = spec.components.schemas[split_ref];
                schemas[split_ref] = target_schema;
                traverseProperties(target_schema, split_ref);
              }
            }
            // add description
            if (
              schema_name.endsWith("RequestBody") ||
              schema_name.endsWith("WhereInput") ||
              schema_name.endsWith('ClusterWhereUniqueInput') ||
              schema_name.endsWith("Connection") ||
              schema_name.startsWith("Nested") ||
              schema_name.startsWith("WithTask") ||
              p === 'where'
            ) {
              return;
            }
            if(prop.type === 'object') {
              return traverseProperties(prop, schema_name, p);
            }
            const paramName = [schema_name, sub_path, p].filter(Boolean).join('_')
            if(i18next.exists(`parameters.${paramName}`)) {
              if(sub_path) {
                return set(schemas, [schema_name, 'properties', sub_path, 'properties', p, 'description'], i18next.t(`parameters.${paramName}`))
              } else {
                return set(schemas, [schema_name, 'properties', p, 'description'], i18next.t(`parameters.${paramName}`))
              }
            } else {
              // TODO:
              // console.log(paramName)
            }
          });
      } else if (schema.type === "string" && schema.enum) {
        if(i18next.exists(`parameters.${schema_name}`)) {
          set(schemas, [schema_name, 'description'], i18next.t(`parameters.${schema_name}`));
        }
      } else {
         // TODO:
        // console.log("no handled schema",  schema);
      }
    };
    Object.keys(schemas).forEach((schema) => {
      traverseProperties(schemas[schema], schema);
    });
    return schemas;
  };

  useEffect(() => {
    const swaggerSpec =
      version && specMap[version]
        ? specMap[version]
        : specMap[Object.keys(specMap)[0]];
    i18next.changeLanguage(i18n.currentLocale);
    const paths = splitPaths(filter, swaggerSpec);
    const schemas = splitSchema(paths, swaggerSpec);
    const WrapWithI18n = (Original, stystem) => (props) =>
      <Original {...props} i18next={i18next} />;
    const spec = {
      ...swaggerSpec,
      components: {
        ...swaggerSpec.components,
        securitySchemes: {
          ...swaggerSpec.components.securitySchemes,
          Authorization: {
            ...swaggerSpec.components.securitySchemes.Authorization,
            description: i18next.t("description.auth"),
          },
        },
        schemas,
      },
      paths,
      info: {},
      servers: [],
    };
    SwaggerUI({
      dom_id: "#swagger-ui",
      spec,
      filter: true,
      presets: [SwaggerUI.presets.apis],
      layout: "CustomLayout",
      plugins: [
        () => ({
          components: { CustomLayout },
          wrapComponents: {
            Example: WrapWithI18n,
            authorizeBtn: WrapWithI18n,
            TryItOutButton: WrapWithI18n,
            FilterContainer: WrapWithI18n,
            parameters: WrapWithI18n,
            modelExample: WrapWithI18n,
            responses: WrapWithI18n,
            response: WrapWithI18n,
            parameterRow: WrapWithI18n,
            authorizationPopup: WrapWithI18n,
            auths: WrapWithI18n,
            apiKeyAuth: WrapWithI18n,
          },
        }),
      ],
    });
  }, [filter, i18n.currentLocale]);

  return (
    <div id="swagger-ui" ref={wrapper}>
      <div id="swagger-loading">
        <Loading />
      </div>
    </div>
  );
};

export default App;
