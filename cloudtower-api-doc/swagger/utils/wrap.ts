import _ from "lodash";
import { OpenAPIV3 } from "openapi-types";
import httpSnippet from "httpsnippet";
import i18next, { ApiDoc } from "../i18n";
import { ISpec } from "./swagger";
import { describeSchema } from "./describe";
import { tagsGroup } from './constant';

const genSchemaExample = (params: {
  schema: OpenAPIV3.ReferenceObject | OpenAPIV3.SchemaObject, field: string, spec:ISpec, schemaName: string,
}) => {
  const { schema, schemaName, spec, field } = params;
  if((schema as OpenAPIV3.ReferenceObject).$ref) {
    const refSchema = (schema as OpenAPIV3.ReferenceObject).$ref;
    const paths = refSchema.split('/').slice(1);
    return genSchemaExample({
      spec,
      schema: _.get(spec, paths),
      field: '',
      schemaName: paths[paths.length - 1],
    })
  } else if((schema as OpenAPIV3.ArraySchemaObject).type === 'array'){
    return [ genSchemaExample({
      schema: (schema as OpenAPIV3.ArraySchemaObject).items, 
      spec,
      field: '',
      schemaName: schemaName,
    })]
  } else if((schema as OpenAPIV3.NonArraySchemaObject).type === 'object') {
    const { required, properties } = (schema as OpenAPIV3.NonArraySchemaObject);
    const example = {};
    if(properties) {
      Object.entries(properties).filter(([key]) => required?.includes(key)).forEach(([key, value]) => {
        example[key] = genSchemaExample({
          schema: value,
          spec,
          field: key,
          schemaName: schemaName,
        });
      })
    }
    if(properties?.where && ((properties.where as OpenAPIV3.NonArraySchemaObject).allOf?.[0] as OpenAPIV3.ReferenceObject)?.$ref && !required?.includes('where')) {
      const ref = ((properties.where as OpenAPIV3.NonArraySchemaObject).allOf[0] as OpenAPIV3.ReferenceObject).$ref;
      const resource = ref.split('/').pop().replace('WhereInput', '').replace('WhereUniqueInput', ''); 
      example['where'] = { id: `${resource}-id` }
    }
    if(schemaName.endsWith('WhereInput') || schemaName.endsWith('WhereUniqueInput')) {
      const resource = schemaName.replace('WhereInput', '').replace('WhereUniqueInput', ''); 
      example['id'] = `${resource}-id`;
    }
    return example;
  } else if((schema as OpenAPIV3.NonArraySchemaObject).allOf) {
    let example = {};
    (schema as OpenAPIV3.NonArraySchemaObject).allOf.forEach(schema => {
      const value = genSchemaExample({
        spec,
        schema,
        schemaName,
        field: '',
      })
      example = {...example, ...value}
    })
    return example;
  } else if((schema as OpenAPIV3.NonArraySchemaObject).anyOf) {
    return {};
  } else {
    const { type, enum:eValues} = schema as OpenAPIV3.NonArraySchemaObject;
    switch(type) {
      case 'string': {
        if(eValues?.length) {
          return eValues[0]
        }
        else if(field.endsWith('id')) {
          return 'ck74rk21wg5lz0786opdnzz5m';
        } else {
          return `${field}-string`
        }
      }
      case 'boolean': {
        return true;
      }
      case 'integer': {
        return 1;
      }
      case 'number': {
        return 1
      }
    }
    return ''
  }
}


const replaceTags = (tag:string) => {
  const replaceTag = tagsGroup.find(group => group.tags.includes(tag));
  if(replaceTag) {
    return replaceTag.name
  }
  return tag;
}

export const wrapSpecWithI18n = (
  spec: ISpec,
  language: string,
  version: string
) => {
  const cloneSpec = _.cloneDeep(spec);
  const { components, paths } = cloneSpec;
  const tags = new Set<string>();
  // handle paths
  Object.keys(paths).forEach((p) => {
    const apiDoc = i18next.t(`${version.split('.').join('_')}.paths.${p}`, {lng: language, returnObjects: true }) as ApiDoc;
    const method = Object.keys(paths[p])[0]
    const operationObj = paths[p][method] as OpenAPIV3.OperationObject;
    const { description, summary } = apiDoc;
    operationObj .description = description;
    operationObj .summary = summary;
    if ((operationObj .requestBody as OpenAPIV3.RequestBodyObject)?.content) {
      Object.keys(
        (operationObj .requestBody as OpenAPIV3.RequestBodyObject).content
      ).forEach((meta) => {
        const exampleValue = genSchemaExample({
          schema: (operationObj.requestBody as OpenAPIV3.RequestBodyObject).content[meta].schema, 
          spec,
          field: '',
          schemaName: '',
         });
        const snippet = new httpSnippet({
          method: method.toUpperCase(),
          url: `http://YOUR_TOWER_URL/v2/api${p}`,
          headers: [
            { name: "Authorization", value: "YOUR_TOKEN" },
            {
              name: "Content-Language",
              value: "en-US",
              comment: "en-US or zh-CN",
            },
            {
              name: "Content-Type",
              value: meta
            }
          ],
          postData: {
            mimeType: "application/json",
            text: JSON.stringify(exampleValue),
          },
        } as httpSnippet.Data);
        operationObj["x-codeSamples"] = [
          {
            lang: "curl",
            source: snippet.convert("shell", "curl", {
              indent: "\t",
              short: true,
            }),
          },
        ];
        (operationObj.requestBody as OpenAPIV3.RequestBodyObject).content[
          meta
        ].examples = {
          Example: {
              description: "",
              summary: "",
              value: exampleValue,
          }
        };
      });
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
    const schema = i18next.t(`${version.split('.').join('_')}.schemas.${s}`, {lng: language, returnObjects: true}) as Record<string, string>;
    describeSchema({
      schema: components.schemas[s],
      prefix: ["components", "schemas", s],
      describeFn: ({ prefix, path }) => {
        _.set(cloneSpec, [...prefix, "description"], schema[path]);
      },
    });
  });
  // handle security schemas
  Object.keys(components.securitySchemes).forEach((s) => {
    const schema = i18next.t(`${version.split('.').join('_')}.schemas.${s}`, {lng: language, returnObjects: true}) as Record<string, string>;
    _.set(cloneSpec, ["components","securitySchemes", s, "description"], schema['description']);
    _.set(cloneSpec, ["components","securitySchemes", s, "x-displayName"], schema['name']);
  });
  // handle tags
  // const combineAllTags = (lng:string, filter:Set<string>) => {
  //   const tags:ISpec['tags'] = [
  //     ...(i18next.t(`v1_8_0.tags`, { returnObjects: true, lng }) as ISpec['tags']),
  //     ...(i18next.t(`v1_9_0.tags`, { returnObjects: true, lng }) as ISpec['tags']),
  //     ...(i18next.t(`v1_10_0.tags`, { returnObjects: true, lng }) as ISpec['tags']),
  //     ...(i18next.t(`v2_0_0.tags`, { returnObjects: true, lng }) as ISpec['tags'])
  //   ];
  //   return tags.filter(tag => filter.has(tag.name));
  // }
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
      Object.entries((schemaContent as OpenAPIV3.SchemaObject).properties).forEach(([key, value]) => {
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