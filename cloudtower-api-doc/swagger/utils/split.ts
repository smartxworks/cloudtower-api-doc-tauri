import { pickBy } from "lodash";
import { ISpec, SwaggerTopBar } from "./swagger";

// get paths we need and add translate tags and description
export const splitPaths = (filter: string, allPaths: ISpec['paths'], hideApis:string[] = []) => {
  const selectAll = filter === 'all';
  // const tags: string[] = selectAll ?  [] : SwaggerTopBar[filter].map(tag => i18next.t(`tags.${tag}`));
  const paths = selectAll
      ? allPaths
      : pickBy(allPaths, (p) => p.post.tags && SwaggerTopBar[filter].includes(p.post.tags[0]));
  return paths;
};
