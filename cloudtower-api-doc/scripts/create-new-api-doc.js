#!/usr/bin/env node
const yargsInteractive = require("yargs-interactive");
const nodePath = require("path");
const fsExtra = require("fs-extra");
const _ = require('lodash');
const {
  getSchemaMarkdown,
  getLocalesFile,
} = require("./describe");

const getSwaggerPath = (v) =>
  nodePath.resolve(
    process.cwd(),
    nodePath.join('cloudtower-api-doc', 'static', 'specs',  `${v}-swagger.json`)
  );

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
  .then(async (result) => {
    const { version } = result;
    // 检查 swagger 文件是否存在
    const swaggerPath = getSwaggerPath(version);
    if (!fsExtra.existsSync(swaggerPath) || !fsExtra.statSync(swaggerPath).isFile()) {
      throw new Error(
        `Swagger file does not exist: ${swaggerPath}\n` +
        `Please ensure the swagger file exists before running this script.`
      );
    }
    // 先更新配置文件
    await updateConfigFiles(version);
    // 然后创建翻译文件
    await createNewApiLocales(version);
  });

// 将版本号转换为命名空间格式（例如: "4.7.0" -> "4_7_0"）
const versionToNs = (version) => {
  return version.split('.').join('_');
};

// 将版本号转换为变量名格式
// 例如: "4.7.0" -> "4_7API", "4.4.1" -> "4_4_1API", "2.8.0" -> "2_xAPI"
const versionToVarName = (version) => {
  const parts = version.split('.');
  const major = parts[0];
  const minor = parts[1];
  const patch = parts[2];
  
  // 特殊处理 2.8.0 和 3.4.4
  if (version === '2.8.0' || version === '3.4.4') {
    return `${major}_xAPI`;
  }
  
  // 如果 patch 是 0，格式为 "4_0API"
  if (patch === '0') {
    return `${major}_${minor}API`;
  }
  
  // 否则格式为 "4_4_1API"
  return `${major}_${minor}_${patch}API`;
};

/**
 * 更新 versions.json 文件
 */
function updateVersionsJson(version) {
  const versionsPath = nodePath.resolve(__dirname, './versions.json');
  const versions = JSON.parse(fsExtra.readFileSync(versionsPath, 'utf-8'));
  
  // 检查版本是否已存在
  if (versions.includes(version)) {
    console.log(`✓ versions.json 中已存在版本 ${version}，跳过更新`);
    return false;
  }
  
  // 在数组开头添加新版本
  versions.unshift(version);
  fsExtra.writeFileSync(versionsPath, JSON.stringify(versions, null, 2) + '\n', 'utf-8');
  console.log(`✓ 已更新 versions.json，添加版本 ${version}`);
  return true;
}

/**
 * 更新 i18n.ts 文件
 */
