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
    spec: {
      description: "Provide the relative file path of the swagger json file",
      type: "input",
    },
    output: {
      description: "Provide the relative dir path of the output markdown file",
      type: "input",
    },
    diff: {
      description:
        "Provide the old json spec file you want to compare with, leave it blank when you don't want to compare",
      type: "input",
    },
  })
  .then((result) => {
    createNewApiDoc(result);
  });

const createNewApiDoc = async (argv) => {
  const { spec: specPath, output, diff } = argv;
  const specAbsolutePath = nodePath.resolve(process.cwd(), specPath);
  const pMap = (await import("p-map")).default;
  if (!fsExtra.existsSync(specAbsolutePath)) {
    throw new Error(
      "can not find spec file, please check your path, provided path is: " +
        specAbsolutePath
    );
  }
  if (!fsExtra.statSync(specAbsolutePath).isFile()) {
    throw new Error(
      "this is not a json file, pelease check the proveded spec path: " +
        specAbsolutePath
    );
  }
  const outputApiPath = nodePath.resolve(process.cwd(), output, "paths");
  const outputSchemaPath = nodePath.resolve(process.cwd(), output, "schemas");
  const outputTagPath = nodePath.resolve(process.cwd(), output, "tags");
  [outputApiPath, outputSchemaPath, outputTagPath].forEach((path) =>
    fsExtra.ensureDirSync(path, { mode: 0777 })
  );
  let diffSpecPath;
  let diffSpec;
  if (diff) {
    diffSpecPath = nodePath.resolve(process.cwd(), diff);
    if (!fsExtra.existsSync(diffSpecPath)) {
      throw new Error(
        "can not find spec file path, check your path, provided path is: " +
          diffSpecPath
      );
    }
    diffSpec = require(diffSpecPath);
  }
  const spec = require(specAbsolutePath);
  const { paths, components } = spec;
  const tags = new Set();
  await pMap(Object.keys(components.schemas), async (schemaName) => {
    const outputSchemaFilePath = nodePath.join(
      outputSchemaPath,
      `${schemaName}.md`
    );
    const content = getSchemaMarkdown({ schemaName, spec });
    if (diff && diffSpec.components.schemas[schemaName]) {
      const diffContent = getSchemaMarkdown({ schemaName, spec: diffSpec });
      if (content === diffContent) {
        return;
      }
    }
    fsExtra.writeFileSync(outputSchemaFilePath, content, "utf-8");
  });
  await pMap(Object.keys(paths), (api) => {
    const outputApiFilePath = nodePath.join(outputApiPath, `${api}.md`);
    const content = getMarkDown({ spec, api });
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
      const diffContent = getMarkDown({ spec: diffSpec, api });
      if (content === diffContent) {
        return;
      }
    }
    fsExtra.writeFileSync(outputApiFilePath, content, "utf-8");
  });
  const outputTagFilePath = nodePath.join(outputTagPath, `tag.md`);
  const content = getTagsMarkdown(Array.from(tags));
  fsExtra.writeFileSync(outputTagFilePath, content);
};
