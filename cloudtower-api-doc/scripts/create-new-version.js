#!/usr/bin/env node
const fs = require("fs");
const path = require("path");
const yargsInteractive = require("yargs-interactive");
const _ = require('lodash');
const swaggerSpecPath = "packages/operation-api/src/generated/swagger-3.0.json";
const downloadPath = path.resolve(__dirname, "../swagger/specs");
const commitJSON = require("./commit.json");
const { fetchGitLabFile } = require("./utils");

//we dont need examples, ommit them
const omitExamples = (spec) => {
  Object.keys(spec.components.schemas).forEach(schemaName => {
    _.unset(spec, ['components', 'schemas', schemaName, 'example'])
  })
  return spec;
}
const downloadFile = async (versions) => {
  /**
   * for some reason, the tag is not a good way to get the matched version,
   * so we hard code the version with the commit hash temporary
   * FYI: https://smartx1.slack.com/archives/GD3UU318A/p1637656081051600
   * and we fix some bugs when we develop v1.8.0, so it's better for only providing version >= 1.8.0
   */
  /**
   * v1.8.0:
   * as java sdk type problem, we reset v1.8.0 commit to 583ec54d48a05db60f12955a572cb7605132a051.
   */
  for (const version in versions) {
    const file = await fetchGitLabFile(swaggerSpecPath, versions[version]);
    const download_file_name = path.join(
      downloadPath,
      `${version}-swagger.json`
    );
    const spec = omitExamples(JSON.parse(file));
    fs.writeFileSync(
      download_file_name,
      JSON.stringify(
        {
          ...spec,
          servers: [],
        },
        null,
        2
      ),
      "utf-8"
    );
  }
};

yargsInteractive()
  .usage("$0 <command> [args]")
  .help("help")
  .alias("help", "h")
  .interactive({
    interactive: { default: true },
    doc_version: {
      description: "Provide new version",
      type: "input"
    },
  })
  .then((argv) => {
    const { doc_version } = argv;
    const commit = commitJSON[doc_version];
    if (!commit) {
      throw new Error(
        "can not find commit, please check the commit in commin.json"
      );
    }
    downloadFile(commitJSON).then(() => {
      const oldVersion = "v1.8.0";
      const copyDir = (rootDir) => {
        const oldDir = path.join(rootDir, `version-${oldVersion}`);
        const newDir = path.join(rootDir, `version-${doc_version}`);
        !fs.existsSync(newDir) && fs.mkdirSync(newDir);
        fs.readdirSync(oldDir).forEach((f) => {
          fs.copyFileSync(path.join(oldDir, f), path.join(newDir, f));
        });
      };
      // create new en files
      const enDocDir = path.resolve(
        __dirname,
        "../i18n/en/docusaurus-plugin-content-docs"
      );
      copyDir(enDocDir);
      fs.copyFileSync(
        path.join(enDocDir, `version-${oldVersion}.json`),
        path.join(enDocDir, `version-${doc_version}.json`)
      );

      // create new docs
      const docDir = path.resolve(__dirname, "../versioned_docs");
      copyDir(docDir);

      // create new version sidbars
      const sidebarDir = path.resolve(__dirname, "../versioned_sidebars");
      const sidebarContent = JSON.stringify(
        require(path.join(sidebarDir, `version-${oldVersion}-sidebars.json`)),
        null,
        2
      );
      fs.writeFileSync(
        path.join(sidebarDir, `version-${doc_version}-sidebars.json`),
        sidebarContent.replace(new RegExp(oldVersion, "g"), doc_version)
      );

      // add to versions.json
      const versions = require("../versions.json");
      fs.writeFileSync(
        path.join(__dirname, "../versions.json"),
        JSON.stringify(Array.from(new Set([doc_version, ...versions])), null, 2)
      );
    });
  });
