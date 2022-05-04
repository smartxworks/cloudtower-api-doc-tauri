#!/usr/bin/env node
const yargsInteractive = require("yargs-interactive");
const nodePath = require("path");
const fsExtra = require("fs-extra");
const {
  getMarkDown,
  getSchemaMarkdown,
  getTagsMarkdown,
} = require("./describe");

yargsInteractive()
  .usage("$0 <command> [args]")
  .help("help")
  .alias("help", "h")
  .interactive({
    interactive: { default: true },
    version: {
      description: "Provide swagger json file version",
      type: "input",
    },
    diff: {
      description:
        "Provide the old json spec file version you want to compare with, leave it blank when you don't want to compare",
      type: "input",
    },
    lng: {
      description: "zh or en",
      type: "input"
    },
  })
  .then((result) => {
    createNewApiDoc(result);
  });

const createNewApiDoc = async (argv) => {
  const { version, diff } = argv;
  let { lng } = argv;
  const getSwaggerPath = (v) => nodePath.resolve(process.cwd(), './cloudtower-api-doc/swagger/specs/', `${v}-swagger.json`);
  const specAbsolutePath = getSwaggerPath(version);
  const pMap = (await import("p-map")).default;
  if (!fsExtra.statSync(specAbsolutePath).isFile()) {
    throw new Error(
      "this is not a json file, pelease check the proveded spec path: " +
        specAbsolutePath
    );
  }
  if(!lng) { lng = 'zh' }
  const outputBasePath = nodePath.resolve(process.cwd(), "./cloudtower-api-doc/markdown/", lng, version );
  const outputApiPath = nodePath.join(outputBasePath, "paths");
  const outputSchemaPath = nodePath.join(outputBasePath, "schemas");
  const outputTagPath = nodePath.join(outputBasePath, "tags");
  [outputApiPath, outputSchemaPath, outputTagPath].forEach((path) =>
    fsExtra.ensureDirSync(path, { mode: 0777 })
  );
  let diffSpecPath;
  let diffBasePath;
  let diffSpec;
  if (diff) {
    diffSpecPath = getSwaggerPath(diff);
    if (!fsExtra.existsSync(diffSpecPath)) {
      throw new Error(
        "can not find spec file path, check your path, provided path is: " +
          diffSpecPath
      );
    }
    diffSpec = require(diffSpecPath);
    diffBasePath = nodePath.resolve(process.cwd(), "./cloudtower-api-doc/markdown/", lng, diff );
  }
  const spec = require(specAbsolutePath);
  const { paths, components } = spec;
  const tags = new Set();
  await pMap(Object.keys(components.schemas), async (schemaName) => {
    const outputSchemaFilePath = nodePath.join(
      outputSchemaPath,
      `${schemaName}.md`
    );
    let diffSchema;
    if (diff && diffSpec.components.schemas[schemaName]) {
      const outputDiffSchemaFilePath = nodePath.join(diffBasePath, "schemas", `${schemaName}.md`);
      diffSchema = await getSchemaMarkdown({ schemaName, spec: diffSpec, output: outputDiffSchemaFilePath });
    }
    const { content } = await getSchemaMarkdown({ schemaName, spec, output: outputSchemaFilePath, previous: diffSchema ? diffSchema.params : undefined});
    if(diffSchema && diffSchema.content === content) { return;}
    fsExtra.writeFileSync(outputSchemaFilePath, content, "utf-8");
  });
  await pMap(Object.keys(paths), async (api) => {
    const outputApiFilePath = nodePath.join(outputApiPath, `${api}.md`);
    const content = await getMarkDown({ spec, api, language: lng, output:outputApiFilePath});
    const tagList = spec.paths[api].post.tags;
    if (tagList) {
      tagList.forEach(tag => tags.add(tag));
    }
    if (diff && diffSpec.paths[api]) {
      const diffTagList = diffSpec.paths[api].post.tags;
      if (diffTagList) {
        diffTagList.forEach((tag) => {
          if (tags.has(tag)) {
            tags.delete(tag);
          }
        });
      }
      const diffContent = await getMarkDown({ spec: diffSpec, api, language: lng, output: outputApiFilePath});
      if (content === diffContent) {
        return;
      }
    }
    fsExtra.writeFileSync(outputApiFilePath, content, "utf-8");
  });
  const outputTagFilePath = nodePath.join(outputTagPath, `tag.md`);
  const content = await getTagsMarkdown(Array.from(tags), outputTagFilePath);
  fsExtra.writeFileSync(outputTagFilePath, content);
};
