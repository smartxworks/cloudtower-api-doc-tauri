import { SearchResultMeta, DEFAULT_SEARCH_MAX_DEPTH } from '@redocly/reference-docs/lib-esm/services/SearchStore'
import { RedocNormalizedOptions, IMenuItem, OperationModel, SearchResult } from '@redocly/reference-docs/lib-esm/redoc-lib'
import type { RedocProUserOptionsExt } from '@redocly/reference-docs/lib-esm/services/ProStore'
import { RedocSearchStore } from './RedocSearchStore';

export class DeepSearchStore extends RedocSearchStore<SearchResultMeta> {
  operationTitleBoost:number;
  tagTitleBoost: number;
  fieldLevelBoost: number;
  pathOnly: boolean;
  searchMaxDepth: number;
  constructor(options: RedocProUserOptionsExt & RedocNormalizedOptions){
    super()
    this.operationTitleBoost = 4;
    this.tagTitleBoost = 8;
    this.fieldLevelBoost = 0.95;
    this.pathOnly = false;
    this.searchMaxDepth = DEFAULT_SEARCH_MAX_DEPTH;
    options.searchOperationTitleBoost && (
      this.operationTitleBoost = parseInt(options.searchOperationTitleBoost as string, 10)
    )
    options.searchTagTitleBoost && (
      this.tagTitleBoost = parseInt(options.searchTagTitleBoost as string, 10)
    )
    options.searchFieldLevelBoost && (
      this.fieldLevelBoost = parseInt(options.searchFieldLevelBoost as string, 10)
    )
    options.searchMode === 'path-only' && (this.pathOnly = true);
    options.searchMaxDepth && (this.searchMaxDepth = options.searchMaxDepth);
  }

  indexItems(groups: Array<IMenuItem | OperationModel>) {
    groups.forEach((e) => {
      if(e.type === 'operation') {
        this.add( (e as OperationModel).path, e.name, {
          menuId: e.id,
        })
      } else {
        this.indexItems(e.items)
      }
    })
    this.searchWorker.done();
  }
  
  add(path:string, title: string, meta?: SearchResultMeta) {
    this.searchWorker.add(path, title, meta);
  }
  async search<T = SearchResultMeta>(q: string): Promise<Array<SearchResult<T>>> {
    return await this.searchWorker.search(q);
  }
  async toJS(): Promise<any> {
    await this.searchWorker.toJS();
  }
  dispose() : void {
    "terminate" in this.searchWorker && (this.searchWorker as any).terminate;
    this.searchWorker.dispose && this.searchWorker.dispose();
  }
}
