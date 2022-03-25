const EJS = require("ejs");
const nodePath = require('path');
const fs = require('fs');
const _ = require('lodash');

const collectSchema = new Set();
const describeRef = (params) => {
  const { ref, spec, path, describeFn } = params;
  const schemaName = ref.split("/").pop();
  const schemaID = `${spec.info.version}_${schemaName}`
  // prevent infinite refs
  if (collectSchema.has(schemaID)) {
    return;
  }
  collectSchema.add(schemaID);
  const schemaObj = spec.components.schemas[schemaName];
  if (schemaObj.$ref) {
    describeRef({
      spec,
      ref: schemaObj.$ref,
      path,
      prefix: [],
      describeFn,
    });
  } else {
    describeSchema({
      spec,
      schema: schemaObj,
      path,
      describeFn,
      prefix: ["components", "schemas", schemaName],
    });
  }
};
const describeArraySchema = (params) => {
  const { spec, path, arraySchema, prefix, describeFn } = params;
  if (arraySchema.items.$ref) {
    describeRef({
      ref: arraySchema.items.$ref,
      spec,
      path,
      prefix: [],
      describeFn,
    });
  } else {
    describeSchema({
      schema: arraySchema.items,
      spec,
      path,
      prefix: prefix.concat(["items"]),
      describeFn,
    });
  }
  describeFn({ prefix, path });
};
const describeObjectSchema = (params) => {
  const { objectSchema, spec, path, prefix, describeFn } = params;
  for (const key in objectSchema.properties) {
    const completePath = `${path === "" ? "" : path + "."}${key}`;
    const value = objectSchema.properties[key];
    if (value.$ref) {
      describeRef({
        spec,
        path: completePath,
        ref: value.$ref,
        prefix: [],
        describeFn,
      });
    } else {
      describeSchema({
        spec,
        schema: value,
        path: completePath,
        prefix: prefix.concat(["properties", key]),
        describeFn,
      });
    }
  }
  describeFn({ prefix, path });
};

const describeAllOfSchema = (params) => {
  const { allOfSchema, spec, path, prefix, describeFn } = params;
  allOfSchema.allOf.forEach((item, index) => {
    if (item.$ref) {
      describeRef({
        spec,
        path,
        ref: item.$ref,
        prefix: [],
        describeFn,
      });
    } else {
      describeSchema({
        spec,
        describeFn,
        schema: item,
        path,
        prefix: prefix.concat(["allOf", index.toString()]),
      });
    }
  });
};

const describeEnum = (params) => {
  const { enumSchema, path, prefix, describeFn } = params;
  describeFn({
    prefix,
    path,
    description: enumSchema.enum.map((e) => `${e}: `).join("<br/>"),
  });
};
const describeAnyOfSchema = (params) => {
  const { anyOfSchema, spec, path, prefix, describeFn } = params;
  anyOfSchema.anyOf.forEach((item, index) => {
    if (item.ref) {
      describeRef({
        ref: item.$ref,
        path,
        spec,
        prefix: [],
        describeFn,
      });
    } else {
      describeSchema({
        schema: item,
        path,
        prefix: prefix.concat(["anyOf", index.toString()]),
        spec,
        describeFn,
      });
    }
  });
};
const describeSchema = (params) => {
  const { spec, schema, path, prefix, describeFn } = params;
  if (schema.type === "array") {
    describeArraySchema({
      spec,
      path,
      prefix,
      arraySchema: schema,
      describeFn,
    });
  } else if (schema.type === "object") {
    describeObjectSchema({
      spec,
      path,
      prefix,
      objectSchema: schema,
      describeFn,
    });
  } else if (schema.enum) {
    describeEnum({
      spec,
      enumSchema: schema,
      path,
      prefix,
      describeFn,
    });
  } else if (schema.allOf) {
    describeAllOfSchema({
      spec,
      allOfSchema: schema,
      path,
      prefix,
      describeFn,
    });
  } else if (schema.anyOf) {
    describeAnyOfSchema({
      spec,
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
  const { prefix, path, spec, api_name, describeFn } = parmas;
  const requestBody = spec.paths[api_name].post.requestBody;
  collectSchema.clear();
  if (requestBody.$ref) {
    describeRef({
      spec,
      path,
      prefix,
      ref: requestBody.$ref,
      describeFn,
    });
  } else if (requestBody.content) {
    Object.keys(requestBody.content).forEach((media) => {
      const { schema } = requestBody.content[media];
      if (schema.$ref) {
        describeRef({
          spec,
          path,
          prefix,
          describeFn,
          ref: schema.$ref,
        });
      } else {
        describeSchema({
          spec,
          path,
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
  const { spec, api, maxLimit, skip } = parameter;
  const params = [];
  const paths = new Set();
  const ApiTemplatePath = nodePath.resolve(__dirname, "../templates/api-template.ejs");
  const ApiTemplateContent = fs.readFileSync(ApiTemplatePath, "utf-8");
  const apiSpec = spec.paths[api];
  if(!apiSpec) {
    return ''
  }
  describeRequestBody({
    spec,
    path: "",
    prefix: [],
    api_name: api,
    describeFn: ({ prefix, path, description }) => {
      const schema = _.get(spec, prefix);
      /**
       * skip when:
       * 1. match ski filer
       * 2. path is empty
       * 3. path existed before
       * 4. path level is larger than maxLimit
       */
      const shouldSkip =
        (skip && skip.filter((s) => new RegExp(s).test(path)).length) ||
        !path ||
        paths.has(path) ||
        path.split('.').length > maxLimit;
      if (shouldSkip) {
        return;
      }
      paths.add(path);
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
}

module.exports = { getMarkDown, describeRequestBody }