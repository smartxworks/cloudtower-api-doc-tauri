#!/usr/bin/env node
const nodePath = require('path');
const fsExtra = require('fs-extra');
const _ = require('lodash');
const { detailedDiff } = require('deep-object-diff');
const yargsInteractive = require('yargs-interactive');

/**
 * 比较版本号（semver）
 */
function compareVersions(a, b) {
  const aParts = a.split('.').map(Number);
  const bParts = b.split('.').map(Number);
  
  for (let i = 0; i < Math.max(aParts.length, bParts.length); i++) {
    const aVal = aParts[i] || 0;
    const bVal = bParts[i] || 0;
    
    if (aVal > bVal) return 1;
    if (aVal < bVal) return -1;
  }
  
  return 0;
}

/**
 * 从指定目录读取所有版本并按 semver 排序
 */
function getVersionsFromDir(dir) {
  if (!fsExtra.existsSync(dir)) {
    return [];
  }
  
  const files = fsExtra.readdirSync(dir);
  const versionSet = new Set();
  
  for (const file of files) {
    if (file.endsWith('-swagger.json')) {
      const filePath = nodePath.join(dir, file);
      try {
        const data = fsExtra.readJsonSync(filePath);
        if (data.info && data.info.version) {
          versionSet.add(data.info.version);
        }
      } catch (error) {
        console.warn(`⚠️  无法读取 ${file}: ${error.message}`);
      }
    }
  }
  
  // 转换为数组并按 semver 排序
  return Array.from(versionSet).sort(compareVersions);
}

/**
 * 获取前一个版本
 */
function getPreviousVersion(version, allVersions) {
  const index = allVersions.indexOf(version);
  if (index <= 0) {
    return null;
  }
  return allVersions[index - 1];
}

// 只保留文档相关的字段
const DOC_FIELDS = new Set([
  'description',
  'summary',
  'title'
]);

// 需要忽略的 schema 后缀（可以通过修改这个数组来启用/禁用）
const IGNORED_SCHEMA_SUFFIXES = [
  'RequestBody',
  'OrderByInput',
  'WhereInput',
  'Connection'
];

/**
 * 检查 schema 名称是否应该被忽略
 */
function shouldIgnoreSchema(schemaName) {
  return IGNORED_SCHEMA_SUFFIXES.some(suffix => schemaName.endsWith(suffix));
}

/**
 * 递归过滤对象，只保留文档描述字段
 * context: 'path' | 'schema' | 'property' - 表示当前处理的上下文
 * isPathOperation: 是否是 path 操作的直接子级（用于判断是否跳过 responses）
 */
function filterDocFields(obj, context = 'path', parentKey = '', isPathOperation = false) {
  if (!obj || typeof obj !== 'object') {
    return undefined;
  }

  if (Array.isArray(obj)) {
    const filtered = obj.map((item, index) => 
      filterDocFields(item, context, `${parentKey}[${index}]`, false)
    ).filter(item => item !== undefined);
    return filtered.length > 0 ? filtered : undefined;
  }

  const result = {};
  let hasContent = false;

  for (const [key, value] of Object.entries(obj)) {
    // 判断当前键是否是文档描述字段
    const isDocField = DOC_FIELDS.has(key);
    
    // 对于 path 操作，跳过 responses、parameters、requestBody 等
    if (isPathOperation && (key === 'responses' || key === 'parameters' || key === 'requestBody' || key === 'security' || key === 'tags')) {
      continue;
    }
    
    if (isDocField && typeof value === 'string') {
      // 这是一个文档描述字段，保留其值（包括空字符串）
      result[key] = value;
      hasContent = true;
    } 
    // 特殊处理 properties - 这是 schema 的属性定义
    else if (key === 'properties' && typeof value === 'object') {
      const filteredProps = {};
      let hasProps = false;
      
      for (const [propName, propDef] of Object.entries(value)) {
        // 对每个属性，只提取其 description 字段
        if (propDef && typeof propDef === 'object') {
          const propResult = {};
          let hasPropContent = false;
          
          // 只保留 description 字段（包括空字符串）
          if ('description' in propDef && typeof propDef.description === 'string') {
            propResult.description = propDef.description;
            hasPropContent = true;
          }
          
          // 递归处理嵌套的 properties (如果有的话)
          if (propDef.properties) {
            const nestedProps = filterDocFields(propDef, 'property', propName, false);
            if (nestedProps && nestedProps.properties) {
              propResult.properties = nestedProps.properties;
              hasPropContent = true;
            }
          }
          
          // 处理数组类型的 items
          if (propDef.items && typeof propDef.items === 'object') {
            if (propDef.items.properties) {
              const itemsFiltered = filterDocFields(propDef.items, 'property', `${propName}.items`, false);
              if (itemsFiltered && itemsFiltered.properties) {
                propResult.items = { properties: itemsFiltered.properties };
                hasPropContent = true;
              }
            }
          }
          
          if (hasPropContent) {
            filteredProps[propName] = propResult;
            hasProps = true;
          }
        }
      }
      
      if (hasProps) {
        result.properties = filteredProps;
        hasContent = true;
      }
    }
    // 处理其他嵌套对象
    // 但跳过某些不需要文档的字段
    else if (typeof value === 'object' && value !== null && !isDocField) {
      // 跳过这些不需要提取文档的字段
      const skipKeys = new Set(['example', 'examples', 'default', 'enum', 'allOf', 'oneOf', 'anyOf', '$ref']);
      if (!skipKeys.has(key)) {
        const filtered = filterDocFields(value, context, key, false);
        if (filtered !== undefined && Object.keys(filtered).length > 0) {
          result[key] = filtered;
          hasContent = true;
        }
      }
    }
  }

  return hasContent ? result : undefined;
}

