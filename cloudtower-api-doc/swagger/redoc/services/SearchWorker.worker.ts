import * as lunr from 'lunr';
import { SearchResult } from '@redocly/reference-docs/lib/redoc-lib/src/services'

/* just for better typings */
export default class Worker {
  add: typeof add = add;
  done = done;
  search: typeof search = search;
  toJS = toJS;
  load = load;
  dispose = dispose;
  fromExternalJS = fromExternalJS;
}


let store: any[] = [];
lunr.tokenizer.separator = /\s+/;
let builder: lunr.Builder;
let resolveIndex: (v: lunr.Index) => void;
let index: Promise<lunr.Index>;

lunr.trimmer = function (token) {
  /**
 **check it contains Chinese (including Japanese and Korean)
 */
  function isChineseChar(str){     
    var reg = /[\u4E00-\u9FA5\uF900-\uFA2D]/;  
    return reg.test(str);  
  }
  return token.update(function (s) {
    return isChineseChar(s) ? s : s.replace(/^\W+/, '').replace(/\W+$/, '')
  })
    
}



function initEmpty() {
  builder = new lunr.Builder();
  builder.field('title');
  builder.field('description');
  builder.ref('ref');

  builder.pipeline.add(lunr.trimmer, lunr.stopWordFilter, lunr.stemmer);

  index = new Promise(resolve => {
    resolveIndex = resolve;
  });
}

initEmpty();

const expandTerm = term => {
  const token = lunr.trimmer(new lunr.Token(term, {}));
  return '*' + lunr.stemmer(token) + '*';
};

export function add<T>(title: string, description: string, meta?: T) {
  const ref = store.push(meta) - 1;
  const item = { title: title.toLowerCase(), description: description.toLowerCase(), ref };
  builder.add(item);
}

export async function done() {
  resolveIndex(builder.build());
}

export async function toJS() {
  return {
    store,
    index: (await index).toJSON(),
  };
}

export async function fromExternalJS(path: string, exportName: string) {
  try {
    importScripts(path);
    if (!self[exportName]) {
      throw new Error('Broken index file format');
    }

    load(self[exportName]);
  } catch (e) {
    console.error('Failed to load search index: ' + e.message);
  }
}

export async function load(state: any) {
  store = state.store;
  resolveIndex(lunr.Index.load(state.index));
}

export async function dispose() {
  store = [];
  initEmpty();
}

export async function search<Meta = string>(
  q: string,
  limit = 0,
): Promise<Array<SearchResult<Meta>>> {
  if (q.trim().length === 0) {
    return [];
  }
  await index;
  const idx = builder.build();

  let searchResults = idx.query(t => {
    q.trim()
      .toLowerCase()
      .split(/\s+/)
      .forEach(term => {
        if (term.length === 1) return;
        const exp = expandTerm(term);
        t.term(exp, {});
      });
  });

  if (limit > 0) {
    searchResults = searchResults.slice(0, limit);
  }

  return searchResults.map(res => ({ meta: store[res.ref], score: res.score }));
}
