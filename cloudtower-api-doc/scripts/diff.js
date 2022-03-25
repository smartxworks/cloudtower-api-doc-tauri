const nodePath = require('path');
const fs = require('fs');
const { getMarkDown } = require('./describe');

const Diff = async (params) => {
  const { newSpec, oldSpec, maxLimit, skip, outputPath } = params;
  const oldSpecJson = JSON.parse(fs.readFileSync(oldSpec, "utf-8"));
  const newSpecJson = JSON.parse(fs.readFileSync(newSpec, 'utf-8'));
  await Promise.all(Object.keys(newSpecJson.paths).map(api => new Promise((resolve) => {
    const newMDContent = getMarkDown({ spec: newSpecJson,  api, maxLimit, skip  })
    const oldMdContent = getMarkDown({ spec: oldSpecJson, api, maxLimit, skip })
    if(newMDContent !== oldMdContent) {
      const OutputApiPath = nodePath.join(outputPath, `${api}.md`);
      fs.writeFile(OutputApiPath, newMDContent, 'utf-8', () => resolve(true))
    } else {
      resolve();
    }
  })))
}
module.exports = { Diff }