/**
 * 清理空对象和空数组（但保留空字符串，因为那是待填充的文档字段）
 */
function cleanEmptyObjects(obj) {
  if (!obj || typeof obj !== 'object') {
    return obj;
  }

  if (Array.isArray(obj)) {
    const cleaned = obj.map(item => cleanEmptyObjects(item)).filter(item => {
      if (item === null || item === undefined) return false;
      if (typeof item === 'object' && Object.keys(item).length === 0) return false;
      return true;
    });
    return cleaned.length > 0 ? cleaned : undefined;
  }

  const result = {};
  let hasContent = false;

  for (const [key, value] of Object.entries(obj)) {
    // 如果是空字符串且是文档字段，保留它
    if (value === '' && DOC_FIELDS.has(key)) {
      result[key] = value;
      hasContent = true;
      continue;
    }
    
    const cleaned = cleanEmptyObjects(value);
    if (cleaned !== undefined && cleaned !== null) {
      if (typeof cleaned === 'object' && !Array.isArray(cleaned) && Object.keys(cleaned).length === 0) {
        continue;
      }
      result[key] = cleaned;
      hasContent = true;
    }
  }

  return hasContent ? result : undefined;
}

/**
 * 递归按字母顺序排序对象的键
 */
function sortObjectKeys(obj) {
  if (!obj || typeof obj !== 'object') {
    return obj;
  }

  if (Array.isArray(obj)) {
    return obj.map(item => sortObjectKeys(item));
  }

  const sorted = {};
  const keys = Object.keys(obj).sort();
  
  for (const key of keys) {
    sorted[key] = sortObjectKeys(obj[key]);
  }
  
  return sorted;
}

/**
 * 将文档字段设置为空字符串（用于 en-patch）
 */
function setDocFieldsToEmpty(obj) {
  if (!obj || typeof obj !== 'object') {
    return obj;
  }

  if (Array.isArray(obj)) {
    return obj.map(item => setDocFieldsToEmpty(item));
  }

  const result = {};
  for (const [key, value] of Object.entries(obj)) {
    if (DOC_FIELDS.has(key)) {
      // 文档字段设为空字符串
      result[key] = '';
    } else if (typeof value === 'object' && value !== null) {
      // 递归处理嵌套对象
      const processed = setDocFieldsToEmpty(value);
      result[key] = processed;
    } else {
      // 非文档字段、非对象的值，保留原值
      result[key] = value;
    }
  }
  return result;
}

/**
 * 确保文档字段存在（如果没有则添加空字段）
 * 针对 path：确保有 summary 和 description
 * 针对 schema properties：确保每个属性有 description
 */
