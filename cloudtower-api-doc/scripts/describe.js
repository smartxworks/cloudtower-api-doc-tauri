const nodePath = require("path");
const _ = require("lodash");

const getLocalesFile = (lng, version) => {
  return nodePath.resolve(process.cwd(),  "./cloudtower-api-doc/swagger/locales", lng, `${version}.json`)
}

const describeRef = (params) => {
  const { path, describeFn, prefix } = params;
  describeFn({
    prefix,
    path,
  });
};
const describeArraySchema = (params) => {
  const { path, arraySchema, prefix, describeFn } = params;
  const nextPrefix = prefix.concat(["items"]);
  if (arraySchema.items.$ref) {
    describeRef({
      path,
      prefix: nextPrefix,
      describeFn,
    });
  } else {
    describeSchema({
      schema: arraySchema.items,
      path,
      prefix: nextPrefix,
      describeFn,
    });
  }
  describeFn({ prefix, path });
};
const describeObjectSchema = (params) => {
  const { objectSchema, path, prefix, describeFn } = params;
  for (const key in objectSchema.properties) {
    const completePath = `${path ? path + "." : ""}${key}`;
    const value = objectSchema.properties[key];
    const nextPrefix = prefix.concat(["properties", key]);
    if (value.$ref) {
      describeRef({
        path: completePath,
        prefix: nextPrefix,
        describeFn,
      });
    } else {
      describeSchema({
        schema: value,
        path: completePath,
        prefix: nextPrefix,
        describeFn,
      });
    }
  }
  describeFn({ prefix, path });
};

const describeAllOfSchema = (params) => {
  const { allOfSchema, path, prefix, describeFn } = params;
  allOfSchema.allOf.forEach((item, index) => {
    const nextPrefix = prefix.concat(["allOf", index.toString()]);
    if (item.$ref) {
      describeRef({
        path,
        prefix: nextPrefix,
        describeFn,
      });
    } else {
      describeSchema({
        describeFn,
        schema: item,
        path,
        prefix: nextPrefix,
      });
    }
  });
};

const describeEnum = (params) => {
  const { enumSchema, path, prefix, describeFn } = params;
  const enumJson = require(nodePath.resolve(__dirname, '../../../tower/packages/i18n/src/locales/zh-CN/enum.json'));
  describeFn({
    prefix,
    path: "enum",
    description: prefix.join("").includes(`OrderByInput`)
      ? ""
      : enumSchema.enum.map((e) => {
        const key = `${prefix[prefix.length - 1]}_${e}`;
        return `${e}: ${enumJson[key] || ''}`
      }).join("<br/>"),
  });
};
const describeAnyOfSchema = (params) => {
  const { anyOfSchema, path, prefix, describeFn } = params;
  anyOfSchema.anyOf.forEach((item, index) => {
    const nextPrefix = prefix.concat(["anyOf", index.toString()]);
    if (item.$ref) {
      describeRef({
        path,
        prefix: nextPrefix,
        describeFn,
      });
    } else {
      describeSchema({
        schema: item,
        path,
        prefix: nextPrefix,
        describeFn,
      });
    }
  });
};
const describeSchema = (params) => {
  const { schema, path, prefix, describeFn } = params;
  if (schema.type === "array") {
    describeArraySchema({
      path,
      prefix,
      arraySchema: schema,
      describeFn,
    });
  } else if (schema.type === "object") {
    describeObjectSchema({
      path,
      prefix,
      objectSchema: schema,
      describeFn,
    });
  } else if (schema.enum) {
    describeEnum({
      enumSchema: schema,
      path,
      prefix,
      describeFn,
    });
  } else if (schema.allOf) {
    describeAllOfSchema({
      allOfSchema: schema,
      path,
      prefix,
      describeFn,
    });
  } else if (schema.anyOf) {
    describeAnyOfSchema({
      anyOfSchema: schema,
      path,
      prefix,
      describeFn,
    });
  } else {
    describeFn({ prefix, path });
  }
};


