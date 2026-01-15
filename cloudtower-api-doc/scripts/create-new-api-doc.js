#!/usr/bin/env node
const yargsInteractive = require("yargs-interactive");
const nodePath = require("path");
const fsExtra = require("fs-extra");
const _ = require('lodash');
const {
  getSchemaMarkdown,
  getLocalesFile,
} = require("./describe");
const versions = require('./versions.json')

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
  });

const getSwaggerPath = (v) =>
  nodePath.resolve(
    process.cwd(),
    nodePath.join('cloudtower-api-doc', 'static', 'specs',  `${v}-swagger.json`)
  );

// 获取上一个版本的 swagger spec 文件
const getPreviousSwaggerSpec = (currentVersion) => {
  const versionIndex = versions.findIndex((v) => v === currentVersion);
  if (versionIndex === -1 || versionIndex + 1 >= versions.length) {
    return null; // 没有上一个版本
  }
  
  // 从当前版本开始，查找第一个存在的 swagger 文件
  for (let i = versionIndex + 1; i < versions.length; i++) {
    const prevVersion = versions[i];
    const prevSwaggerPath = getSwaggerPath(prevVersion);
    if (fsExtra.existsSync(prevSwaggerPath) && fsExtra.statSync(prevSwaggerPath).isFile()) {
      try {
        return require(prevSwaggerPath);
      } catch (error) {
        console.warn(`Failed to load swagger spec for version ${prevVersion}:`, error.message);
        continue;
      }
    }
  }
  
  return null; // 没有找到存在的 swagger 文件
};

// 递归对比两个 schema 对象，找出新增字段的路径
// 返回新增字段路径的 Set（例如：['field1', 'field2.nested', 'field3.properties.subfield']）
const getNewSchemaFields = (currentSchema, previousSchema, pathPrefix = '') => {
  const newFields = new Set();
  
  // 如果上一个版本不存在该 schema，所有字段都是新的
  if (!previousSchema) {
    return newFields;
  }
  
  // 如果当前 schema 不是对象类型，无法对比字段
  if (!currentSchema || currentSchema.type !== 'object' || !currentSchema.properties) {
    return newFields;
  }
  
  // 如果上一个版本也不是对象类型，所有字段都是新的
  if (!previousSchema.properties) {
    return newFields;
  }
  
  // 对比 properties 中的字段
  for (const key in currentSchema.properties) {
    const currentField = currentSchema.properties[key];
    const previousField = previousSchema.properties[key];
    const fieldPath = pathPrefix ? `${pathPrefix}.${key}` : key;
    
    // 如果字段在上一个版本不存在，是新增字段
    if (!previousField) {
      newFields.add(fieldPath);
    } else {
      // 如果字段存在，递归检查嵌套对象
      if (currentField.type === 'object' && currentField.properties) {
        // 处理嵌套对象
        const nestedNewFields = getNewSchemaFields(
          currentField,
          previousField.type === 'object' ? previousField : null,
          fieldPath
        );
        nestedNewFields.forEach(field => newFields.add(field));
      } else if (currentField.type === 'array' && currentField.items) {
        // 处理数组类型，检查 items
        if (currentField.items.type === 'object' && currentField.items.properties) {
          const nestedNewFields = getNewSchemaFields(
            currentField.items,
            previousField.items && previousField.items.type === 'object' ? previousField.items : null,
            fieldPath
          );
          nestedNewFields.forEach(field => newFields.add(field));
        }
      }
      // 对于 $ref，我们无法深入对比，跳过
    }
  }
  
  return newFields;
};

const createNewApiLocales = async (version) => {
  const specAbsolutePath = getSwaggerPath(version);
  const pMap = (await import("p-map")).default;
  if (!fsExtra.statSync(specAbsolutePath).isFile()) {
    throw new Error(
      "this is not a json file, pelease check the proveded spec path: " +
        specAbsolutePath
    );
  }

  // 加载上一个版本的 swagger spec
  const previousSpec = getPreviousSwaggerSpec(version);
  
  await pMap(['zh', 'en'], async (lng) => {
    const spec = require(specAbsolutePath);
    const { paths, components } = spec;
    const outputLocalesPath = getLocalesFile(lng, version);
    const locales = fsExtra.existsSync(outputLocalesPath) ? require(outputLocalesPath) : {
      schemas: {},
      paths: {}
    };
    
    await pMap(Object.keys(components.schemas), async (schemaName) => {
      const existingSchema = locales.schemas[schemaName] || {};
      const currentSchemaObj = components.schemas[schemaName];
      
      // 获取上一个版本的 schema 对象
      const previousSchemaObj = previousSpec?.components?.schemas?.[schemaName] || null;
      
      // 找出新增字段路径
      const newFieldPaths = getNewSchemaFields(currentSchemaObj, previousSchemaObj);
      
      // 如果当前版本已有翻译，且没有新增字段，跳过
      if (Object.keys(existingSchema).length > 0 && newFieldPaths.size === 0) {
        return;
      }
      
      // 如果上一个版本不存在该 schema，视为全新 schema，生成所有字段
      if (!previousSchemaObj) {
        const content = await getSchemaMarkdown({
          schemaName,
          spec,
          locales,
          previousVersion: null,
          lng,
        });
        // 合并到现有翻译，保留已有翻译
        const merged = { ...existingSchema };
        for (const key in content) {
          if (!(key in merged) || merged[key] === '') {
            merged[key] = content[key];
          }
        }
        locales.schemas[schemaName] = merged;
        return;
      }
      
      // 如果有新增字段，只为新增字段生成翻译
      if (newFieldPaths.size > 0) {
        // 生成所有字段的翻译（getSchemaMarkdown 会处理所有字段）
        const allContent = await getSchemaMarkdown({
          schemaName,
          spec,
          locales,
          previousVersion: null,
          lng,
        });
        
        // 只保留新增字段的翻译
        const newFieldsContent = {};
        newFieldPaths.forEach(fieldPath => {
          if (allContent[fieldPath] !== undefined) {
            newFieldsContent[fieldPath] = allContent[fieldPath];
          }
        });
        
        // 合并到现有翻译，保留已有翻译，只添加新增字段
        const merged = { ...existingSchema };
        for (const key in newFieldsContent) {
          // 只添加不存在的字段或空字符串字段
          if (!(key in merged) || merged[key] === '') {
            merged[key] = newFieldsContent[key];
          }
        }
        locales.schemas[schemaName] = merged;
      }
      // 如果没有新增字段，且已有翻译，已经在第148行跳过了，这里不需要处理
    });

    // 获取上一个版本的 paths
    const previousPaths = previousSpec?.paths || {};
    
    await pMap(Object.keys(paths), async (api) => {
      const existingPath = locales.paths[api];
      
      // 检查该 path 是否在上一个版本存在
      const pathExistsInPrevious = api in previousPaths;
      
      // 如果 path 在上一个版本已存在，跳过处理
      if (pathExistsInPrevious) {
        // 如果当前版本已有翻译，保留
        if (existingPath) {
          locales.paths[api] = existingPath;
        }
        return;
      }
      
      // 如果 path 是新增的，创建占位符
      // 但如果当前版本已有翻译，保留不覆盖
      if (existingPath && (existingPath.summary || existingPath.description)) {
        locales.paths[api] = existingPath;
        return;
      }
      
      // 全新的 path，创建占位符
      locales.paths[api] = {
        summary: '',
        description: ''
      };
    });
    
    fsExtra.writeFileSync(outputLocalesPath, JSON.stringify(locales, null, 2), "utf-8");
  })
};
