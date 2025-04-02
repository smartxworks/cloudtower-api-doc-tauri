#!/usr/bin/env node
const yargsInteractive = require("yargs-interactive");
const nodePath = require("path");
const fsExtra = require("fs-extra");
const _ = require("lodash");
const { getSchemaMarkdown, getLocalesFile } = require("./describe");
const versions = require("./versions.json");

yargsInteractive()
  .usage("$0 <command> [args]")
  .help("help")
  .alias("help", "h")
  .interactive({
    interactive: { default: true },
    version: {
      description: "Provide swagger json file version to update",
      type: "input",
    },
  })
  .then((result) => {
    const { version } = result;
    updateApiLocales(version);
  });
const getSwaggerPath = (v) =>
  nodePath.resolve(
    process.cwd(),
    nodePath.join("cloudtower-api-doc", "static", "specs", `${v}-swagger.json`)
  );

/**
 * Incrementally update API documentation localization files
 * @param {string} version - Swagger file version
 */
const updateApiLocales = async (version) => {
  const traverPreviousVersion = async (current_version, onGetDiffSpec) => {
    let early_break = false;
    let versionIndex = versions.findIndex((v) => v === current_version) + 1;
    while (!early_break && versionIndex < versions.length) {
      const diff = versions[versionIndex];
      early_break = await onGetDiffSpec(diff);
      versionIndex += 1;
    }
  };

  const specAbsolutePath = getSwaggerPath(version);
  const pMap = (await import("p-map")).default;

  if (
    !fsExtra.existsSync(specAbsolutePath) ||
    !fsExtra.statSync(specAbsolutePath).isFile()
  ) {
    throw new Error(
      "Swagger file does not exist or has invalid format, please check the provided path: " +
        specAbsolutePath
    );
  }

  await pMap(["zh", "en"], async (lng) => {
    const spec = require(specAbsolutePath);
    const { paths, components } = spec;
    const tags = new Set();
    const outputLocalesPath = getLocalesFile(lng, version);

    // Read existing localization file (if exists)
    let locales = fsExtra.existsSync(outputLocalesPath)
      ? require(outputLocalesPath)
      : {
          schemas: {},
          tags: [],
          paths: {},
        };

    // Process schemas
    await pMap(Object.keys(components.schemas), async (schemaName) => {
      let diffSchema;
      let previousVersion;

      // Find the same schema in previous versions
      await traverPreviousVersion(version, async (previous) => {
        const previousLocalesPath = getLocalesFile(lng, previous);
        if (fsExtra.existsSync(previousLocalesPath)) {
          const previousLocales = require(previousLocalesPath);
          diffSchema = previousLocales.schemas[schemaName];
          if (diffSchema) {
            previousVersion = previous;
            return diffSchema;
          }
        }
        return false;
      });

      // Get new schema content
      const content = await getSchemaMarkdown({
        schemaName,
        spec,
        locales,
        previousVersion: previousVersion,
        lng,
      });

      // If keys are identical, no update needed
      if (
        Object.keys(diffSchema || {}).join("") ===
        Object.keys(content || {}).join("")
      ) {
        _.unset(locales, ["schemas", schemaName]);
        return;
      }

      // If content is identical, no update needed
      if (JSON.stringify(diffSchema) === JSON.stringify(content)) {
        return;
      }

      // Merge existing and new schema descriptions
      if (locales.schemas[schemaName]) {
        // Use existing content as base, add new fields
        const existingSchema = locales.schemas[schemaName];
        for (const key in content) {
          if (!existingSchema[key] || existingSchema[key] === "") {
            existingSchema[key] = content[key];
          }
        }
      } else {
        // If not exists, use new content
        locales.schemas[schemaName] = content;
      }
    });

    // Process paths
    await pMap(Object.keys(paths), async (api) => {
      const tagList = spec.paths[api].post
        ? spec.paths[api].post.tags
        : spec.paths[api].get.tags;
      if (tagList) {
        tagList.forEach((tag) => tags.add(tag));
      }

      // Check if this API exists in previous versions
      let diffContent;
      await traverPreviousVersion(version, async (previous) => {
        const previousLocalesPath = getLocalesFile(lng, previous);
        if (fsExtra.existsSync(previousLocalesPath)) {
          const previousLocales = require(previousLocalesPath);
          diffContent = previousLocales.paths[api];
          return diffContent;
        }
        return false;
      });

      // If API exists in previous version, skip it
      if (diffContent) {
        return;
      }

      // If current version doesn't have this API description, add empty one
      if (!locales.paths[api]) {
        locales.paths[api] = {
          summary: "",
          description: "",
        };
      }
    });

    // Process tags
    // Find unique tags that only appear in current version
    const uniqueTags = new Set(tags);
    await traverPreviousVersion(version, async (previous) => {
      const previousSpecPath = getSwaggerPath(previous);
      if (fsExtra.existsSync(previousSpecPath)) {
        const previousSpec = require(previousSpecPath);

        await pMap(Object.keys(previousSpec.paths || {}), async (api) => {
          const tagList =
            _.get(previousSpec, ["paths", api, "post", "tags"]) ||
            _.get(previousSpec, ["paths", api, "get", "tags"]) ||
            [];

          tagList.forEach((tag) => {
            if (uniqueTags.has(tag)) {
              uniqueTags.delete(tag);
            }
          });
        });
      }
      return uniqueTags.size === 0;
    });

    // Add unique tags
    if (uniqueTags.size) {
      uniqueTags.forEach((tag) => {
        // Check if tag already exists in locales
        if (!locales.tags.find((t) => t.name === tag)) {
          locales.tags.push({
            name: tag,
            "x-displayName": "",
            description: "",
          });
        }
      });
    }

    // Write updated localization data to file
    fsExtra.writeFileSync(
      outputLocalesPath,
      JSON.stringify(locales, null, 2),
      "utf-8"
    );
    console.log(
      `Updated ${lng} language API documentation (version: ${version})`
    );
  });
};
