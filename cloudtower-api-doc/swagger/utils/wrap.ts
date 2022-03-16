import _ from "lodash";
import { OpenAPIV3} from 'openapi-types';
import { SwaggerApi } from "../../declerations/swagger-api";
import { getExamples } from '../examples';
import i18next from "../i18n";
import { ISpec, SupportLanguage } from "./swagger";

const toSchemaObj = (obj: OpenAPIV3.ReferenceObject | OpenAPIV3.SchemaObject) => obj as OpenAPIV3.SchemaObject
const toParameterObj = (obj:OpenAPIV3.ReferenceObject | OpenAPIV3.ParameterObject) => obj as OpenAPIV3.ParameterObject;
export const wrapPathWithI18n = (paths: ISpec["paths"], language: string) => {
  Object.keys(paths).forEach((api_name) => {
    const post = paths[api_name].post;
    if (post.tags) {
      post.tags = post.tags.map((tag) =>
        i18next.t(`tags.${tag}`, { lng: language, defaultValue: '' })
      );
    }
    // add description of api
    post.description = i18next.t(`description.${api_name}`, { lng: language, defaultValue: '' })
    post.summary = i18next.t(`summary.${api_name}`, {lng: language, defaultValue: ''});
    // add description of header parameters
    post.parameters = post.parameters?.map((param) => ({
        ...param,
        description: i18next.t(`parameters.${(toParameterObj(param)).name}`, {lng: language, defaultValue: ''}),
    }));
    if((post.requestBody as OpenAPIV3.RequestBodyObject).content['application/json']) {
      (post.requestBody as OpenAPIV3.RequestBodyObject).content['application/json'].examples = getExamples(api_name as SwaggerApi, language as SupportLanguage);
    }
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
      schema_name.startsWith('NestedAggregate') ||
      schema_name.startsWith('WithTask')
    );
  };
  const trranslateSchema = (schema: OpenAPIV3.SchemaObject, schema_name: string) => {
    if(schema.properties) {
      for(const prop in schema.properties) { 
        if(isIgnoreParams(schema_name, prop)) {  continue; }
        if (toSchemaObj(schema.properties[prop]).properties) {
          for (const sub_prop in (toSchemaObj(schema.properties[prop])).properties) {
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
        if((toSchemaObj(item)).properties) {
          for(const prop in (toSchemaObj(item)).properties) {
            const translate_key = `${schema_name}_${prop}`;
            _.set(schemas, [schema_name, 'allOf', index, 'properties', prop, 'description'], i18next.t(`parameters.${translate_key}`, {lng: language, defaultValue: ''}));
          }
        }
      }
    } else {
      console.log('unhandle schema', schema);
    }

    // remove example
    schema.example = undefined
  }
  Object.keys(schemas).forEach((schemaName) =>
    trranslateSchema((toSchemaObj(schemas))[schemaName], schemaName)
  );
  return schemas;
};

export const wrapTagsWithI18n = (paths: ISpec["paths"], language: string) => {
  const tags: ISpec['tags'] = [];
  Object.values(paths).forEach(api => {
    if(api.post.tags) {
      console.log(api.post.tags)
      const tags_obj = api.post.tags.map(tag => ({
        name: i18next.t(`tags.${tag}`, {lng: language, defaultValue: ''}),
        description: i18next.t(`description.${tag}`, {lng: language, defaultValue: ''}),
      } as ISpec['tags'][0]))
      tags.push(...tags_obj);
    }
  })
  return Array.from(new Set(tags));
}