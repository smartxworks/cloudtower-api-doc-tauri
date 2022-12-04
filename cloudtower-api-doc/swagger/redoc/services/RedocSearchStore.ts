import { IMenuItem, OperationModel } from '@redocly/reference-docs/lib/redoc-lib/src/services'
import Worker from './SearchWorker.worker';

const IS_BROWSER = typeof window !== 'undefined' && 'HTMLElement' in window;


function getWorker() {
  let worker: new () => Worker;
  if (IS_BROWSER) {
    try {
      // tslint:disable-next-line
      worker = require('workerize-loader?inline&fallback=false!./SearchWorker.worker');
    } catch (e) {
      worker = require('./SearchWorker.worker').default;
    }
  } else {
    worker = require('./SearchWorker.worker').default;
  }
  return new worker();
}

export class RedocSearchStore<T> {
  searchWorker = getWorker();

  indexItems(groups: Array<IMenuItem | OperationModel>) {
    const recurse = items => {
      items.forEach(group => {
        if (group.type !== 'group') {
          this.add(group.name, (group.description || '').concat(' ', group.path || ''), group.id);
        }
        recurse(group.items);
      });
    };

    recurse(groups);
    this.searchWorker.done();
  }

  add(title: string, body: string, meta?: T) {
    this.searchWorker.add(title, body, meta);
  }

  dispose() {
    (this.searchWorker as any).terminate();
    (this.searchWorker as any).dispose();
  }

  search(q: string) {
    return this.searchWorker.search<T>(q);
  }

  async toJS() {
    return this.searchWorker.toJS();
  }

  load(state: any) {
    this.searchWorker.load(state);
  }

  fromExternalJS(path?: string, exportName?: string) {
    if (path && exportName) {
      this.searchWorker.fromExternalJS(path, exportName);
    }
  }
}
