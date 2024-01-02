const { CommonParser } = require("sdk-example-generator");
const {
  parsePythonCommonDef,
} = require("sdk-example-generator/dist/helper/python");
const { parseGoCommonDef } = require("sdk-example-generator/dist/helper/go");
const {
  parseJavaCommonDef,
} = require("sdk-example-generator/dist/helper/java");
const {
  goTemplate,
  pythonTemplate,
  javaTemplate,
} = require("sdk-example-generator/dist/helper/hbs");
const fs = require("fs");
const path = require("path");
const _ = require("lodash");
const httpSnippet = require("httpsnippet");
const { program } = require('commander');

const genSchemaExample = (params) => {
  const { schema, schemaName, spec, field } = params;
  if (schema.$ref) {
    const refSchema = schema.$ref;
    const paths = refSchema.split("/").slice(1);
    return genSchemaExample({
      spec,
      schema: _.get(spec, paths),
      field: "",
      schemaName: paths[paths.length - 1],
    });
  } else if (schema.type === "array") {
    return [
      genSchemaExample({
        schema: schema.items,
        spec,
        field: "",
        schemaName: schemaName,
      }),
    ];
  } else if (schema.type === "object") {
    const { required, properties } = schema;
    const example = {};
    if (properties) {
      Object.entries(properties)
        .filter(([key]) => required?.includes(key))
        .forEach(([key, value]) => {
          example[key] = genSchemaExample({
            schema: value,
            spec,
            field: key,
            schemaName: schemaName,
          });
        });
    }
    if (
      _.get(properties, ["where", "allOf", 0, "$ref"]) &&
      (!required || !required.includes("where"))
    ) {
      const ref = _.get(properties, ["where", "allOf", 0, "$ref"]);
      const resource = ref
        .split("/")
        .pop()
        .replace("WhereInput", "")
        .replace("WhereUniqueInput", "");
      example["where"] = { id: `${resource}-id` };
    }
    if (
      schemaName.endsWith("WhereInput") ||
      schemaName.endsWith("WhereUniqueInput")
    ) {
      const resource = schemaName
        .replace("WhereInput", "")
        .replace("WhereUniqueInput", "");
      example["id"] = `${resource}-id`;
    }
    return example;
  } else if (schema.allOf) {
    let example = {};
    schema.allOf.forEach((schema) => {
      const value = genSchemaExample({
        spec,
        schema,
        schemaName,
        field: "",
      });
      example = { ...example, ...value };
    });
    return example;
  } else if (schema.anyOf) {
    return {};
  } else {
    const { type, enum: eValues } = schema;
    switch (type) {
      case "string": {
        if (eValues?.length) {
          return eValues[0];
        } else if (field.endsWith("id")) {
          return "ck74rk21wg5lz0786opdnzz5m";
        } else {
          return `${field}-string`;
        }
      }
      case "boolean": {
        return true;
      }
      case "integer": {
        return 1;
      }
      case "number": {
        return 1;
      }
    }
    return "";
  }
};

async function genSnippet(specPath, input) {
  const parser = new CommonParser();
  await parser.init(specPath);
  const commonDef = await parser.parse(input);
  const pythonDef = parsePythonCommonDef(commonDef);
  const goDef = parseGoCommonDef(commonDef);
  const javaDef = parseJavaCommonDef(commonDef);
  const pythonFile = pythonTemplate(pythonDef);
  const goFile = goTemplate(goDef);
  const javaFile = javaTemplate(javaDef)

  return {
    python: pythonFile,
    go: goFile,
    java: javaFile,
  };
}

const excludePaths = [
  // "/create-vds-with-migrate-vlan",
  // "/create-vds-with-access-vlan",

  // "/delete-log-collection",
  // "/force-stop-log-collection",
  // "/create-log-collection",
  // "/update-alert-notifier",
  // "/move-node-topo",
  // "/create-nvmf-subsystem",
  // "/update-nvmf-subsystem",
  // "/delete-nvmf-subsystem",
];
const traveseSpec = async (specPath) => {
  const example = {};
  const spec = require(specPath);
  const { paths } = spec;
  await Promise.all(
    Object.keys(paths).map(async (p) => {
      const method = Object.keys(paths[p])[0];
      const operationObj = paths[p][method];
      if (_.get(operationObj, ["requestBody", "content"])) {
        for (const meta of Object.keys(operationObj.requestBody.content)) {
          const exampleValue = genSchemaExample({
            schema: operationObj.requestBody.content[meta].schema,
            spec,
            field: "",
            schemaName: "",
          });

          const snippet = new httpSnippet({
            method: method.toUpperCase(),
            url: `http://YOUR_TOWER_URL/v2/api${p}`,
            headers: [
              { name: "Authorization", value: "YOUR_TOKEN" },
              {
                name: "Content-Language",
                value: "en-US",
                comment: "en-US or zh-CN",
              },
              {
                name: "Content-Type",
                value: meta,
              },
            ],
            postData: {
              mimeType: "application/json",
              text: JSON.stringify(exampleValue),
            },
          });

          example[p] = {
            exampleValue,
            curl: snippet.convert("shell", "curl", {
              indent: "\t",
              short: true,
            }),
          };
          if (!excludePaths.includes(p)) {
            // try {
              const sdkSnippet = await genSnippet(specPath, {
                path: p,
                input: exampleValue,
                returnName: "resp",
                paramName: "params",
              });
              example[p] = {
                ...example[p],
                ...sdkSnippet,
              };
            // } catch(err) {
            //   console.log(example[p])
            //   console.error('generate example for failed!', p, err)
            // }
     
          }
        }
      }
    })
  );
  return example;
};

const main = async (version) => {
  const filePath = path.join(__dirname, "../static/specs", `${version}-swagger.json`);
  const examplePath = path.join(
    __dirname,
    "../swagger/examples",
    `swagger-examples.json`
  );
  const examples = await traveseSpec(filePath);
  fs.writeFileSync(examplePath, JSON.stringify(examples, null, 2));
};



program
  .requiredOption('-v --version <char>')
program.parse();
main(program.opts().version);