function updateI18nTs(version) {
  const i18nPath = nodePath.resolve(__dirname, '../swagger/i18n.ts');
  let content = fsExtra.readFileSync(i18nPath, 'utf-8');
  
  const ns = versionToNs(version);
  const varNameZh = `zh${versionToVarName(version)}`;
  const varNameEn = `en${versionToVarName(version)}`;
  const importPathZh = `./locales/zh/${version}.json`;
  const importPathEn = `./locales/en/${version}.json`;
  
  // 检查是否已存在该版本的 import（使用更精确的匹配）
  const importRegexZh = new RegExp(`import\\s+${varNameZh}\\s+from\\s+["']${importPathZh.replace(/\./g, '\\.')}["']`, 'g');
  const importRegexEn = new RegExp(`import\\s+${varNameEn}\\s+from\\s+["']${importPathEn.replace(/\./g, '\\.')}["']`, 'g');
  
  if (importRegexZh.test(content) || importRegexEn.test(content)) {
    console.log(`✓ i18n.ts 中已存在版本 ${version} 的导入，跳过更新`);
    return false;
  }
  
  // 查找最后一个 import 语句的位置（在 components import 之前）
  // 匹配所有版本 import 语句（包括 2_x, 3_x 等）
  const importPattern = /import\s+(zh|en)\d+.*API\s+from\s+["'].*\.json["'];?\n/g;
  const allImports = content.match(importPattern);
  if (!allImports || allImports.length === 0) {
    console.warn(`⚠ 无法找到合适的插入位置，请手动更新 i18n.ts`);
    return false;
  }
  
  // 找到最后一个 import 的位置
  const lastImport = allImports[allImports.length - 1];
  const lastImportIndex = content.lastIndexOf(lastImport);
  const insertIndex = lastImportIndex + lastImport.length;
  
  const newImports = `import ${varNameZh} from "${importPathZh}";\nimport ${varNameEn} from "${importPathEn}";\n\n`;
  content = content.slice(0, insertIndex) + newImports + content.slice(insertIndex);
  
  // 更新 fallbackNS 数组（在开头添加）
  const fallbackNSMatch = content.match(/export const fallbackNS = \[([\s\S]*?)\];/);
  if (fallbackNSMatch) {
    const fallbackNSContent = fallbackNSMatch[1];
    // 检查是否已存在
    if (!fallbackNSContent.includes(`"${ns}"`)) {
      const newFallbackNS = `export const fallbackNS = [\n  "${ns}",${fallbackNSContent.trim() ? '\n' + fallbackNSContent.trim() : ''}\n];`;
      content = content.replace(fallbackNSMatch[0], newFallbackNS);
    }
  }
  
  // 更新 resources 中的 en 部分
  // 找到最后一个版本条目的位置，在其后插入新版本
  const enResourcesMatch = content.match(/(\[SupportLanguage\.en\]: \{)([\s\S]*?)(\s+components: enComponents,)/);
  if (enResourcesMatch) {
    const resourcesContent = enResourcesMatch[2];
    // 使用更精确的检查，避免误判
    const nsRegex = new RegExp(`\\["${ns.replace(/\./g, '\\.')}"\\]`, 'g');
    if (!nsRegex.test(resourcesContent)) {
      // 找到最后一个版本条目（格式为 ["4_7_0"]: en4_7API,）
      const lastVersionMatch = resourcesContent.match(/(\s+\["[^"]+"\]:\s+\w+API,?\n)/g);
      if (lastVersionMatch && lastVersionMatch.length > 0) {
        const lastVersion = lastVersionMatch[lastVersionMatch.length - 1];
        const lastVersionIndex = resourcesContent.lastIndexOf(lastVersion);
        const insertIndex = lastVersionIndex + lastVersion.length;
        const newResourceEntry = `      ["${ns}"]: ${varNameEn},\n`;
        const newResourcesContent = resourcesContent.slice(0, insertIndex) + newResourceEntry + resourcesContent.slice(insertIndex);
        content = content.replace(enResourcesMatch[0], enResourcesMatch[1] + newResourcesContent + enResourcesMatch[3]);
      } else {
        // 如果找不到，直接在开头添加
        const newResourceEntry = `      ["${ns}"]: ${varNameEn},\n`;
        content = content.replace(enResourcesMatch[0], enResourcesMatch[1] + newResourceEntry + resourcesContent + enResourcesMatch[3]);
      }
    }
  }
  
  // 更新 resources 中的 zh 部分
  const zhResourcesMatch = content.match(/(\[SupportLanguage\.zh\]: \{)([\s\S]*?)(\s+components: zhComponents,)/);
  if (zhResourcesMatch) {
    const resourcesContent = zhResourcesMatch[2];
    // 使用更精确的检查，避免误判
    const nsRegex = new RegExp(`\\["${ns.replace(/\./g, '\\.')}"\\]`, 'g');
    if (!nsRegex.test(resourcesContent)) {
      // 找到最后一个版本条目
      const lastVersionMatch = resourcesContent.match(/(\s+\["[^"]+"\]:\s+\w+API,?\n)/g);
      if (lastVersionMatch && lastVersionMatch.length > 0) {
        const lastVersion = lastVersionMatch[lastVersionMatch.length - 1];
        const lastVersionIndex = resourcesContent.lastIndexOf(lastVersion);
        const insertIndex = lastVersionIndex + lastVersion.length;
        const newResourceEntry = `      ["${ns}"]: ${varNameZh},\n`;
        const newResourcesContent = resourcesContent.slice(0, insertIndex) + newResourceEntry + resourcesContent.slice(insertIndex);
        content = content.replace(zhResourcesMatch[0], zhResourcesMatch[1] + newResourcesContent + zhResourcesMatch[3]);
      } else {
        // 如果找不到，直接在开头添加
        const newResourceEntry = `      ["${ns}"]: ${varNameZh},\n`;
        content = content.replace(zhResourcesMatch[0], zhResourcesMatch[1] + newResourceEntry + resourcesContent + zhResourcesMatch[3]);
      }
    }
  }
  
  // 更新 ns 数组（在开头添加）
  const nsMatch = content.match(/ns:\s*\[([\s\S]*?)\],/);
  if (nsMatch) {
    const nsContent = nsMatch[1];
    // 使用更精确的检查，避免误判
    const nsRegex = new RegExp(`"${ns.replace(/\./g, '\\.')}"`, 'g');
    if (!nsRegex.test(nsContent)) {
      // 格式化 ns 数组，确保正确的缩进
      const trimmedContent = nsContent.trim();
      const newNs = trimmedContent 
        ? `ns: [\n    "${ns}",\n${trimmedContent.split('\n').map(line => '    ' + line.trim()).join('\n')}\n  ],`
        : `ns: [\n    "${ns}",\n  ],`;
      content = content.replace(nsMatch[0], newNs);
    }
  }
  
  fsExtra.writeFileSync(i18nPath, content, 'utf-8');
  console.log(`✓ 已更新 i18n.ts，添加版本 ${version}`);
  return true;
}

/**
 * 更新 swagger.ts 文件
 */
function updateSwaggerTs(version) {
  const swaggerPath = nodePath.resolve(__dirname, '../swagger/utils/swagger.ts');
  let content = fsExtra.readFileSync(swaggerPath, 'utf-8');
  
  // 检查版本是否已存在
  if (content.includes(`"${version}":`)) {
    console.log(`✓ swagger.ts 中已存在版本 ${version}，跳过更新`);
    return false;
  }
  
  // 查找 defaultSpecMap 的开始位置
  const specMapMatch = content.match(/const defaultSpecMap = \{/);
  if (!specMapMatch) {
    console.warn(`⚠ 无法找到 defaultSpecMap，请手动更新 swagger.ts`);
    return false;
  }
  
  const insertIndex = specMapMatch.index + specMapMatch[0].length;
  const newEntry = `\n  "${version}": import("../../static/specs/${version}-swagger.json"),`;
  content = content.slice(0, insertIndex) + newEntry + content.slice(insertIndex);
  
  fsExtra.writeFileSync(swaggerPath, content, 'utf-8');
  console.log(`✓ 已更新 swagger.ts，添加版本 ${version}`);
  return true;
}

/**
 * 更新所有配置文件
 */
async function updateConfigFiles(version) {
  // 再次检查 swagger 文件是否存在（双重保险）
  const swaggerPath = getSwaggerPath(version);
  if (!fsExtra.existsSync(swaggerPath) || !fsExtra.statSync(swaggerPath).isFile()) {
    throw new Error(
      `Swagger file does not exist: ${swaggerPath}\n` +
      `Please ensure the swagger file exists before running this script.`
    );
  }
  
  console.log(`\n开始更新配置文件，版本: ${version}\n`);
  
  const results = {
    versions: updateVersionsJson(version),
    i18n: updateI18nTs(version),
    swagger: updateSwaggerTs(version),
  };
  
  const updatedCount = Object.values(results).filter(Boolean).length;
  console.log(`\n配置文件更新完成，共更新 ${updatedCount} 个文件\n`);
  
  // 重新加载 versions（如果已更新）
  if (results.versions) {
    // 清除 require 缓存
    delete require.cache[require.resolve('./versions.json')];
  }
}

// 获取上一个版本的 swagger spec 文件
const getPreviousSwaggerSpec = (currentVersion) => {
  // 重新加载 versions（可能已更新）
  const versionsPath = nodePath.resolve(__dirname, './versions.json');
  const versions = JSON.parse(fsExtra.readFileSync(versionsPath, 'utf-8'));
  
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
