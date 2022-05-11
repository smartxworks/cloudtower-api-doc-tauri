import { pickBy, unset, set } from "lodash";
import { ISpec, SwaggerTopBar, Schema } from "./swagger";
import i18next from "../i18n";

// get paths we need and add translate tags and description
export const splitPaths = (filter: string, allPaths: ISpec['paths'], hideApis:string[] = []) => {
  const selectAll = filter === 'all';
  const tags: string[] = selectAll ?  [] : SwaggerTopBar[filter].map(tag => i18next.t(`tags.${tag}`));
  const selectPaths = pickBy(allPaths, (p, key) => !hideApis.includes(key))
  const paths = selectAll
      ? selectPaths
      : pickBy(selectPaths, (p) => p.post.tags && tags.includes(p.post.tags[0]));
  return paths;
};

// get schemas we need
export const splitSchema = (paths: ISpec["paths"], allSchemas: ISpec['components']['schemas']) => {
  const schemas = {};

  // get current paths schema
  for (const pt in paths) {
    Object.entries(paths[pt].post.responses).forEach(([code, value]) => {
      if(value.content?.['application/json']) {
        const responsetRef =
        value.content["application/json"].schema;
        const responseSchema = (
          responsetRef.items?.$ref ||
          responsetRef.items?.properties?.data?.allOf?.[0]?.$ref ||
          responsetRef.$ref
        )?.split("/")?.pop();
        if(responseSchema) { 
          schemas[responseSchema] = allSchemas[responseSchema];
         }
      }
    })
    const requestRef =
      paths[pt].post.requestBody.content["application/json"]?.schema;
    const requestSchema = (requestRef?.$ref || requestRef?.items?.$ref || "")
      .split("/")
      .pop();
    if (requestSchema) {
      schemas[requestSchema] = allSchemas[requestSchema];
    }
  }

  // omit not import schema
  const traverseProperties = (
    schema: Schema,
    schema_name: string,
  ) => {
    const getRef = (schema:any) => {
      const ref = schema.items?.$ref || schema.$ref || schema.allOf?.[0]?.$ref;
      if (ref) {
        const split_ref = ref.split("/").pop();
        if (!schemas[split_ref]) {
          const target_schema = allSchemas[split_ref];
          schemas[split_ref] = target_schema;
          traverseProperties(target_schema, split_ref);
        }
      }
    }
    if (schema.type === "object") {
      schema.properties &&
        Object.keys(schema.properties).forEach((p) => {
          const prop = schema.properties[p];
          // ignore large params
          if (
            schema_name.endsWith("WhereInput") &&
            prop.allOf &&
            prop.allOf.length &&
            prop.allOf[0]["$ref"] && (
              prop.allOf[0]["$ref"].endsWith("WhereInput") ||
              prop.allOf[0]["$ref"].endsWith('WhereInput_')
            )
          ) {
            return unset(schemas, [schema_name, "properties", p]);
          }
          if(schema_name.endsWith('WhereInput') && (
            prop['$ref'] && (
              prop['$ref'].endsWith('WhereInput') ||
              prop['$ref'].endsWith('WhereInput_')
            )
          )) {
            return set(schemas, [schema_name, "properties", p], {type: "object"});
          }
          if (p === "AND" || p === "NOT" || p === "OR") {
            return unset(schemas, [schema_name, "properties", p]);
          }
  
          getRef(prop);
          if(prop.type === 'object') {
            Object.entries(prop.properties).forEach(([prop_name, properties]) => {
              getRef(properties)
            })
          }
        });
    } else {
      getRef(schema)
    }
  };
  Object.keys(schemas).forEach((schema) => {
    traverseProperties(schemas[schema], schema);
  });
  return schemas;
};
