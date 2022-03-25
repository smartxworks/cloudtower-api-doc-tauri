#!/usr/bin/env node
const yargsInteractive = require("yargs-interactive");
const fs = require("fs");
const nodePath = require("path");
const { getMarkDown } = require('./describe');
const { Diff } = require('./diff');

yargsInteractive()
  .usage("$0 <command> [args]")
  .help("help")
  .alias("help", "h")
  .interactive({
    interactive:  { default: true },
    spec: {
      description: "Provide the relative file path of the swagger json file",
      type: "input",
    },
    output: {
      description: "Provide the relative dir path of the output markdown file",
      type: "input",
    },
    api: {
      description:
        "Provide the api name, starts with /, if you want to generate whole api doc, just leave it blank",
      type: "input",
    },
    diff: {
      description: "Provide the old json spec file you want to compare with, leave it blank when you don't want to compare",
      type: "input"
    },
    maxLimit: {
      description: "Provvide the max limit of object key path, otherwise it will generate all possible path",
      default: 3,
      type: "input"
    },
    skip: {
      description:
        "Provide the regex text, if you want to skip some params, eg: --skip where.AND where.OR",
      type: "input",
    },
  })
  .then(result => {
    createNewApiDoc(result);
  });

const createNewApiDoc = async (argv) => {
  const { spec: specPath, api, skip, output, maxLimit, diff } = argv;
  const specAbsolutePath = nodePath.resolve(process.cwd(), specPath);
  const skips = !skip.trim() ? undefined : skip.split(" ");
  if (!fs.existsSync(specAbsolutePath)) {
    throw new Error(
      "can not find spec file, please check your path, provided path is: " +
        specAbsolutePath
    );
  }
  if(!fs.statSync(specAbsolutePath).isFile()) {
    throw new Error(
      "this is not a json file, pelease check the proveded spec path: " +
        specAbsolutePath
    );
  }
  const outputPath = nodePath.resolve(process.cwd(), output);
  if (!fs.existsSync(outputPath)) {
    throw new Error(
      "can not find output dir path, please check you dir path, provided output path is: " +
        outputPath
    );
  }
  if (api && !api.startsWith("/")) {
    throw new Error("please provide api starts with /");
  }
  if(diff) {
    const diffSpecPath = nodePath.resolve(process.cwd(), diff);
    if(!fs.existsSync(diffSpecPath)) {
      throw new Error('can not find spec file path, check your path, provided path is: ', diffSpecPath);
    }
    return await Diff({oldSpec:diffSpecPath, newSpec:specAbsolutePath, maxLimit, skip:skips, outputPath})
  }
  const spec = JSON.parse(fs.readFileSync(specPath, "utf-8"));
  const apis = api ? [api] : Object.keys(spec.paths);
  await Promise.all(apis.map(api => new Promise((resolve, reject) => {
      const apiSpec = spec.paths[api];
      if (!apiSpec) {
        reject(`do not exist api: ${api} in spec file, pelase check it. spec file path: ${specPath}`)
      }
      const OutputApiPath = nodePath.join(outputPath, `${api}.md`);
      const content = getMarkDown({  spec, api, maxLimit, skip: skips })
      fs.writeFile(OutputApiPath, content, 'utf-8', () => resolve(true))
  })));
};

