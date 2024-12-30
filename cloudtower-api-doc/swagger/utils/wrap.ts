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
    describeSchema({
      schema: components.schemas[s],
      prefix: ["components", "schemas", s],
      describeFn: ({ prefix, path }) => {
        const schemaObj = _.get(cloneSpec, prefix);
        const type = schemaObj['type'];
        if (type === "object") {
          if(!schemaObj['properties']) {
            _.set(cloneSpec, [...prefix, "title"], prefix[prefix.length - 1]);
          } else {
            Object.keys(schemaObj['properties']).forEach((key) => {
              if(schemaObj['properties'][key]['allOf']) {
                const allOfRef = schemaObj['properties'][key]['allOf'][0]['$ref'];
                _.set(cloneSpec, [...prefix, "properties", key, "title"], allOfRef.split('/').pop());
                const des = i18next.t(`${ns}.schemas.${s}.${key}`, {lng: language});
                if(des) {
                  _.set(cloneSpec, [...prefix, "properties", key, "description"], des);
                }
              }
            })
          }
        }
        const des = i18next.t(`${ns}.schemas.${s}${path ? `.${path}` : ''}`, {lng: language, returnObjects: true});
        // not found schema description
        if(typeof des === 'string' && des.includes(s)) { return }
        if(typeof des === 'string') {
          _.set(cloneSpec, [...prefix, "description"], des);
        }
        if(typeof des ==='object') {
          Object.keys(des).forEach((key) => {
            const keyPath = key.split('.').join('.properties.').split('.')
            if(des![key]) {
              _.set(cloneSpec, [...prefix, 'properties', ...keyPath, 'description'], des![key]);
            }
          })
        }
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
