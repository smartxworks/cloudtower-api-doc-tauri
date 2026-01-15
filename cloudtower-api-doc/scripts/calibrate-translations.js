#!/usr/bin/env node
/**
 * 翻译字段版本校准脚本
 * 
 * 用途：校准翻译文件中字段的版本归属，解决研发在历史补充时没有把字段补充到正确版本的问题
 * 
 * 功能：
 * 1. 如果字段在上一个版本的翻译中就存在，则更新到对应的版本中，并从当前文档中移除
 * 2. 如果字段存在于多个版本中：
 *    - 如果多个版本的翻译相同，只保留最旧版本（首次出现版本）的翻译，其他版本删除
 *    - 如果多个版本的翻译不同，保持现状
 * 3. 如果字段首次出现的版本没有翻译，则选择临近的下一个有翻译的版本来补充
 * 4. 特殊处理：2.8.0 和 3.4.4 是 merge 版本，可以接受新增和变更，但不允许删除已存在的字段
 * 
 * 使用方法：
 *   node calibrate-translations.js -v 4.7.0          # 校准 4.7.0 版本
 *   node calibrate-translations.js -v 4.7.0 --dry-run  # 预览模式，不实际保存
 *   node calibrate-translations.js -v 4.7.0 --force   # 强制模式：覆盖旧版本的不同翻译
 * 
 * 注意：
 * - 每次只处理一个版本
 * - 建议先用 --dry-run 预览更改
 * - 版本关系参考 versions.json
 * - 空值不作为有效翻译值
 * - 每次执行的结果会自动保存到 logs/ 目录下的日志文件中
 * - 日志文件名格式: calibrate-{版本号}-{时间戳}.log
 */
const fs = require("fs");
const path = require("path");
const { program } = require("commander");

/**
 * 写入日志文件
 */
function writeLog(logPath, content) {
  const logDir = path.dirname(logPath);
  if (!fs.existsSync(logDir)) {
    fs.mkdirSync(logDir, { recursive: true });
  }
  fs.writeFileSync(logPath, content, "utf-8");
}

/**
 * 生成日志文件路径
 */
function getLogPath(targetVersion) {
  const timestamp = new Date().toISOString().replace(/[:.]/g, "-").slice(0, 19);
  const logDir = path.resolve(__dirname, "logs");
  const logFileName = `calibrate-${targetVersion}-${timestamp}.log`;
  return path.resolve(logDir, logFileName);
}

/**
 * 将版本号转换为命名空间格式
 * 例如: "4.7.0" -> "4_7_0"
 */
function getNs(version) {
  return version.split(".").join("_");
}

/**
 * 检查字段是否有有效的翻译（非空字符串）
 */
function hasTranslation(value) {
  return typeof value === "string" && value.trim() !== "";
}

/**
 * 递归获取对象中的所有字段路径
 * 返回格式: ["schemas.ClusterWhereInput.field1", "paths./api/something.summary"]
 */
function getAllFieldPaths(obj, prefix = "") {
  const paths = [];
  
  if (typeof obj !== "object" || obj === null) {
    return paths;
  }
  
  for (const [key, value] of Object.entries(obj)) {
    const currentPath = prefix ? `${prefix}.${key}` : key;
    
    if (typeof value === "object" && value !== null && !Array.isArray(value)) {
      // 继续递归
      paths.push(...getAllFieldPaths(value, currentPath));
    } else {
      // 叶子节点
      paths.push(currentPath);
    }
  }
  
  return paths;
}

/**
 * 根据路径获取嵌套对象的值
 */
function getNestedValue(obj, path) {
  const keys = path.split(".");
  let current = obj;
  for (const key of keys) {
    if (current === null || current === undefined || typeof current !== "object") {
      return undefined;
    }
    current = current[key];
  }
  return current;
}

/**
 * 根据路径设置嵌套对象的值
 */
function setNestedValue(obj, path, value) {
  const keys = path.split(".");
  const lastKey = keys.pop();
  let current = obj;
  
  for (const key of keys) {
    if (current[key] === null || current[key] === undefined || typeof current[key] !== "object") {
      current[key] = {};
    }
    current = current[key];
  }
  
  current[lastKey] = value;
}

/**
 * 根据路径删除嵌套对象的值
 */
function deleteNestedValue(obj, path) {
  const keys = path.split(".");
  const lastKey = keys.pop();
  let current = obj;
  
  for (const key of keys) {
    if (current === null || current === undefined || typeof current !== "object") {
      return false;
    }
    current = current[key];
  }
  
  if (current && typeof current === "object" && lastKey in current) {
    delete current[lastKey];
    return true;
  }
  
  return false;
}