const getSchemaMarkdown = async ({ schemaName, spec, locales, previousVersion, lng }) => {
  const params = {};
  const existedLocales = locales.schemas[schemaName] || {};
  const previous = previousVersion ? require(getLocalesFile(lng, previousVersion)) : { schemas: {} };
  const previousSchema = previous.schemas[schemaName] || {};
  if(schemaName.endsWith('WhereInput')) {
    const basicSchema = schemaName.replace('WhereInput', '');
    const basicAst = locales.schemas[basicSchema] || previous.schemas[basicSchema] || {};
    describeSchema({
      spec,
      schema: spec.components.schemas[schemaName],
      prefix: ["components", "schemas", schemaName],
      describeFn: ({ prefix, path }) => {
        if (path === undefined) {
          return;
        }
        let des = '';
        let basicDes = basicAst[path];
        if(basicDes) {
          des = basicDes
        } else if(basicDes = basicAst[path.replace('_in', '')]) {
          des = lng === 'zh' ?  `${basicDes}在指定范围中` : `${basicDes} in given range`;
        } else if(basicDes = basicAst[path.replace('_not_in', '')]) {
          des = lng === 'zh' ?  `${basicDes}不在指定范围中` : `${basicDes} not in given range`;
        } else if(basicDes = basicAst[path.replace('_not', '')]) {
          des = lng === 'zh' ?  `${basicDes}不等于指定数值` : `${basicDes} not equal given data`;
        } else if(basicDes = basicAst[path.replace('_contains', '')]) {
          des = lng === 'zh' ?  `${basicDes}包含指定字符` : `${basicDes} contains given string`;
        } else if(basicDes = basicAst[path.replace('_not_contains', '')]) {
          des = lng === 'zh' ?  `${basicDes}不包含指定字符` : `${basicDes} not contains given string`;
        } else if(basicDes = basicAst[path.replace('_ends_with', '')]) {
          des = lng === 'zh' ?  `${basicDes}已指定字符结尾` : `${basicDes} ends with given string`;
        } else if(basicDes = basicAst[path.replace('_not_ends_with', '')]) {
          des = lng === 'zh' ?  `${basicDes}不已指定字符结尾` : `${basicDes} not ends with given string`;
        } else if(basicDes = basicAst[path.replace('_starts_with', '')]) {
          des = lng === 'zh' ?  `${basicDes}已指定字符开始` : `${basicDes} starts with given string`;
        } else if(basicDes = basicAst[path.replace('_not_starts_with', '')]) {
          des = lng === 'zh' ?  `${basicDes}不已指定字符开始` : `${basicDes} not starts with given string`;
        } else if(basicDes = basicAst[path.replace('_gt', '')]) {
          des = lng === 'zh' ?  `${basicDes}大于指定数值` : `${basicDes} greater than given data`;
        } else if(basicDes = basicAst[path.replace('_gte', '')]) {
          des = lng === 'zh' ?  `${basicDes}大于或等于指定数值` : `${basicDes} greater than or equals to given data`;
        } else if(basicDes = basicAst[path.replace('_lt', '')]) {
          des = lng === 'zh' ?  `${basicDes}小于指定字符` : `${basicDes} less than given data`;
        } else if(basicDes = basicAst[path.replace('_lte', '')]) {
          des = lng === 'zh' ?  `${basicDes}小于或等于指定字符` : `${basicDes} less than or equals to given data`;
        } else if(basicDes = basicAst[path.replace('_some', '')]) {
          des = lng === 'zh' ? `返回关联资源一项或多项符合相关筛选条件的资源` : 'Returns all records where one or more ("some") related records match filtering criteria.'
        } else if (basicDes = basicAst[path.replace('_every', '')]) {
          des = lng === 'zh' ? `返回关联资源全都符合相关筛选条件的资源` : 'Returns all records where all ("every") related records match filtering criteria.'
        } else if (basicDes = basicAst[path.replace('_none', '')]) {
          des = lng === 'zh' ? `返回关联资源不符合相关筛选条件的资源` : 'Returns all records where zero related records match filtering criteria.'
        } else if(path === 'AND') {
          des = lng === 'zh' ? '符合所有的筛选条件': `All conditions must return true.`
        } else if (path === 'OR') {
          des = lng === 'zh' ? '符合一项或多项筛选条件' : 'One or more conditions must return true.'
        } else if (path === 'NOT') {
          des = lng === 'zh' ? '不符合所有筛选条件': 'All conditions must return false.'
        } else {
          // console.log(path);
        }
        params[path] = des;
      },
    });
    return params;
  } else if(schemaName.endsWith('OrderByInput')) {
    describeSchema({
      spec,
      schema: spec.components.schemas[schemaName],
      prefix: ["components", "schemas", schemaName],
      describeFn: ({ prefix, path }) => {
        if (path === undefined) {
          return;
        }
        params[path] = lng === 'zh' ? '按照指定方式排列放回数据' : 'Sorts a list of records';
      },
    });
    return params;
  } else if(schemaName.startsWith('Nested')) {
    if(schemaName.startsWith('NestedAggregate')) {
      describeSchema({
        spec,
        schema: spec.components.schemas[schemaName],
        prefix: ["components", "schemas", schemaName],
        describeFn: ({ prefix, path }) => {
          if (path === undefined) {
            return;
          }
          params[path] = lng === 'zh' ? '数量' : 'count'
        },
      });
      return params;
    } else {
      const commonDes = {
        'zh': {
          'name': "名称",
          "id": "唯一标识"
        },
        "en": {
          "name": "name",
          "id": "id"
        }
      };
      describeSchema({
        spec,
        schema: spec.components.schemas[schemaName],
        prefix: ["components", "schemas", schemaName],
        describeFn: ({ prefix, path }) => {
          if (path === undefined) {
            return;
          }
          params[path] = existedLocales[path] || previousSchema[path] || commonDes[lng][path] || '';
        },
      });
      return params;
    }
  } else if(schemaName.endsWith('RequestBody')){
    describeSchema({
      spec,
      schema: spec.components.schemas[schemaName],
      prefix: ["components", "schemas", schemaName],
      describeFn: ({ prefix, path }) => {
        if (path === undefined) {
          return;
        }
        let des = existedLocales[path] || '';
        if(path === 'after') {
          des = lng === 'zh' ? '填入单个资源的 id。表示从该资源之后开始获取，不包含该资源。' : 'Fill in a single resource’s id, representing to acquire resources after this resource and not including it.'
        } else if (path === 'before') {
          des = lng === 'zh' ? '填入单个资源的 id。表示从该资源之前开始获取，不包含该资源' : 'Fill in a single resource’s id, representing to acquire resources before this resource but not including it.';
        } else if(path === 'first') {
          des = lng === 'zh' ? '可与 after / before 搭配使用，表示获取指定资源后的多少个数据。' : 'It can be used together with after / before, representing the number of data acquired after the specified resource.'
        } else if (path === 'last') {
          des = lng === 'zh' ? '可与 after / before 搭配使用，表示获取指定资源前的多少个数据。' : 'It can be used together with after / before, representing the number of data acquired before the specified resource.'
        } else if (path === 'skip') {
          des = lng === 'zh' ? '可与 after / before 搭配使用，表示跳过指定资源的 n 项后开始查询。' : 'It can be used together with after / before，representing to start a query after skipping n items of the specified resource.'
        } else if (path === 'orderBy') {
          des = lng === 'zh' ? '表示查询顺序，通常包含了资源所有字段的降序(_DESC)或者升序 (_ASC)。' : ' It represents the order of query results, usually including descending or ascending order of all the fields of the resource, i.e., _DESC or _ASC.'
        } else if (path === 'where') {
          des = lng === 'zh' ? '条件查询，表示查询符合该条件的资源。' : 'conditional query, representing to query the resources that meet the conditions. '
        }
        params[path] = des;
      },
    });
    return params;
  } else if(schemaName.startsWith('WithTask_')) {
    describeSchema({
      spec,
      schema: spec.components.schemas[schemaName],
      prefix: ["components", "schemas", schemaName],
      describeFn: ({ prefix, path }) => {
        if (path === undefined) {
          return;
        }
        let des = '';
        if(path === 'task_id') {
          des = lng === 'zh' ? '异步任务 id。' : 'asynchronous task id '
        } else if (path === 'data') {
          des = lng === 'zh' ? '资源' : 'resources';
        } else if(path === 'data.token') {
          des = lng === 'zh' ? '鉴权 token' : 'authorization token';
        }
        params[path] = des;
      },
    });
    return params;
  } else if(schemaName.startsWith('Delete')) {
    describeSchema({
      spec,
      schema: spec.components.schemas[schemaName],
      prefix: ["components", "schemas", schemaName],
      describeFn: ({ prefix, path }) => {
        if (path === undefined) {
          return;
        }
        let des = '';
        if(path === 'id') {
          des = lng === 'zh' ? '资源 id' : 'resource‘s id '
        }
        params[path] = des;
      },
    });
    return params;
  } else {
    describeSchema({
      spec,
      schema: spec.components.schemas[schemaName],
      prefix: ["components", "schemas", schemaName],
      describeFn: ({ prefix, path }) => {
        if (path === undefined || prefix[prefix.length - 1] === 'items') {
          return;
        } 
        params[path] = existedLocales[path] || previousSchema[path] || '';
      },
    });
    return params;
  }
};

module.exports = { 
  getLocalesFile,
  getSchemaMarkdown,
};
