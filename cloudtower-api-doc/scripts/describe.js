const EJS = require("ejs");
const nodePath = require("path");
const fsExtra = require('fs-extra');
const _ = require("lodash");

const describeRef = (params) => {
  const { path, describeFn, prefix } = params;
  describeFn({
    prefix,
    path,
  })
};
const describeArraySchema = (params) => {
  const { path, arraySchema, prefix, describeFn } = params;
  const nextPrefix = prefix.concat(["items"])
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
    const nextPrefix = prefix.concat(['properties', key])
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
    const nextPrefix = prefix.concat(["allOf", index.toString()])
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
    path: 'enum',
    description: prefix.join('').includes(`OrderByInput`) ? '' : enumSchema.enum.map((e) => `${e}: `).join("<br/>"),
  });
};
const describeAnyOfSchema = (params) => {
  const { anyOfSchema, path, prefix, describeFn } = params;
  anyOfSchema.anyOf.forEach((item, index) => {
    const nextPrefix = prefix.concat(["anyOf", index.toString()])
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
          path: '',
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

const getMarkDown = (parameter) => {
  const { spec, api } = parameter;
  const params = [];
  const ApiTemplatePath = nodePath.resolve(
    __dirname,
    "../templates/api-template.ejs"
  );
  const ApiTemplateContent = fsExtra.readFileSync(ApiTemplatePath, "utf-8");
  const apiSpec = spec.paths[api];
  if (!apiSpec) {
    return "";
  }
  describeRequestBody({
    requestBody: spec.paths[api].post.requestBody,
    api_name: api,
    describeFn: ({ prefix, path, description }) => {
      if(!path) { return;}
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
    responses: Object.keys(apiSpec.post.responses),
    params,
  });
};

const getSchemaMarkdown = ({ schemaName, spec }) => {
  const params = [];
  const templatePath = nodePath.resolve(
    __dirname,
    "../templates/schema-template.ejs"
  );
  const templateContent = fsExtra.readFileSync(templatePath, "utf-8");
  describeSchema({
    spec, 
    schema: spec.components.schemas[schemaName], 
    prefix: ['components', 'schemas',  schemaName], 
    describeFn: ({ prefix, path, description }) => {
      if(path === undefined) { return;}
      const schema = _.get(spec, prefix);
      params.push({
        name: path,
        type: schema.type || 'object',
        description,
      });
    }
  })
  return EJS.render(templateContent, {
    params,
  });
}


const getTagsMarkdown = (tags) => {
  const templatePath = nodePath.resolve(
    __dirname,
    "../templates/tag-template.ejs"
  );
  const templateContent = fsExtra.readFileSync(templatePath, "utf-8");
  return EJS.render(templateContent, {tags});
}

module.exports = { getMarkDown, getSchemaMarkdown, getTagsMarkdown };
