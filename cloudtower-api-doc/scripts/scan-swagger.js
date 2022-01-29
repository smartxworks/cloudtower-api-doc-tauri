const fs = require("fs");
const path = require("path");
const { getLocales, writeLoclaes } = require("./utils");

const scan = () => {
  const specDir = path.resolve(__dirname, "../swagger/specs");
  fs.readdirSync(specDir).forEach((f) => {
    // scan swagger
    const specContext = require(path.join(specDir, f));
    const { zhLocalesPath: tagZhLocalesFile, enLocalesPath: tagEnLocalesFile } =
      getLocales("tags");
    const { zhLocalesPath: desZhLocalesFile, enLocalesPath: desEnLocalesFile } =
      getLocales("description");
    const {
      zhLocalesPath: paramsZhLocalesFile,
      enLocalesPath: paramsEnLocalesFile,
    } = getLocales("parameters");
    const { paths, components } = specContext;
    const { schemas } = components;
    const tagLocales = {};
    const desLocales = {};
    const paramsLocales = {};
    const isIgnoreParams = (schemaName, field) => {
      return (
        ["OR", "NOT", "AND", "aggregate", "__typename", "after", "before", "first", "last", "orderBy", "skip"].includes(field) ||
        schemaName.endsWith("WhereInput") ||
        schemaName.endsWith('WhereUniqueInput') ||
        schemaName.startsWith('Nested') ||
        schemaName.startsWith('WithTask')
      );
    };
    const collectParams = (schemaName, schemaContent, schemas) => {
      if (schemaContent.allOf) {
        for (const prop of schemaContent.allOf) {
          collectParams(schemaName, prop, schemas);
        }
      } else if (schemaContent.type === "array") {
        for (const prop in schemaContent.items.properties) {
          if (schemaContent.items.properties[prop].anyOf) {
            for (const data of schemaContent.items.properties[prop].anyOf) {
              collectParams(schemaName, data, schemas);
            }
          }
        }
      } else if (schemaContent["$ref"]) {
        collectParams(
          schemaName,
          schemas[schemaContent["$ref"].split("/").pop()],
          schemas
        );
      } else if (schemaContent.properties) {
        for (const prop in schemaContent.properties) {
          if (prop === "where") {
            continue;
          }
          if (schemaContent.properties[prop].properties) {
            for (const sub_prop in schemaContent.properties[prop].properties) {
              paramsLocales[`${schemaName}_${prop}_${sub_prop}`] = "";
            }
          }
          if (!isIgnoreParams(schemaName, prop)) {
            paramsLocales[`${schemaName}_${prop}`] = "";
          }
        }
      } else {
        console.warn("unhandled schema", schemaName);
      }
    };
    Object.keys(paths).forEach((p) => {
      const { tags, requestBody } = paths[p].post;
      desLocales[p] = "";
      if (tags) {
        tags.forEach((tag) => {
          tagLocales[tag] = "";
        });
      }
      if (!p.startsWith("/get-")) {
        if (requestBody.content["multipart/form-data"]) {
          const { properties } =
            requestBody.content["multipart/form-data"].schema;
          for (const prop in properties) {
            paramsLocales[`${p}_${prop}`] = "";
          }
        }
      }
    });
    Object.keys(schemas).forEach((schemaName) =>
      collectParams(schemaName, schemas[schemaName], schemas)
    );
    writeLoclaes({
      en: { locales: tagLocales, localesPath: tagEnLocalesFile },
      zh: { locales: tagLocales, localesPath: tagZhLocalesFile },
    });
    writeLoclaes({
      en: { locales: desLocales, localesPath: desEnLocalesFile },
      zh: { locales: desLocales, localesPath: desZhLocalesFile },
    });
    writeLoclaes({
      en: { locales: paramsLocales, localesPath: paramsEnLocalesFile },
      zh: { locales: paramsLocales, localesPath: paramsZhLocalesFile },
    });
  });
};

scan();
