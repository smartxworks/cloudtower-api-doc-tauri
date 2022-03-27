import _ from "lodash";
import { OpenAPIV3 } from "openapi-types";
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
  if(prefix[2].includes('RequestBody')) {
    return;
  }
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
    const { description, summary, examples, responses } = apiDoc;
    post.description = description;
    post.summary = summary;
    if ((post.requestBody as OpenAPIV3.RequestBodyObject).content) {
      Object.keys(
        (post.requestBody as OpenAPIV3.RequestBodyObject).content
      ).forEach((meta) => {
        (post.requestBody as OpenAPIV3.RequestBodyObject).content[
          meta
        ].examples = examples;
      });
    }
    Object.keys(post.responses).forEach((c) => {
      (post.responses[c] as OpenAPIV3.ResponseObject).description =
        responses[c];
    });
    const snippetValue = examples[0].value;
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
        text: JSON.stringify(snippetValue),
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
