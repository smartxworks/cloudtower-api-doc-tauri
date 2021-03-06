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
          des = lng === 'zh' ?  `${basicDes}??????????????????` : `${basicDes} in given range`;
        } else if(basicDes = basicAst[path.replace('_not_in', '')]) {
          des = lng === 'zh' ?  `${basicDes}?????????????????????` : `${basicDes} not in given range`;
        } else if(basicDes = basicAst[path.replace('_not', '')]) {
          des = lng === 'zh' ?  `${basicDes}?????????????????????` : `${basicDes} not equal given data`;
        } else if(basicDes = basicAst[path.replace('_contains', '')]) {
          des = lng === 'zh' ?  `${basicDes}??????????????????` : `${basicDes} contains given string`;
        } else if(basicDes = basicAst[path.replace('_not_contains', '')]) {
          des = lng === 'zh' ?  `${basicDes}?????????????????????` : `${basicDes} not contains given string`;
        } else if(basicDes = basicAst[path.replace('_ends_with', '')]) {
          des = lng === 'zh' ?  `${basicDes}?????????????????????` : `${basicDes} ends with given string`;
        } else if(basicDes = basicAst[path.replace('_not_ends_with', '')]) {
          des = lng === 'zh' ?  `${basicDes}????????????????????????` : `${basicDes} not ends with given string`;
        } else if(basicDes = basicAst[path.replace('_starts_with', '')]) {
          des = lng === 'zh' ?  `${basicDes}?????????????????????` : `${basicDes} starts with given string`;
        } else if(basicDes = basicAst[path.replace('_not_starts_with', '')]) {
          des = lng === 'zh' ?  `${basicDes}????????????????????????` : `${basicDes} not starts with given string`;
        } else if(basicDes = basicAst[path.replace('_gt', '')]) {
          des = lng === 'zh' ?  `${basicDes}??????????????????` : `${basicDes} greater than given data`;
        } else if(basicDes = basicAst[path.replace('_gte', '')]) {
          des = lng === 'zh' ?  `${basicDes}???????????????????????????` : `${basicDes} greater than or equals to given data`;
        } else if(basicDes = basicAst[path.replace('_lt', '')]) {
          des = lng === 'zh' ?  `${basicDes}??????????????????` : `${basicDes} less than given data`;
        } else if(basicDes = basicAst[path.replace('_lte', '')]) {
          des = lng === 'zh' ?  `${basicDes}???????????????????????????` : `${basicDes} less than or equals to given data`;
        } else if(basicDes = basicAst[path.replace('_some', '')]) {
          des = lng === 'zh' ? `??????????????????????????????????????????????????????????????????` : 'Returns all records where one or more ("some") related records match filtering criteria.'
        } else if (basicDes = basicAst[path.replace('_every', '')]) {
          des = lng === 'zh' ? `?????????????????????????????????????????????????????????` : 'Returns all records where all ("every") related records match filtering criteria.'
        } else if (basicDes = basicAst[path.replace('_none', '')]) {
          des = lng === 'zh' ? `??????????????????????????????????????????????????????` : 'Returns all records where zero related records match filtering criteria.'
        } else if(path === 'AND') {
          des = lng === 'zh' ? '???????????????????????????': `All conditions must return true.`
        } else if (path === 'OR') {
          des = lng === 'zh' ? '?????????????????????????????????' : 'One or more conditions must return true.'
        } else if (path === 'NOT') {
          des = lng === 'zh' ? '???????????????????????????': 'All conditions must return false.'
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
        params[path] = lng === 'zh' ? '????????????????????????????????????' : 'Sorts a list of records';
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
          params[path] = lng === 'zh' ? '??????' : 'count'
        },
      });
      return params;
    } else {
      const commonDes = {
        'zh': {
          'name': "??????",
          "id": "????????????"
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
          des = lng === 'zh' ? '????????????????????? id???????????????????????????????????????????????????????????????' : 'Fill in a single resource???s id, representing to acquire resources after this resource and not including it.'
        } else if (path === 'before') {
          des = lng === 'zh' ? '????????????????????? id????????????????????????????????????????????????????????????' : 'Fill in a single resource???s id, representing to acquire resources before this resource but not including it.';
        } else if(path === 'first') {
          des = lng === 'zh' ? '?????? after / before ???????????????????????????????????????????????????????????????' : 'It can be used together with after / before, representing the number of data acquired after the specified resource.'
        } else if (path === 'last') {
          des = lng === 'zh' ? '?????? after / before ???????????????????????????????????????????????????????????????' : 'It can be used together with after / before, representing the number of data acquired before the specified resource.'
        } else if (path === 'skip') {
          des = lng === 'zh' ? '?????? after / before ?????????????????????????????????????????? n ?????????????????????' : 'It can be used together with after / before???representing to start a query after skipping n items of the specified resource.'
        } else if (path === 'orderBy') {
          des = lng === 'zh' ? '???????????????????????????????????????????????????????????????(_DESC)???????????? (_ASC)???' : ' It represents the order of query results, usually including descending or ascending order of all the fields of the resource, i.e., _DESC or _ASC.'
        } else if (path === 'where') {
          des = lng === 'zh' ? '??????????????????????????????????????????????????????' : 'conditional query, representing to query the resources that meet the conditions. '
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
          des = lng === 'zh' ? '???????????? id???' : 'asynchronous task id '
        } else if (path === 'data') {
          des = lng === 'zh' ? '??????' : 'resources';
        } else if(path === 'data.token') {
          des = lng === 'zh' ? '?????? token' : 'authorization token';
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
          des = lng === 'zh' ? '?????? id' : 'resource???s id '
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
