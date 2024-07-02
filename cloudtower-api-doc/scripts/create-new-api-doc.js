#!/usr/bin/env node
const yargsInteractive = require("yargs-interactive");
const nodePath = require("path");
const fsExtra = require("fs-extra");
const _ = require('lodash');
const {
  getSchemaMarkdown,
  getLocalesFile,
} = require("./describe");

const versions = [
  '4.2.0',
  '4.0.0',
  '3.4.0',
  "3.3.0",
  "3.2.0",
  '3.1.0',
  '3.0.0',
  '2.8.0',
  '2.7.0',
  '2.6.0',
  '2.5.0',
  '2.4.0',
  '2.3.0',
  '2.2.0',
  '2.1.0',
  '2.0.0',
  '1.10.0',
  '1.9.0',
  '1.8.0'
];

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
  })
  .then((result) => {
    const { version } = result;
    createNewApiLocales(version);
    // createNewApiDoc(version);
  });


const getPrevVersion = (v) => {
  if(versions.indexOf(v) < 0) {
    return versions[0]
  }
  return versions[versions.indexOf(v) + 1];
}
const getSwaggerPath = (v) =>
  nodePath.resolve(
    process.cwd(),
    nodePath.join('cloudtower-api-doc', 'static', 'specs',  `${v}-swagger.json`)
  );

const getVersionedPath =(version, isEn) => {
  let versionedPath = nodePath.join('versioned_docs', `version-${version}`);
  if(isEn) {
    versionedPath = nodePath.join('i18n', 'en', 'docusaurus-plugin-content-docs', `version-${version}`)
  }
  return nodePath.resolve(process.cwd(), nodePath.join('cloudtower-api-doc', versionedPath))
}

const createNewApiDoc = async (version) => {
  const prevVersion = getPrevVersion(version);
  const pMap = (await import("p-map")).default;
  await pMap(['zh', 'en'], async (lng) => {
    const versiondPath = getVersionedPath(version, lng === 'en');
    const prevVersionPath = getVersionedPath(prevVersion, lng === 'en');
    fsExtra.copySync(prevVersionPath, versiondPath);
    fsExtra.readdirSync(versiondPath).forEach(file => {
      if(file === 'download.md') {
        const completePath = nodePath.join(versiondPath, file);
        fsExtra.writeFileSync(completePath, fsExtra.readFileSync(completePath, 'utf-8').replaceAll(prevVersion, version), 'utf-8')
      }
    })
  })
}

const createNewApiLocales = async (version) => {
  const traverPreviousVersion = async (current_version, onGetDiffSpec) => {
    let early_break = false;
    let versionIndex = versions.findIndex((v) => v === current_version) + 1;
    versionIndex = versions.findIndex((v) => v === current_version) + 1;
    while (!early_break && versionIndex < versions.length) {
      const diff = versions[versionIndex];
      early_break = await onGetDiffSpec(diff);
      versionIndex += 1;
    }
  };

  const specAbsolutePath = getSwaggerPath(version);
  const pMap = (await import("p-map")).default;
  if (!fsExtra.statSync(specAbsolutePath).isFile()) {
    throw new Error(
      "this is not a json file, pelease check the proveded spec path: " +
        specAbsolutePath
    );
  }

  await pMap(['zh', 'en'], async (lng) => {
    const spec = require(specAbsolutePath);
    const { paths, components } = spec;
    const tags = new Set();
    const outputLocalesPath = getLocalesFile(lng, version);
    const locales = fsExtra.existsSync(outputLocalesPath) ? require(outputLocalesPath) : {
      schemas: {},
      tags: [],
      paths: {}
    };
    await pMap(Object.keys(components.schemas), async (schemaName) => {
      let diffSchema;
      let previousVersion;
      await traverPreviousVersion(version, async (previous) => {
        const previousLocales = require(getLocalesFile(lng, previous));
        diffSchema = previousLocales.schemas[schemaName]
        if(diffSchema) {
          previousVersion = previous;
          return diffSchema;
        }
      });
      const content = await getSchemaMarkdown({
        schemaName,
        spec,
        locales,
        previousVersion: previousVersion,
        lng,
      });
      if(Object.keys(diffSchema || {}).join('') === Object.keys(content || {}).join('')) {
        _.unset(locales, ['schemas', schemaName]);
      }
      if (JSON.stringify(diffSchema) === JSON.stringify(content)) {
        return;
      }
      locales.schemas[schemaName] = content;
    });

    await pMap(Object.keys(paths), async (api) => {
      const content = locales.paths[api];
      const tagList = spec.paths[api].post ? spec.paths[api].post.tags : spec.paths[api].get.tags;
      if (tagList) {
        tagList.forEach((tag) => tags.add(tag));
      }
      let diffContent;
      await traverPreviousVersion(version, async (previous) => {
        const previousLocales = require(getLocalesFile(lng, previous));
        diffContent = previousLocales.paths[api];
        return diffContent;
      });
      if (diffContent) {
        return;
      }
      locales.paths[api] = content || {
        summary: '',
        description: ''
      };
    });
    await traverPreviousVersion(version, async (previous) => {
      const previousSpec = require(getSwaggerPath(previous));
      await pMap(Object.keys(previousSpec.paths), async (api) => {
        const tagList = _.get(previousSpec, ['paths', api, 'post', 'tags'])
        tagList &&
          tagList.forEach((tag) => {
            if (tags.has(tag)) {
              tags.delete(tag);
            }
          });
      });
      return tags.length === 0;
    });
    if (tags.size) {
      tags.forEach(tag => {
        if(locales.tags.find(t => t.name === tag)) { return; }
        locales.tags.push({
          name: tag,
          "x-displayName": "",
          "description": ""
        })
      })
    }
    fsExtra.writeFileSync(outputLocalesPath, JSON.stringify(locales, null, 2), "utf-8");
  })
};