function ensureDocFields(obj, context = 'path') {
  if (!obj || typeof obj !== 'object') {
    return obj;
  }

  if (Array.isArray(obj)) {
    return obj.map(item => ensureDocFields(item, context));
  }

  const result = { ...obj };

  // 对于 path 操作，确保有 summary 和 description
  if (context === 'path' && obj.operationId) {
    if (!result.summary) {
      result.summary = '';
    }
    if (!result.description) {
      result.description = '';
    }
  }

  // 处理 properties
  if (result.properties && typeof result.properties === 'object') {
    const newProperties = {};
    for (const [propName, propDef] of Object.entries(result.properties)) {
      if (propDef && typeof propDef === 'object') {
        newProperties[propName] = { ...propDef };
        // 确保每个属性有 description
        if (!newProperties[propName].description) {
          newProperties[propName].description = '';
        }
        // 递归处理嵌套的 properties
        if (propDef.properties) {
          newProperties[propName] = ensureDocFields(newProperties[propName], 'schema');
        }
        // 处理 items
        if (propDef.items && propDef.items.properties) {
          newProperties[propName].items = ensureDocFields(propDef.items, 'schema');
        }
      }
    }
    result.properties = newProperties;
  }

  // 递归处理嵌套对象
  for (const [key, value] of Object.entries(result)) {
    if (key !== 'properties' && typeof value === 'object' && value !== null) {
      result[key] = ensureDocFields(value, context);
    }
  }

  return result;
}

/**
 * 比较两个版本并生成 patch
 */