/**
 * 清理空对象
 */
function cleanEmptyObjects(obj) {
  if (typeof obj !== "object" || obj === null || Array.isArray(obj)) {
    return obj;
  }
  
  const cleaned = {};
  for (const [key, value] of Object.entries(obj)) {
    if (typeof value === "object" && value !== null && !Array.isArray(value)) {
      const cleanedValue = cleanEmptyObjects(value);
      if (Object.keys(cleanedValue).length > 0) {
        cleaned[key] = cleanedValue;
      }
    } else {
      cleaned[key] = value;
    }
  }
  
  return cleaned;
}

/**
 * 检查版本是否是 merge 版本（不允许删除）
 */
function isMergeVersion(version) {
  return version === "2.8.0" || version === "3.4.4";
}

/**
 * 检查字段是否可以在指定版本中删除
 */
function canDeleteField(version, fieldPath, translations, locale) {
  // merge 版本不允许删除已存在的字段
  if (isMergeVersion(version)) {
    const versionTrans = translations[locale][version];
    const existingValue = getNestedValue(versionTrans, fieldPath);
    // 如果字段存在（即使为空），不允许删除
    if (existingValue !== undefined) {
      return false;
    }
  }
  return true;
}

/**
 * 校准指定版本的翻译
 */
function calibrateVersion(targetVersion, dryRun = false, force = false) {
  const versionsPath = path.resolve(__dirname, "versions.json");
  const versions = JSON.parse(fs.readFileSync(versionsPath, "utf-8"));
  
  const targetIndex = versions.indexOf(targetVersion);
  if (targetIndex === -1) {
    console.error(`错误: 版本 ${targetVersion} 不在版本列表中`);
    process.exit(1);
  }
  
  if (targetIndex === versions.length - 1) {
    console.log(`提示: ${targetVersion} 是最旧版本，没有上一个版本可以比较`);
    return;
  }
  
  const prevVersion = versions[targetIndex + 1];
  console.log(`\n校准版本: ${targetVersion}`);
  console.log(`上一个版本: ${prevVersion}`);
  if (isMergeVersion(targetVersion)) {
    console.log(`注意: ${targetVersion} 是 merge 版本，不允许删除已存在的字段`);
  }
  if (force) {
    console.log(`注意: 已启用 force 模式，将强制用当前版本覆盖旧版本的不同翻译（3.4.4 和 2.8.0 除外）`);
  }
  
  // 加载翻译文件
  const locales = ["zh", "en"];
  const translations = {};
  
  for (const locale of locales) {
    translations[locale] = {};
    
    // 加载目标版本及之前所有版本的翻译
    for (let i = targetIndex; i < versions.length; i++) {
      const version = versions[i];
      const filePath = path.resolve(
        __dirname,
        `../swagger/locales/${locale}/${version}.json`
      );
      
      if (fs.existsSync(filePath)) {
        translations[locale][version] = JSON.parse(
          fs.readFileSync(filePath, "utf-8")
        );
      } else {
        console.warn(`警告: 文件不存在 ${filePath}`);
        translations[locale][version] = {};
      }
    }
  }
  
  const changes = {
    moved: [], // 移动到上一个版本的字段
    removed: [], // 从当前版本移除的字段
    kept: [], // 保持现状的字段（存在于多个版本且翻译不同）
    deduplicated: [], // 去重后的字段（多个版本翻译相同，只保留最旧版本）
    filled: [], // 补充翻译的字段
    protected: [], // 受保护的字段（merge 版本不允许删除）
  };
  
  // 处理每个语言
  for (const locale of locales) {
    const targetTrans = translations[locale][targetVersion];
    const prevTrans = translations[locale][prevVersion];
    
    // 获取目标版本的所有字段路径
    const targetPaths = getAllFieldPaths(targetTrans);
    
    for (const fieldPath of targetPaths) {
      const targetValue = getNestedValue(targetTrans, fieldPath);
      
      // 跳过空值
      if (!hasTranslation(targetValue)) {
        continue;
      }
      
      // 检查该字段在所有版本中的存在情况（从旧到新，即从高索引到低索引）
      const versionsWithField = [];
      for (let i = targetIndex; i < versions.length; i++) {
        const version = versions[i];
        const versionTrans = translations[locale][version];
        const versionValue = getNestedValue(versionTrans, fieldPath);
        if (versionValue !== undefined) {
          versionsWithField.push({
            version,
            index: i,
            hasTranslation: hasTranslation(versionValue),
            value: versionValue,
          });
        }
      }
      
      // 如果字段在多个版本都存在
      if (versionsWithField.length > 1) {
        // force 模式：无论翻译是否相同，都强制处理
        if (force) {
          // 找到最初出现的版本（最旧的版本，索引越大越旧）
          const sortedByIndex = [...versionsWithField].sort((a, b) => b.index - a.index);
          const oldestVersion = sortedByIndex[0];
          
          // 用当前版本的翻译覆盖最初出现的版本
          if (oldestVersion.version !== targetVersion) {
            setNestedValue(translations[locale][oldestVersion.version], fieldPath, targetValue);
          }
          
          // 收集要删除的版本（包括当前版本，除了最初出现的版本）
          const versionsToRemove = versionsWithField.filter(
            v => v.version !== oldestVersion.version
          );
          
          // 记录删除的版本
          const removedVersions = [];
          const protectedVersions = [];
          
          // 从所有其他版本删除（包括当前版本，除了最初出现的版本和 merge 版本）
          for (const v of versionsToRemove) {
            // 检查是否可以删除（merge 版本不允许删除）
            if (canDeleteField(v.version, fieldPath, translations, locale)) {
              deleteNestedValue(translations[locale][v.version], fieldPath);
              removedVersions.push(v.version);
            } else {
              // merge 版本不允许删除
              protectedVersions.push(v.version);
              changes.protected.push({
                locale,
                fieldPath,
                version: v.version,
                reason: "merge 版本不允许删除",
              });
            }
          }
          
          // 记录变更
          if (removedVersions.length > 0) {
            changes.moved.push({
              locale,
              fieldPath,
              from: removedVersions.join(", "),
              to: oldestVersion.version,
              reason: "force 模式：强制覆盖到最初出现的版本",
            });
          }
          
          continue;
        }
        
        // 非 force 模式：按原逻辑处理
        // 获取所有有翻译的版本
        const versionsWithTranslation = versionsWithField.filter(v => v.hasTranslation);
        
        if (versionsWithTranslation.length > 1) {
          // 检查所有有翻译的版本的值是否相同
          const firstTranslation = versionsWithTranslation[0].value;
          const allSame = versionsWithTranslation.every(v => v.value === firstTranslation);
          
          if (allSame) {
            // 所有翻译都相同，只保留最旧版本（首次出现的版本）的翻译
            // 按照索引从大到小排序，找到最旧的版本（索引越大越旧）
            const sortedByIndex = [...versionsWithTranslation].sort((a, b) => b.index - a.index);
            const oldestVersion = sortedByIndex[0];
            
            // 从其他版本删除
            for (const v of versionsWithTranslation) {
              if (v.version !== oldestVersion.version) {
                // 检查是否可以删除
                if (canDeleteField(v.version, fieldPath, translations, locale)) {
                  deleteNestedValue(translations[locale][v.version], fieldPath);
                  changes.deduplicated.push({
                    locale,
                    fieldPath,
                    removedFrom: v.version,
                    keptIn: oldestVersion.version,
                  });
                } else {
                  // merge 版本不允许删除
                  changes.protected.push({
                    locale,
                    fieldPath,
                    version: v.version,
                    reason: "merge 版本不允许删除",
                  });
                }
              }
            }
            continue;
          } else {
            // 翻译不同，保持现状
            changes.kept.push({
              locale,
              fieldPath,
              reason: "存在于多个版本中且翻译不同",
              versions: versionsWithField.map((v) => v.version),
            });
            continue;
          }
        } else {
          // 只有一个版本有翻译，或者都没有翻译，保持现状
          changes.kept.push({
            locale,
            fieldPath,
            reason: "存在于多个版本中",
            versions: versionsWithField.map((v) => v.version),
          });
          continue;
        }
      }
      
      // 情况1: 如果字段在上一个版本存在且有翻译，更新到上一个版本并从当前版本移除
      const prevValue = getNestedValue(prevTrans, fieldPath);
      const hasPrevTranslation = hasTranslation(prevValue);
      const prevValueExists = prevValue !== undefined;
      
      if (prevValueExists && hasPrevTranslation) {
        // 字段在 prevVersion 存在且有翻译
        const isDifferent = prevValue !== targetValue;
        
        // 如果翻译相同，或者 force 模式，或者 prevVersion 是 merge 版本，则更新并删除
        if (!isDifferent || force || isMergeVersion(prevVersion)) {
          // 更新 prevVersion（如果翻译不同）
          if (isDifferent) {
            setNestedValue(prevTrans, fieldPath, targetValue);
          }
          // 从 targetVersion 删除（需要检查是否可以删除）
          if (canDeleteField(targetVersion, fieldPath, translations, locale)) {
            deleteNestedValue(targetTrans, fieldPath);
            changes.moved.push({
              locale,
              fieldPath,
              from: targetVersion,
              to: prevVersion,
              reason: isDifferent && force ? "force 模式：强制覆盖旧版本" : undefined,
            });
          } else {
            // merge 版本不允许删除
            changes.protected.push({
              locale,
              fieldPath,
              version: targetVersion,
              reason: "merge 版本不允许删除，已更新到上一个版本",
            });
            // 仍然更新上一个版本
            changes.moved.push({
              locale,
              fieldPath,
              from: targetVersion,
              to: prevVersion,
              note: "保留在当前版本（merge 版本）",
              reason: isDifferent && force ? "force 模式：强制覆盖旧版本" : undefined,
            });
          }
          continue;
        }
        // 如果翻译不同且不是 force 模式，且 prevVersion 不是 merge 版本，则保持现状（在后续逻辑中处理）
      }
      
      // 情况2: 字段首次出现的版本没有翻译，找到最近的有翻译的版本来补充
      // 找到字段首次出现的版本（从旧到新遍历，即从高索引到低索引）
      let firstVersionIndex = -1;
      let firstVersion = null;
      for (let i = versions.length - 1; i >= targetIndex; i--) {
        const version = versions[i];
        const versionTrans = translations[locale][version];
        const versionValue = getNestedValue(versionTrans, fieldPath);
        if (versionValue !== undefined) {
          firstVersionIndex = i;
          firstVersion = version;
        }
      }
      
      if (firstVersionIndex === -1 || firstVersionIndex === targetIndex) {
        // 字段只在当前版本存在，或首次出现就是当前版本，不做处理
        continue;
      }
      
      const firstTrans = translations[locale][firstVersion];
      const firstValue = getNestedValue(firstTrans, fieldPath);
      
      // 如果首次出现的版本没有翻译，但当前版本有翻译
      if (!hasTranslation(firstValue) && hasTranslation(targetValue)) {
        // 将翻译补充到首次出现的版本
        setNestedValue(firstTrans, fieldPath, targetValue);
        changes.filled.push({
          locale,
          fieldPath,
          version: firstVersion,
          value: targetValue,
        });
        
        // 从当前版本移除（需要检查是否可以删除）
        if (canDeleteField(targetVersion, fieldPath, translations, locale)) {
          deleteNestedValue(targetTrans, fieldPath);
          changes.removed.push({
            locale,
            fieldPath,
            from: targetVersion,
            reason: "已移动到首次出现版本",
          });
        } else {
          // merge 版本不允许删除
          changes.protected.push({
            locale,
            fieldPath,
            version: targetVersion,
            reason: "merge 版本不允许删除，已补充到首次出现版本",
          });
        }
      }
    }
  }
  
  // 清理空对象
  for (const locale of locales) {
    for (const version of Object.keys(translations[locale])) {
      translations[locale][version] = cleanEmptyObjects(
        translations[locale][version]
      );
    }
  }
  
  // 生成日志文件路径
  const logPath = getLogPath(targetVersion);
  const logLines = [];
  
  // 添加日志头部信息
  const timestamp = new Date().toISOString();
  logLines.push("=".repeat(80));
  logLines.push(`翻译字段版本校准日志`);
  logLines.push(`版本: ${targetVersion}`);
  logLines.push(`执行时间: ${timestamp}`);
  logLines.push(`模式: ${dryRun ? "预览模式 (dry-run)" : "实际执行"}`);
  logLines.push(`Force 模式: ${force ? "已启用" : "未启用"}`);
  logLines.push(`上一个版本: ${prevVersion}`);
  if (isMergeVersion(targetVersion)) {
    logLines.push(`注意: ${targetVersion} 是 merge 版本，不允许删除已存在的字段`);
  }
  if (force) {
    logLines.push(`注意: Force 模式将强制用当前版本覆盖旧版本的不同翻译（3.4.4 和 2.8.0 除外）`);
  }
  logLines.push("=".repeat(80));
  logLines.push("");
  
  // 打印变更摘要（同时写入日志）
  const output = (message) => {
    console.log(message);
    logLines.push(message);
  };
  
  output("\n=== 变更摘要 ===");
  output(`\n移动到上一个版本 (${prevVersion}):`);
  if (changes.moved.length === 0) {
    output("  无");
  } else {
    changes.moved.forEach((change) => {
      const line = `  [${change.locale}] ${change.fieldPath}${change.note ? ` (${change.note})` : ""}`;
      output(line);
    });
  }
  
  output(`\n从当前版本移除:`);
  if (changes.removed.length === 0) {
    output("  无");
  } else {
    changes.removed.forEach((change) => {
      output(`  [${change.locale}] ${change.fieldPath} (${change.reason})`);
    });
  }
  
  output(`\n保持现状 (存在于多个版本且翻译不同):`);
  if (changes.kept.length === 0) {
    output("  无");
  } else {
    changes.kept.forEach((change) => {
      output(
        `  [${change.locale}] ${change.fieldPath} (存在于: ${change.versions.join(", ")})`
      );
    });
  }
  
  output(`\n去重处理 (多个版本翻译相同，只保留最旧版本):`);
  if (changes.deduplicated.length === 0) {
    output("  无");
  } else {
    const grouped = {};
    changes.deduplicated.forEach((change) => {
      const key = `${change.locale}.${change.fieldPath}`;
      if (!grouped[key]) {
        grouped[key] = {
          locale: change.locale,
          fieldPath: change.fieldPath,
          keptIn: change.keptIn,
          removedFrom: [],
        };
      }
      grouped[key].removedFrom.push(change.removedFrom);
    });
    Object.values(grouped).forEach((group) => {
      output(
        `  [${group.locale}] ${group.fieldPath} (保留在: ${group.keptIn}, 从以下版本移除: ${group.removedFrom.join(", ")})`
      );
    });
  }
  
  output(`\n补充翻译到首次出现版本:`);
  if (changes.filled.length === 0) {
    output("  无");
  } else {
    changes.filled.forEach((change) => {
      output(`  [${change.locale}] ${change.fieldPath} -> ${change.version}`);
    });
  }
  
  output(`\n受保护字段 (merge 版本不允许删除):`);
  if (changes.protected.length === 0) {
    output("  无");
  } else {
    changes.protected.forEach((change) => {
      output(
        `  [${change.locale}] ${change.fieldPath} (${change.version}: ${change.reason})`
      );
    });
  }
  
  // 统计信息
  const stats = {
    moved: changes.moved.length,
    removed: changes.removed.length,
    kept: changes.kept.length,
    deduplicated: changes.deduplicated.length,
    filled: changes.filled.length,
    protected: changes.protected.length,
  };
  
  output("\n=== 统计信息 ===");
  output(`移动到上一个版本: ${stats.moved} 个字段`);
  output(`从当前版本移除: ${stats.removed} 个字段`);
  output(`保持现状: ${stats.kept} 个字段`);
  output(`去重处理: ${stats.deduplicated} 个字段`);
  output(`补充翻译: ${stats.filled} 个字段`);
  output(`受保护字段: ${stats.protected} 个字段`);
  output(`总计处理: ${stats.moved + stats.removed + stats.kept + stats.deduplicated + stats.filled + stats.protected} 个字段`);
  
  // 保存文件
  if (!dryRun) {
    output("\n=== 保存文件 ===");
    for (const locale of locales) {
      for (const version of Object.keys(translations[locale])) {
        const filePath = path.resolve(
          __dirname,
          `../swagger/locales/${locale}/${version}.json`
        );
        const content = JSON.stringify(translations[locale][version], null, 2);
        fs.writeFileSync(filePath, content, "utf-8");
        output(`已保存: ${filePath}`);
      }
    }
    output("\n校准完成！");
  } else {
    output("\n=== 预览模式（未实际保存文件）===");
    output("移除 --dry-run 参数来实际保存更改");
  }
  
  // 写入日志文件
  logLines.push("");
  logLines.push("=".repeat(80));
  logLines.push(`日志结束`);
  logLines.push("=".repeat(80));
  logLines.push("");
  
  const logContent = logLines.join("\n");
  writeLog(logPath, logContent);
  console.log(`\n日志已保存到: ${logPath}`);
  
  return changes;
}

// 命令行参数
program
  .requiredOption("-v --version <version>", "要校准的版本号，例如: 4.7.0")
  .option("--dry-run", "预览模式，不实际保存文件", false)
  .option("--force", "强制模式：当旧版本存在但翻译不同时，用当前版本覆盖旧版本（3.4.4 和 2.8.0 除外）", false)
  .parse();

const options = program.opts();
const targetVersion = options.version;
const dryRun = options.dryRun || false;
const force = options.force || false;
calibrateVersion(targetVersion, dryRun, force);
