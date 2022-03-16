import { pickBy, unset } from "lodash";
import { ISpec, SwaggerTopBar, Schema } from "./swagger";
import i18next from "../i18n";

// get paths we need and add translate tags and description
export const splitPaths = (filter: string, allPaths: ISpec['paths']) => {
  const selectAll = filter === 'all';
  // const tags: string[] = selectAll ?  [] : SwaggerTopBar[filter].map(tag => i18next.t(`tags.${tag}`));
  const paths = selectAll
      ? allPaths
      : pickBy(allPaths, (p) => p.post.tags && SwaggerTopBar[filter].includes(p.post.tags[0]));
  return paths;
};

// get schemas we need
export const splitSchema = (paths: ISpec["paths"], allSchemas: ISpec['components']['schemas']) => {
  const schemas = {};

  // get current paths schema
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
    schemas[responseSchema] = allSchemas[responseSchema];
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
              const target_schema = allSchemas[split_ref];
              schemas[split_ref] = target_schema;
              traverseProperties(target_schema, split_ref);
            }
          }
        });
    }
  };
  Object.keys(schemas).forEach((schema) => {
    traverseProperties(schemas[schema], schema);
  });
  return schemas;
};
