import _ from "lodash";
import { OpenAPIV3 } from "openapi-types";
import i18next from "../i18n";
import { ISpec  } from "./swagger";
import { APIInfo, tagsGroup } from './constant';

const replaceTags = (tag:string) => {
  const replaceTag = tagsGroup.find(group => group.tags.includes(tag));
  if(replaceTag) {
    return replaceTag.name
  }
  return tag;
}

export const wrapSpecWithI18n = (
  spec: ISpec,
  version: string
) => {
  const cloneSpec = _.cloneDeep(spec);
  const { paths } = cloneSpec;
  const tags = new Set<string>();
  Object.keys(paths).forEach((p) => {
    const method = Object.keys(paths[p])[0]
    const operationObj = paths[p][method] as OpenAPIV3.OperationObject;
    operationObj.tags = operationObj.tags?.map(tag => {
      const replaceTag = replaceTags(tag);
      tags.add(replaceTag);
      return replaceTag;
    })
  });

  cloneSpec.tags = Array.from(tags).map(tag => ({
    name: tag,
    "x-displayName": i18next.t(`components.${tag}`),
    description: ""
  }));

  cloneSpec.info = APIInfo;
  cloneSpec.info.version = version.split('_').join('.');
  return cloneSpec;
};
