const fs = require('fs');
const path = require('path');

const traverse = (p, callback) => {
  if(fs.statSync(p).isDirectory()) {
    fs.readdirSync(p).forEach(pp => traverse(path.join(p, pp), callback))
  } else {
    callback(p);
  }
}
const generatedFiles = path.resolve(__dirname, '../generated/locales')


traverse(generatedFiles, (file) => {
  const spec = require(file);
  const { paths, schemas, tags } = spec;
  const miss_summary = {
    count: 0,
    path: [],
  }
  const miss_description = {
    count: 0,
    path: [],
  }
  const pathEntries = Object.entries(paths)
  const schemaEntries = Object.entries(schemas);
  pathEntries.forEach(([key, value]) => {
    const { summary, description } = value;
    if(summary === '') {
      miss_summary.count += 1;
      miss_summary.path.push(key);
    }
    if(description === '') {
      miss_description.count += 1;
      miss_description.path.push(key);
    }
  })
  const miss_schemas = {
    count: 0,
    schemas: [],
  };
  schemaEntries.forEach(([key, value]) => {
    if((Object.values(value).find(v => v === '') !== undefined) || (
      Object.keys(value)[0] === 'enum' && Object.values(value)[0].split('\n').find(v =>  v.trim().endsWith(':'))
    )) {
      miss_schemas.count += 1;
      miss_schemas.schemas.push(key);
    } else {
      console.log(key)
    }
  })
  const miss_display = {
    count: 0,
    tags: [],
  }
  const miss_tags_description = {
    count: 0,
    tags: [],
  }
  tags.forEach(tag => {
    if(tag['x-displayName'] === '') {
      miss_display.count += 1;
      miss_display.tags.push(tag.name)
    }
    if(tag['description'] === '') {
      miss_tags_description.count += 1;
      miss_tags_description.tags.push(tag.name)
    }
  })
  const detail = {
    file,
    pathDetail: {
      total: pathEntries.length,
      miss_summary,
      miss_description
    },
    schemaDetail: {
      total: schemaEntries.length,
      miss_schemas,
    },
    tagDetail: {
      total: tags.length,
      miss_display,
      miss_description: miss_tags_description,
    }
  }
  fs.writeFileSync(path.resolve(__dirname, `../miss/${file.includes('zh') ? 'zh' : 'en'}-${path.basename(file)}`), JSON.stringify(detail, null, 2))
})