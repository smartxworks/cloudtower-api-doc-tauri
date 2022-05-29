import _ from 'lodash';
import { ISpec } from './swagger';
export const overwriteArrayClose = (spec:ISpec) => {
  // get ]
  const titles = document.querySelectorAll('.sc-giYglK.lkBzPA');
  titles.forEach(title => {
    const parentDiv = title.closest('[data-section-id]');
    if(!parentDiv) { return; }
    const sectionId = parentDiv.getAttribute('data-section-id')?.split('/')?.pop();
    const p = Object.entries(spec.paths).find(([key, p]) => p.post?.operationId === sectionId)
    if(!p) { return; }
    const requestRef = _.get(p[1], ['post', 'requestBody', 'content', 'application/json', 'schema', 'items', '$ref'], null);
    if(!requestRef) { return; }
    const ref = requestRef.split('/').pop();
    title.textContent = title.textContent + ` (${ref})`;
  })
}