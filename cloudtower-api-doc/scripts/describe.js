const EJS = require("ejs");
const nodePath = require("path");
const fsExtra = require("fs-extra");
const _ = require("lodash");

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
  describeFn({
    prefix,
    path: "enum",
    description: prefix.join("").includes(`OrderByInput`)
      ? ""
      : enumSchema.enum.map((e) => `${e}: `).join("<br/>"),
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

const describeRequestBody = (parmas) => {
  const { requestBody, api_name, describeFn } = parmas;
  if (requestBody.content) {
    Object.keys(requestBody.content).forEach((media) => {
      const { schema } = requestBody.content[media];
      if (!schema.$ref && schema.type !== "array") {
        describeSchema({
          path: "",
          describeFn,
          schema: schema,
          prefix: [
            "paths",
            api_name,
            "post",
            "requestBody",
            "content",
            media,
            "schema",
          ],
        });
      }
    });
  }
};

const getPathMarkdownAst = async (output) => {
  if (!fsExtra.existsSync(output)) {
    return {};
  }
  const { fromMarkdown } = await import("mdast-util-from-markdown");
  const { gfmTableFromMarkdown } = await import("mdast-util-gfm-table");
  const { gfmTable } = await import("micromark-extension-gfm-table");
  const ast = fromMarkdown(fsExtra.readFileSync(output, "utf-8"), {
    extensions: [gfmTable],
    mdastExtensions: [gfmTableFromMarkdown],
  });
  const { children } = ast;
  const summary = children[0].children[1].value.split(":")[1];
  const description = children[1].children[1].value.split(":")[1];
  children[1].children[1].value.split(":")[1];

  const responses = {};
  const responseIndex = children
    .slice()
    .reverse()
    .findIndex((c) => c.type == "table");
  children
    .slice()
    .reverse()
    [responseIndex].children.slice(1)
    .forEach(({ children }) => {
      const [code, description] = children;
      responses[code.children[0].value] = description.children[0]
        ? description.children[0].value
        : "";
    });
  return {
    summary,
    description,
    responses,
  };
};

const getMarkDown = async (parameter) => {
  const { spec, api, language, output } = parameter;
  const params = [];
  const ApiTemplatePath = nodePath.resolve(
    __dirname,
    "../templates/api-template.ejs"
  );
  const existApiContent = await getPathMarkdownAst(output);
  const ApiTemplateContent = fsExtra.readFileSync(ApiTemplatePath, "utf-8");
  const apiSpec = spec.paths[api];
  if (!apiSpec) {
    return "";
  }
  describeRequestBody({
    requestBody: spec.paths[api].post.requestBody,
    api_name: api,
    describeFn: ({ prefix, path, description }) => {
      if (!path) {
        return;
      }
      const schema = _.get(spec, prefix);
      params.push({
        name: path,
        type: schema.type,
        description,
      });
    },
  });
  return EJS.render(ApiTemplateContent, {
    api,
    responses: Object.keys(apiSpec.post.responses, params),
    params,
    description: existApiContent.description || "",
    summary: existApiContent.summary || "",
    language,
  });
};

const getSchemaMarkdownAst = async (output) => {
  if (!fsExtra.existsSync(output)) {
    return {};
  }
  const { fromMarkdown } = await import("mdast-util-from-markdown");
  const { gfmTableFromMarkdown } = await import("mdast-util-gfm-table");
  const { gfmTable } = await import("micromark-extension-gfm-table");
  const ast = fromMarkdown(fsExtra.readFileSync(output, "utf-8"), {
    extensions: [gfmTable],
    mdastExtensions: [gfmTableFromMarkdown],
  });
  const { children } = ast;
  const schemas = {};
  children[0].children.slice(1).forEach(({ children }) => {
    const [name, _type, description] = children;
    const nameValue = name.children[0] ? name.children[0].value : "";
    schemas[nameValue] = description.children[0] ? description.children.map(c => c.value).join('') : ''
  });
  return schemas;
};


const getSchemaMarkdown = async ({ schemaName, spec, output, previous }) => {
  const params = [];
  const templatePath = nodePath.resolve(
    __dirname,
    "../templates/schema-template.ejs"
  );
  const templateContent = fsExtra.readFileSync(templatePath, "utf-8");
  const exsitSchemas = await getSchemaMarkdownAst(output);
  const lng = output.includes('zh') ? 'zh' : 'en';
  if(schemaName.endsWith('WhereInput')) {
    const basicSchema = schemaName.replace('WhereInput', '');
    const basicSchemaOutput = output.replace(schemaName, basicSchema);
    const basicAst = await getSchemaMarkdownAst(basicSchemaOutput);
    describeSchema({
      spec,
      schema: spec.components.schemas[schemaName],
      prefix: ["components", "schemas", schemaName],
      describeFn: ({ prefix, path, description }) => {
        if (path === undefined) {
          return;
        }
        let des = description;
        let basicDes = basicAst[path];
        const previousDescription = previous && previous.length ? (previous.filter( p => p.name === path)).map(p => p.description)[0]: undefined
        const schema = _.get(spec, prefix);
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
          console.log(path);
        }
        params.push({
          name: path,
          type: schema.type || "object",
          description: exsitSchemas[path] === '' ?  previousDescription || des : exsitSchemas[path],
        });
      },
    });
    return {
      content:  EJS.render(templateContent, {
        params,
      }),
      params,
    }
  } else if(schemaName.endsWith('OrderByInput')) {
    describeSchema({
      spec,
      schema: spec.components.schemas[schemaName],
      prefix: ["components", "schemas", schemaName],
      describeFn: ({ prefix, path, description }) => {
        if (path === undefined) {
          return;
        }
        const schema = _.get(spec, prefix);
        params.push({
          name: path,
          type: schema.type || "object",
          description: lng === 'zh' ? '按照指定方式排列放回数据' : 'Sorts a list of records',
        });
      },
    });
    return {
      content:  EJS.render(templateContent, {
        params,
      }),
      params,
    }
  } else {
    describeSchema({
      spec,
      schema: spec.components.schemas[schemaName],
      prefix: ["components", "schemas", schemaName],
      describeFn: ({ prefix, path, description }) => {
        if (path === undefined) {
          return;
        }
        const previousDescription = previous && previous.length ? (previous.filter( p => p.name === path)).map(p => p.description)[0]: undefined
        const schema = _.get(spec, prefix);
        params.push({
          name: path,
          type: schema.type || "object",
          description: exsitSchemas[path] === '' ?  previousDescription || description : exsitSchemas[path],
        });
      },
    });
    return {
      content:  EJS.render(templateContent, {
        params,
      }),
      params,
    }
  }
};

const getTagMarkdownAst = async (output) => {
  if (!fsExtra.existsSync(output)) {
    return {};
  }
  const { fromMarkdown } = await import("mdast-util-from-markdown");
  const { gfmTableFromMarkdown } = await import("mdast-util-gfm-table");
  const { gfmTable } = await import("micromark-extension-gfm-table");
  const ast = fromMarkdown(fsExtra.readFileSync(output, "utf-8"), {
    extensions: [gfmTable],
    mdastExtensions: [gfmTableFromMarkdown],
  });
  const { children } = ast;
  const tags = {};
  children[0].children.slice(1).forEach(({ children }) => {
    const [name, display, description] = children;
    const nameValue = name.children[0] ? name.children[0].value : "";
    tags[nameValue] = {
      display: display.children[0] ? display.children[0].value : "",
      description: description.children[0] ? description.children[0].value : "",
    };
  });
  return tags;
};

const getTagsMarkdown = async (tags, output) => {
  const templatePath = nodePath.resolve(
    __dirname,
    "../templates/tag-template.ejs"
  );
  const existTags = await getTagMarkdownAst(output);
  const newTags = tags.map(tag => {
    return {
      name: tag,
      display: existTags[tag].display || '',
      description: existTags[tag].description || "",
    };
  })
  const templateContent = fsExtra.readFileSync(templatePath, "utf-8");
  return EJS.render(templateContent, { tags: newTags });
};

module.exports = { getMarkDown, getSchemaMarkdown, getTagsMarkdown };
