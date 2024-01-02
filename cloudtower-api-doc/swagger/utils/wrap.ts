import _ from "lodash";
import { OpenAPIV3 } from "openapi-types";
import i18next, { ApiDoc, fallbackNS } from "../i18n";
import { ISpec  } from "./swagger";
import { describeSchema } from "./describe";
import { tagsGroup } from './constant';
import swaggerSpecExample from '../examples/swagger-examples.json';


const replaceTags = (tag:string) => {
  const replaceTag = tagsGroup.find(group => group.tags.includes(tag));
  if(replaceTag) {
    return replaceTag.name
  }
  return tag;
}

const getNs = (version: string) => {
  return version.split('.').join('_');
}

const getFallbackNS = (version: string) => {
  return fallbackNS.slice(fallbackNS.indexOf(getNs(version)))
}

export const wrapSpecWithI18n = (
  spec: ISpec,
  language: string,
  version: string
) => {
  const cloneSpec = _.cloneDeep(spec);
  const { components, paths } = cloneSpec;
  const tags = new Set<string>();
  const ns = getNs(version);
  const fallbackNS = getFallbackNS(version);
  i18next.options.fallbackNS = fallbackNS;
  Object.keys(paths).forEach((p) => {
    const apiDoc = i18next.t(`${ns}.paths.${p}`, {lng: language, returnObjects: true }) as ApiDoc;
    const method = Object.keys(paths[p])[0]
    const operationObj = paths[p][method] as OpenAPIV3.OperationObject;
    const { description, summary } = apiDoc;
    operationObj .description = description;
    operationObj .summary = summary;
    const example = swaggerSpecExample [p] || {};
    if(example) {
      operationObj["x-codeSamples"] = [
        {
          lang: "curl",
          source: example.curl
        },
        example.java ? {
          lang: "Java",
          source: example.java,
        } : undefined,
        example.go ? {
          lang: "Go",
          source: example.go,
        } : undefined,
        example.python ? {
          lang: "Python",
          source: example.python,
        } : undefined
      ].filter(Boolean);
      if(_.has(operationObj, ['requestBody', 'content', 'application/json'])) {
        (operationObj.requestBody as OpenAPIV3.RequestBodyObject).content[
          'application/json'
        ].examples = {
          Example: {
              description: "",
              summary: "",
              value: example.exampleValue,
          }
        };
      }
    }
    cloneSpec.paths[p][method] = operationObj;
    operationObj.tags = operationObj.tags?.map(tag => {
      const replaceTag = replaceTags(tag);
      tags.add(replaceTag);
      return replaceTag;
    })
  });
  // handle schemas
  Object.keys(components.schemas).forEach((s) => {
    const schema = i18next.t(`${ns}.schemas.${s}`, {lng: language, returnObjects: true}) as Record<string, string>;
    describeSchema({
      schema: components.schemas[s],
      prefix: ["components", "schemas", s],
      describeFn: ({ prefix, path }) => {
        _.set(cloneSpec, [...prefix, "description"], schema[path]);
      },
    });
  });
  // handle security schemas
  Object.keys(components?.securitySchemes || {}).forEach((s) => {
    const schema = i18next.t(`${ns}.schemas.${s}`, {lng: language, returnObjects: true}) as Record<string, string>;
    _.set(cloneSpec, ["components","securitySchemes", s, "description"], schema['description']);
    _.set(cloneSpec, ["components","securitySchemes", s, "x-displayName"], schema['name']);
  });

  cloneSpec.tags = Array.from(tags).map(tag => ({
    name: tag,
    "x-displayName": i18next.t(`components.${tag}`),
    description: ""
  }));
  return cloneSpec;
};


export const splitSchema = (spec: ISpec,) => {
  const cloneSpec = _.cloneDeep(spec);
  const traveseSchema = (name: string, schemaContent: OpenAPIV3.ReferenceObject | OpenAPIV3.SchemaObject, properties_path: string[]) => {
    if((schemaContent as OpenAPIV3.SchemaObject)?.type === 'object') {
      Object.entries((schemaContent as OpenAPIV3.SchemaObject)?.properties || {}).forEach(([key, value]) => {
        if(
          ['AND', 'OR', 'NOT'].includes(key) ||
          ((key.endsWith('_some') || key.endsWith('_every') || key.endsWith('none') && ((value as OpenAPIV3.SchemaObject).allOf?.[0] as OpenAPIV3.ReferenceObject)?.$ref?.endsWith('WhereInput')))
        ) {
          _.unset(cloneSpec, ['components', 'schemas', ...properties_path, 'properties', key]);
        }
        traveseSchema(key, value, properties_path.concat(['properties', key]));
      })
    } 
  }
  Object.entries(cloneSpec.components.schemas).forEach((
    [ schemaName, schema ]
  ) => {
    const properties_path = [ schemaName ];
    traveseSchema(schemaName, schema, properties_path);
  })
  return cloneSpec;
}