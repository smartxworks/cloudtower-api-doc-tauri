import _ from "lodash";
import i18next from "../i18n";
import { ISpec } from "./swagger";
export const wrapPathWithI18n = (paths: ISpec["paths"], language: string) => {
  Object.keys(paths).forEach((api_name) => {
    const post = paths[api_name].post;
    if (post.tags) {
      post.tags = post.tags.map((tag) =>
        i18next.t(`tags.${tag}`, { lng: language })
      );
    }
    // add description of api
    post.description = i18next.exists(`description.${api_name}`)
      ? i18next.t(`description.${api_name}`)
      : undefined;
    // add description of header parameters
    post.parameters = post.parameters?.map((param) => {
      if (i18next.exists(`parameters.${param.name}`, { lng: language })) {
        return {
          ...param,
          description: i18next.t(`parameters.${param.name}`),
        };
      }
      return param;
    });
    _.set(paths, [api_name, 'post'], post);
  });
  return paths;
};

export const wrapSchemaWithI18n = (schemas: ISpec['components']['schemas'], language: string) => {
  const isIgnoreParams = (schema_name, field) => {
    return (
      ["OR", "NOT", "AND", "aggregate", "__typename", "after", "before", "first", "last", "orderBy", "skip", "where"].includes(field) ||
      schema_name.endsWith("WhereInput") ||
      schema_name.endsWith('WhereUniqueInput') ||
      schema_name.startsWith('Nested') ||
      schema_name.startsWith('WithTask')
    );
  };
  const trranslateSchema = (schema: ISpec['components']['schemas'][string], schema_name: string) => {
    if(schema.properties) {
      for(const prop in schema.properties) { 
        if(isIgnoreParams(schema_name, prop)) {  continue; }
        if (schema.properties[prop].properties) {
          for (const sub_prop in schema.properties[prop].properties) {
            const translate_key = [schema_name, prop, sub_prop].join('_');
            _.set(schemas, [schema_name, 'properties', prop, 'properties', sub_prop, 'description'], i18next.t(`parameters.${translate_key}`, { lng: language, defaultValue: '' }));
          }
        } else {
          const translate_key = `${schema_name}_${prop}`;
          _.set(schemas, [schema_name, 'properties', prop, 'description'], i18next.t(`parameters.${translate_key}`, {lng: language, defaultValue: ''}));
        }
      }
    } else if(schema.type === 'string' && schema.enum) {
      _.set(schemas, [schema_name, 'description'], i18next.t(`parameters.${schema_name}`, {lng: language, defaultValue: ''}));
    } else if(schema.allOf) {
      for(const index in schema.allOf) {
        const item = schema.allOf[index];
        if(item.properties) {
          for(const prop in item.properties) {
            const translate_key = `${schema_name}_${prop}`;
            _.set(schemas, [schema_name, 'allOf', index, 'properties', prop, 'description'], i18next.t(`parameters.${translate_key}`, {lng: language, defaultValue: ''}));
          }
        }
      }
    } else {
      console.log('unhandle schema', schema);
    }
  }
  Object.keys(schemas).forEach((schemaName) =>
    trranslateSchema(schemas[schemaName], schemaName)
  );
  return schemas;
};