function generatePatch(prevVersion, currentVersion, language, zhReleaseDir) {
  // 始终从 zh-release 读取源文件
  const prevPath = prevVersion 
    ? nodePath.join(zhReleaseDir, `${prevVersion}-swagger.json`)
    : null;
  const currentPath = nodePath.join(zhReleaseDir, `${currentVersion}-swagger.json`);

  console.log(`\n[${language.toUpperCase()}] 比较 ${prevVersion || '(empty)'} -> ${currentVersion}...`);

  // 读取文件
  const prevData = prevVersion && prevPath && fsExtra.existsSync(prevPath) 
    ? fsExtra.readJsonSync(prevPath) 
    : {};
  
  if (!fsExtra.existsSync(currentPath)) {
    console.log(`  ⚠️  跳过: ${currentPath} 不存在`);
    return null;
  }

  const currentData = fsExtra.readJsonSync(currentPath);

  // 计算差异
  const diff = detailedDiff(prevData, currentData);
  const { added } = diff;

  // 提取新增的文档字段
  let patch = {
    info: currentData.info || {},
    paths: {},
    components: {
      schemas: {}
    }
  };

  // 处理 paths
  if (added.paths) {
    for (const [path, pathData] of Object.entries(added.paths)) {
      const pathResult = {};
      let hasPathContent = false;
      
      // 处理每个 HTTP 方法（post, get, put, delete 等）
      for (const [method, methodData] of Object.entries(pathData)) {
        if (typeof methodData === 'object' && methodData !== null) {
          // 确保新路径有文档字段
          const ensured = ensureDocFields(methodData, 'path');
          // 传递 isPathOperation=true，只提取 summary/description，不提取 responses
          const filteredMethod = filterDocFields(ensured, 'path', method, true);
          if (filteredMethod && Object.keys(filteredMethod).length > 0) {
            pathResult[method] = filteredMethod;
            hasPathContent = true;
          }
        }
      }
      
      if (hasPathContent) {
        patch.paths[path] = pathResult;
      }
    }
  }

  // 处理现有 paths 中新增的字段
  if (currentData.paths) {
    for (const [path, pathData] of Object.entries(currentData.paths)) {
      const prevPathData = _.get(prevData, ['paths', path], {});
      
      // 如果这个 path 在 prevData 中不存在，说明是新增的，跳过（已在上面处理）
      if (!prevData.paths || !prevData.paths[path]) {
        continue;
      }
      
      const pathDiff = detailedDiff(prevPathData, pathData);
      
      if (pathDiff.added && Object.keys(pathDiff.added).length > 0) {
        // 对于现有 path 的新增字段，需要逐个处理每个 HTTP 方法
        const pathResult = {};
        let hasPathContent = false;
        
        for (const [method, methodData] of Object.entries(pathDiff.added)) {
          if (typeof methodData === 'object' && methodData !== null) {
            // 对每个方法，使用 isPathOperation=true 来跳过 responses
            const filteredMethod = filterDocFields(methodData, 'path', method, true);
            if (filteredMethod && Object.keys(filteredMethod).length > 0) {
              pathResult[method] = filteredMethod;
              hasPathContent = true;
            }
          }
        }
        
        if (hasPathContent) {
          if (!patch.paths[path]) {
            patch.paths[path] = {};
          }
          patch.paths[path] = _.merge(patch.paths[path], pathResult);
        }
      }
    }
  }

  // 处理 schemas
  if (added.components?.schemas) {
    for (const [schemaName, schemaData] of Object.entries(added.components.schemas)) {
      // 跳过忽略的 schema 类型
      if (shouldIgnoreSchema(schemaName)) {
        continue;
      }
      
      // 确保新 schema 有文档字段
      const ensured = ensureDocFields(schemaData, 'schema');
      const filteredSchema = filterDocFields(ensured, 'schema');
      if (filteredSchema && Object.keys(filteredSchema).length > 0) {
        patch.components.schemas[schemaName] = filteredSchema;
      }
    }
  }

  // 处理现有 schemas 中新增的字段
  if (currentData.components?.schemas) {
    for (const [schemaName, schemaData] of Object.entries(currentData.components.schemas)) {
      // 跳过忽略的 schema 类型
      if (shouldIgnoreSchema(schemaName)) {
        continue;
      }
      
      const prevSchemaData = _.get(prevData, ['components', 'schemas', schemaName], {});
      
      // 如果这个 schema 在 prevData 中不存在，说明是新增的，跳过（已在上面处理）
      if (!prevData.components || !prevData.components.schemas || !prevData.components.schemas[schemaName]) {
        continue;
      }
      
      const schemaDiff = detailedDiff(prevSchemaData, schemaData);
      
      if (schemaDiff.added && Object.keys(schemaDiff.added).length > 0) {
        // 确保新增的属性有 description
        const ensuredAdded = ensureDocFields(schemaDiff.added, 'schema');
        const filteredAdded = filterDocFields(ensuredAdded, 'schema');
        if (filteredAdded && Object.keys(filteredAdded).length > 0) {
          if (!patch.components.schemas[schemaName]) {
            patch.components.schemas[schemaName] = {};
          }
          patch.components.schemas[schemaName] = _.merge(
            patch.components.schemas[schemaName], 
            filteredAdded
          );
        }
      }
    }
  }

  // 清理空对象
  patch = cleanEmptyObjects(patch);
  
  // 检查是否有实际内容
  const hasPathContent = patch.paths && Object.keys(patch.paths).length > 0;
  const hasSchemaContent = patch.components?.schemas && Object.keys(patch.components.schemas).length > 0;

  if (!hasPathContent && !hasSchemaContent) {
    console.log(`  ℹ️  无新增文档字段`);
    return null;
  }

  // 按字母顺序排序所有键
  patch = sortObjectKeys(patch);

  // 统计信息
  const pathCount = Object.keys(patch.paths || {}).length;
  const schemaCount = Object.keys(patch.components?.schemas || {}).length;
  console.log(`  ✅ 新增文档字段: ${pathCount} paths, ${schemaCount} schemas`);

  return patch;
}

/**
 * 验证 patch 可以 merge 回原文件
 */
function validatePatch(version, patch, language, zhReleaseDir) {
  // 始终使用 zh-release 进行验证
  const releasePath = nodePath.join(zhReleaseDir, `${version}-swagger.json`);
  
  if (!fsExtra.existsSync(releasePath)) {
    console.log(`  ⚠️  无法验证: release 文件不存在`);
    return false;
  }
  
  const releaseData = fsExtra.readJsonSync(releasePath);
  
  // 尝试 merge
  const merged = _.merge(_.cloneDeep(releaseData), patch);
  
  // 验证基本结构
  if (!merged.info || !merged.paths || !merged.components) {
    throw new Error(`合并后的文件结构不完整`);
  }
  
  console.log(`  ✓ Patch 验证通过`);
  return true;
}

/**
 * 合并已有的 patch 和新生成的 patch
 */
