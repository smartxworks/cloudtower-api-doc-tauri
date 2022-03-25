import _ from "lodash";
import { OpenAPIV3 } from "openapi-types";
import httpSnippet from "httpsnippet";
import i18next, { ApiDoc } from "../i18n";
import { ISpec } from "./swagger";
import { describeRequestBody } from './describe';

const toParameterObj = (
  obj: OpenAPIV3.ReferenceObject | OpenAPIV3.ParameterObject
) => obj as OpenAPIV3.ParameterObject;

export const wrapSpecWithI18n = (spec: ISpec, language: string) => {
  let cloneSpec = _.cloneDeep(spec);
  const { paths } = cloneSpec;
  Object.keys(paths).forEach((api_name) => {
    const post = paths[api_name].post;
    // add description of api
    const { description, summary, examples, responses, requestBody } = i18next.t(
      `api.${api_name}`,
      {
        lng: language,
        defaultValue: "",
        returnObjects: true,
      }
    ) as ApiDoc;
    // add description of api
    post.description = description;
    // add summary of api
    post.summary = summary;
    // add description of header parameters
    post.parameters = post.parameters?.map((param) => ({
      ...param,
      description: i18next.t(`parameters.${toParameterObj(param).name}`, {
        lng: language,
        defaultValue: "",
      }),
    }));
    // add examples of requestBody
    if (
      (post.requestBody as OpenAPIV3.RequestBodyObject).content[
        "application/json"
      ]
    ) {
      (post.requestBody as OpenAPIV3.RequestBodyObject).content[
        "application/json"
      ].examples = examples as any;

      const snippetValue = Object.values(examples)[0].value;
      const snippet = new httpSnippet({
        method: "POST",
        url: `http://YOUR_TOWER_URL/v2/api${api_name}`,
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
      } as any);

      post["x-codeSamples"] = [
        {
          lang: "curl",
          source: snippet.convert("shell", "curl", {
            indent: "\t",
            short: true,
          }),
        },
      ];
    }
    // TODO: add description of parameters
    // add description of responses
    Object.keys(post.responses).forEach((c) => {
      (post.responses[c] as OpenAPIV3.ResponseObject).description =
        responses[c];
    });
    _.set(paths, [api_name, "post"], post);
    describeRequestBody({
      api_name,
      prefix: [],
      path: '',
      spec: cloneSpec,
      describeFn: ({ prefix, path }) => {
        _.set(cloneSpec, [...prefix, 'description'], requestBody[path]);
      }
    });
  });
  cloneSpec.paths = paths;
  return cloneSpec;
};

export const wrapTagsWithI18n = (paths: ISpec["paths"], language: string) => {
  const tags: ISpec["tags"] = [];
  Object.values(paths).forEach((api) => {
    if (api.post.tags) {
      const tags_obj = api.post.tags.map(
        (tag) =>
          ({
            "x-displayName": i18next.t(`tags.${tag}`, {
              lng: language,
              defaultValue: "",
            }),
            name: tag,
            description: i18next.t(`description.${tag}`, {
              lng: language,
              defaultValue: "",
            }),
          } as ISpec["tags"][0])
      );
      tags.push(...tags_obj);
    }
  });
  return Array.from(new Set(tags));
};
