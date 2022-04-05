import _ from "lodash";
import { OpenAPI, OpenAPIV3 } from "openapi-types";
import httpSnippet from "httpsnippet";
import i18next, { ApiDoc } from "../i18n";
import { ISpec } from "./swagger";
import { describeSchema } from "./describe";

const isIgnoreParams = (params: {
  prefix: string[];
  spec: ISpec;
}) => {
  const { prefix, spec } = params;
  const itemSchema = _.get(spec, prefix) as OpenAPIV3.ArraySchemaObject | OpenAPIV3.NonArraySchemaObject;
  if(((itemSchema as OpenAPIV3.ArraySchemaObject)?.items as OpenAPIV3.ReferenceObject)?.$ref?.endsWith(`WhereInput`)) {
    return true;
  }
  if((itemSchema as OpenAPIV3.ReferenceObject)?.$ref?.endsWith(`WhereInput`)) { 
    return true;
  }
};

const combineAllTags = (lng:string) => {
  const tags:ISpec['tags'] = [
    ...(i18next.t(`v1_8_0.tags`, { returnObjects: true, lng }) as ISpec['tags']),
    ...(i18next.t(`v1_9_0.tags`, { returnObjects: true, lng }) as ISpec['tags'])
  ];
  return tags;
}

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
      console.log('ggg');
      const ref = ((properties.where as OpenAPIV3.NonArraySchemaObject).allOf[0] as OpenAPIV3.ReferenceObject).$ref;
      const resource = ref.split('/').pop().replace('WhereInput', '').replace('WhereUniqueInput', ''); 
      example['where'] = { id: `${resource}-id` }
    }
    if(schemaName.endsWith('WhereInput') || schemaName.endsWith('WhereUniqueInput')) {
      const resource = schemaName.replace('WhereInput', '').replace('WhereUniqueInput', ''); 
      console.log('sche', schemaName, resource)
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
    const { type } = schema as OpenAPIV3.NonArraySchemaObject;
    switch(type) {
      case 'string': {
        if(field.endsWith('id')) {
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

export const wrapSpecWithI18n = (
  spec: ISpec,
  language: string,
  version: string
) => {
  const cloneSpec = _.cloneDeep(spec);
  const { components, paths } = cloneSpec;
  cloneSpec.tags = combineAllTags(language);
  Object.keys(paths).forEach((p) => {
    const apiDoc = i18next.t(`${version.split('.').join('_')}.paths.${p}`, {lng: language, returnObjects: true }) as ApiDoc;
    const post = paths[p].post as OpenAPIV3.OperationObject;
    const { description, summary, responses } = apiDoc;
    post.description = description;
    post.summary = summary;
    if ((post.requestBody as OpenAPIV3.RequestBodyObject).content) {
      Object.keys(
        (post.requestBody as OpenAPIV3.RequestBodyObject).content
      ).forEach((meta) => {
        const exampleValue = genSchemaExample({
          schema: (post.requestBody as OpenAPIV3.RequestBodyObject).content[meta].schema, 
          spec,
          field: '',
          schemaName: '',
         });
        const snippet = new httpSnippet({
          method: "POST",
          url: `http://YOUR_TOWER_URL/v2/api${p}`,
          headers: [
            { name: "Authorization", value: "YOUR_TOKEN" },
            {
              name: "content-language",
              value: "en-US",
              comment: "en-US or zh-CN",
            },
          ],
          postData: {
            mimeType: "application/json",
            text: JSON.stringify(exampleValue),
          },
        } as httpSnippet.Data);
        post["x-codeSamples"] = [
          {
            lang: "curl",
            source: snippet.convert("shell", "curl", {
              indent: "\t",
              short: true,
            }),
          },
        ];
        (post.requestBody as OpenAPIV3.RequestBodyObject).content[
          meta
        ].examples = [{
          description: "",
          summary: "",
          value: exampleValue,
        }] as any;
      });
    }
    Object.keys(post.responses).forEach((c) => {
      (post.responses[c] as OpenAPIV3.ResponseObject).description =
        responses[c];
    });
    cloneSpec.paths[p].post = post;
  });
  Object.keys(components.schemas).forEach((s) => {
    const schema = i18next.t(`${version.split('.').join('_')}.schemas.${s}`, {lng: language, returnObjects: true}) as Record<string, string>;
    describeSchema({
      schema: components.schemas[s],
      prefix: ["components", "schemas", s],
      describeFn: ({ prefix, path }) => {
        if (isIgnoreParams({ prefix, spec })) {
          _.set(cloneSpec, [...prefix], {type: 'object'})
        }
        _.set(cloneSpec, [...prefix, "description"], schema[path]);
      },
    });
  });
  return cloneSpec;
};