function mergePatches(existingPatch, newPatch) {
  console.log(`  🔄 合并已有 patch 和新生成的 patch...`);
  
  // 使用 lodash merge，已有的 patch 优先级更高
  const merged = _.merge(_.cloneDeep(newPatch), existingPatch);
  
  // 按字母顺序排序
  const sorted = sortObjectKeys(merged);
  
  const existingPathCount = Object.keys(existingPatch.paths || {}).length;
  const existingSchemaCount = Object.keys(existingPatch.components?.schemas || {}).length;
  const newPathCount = Object.keys(newPatch.paths || {}).length;
  const newSchemaCount = Object.keys(newPatch.components?.schemas || {}).length;
  const mergedPathCount = Object.keys(sorted.paths || {}).length;
  const mergedSchemaCount = Object.keys(sorted.components?.schemas || {}).length;
  
  console.log(`  📊 已有: ${existingPathCount} paths, ${existingSchemaCount} schemas`);
  console.log(`  📊 新增: ${newPathCount} paths, ${newSchemaCount} schemas`);
  console.log(`  📊 合并后: ${mergedPathCount} paths, ${mergedSchemaCount} schemas`);
  
  return sorted;
}

/**
 * 处理单个语言的 patch 生成
 */
function processLanguage(version, prevVersion, language, force, zhReleaseDir) {
  const patchDir = nodePath.resolve(
    process.cwd(),
    'cloudtower-api-doc',
    'docs-swagger',
    `${language}-patch`
  );

  // 确保目录存在
  fsExtra.ensureDirSync(patchDir);

  const patchPath = nodePath.join(patchDir, `${version}-patch.json`);
  const existingPatch = fsExtra.existsSync(patchPath) && !force
    ? fsExtra.readJsonSync(patchPath)
    : null;

  // 生成新的 patch（始终从 zh-release 生成）
  const newPatch = generatePatch(prevVersion, version, language, zhReleaseDir);

  if (!newPatch) {
    if (existingPatch) {
      console.log(`  ℹ️  保留已有的 patch 文件`);
      return { success: true, kept: true };
    }
    return { success: false, kept: false };
  }

  // 合并或覆盖
  let finalPatch;
  if (existingPatch && !force) {
    finalPatch = mergePatches(existingPatch, newPatch);
  } else {
    if (force && existingPatch) {
      console.log(`  🔄 --force 模式: 覆盖已有 patch`);
    }
    finalPatch = newPatch;
  }

  // 验证 patch（使用 zh-release）
  validatePatch(version, finalPatch, language, zhReleaseDir);

  // 写入文件
  fsExtra.writeJsonSync(patchPath, finalPatch, { spaces: 2 });

  return { success: true, kept: false };
}

