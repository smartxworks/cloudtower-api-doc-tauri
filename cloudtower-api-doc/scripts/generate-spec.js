#!/usr/bin/env node
const nodePath = require('path');
const fsExtra = require('fs-extra');
const _ = require('lodash');
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
 * 获取指定版本之前的所有版本（包括自己）
 */
function getVersionsUpTo(targetVersion, allVersions) {
  const targetIndex = allVersions.indexOf(targetVersion);
  if (targetIndex === -1) {
    return [];
  }
  return allVersions.slice(0, targetIndex + 1);
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
 * 生成单个版本的 spec
 */
function generateSpec(version, language, allVersions) {
  console.log(`\n📦 生成 ${version} (${language.toUpperCase()})...`);
  
  const docsSwaggerDir = nodePath.resolve(
    process.cwd(),
    'cloudtower-api-doc',
    'docs-swagger'
  );
  
  const zhReleaseDir = nodePath.join(docsSwaggerDir, 'zh-release');
  const zhPatchDir = nodePath.join(docsSwaggerDir, 'zh-patch');
  const enPatchDir = nodePath.join(docsSwaggerDir, 'en-patch');
  
  const outputDir = nodePath.resolve(
    process.cwd(),
    'cloudtower-api-doc',
    'static',
    'specs'
  );
  
  // 获取需要合并的所有版本
  const versionsToMerge = getVersionsUpTo(version, allVersions);
  
  if (versionsToMerge.length === 0) {
    console.log(`  ⚠️  未找到版本 ${version}`);
    return false;
  }
  
  console.log(`  📚 合并版本: ${versionsToMerge.join(', ')}`);
  
  // 开始合并
  let result = {};
  
  // Step 1: 合并所有 release 文件（从 zh-release）
  console.log(`  🔄 合并 release 文件...`);
  for (const ver of versionsToMerge) {
    const releasePath = nodePath.join(zhReleaseDir, `${ver}-swagger.json`);
    if (fsExtra.existsSync(releasePath)) {
      const releaseData = fsExtra.readJsonSync(releasePath);
      result = _.merge(result, releaseData);
    } else {
      console.log(`    ⚠️  ${ver}-swagger.json 不存在，跳过`);
    }
  }
  
  // Step 2: 合并对应语言的 patch 文件
  console.log(`  🔄 合并 ${language} patch 文件...`);
  const patchDir = language === 'zh' ? zhPatchDir : enPatchDir;
  
  for (const ver of versionsToMerge) {
    const patchPath = nodePath.join(patchDir, `${ver}-patch.json`);
    if (fsExtra.existsSync(patchPath)) {
      const patchData = fsExtra.readJsonSync(patchPath);
      result = _.merge(result, patchData);
    } else {
      // patch 文件不存在是正常的，某些版本可能没有新增文档字段
    }
  }
  
  // 确保 info 字段正确
  if (!result.info) {
    result.info = {};
  }
  result.info.title = "CloudTower APIs";
  result.info.version = version;
  result.info.description = "cloudtower operation API and SDK";
  
  // 按字母顺序排序
  console.log(`  🔄 排序对象键...`);
  result = sortObjectKeys(result);
  
  // 写入输出文件
  fsExtra.ensureDirSync(outputDir);
  const outputPath = nodePath.join(outputDir, `${version}-swagger-${language}.json`);
  
  console.log(`  💾 写入文件: ${outputPath}`);
  fsExtra.writeJsonSync(outputPath, result, { spaces: 2 });
  
  const fileSize = (fsExtra.statSync(outputPath).size / 1024 / 1024).toFixed(2);
  const pathCount = Object.keys(result.paths || {}).length;
  const schemaCount = Object.keys(result.components?.schemas || {}).length;
  
  console.log(`  ✅ 成功生成!`);
  console.log(`     - Paths: ${pathCount}`);
  console.log(`     - Schemas: ${schemaCount}`);
  console.log(`     - 文件大小: ${fileSize} MB`);
  
  return true;
}

/**
 * 主函数
 */
function main({ version, language }) {
  console.log('🚀 开始生成 Swagger Spec 文件...');
  
  const zhReleaseDir = nodePath.resolve(
    process.cwd(),
    'cloudtower-api-doc',
    'docs-swagger',
    'zh-release'
  );
  
  // 获取所有可用版本
  const allVersions = getVersionsFromDir(zhReleaseDir);
  
  if (allVersions.length === 0) {
    console.error(`❌ 错误: 未找到任何 swagger 文件`);
    process.exit(1);
  }
  
  console.log(`\n📚 发现 ${allVersions.length} 个版本: ${allVersions.slice(0, 5).join(', ')}...`);
  
  // 确定要生成的版本列表
  const versionsToGenerate = version ? [version] : allVersions;
  const languagesToGenerate = language ? [language] : ['zh', 'en'];
  
  // 验证指定的版本是否存在
  if (version && !allVersions.includes(version)) {
    console.error(`\n❌ 错误: 版本 ${version} 不存在`);
    console.log(`\n可用版本: ${allVersions.join(', ')}`);
    process.exit(1);
  }
  
  console.log(`\n🎯 生成配置:`);
  console.log(`   版本: ${version || '全部'} (${versionsToGenerate.length} 个)`);
  console.log(`   语言: ${language || '全部'} (${languagesToGenerate.join(', ')})`);
  console.log(`   总任务: ${versionsToGenerate.length * languagesToGenerate.length} 个`);
  
  let successCount = 0;
  let errorCount = 0;
  const startTime = Date.now();
  
  // 生成所有版本和语言的组合
  for (const ver of versionsToGenerate) {
    for (const lang of languagesToGenerate) {
      try {
        const success = generateSpec(ver, lang, allVersions);
        if (success) {
          successCount++;
        } else {
          errorCount++;
        }
      } catch (error) {
        console.error(`\n❌ 错误 [${ver}-${lang}]: ${error.message}`);
        if (process.env.DEBUG) {
          console.error(error.stack);
        }
        errorCount++;
      }
    }
  }
  
  const endTime = Date.now();
  const duration = ((endTime - startTime) / 1000).toFixed(2);
  
  // 输出统计
  console.log('\n' + '='.repeat(60));
  console.log('📊 生成完成！');
  console.log('='.repeat(60));
  console.log(`✅ 成功: ${successCount}`);
  console.log(`❌ 失败: ${errorCount}`);
  console.log(`⏱️  耗时: ${duration}s`);
  console.log(`📁 输出目录: cloudtower-api-doc/static/specs/\n`);
  
  process.exit(errorCount > 0 ? 1 : 0);
}

// 命令行参数处理
if (require.main === module) {
  const argv = process.argv.slice(2);
  
  // 支持非交互模式
  if (argv.includes('--non-interactive')) {
    const versionArg = argv.find(arg => arg.startsWith('--version='));
    const languageArg = argv.find(arg => arg.startsWith('--language='));
    
    const version = versionArg ? versionArg.split('=')[1] : undefined;
    const language = languageArg ? languageArg.split('=')[1] : undefined;
    
    main({ version, language });
  } else {
    // 交互模式
    yargsInteractive()
      .usage("$0 <command> [args]")
      .help("help")
      .alias("help", "h")
      .interactive({
        interactive: { default: true },
        version: {
          description: "要生成的版本号 (留空生成所有版本)",
          type: "input",
          default: "",
        },
        language: {
          description: "语言 (zh/en，留空生成所有语言)",
          type: "list",
          choices: ["", "zh", "en"],
          default: "",
        },
      })
      .then((result) => {
        try {
          main({
            version: result.version || undefined,
            language: result.language || undefined,
          });
        } catch (error) {
          console.error(`\n❌ 错误: ${error.message}`);
          console.error(error.stack);
          process.exit(1);
        }
      });
  }
}

module.exports = { generateSpec, main };