// 主函数
function main({ version, force }) {
  console.log('🚀 开始生成 Swagger Patch 文件...');
  console.log(`📦 版本: ${version}`);
  console.log(`🔄 强制覆盖: ${force ? '是' : '否'}\n`);

  // 从 zh-release 目录读取所有版本
  const zhReleaseDir = nodePath.resolve(
    process.cwd(),
    'cloudtower-api-doc',
    'docs-swagger',
    'zh-release'
  );
  
  const allVersions = getVersionsFromDir(zhReleaseDir);
  
  if (allVersions.length === 0) {
    console.error(`❌ 错误: 未找到任何 swagger 文件`);
    process.exit(1);
  }
  
  console.log(`📚 发现 ${allVersions.length} 个版本: ${allVersions.join(', ')}\n`);

  // 验证版本
  if (!allVersions.includes(version)) {
    console.error(`❌ 错误: 版本 ${version} 不在已有版本列表中`);
    console.log(`\n可用版本: ${allVersions.join(', ')}`);
    process.exit(1);
  }

  // 获取前一个版本
  const prevVersion = getPreviousVersion(version, allVersions);
  console.log(`📝 比较版本: ${prevVersion || '(empty)'} -> ${version}\n`);

  let successCount = 0;
  let errorCount = 0;
  const languages = ['zh', 'en'];

  // 先处理 zh，生成 zh-patch
  let zhPatch = null;
  try {
    const zhResult = processLanguage(version, prevVersion, 'zh', force, zhReleaseDir);
    if (zhResult.success) {
      successCount++;
      // 读取生成的 zh-patch
      const zhPatchPath = nodePath.resolve(
        process.cwd(),
        'cloudtower-api-doc',
        'docs-swagger',
        'zh-patch',
        `${version}-patch.json`
      );
      if (fsExtra.existsSync(zhPatchPath)) {
        zhPatch = fsExtra.readJsonSync(zhPatchPath);
      }
    }
  } catch (error) {
    console.error(`\n[ZH] ❌ 错误: ${error.message}`);
    errorCount++;
  }

  // 基于 zh-patch 生成 en-patch
  if (zhPatch) {
    try {
      const enPatchDir = nodePath.resolve(
        process.cwd(),
        'cloudtower-api-doc',
        'docs-swagger',
        'en-patch'
      );
      fsExtra.ensureDirSync(enPatchDir);
      
      const enPatchPath = nodePath.join(enPatchDir, `${version}-patch.json`);
      const existingEnPatch = fsExtra.existsSync(enPatchPath) && !force
        ? fsExtra.readJsonSync(enPatchPath)
        : null;
      
      console.log(`\n[EN] 基于 zh-patch 生成空文档字段...`);
      
      // 将 zh-patch 转换为 en-patch（文档字段设为空）
      let enPatch = setDocFieldsToEmpty(zhPatch);
      enPatch = sortObjectKeys(enPatch);
      
      // 如果有已存在的 en-patch，合并（保留已翻译的内容）
      if (existingEnPatch && !force) {
        enPatch = _.merge(enPatch, existingEnPatch);
        enPatch = sortObjectKeys(enPatch);
        console.log(`  🔄 合并已有 en-patch 翻译内容`);
      } else if (force && existingEnPatch) {
        console.log(`  🔄 --force 模式: 覆盖已有 en-patch`);
      }
      
      // 验证
      validatePatch(version, enPatch, 'en', zhReleaseDir);
      
      // 写入文件
      fsExtra.writeJsonSync(enPatchPath, enPatch, { spaces: 2 });
      
      const pathCount = Object.keys(enPatch.paths || {}).length;
      const schemaCount = Object.keys(enPatch.components?.schemas || {}).length;
      console.log(`  ✅ 生成 en-patch: ${pathCount} paths, ${schemaCount} schemas`);
      
      successCount++;
    } catch (error) {
      console.error(`\n[EN] ❌ 错误: ${error.message}`);
      errorCount++;
    }
  } else {
    console.log(`\n[EN] ⚠️  跳过: zh-patch 未生成`);
  }

  // 输出统计
  console.log('\n' + '='.repeat(60));
  console.log('📊 生成完成！');
  console.log('='.repeat(60));
  console.log(`✅ 成功: ${successCount}/${languages.length} 语言`);
  console.log(`❌ 失败: ${errorCount}/${languages.length} 语言`);
  
  const zhPatchPath = nodePath.resolve(
    process.cwd(),
    'cloudtower-api-doc',
    'docs-swagger',
    'zh-patch',
    `${version}-patch.json`
  );
  const enPatchPath = nodePath.resolve(
    process.cwd(),
    'cloudtower-api-doc',
    'docs-swagger',
    'en-patch',
    `${version}-patch.json`
  );
  
  console.log(`\n📁 输出文件:`);
  if (fsExtra.existsSync(zhPatchPath)) {
    console.log(`   - ${zhPatchPath}`);
  }
  if (fsExtra.existsSync(enPatchPath)) {
    console.log(`   - ${enPatchPath}`);
  }
  console.log('');

  process.exit(errorCount > 0 ? 1 : 0);
}

// 命令行参数处理
yargsInteractive()
  .usage("$0 <command> [args]")
  .help("help")
  .alias("help", "h")
  .interactive({
    interactive: { default: true },
    version: {
      description: "要生成 patch 的版本号 (例如: 4.7.0)",
      type: "input",
      prompt: "always",
    },
    force: {
      description: "是否强制覆盖已有的 patch 文件",
      type: "confirm",
      default: false,
    },
  })
  .then((result) => {
    try {
      main({
        version: result.version,
        force: result.force,
      });
    } catch (error) {
      console.error(`\n❌ 错误: ${error.message}`);
      console.error(error.stack);
      process.exit(1);
    }
  });
