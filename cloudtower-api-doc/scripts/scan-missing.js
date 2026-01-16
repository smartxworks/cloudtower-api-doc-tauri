#!/usr/bin/env node
/**
 * 扫描翻译文件中缺失的内容
 * 
 * 功能：
 * - 检查 paths 中缺失的 summary 和 description
 * - 检查 schemas 中缺失的字段翻译
 * - 检查 tags 中缺失的显示名称和描述（如果存在）
 * 
 * 输出 check-missing.log 文件，按版本从新到旧排序
 */

const fs = require('fs');
const path = require('path');

/**
 * 检查值是否为空（空字符串或未定义）
 */
function isEmpty(value) {
  return value === '' || value === undefined || value === null;
}

/**
 * 检查字符串是否只包含空白字符
 */
function isWhitespaceOnly(value) {
  return typeof value === 'string' && value.trim() === '';
}

/**
 * 检查 schema 是否有缺失的翻译
 */
function hasMissingTranslations(schemaName, schemaValue) {
  // 跳过 Connection 和 WhereInput 类型（这些通常由脚本自动生成）
  if (schemaName.endsWith('Connection') || schemaName.endsWith('WhereInput')) {
    return false;
  }

  if (!schemaValue || typeof schemaValue !== 'object') {
    return false;
  }

  // 检查所有字段，排除特殊字段
  const excludeKeys = ['data', 'where', 'enum'];
  
  for (const [key, value] of Object.entries(schemaValue)) {
    // 跳过排除的键
    if (excludeKeys.includes(key)) {
      continue;
    }
    
    // 检查是否为空
    if (isEmpty(value) || isWhitespaceOnly(value)) {
      return true;
    }
  }

  // 特殊处理 enum 字段：检查是否有未翻译的枚举值
  if (schemaValue.enum && typeof schemaValue.enum === 'string') {
    const enumLines = schemaValue.enum.split('\n');
    const hasUntranslatedEnum = enumLines.some(line => {
      const trimmed = line.trim();
      // 检查是否有以冒号结尾但后面没有内容的行（表示未翻译）
      return trimmed && trimmed.endsWith(':') && trimmed.length > 1;
    });
    if (hasUntranslatedEnum) {
      return true;
    }
  }

  return false;
}

/**
 * 扫描单个翻译文件
 */
function scanTranslationFile(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf-8');
    const spec = JSON.parse(content);
    const { paths = {}, schemas = {}, tags = [] } = spec;

    // 如果文件不包含任何有效内容，跳过
    if (!paths && !schemas && (!tags || tags.length === 0)) {
      return null;
    }

    // 检查 paths
    const missSummary = {
      count: 0,
      paths: [],
    };
    const missDescription = {
      count: 0,
      paths: [],
    };

    if (paths && typeof paths === 'object') {
      const pathEntries = Object.entries(paths);
      pathEntries.forEach(([pathKey, pathValue]) => {
        if (!pathValue || typeof pathValue !== 'object') {
          return;
        }

        const summary = pathValue.summary;
        const description = pathValue.description;

        if (isEmpty(summary) || isWhitespaceOnly(summary)) {
          missSummary.count += 1;
          missSummary.paths.push(pathKey);
        }

        if (isEmpty(description) || isWhitespaceOnly(description)) {
          missDescription.count += 1;
          missDescription.paths.push(pathKey);
        }
      });
    }

    // 检查 schemas
    const missSchemas = {
      count: 0,
      schemas: [],
      details: {}, // 记录每个 schema 缺失的字段
    };

    if (schemas && typeof schemas === 'object') {
      const schemaEntries = Object.entries(schemas);
      schemaEntries.forEach(([schemaName, schemaValue]) => {
        if (hasMissingTranslations(schemaName, schemaValue)) {
          missSchemas.count += 1;
          missSchemas.schemas.push(schemaName);

          // 记录缺失的字段详情
          const missingFields = [];
          if (schemaValue && typeof schemaValue === 'object') {
            for (const [key, value] of Object.entries(schemaValue)) {
              if (!['data', 'where', 'enum'].includes(key)) {
                if (isEmpty(value) || isWhitespaceOnly(value)) {
                  missingFields.push(key);
                }
              }
            }

            // 检查 enum
            if (schemaValue.enum && typeof schemaValue.enum === 'string') {
              const enumLines = schemaValue.enum.split('\n');
              const untranslatedEnums = enumLines
                .filter(line => {
                  const trimmed = line.trim();
                  return trimmed && trimmed.endsWith(':') && trimmed.length > 1;
                })
                .map(line => line.trim());
              if (untranslatedEnums.length > 0) {
                missingFields.push(`enum (${untranslatedEnums.length} 个未翻译)`);
              }
            }
          }

          if (missingFields.length > 0) {
            missSchemas.details[schemaName] = missingFields;
          }
        }
      });
    }

    // 检查 tags（如果存在）
    const missDisplayName = {
      count: 0,
      tags: [],
    };
    const missTagDescription = {
      count: 0,
      tags: [],
    };

    if (Array.isArray(tags) && tags.length > 0) {
      tags.forEach(tag => {
        if (!tag || typeof tag !== 'object') {
          return;
        }

        const displayName = tag['x-displayName'];
        const description = tag.description;

        if (isEmpty(displayName) || isWhitespaceOnly(displayName)) {
          missDisplayName.count += 1;
          missDisplayName.tags.push(tag.name || 'unknown');
        }

        if (isEmpty(description) || isWhitespaceOnly(description)) {
          missTagDescription.count += 1;
          missTagDescription.tags.push(tag.name || 'unknown');
        }
      });
    }

    return {
      pathDetail: {
        total: paths ? Object.keys(paths).length : 0,
        missSummary,
        missDescription,
      },
      schemaDetail: {
        total: schemas ? Object.keys(schemas).length : 0,
        missSchemas,
      },
      tagDetail: {
        total: Array.isArray(tags) ? tags.length : 0,
        missDisplayName,
        missDescription: missTagDescription,
      },
    };
  } catch (error) {
    console.error(`处理文件失败 ${filePath}:`, error.message);
    return null;
  }
}

/**
 * 格式化输出内容（Markdown 格式，用于 PR 评论）
 */
function formatLogEntry(version, language, result) {
  const { pathDetail, schemaDetail, tagDetail } = result;
  const totalMissing = 
    pathDetail.missSummary.count +
    pathDetail.missDescription.count +
    schemaDetail.missSchemas.count +
    tagDetail.missDisplayName.count +
    tagDetail.missDescription.count;

  if (totalMissing === 0) {
    return null; // 没有缺失，不输出
  }

  let output = `\n### 📦 版本 ${version} (${language.toUpperCase()})\n\n`;
  output += `**总计缺失: ${totalMissing} 项**\n\n`;

  // Paths 缺失
  if (pathDetail.missSummary.count > 0 || pathDetail.missDescription.count > 0) {
    output += `#### 🔗 Paths (总计: ${pathDetail.total})\n\n`;
    if (pathDetail.missSummary.count > 0) {
      output += `**缺失 summary: ${pathDetail.missSummary.count} 个**\n\n`;
      if (pathDetail.missSummary.paths.length <= 10) {
        output += '<details>\n<summary>查看详情</summary>\n\n';
        output += '```\n';
        pathDetail.missSummary.paths.forEach(p => {
          output += `${p}\n`;
        });
        output += '```\n\n';
        output += '</details>\n\n';
      } else {
        output += '<details>\n<summary>查看详情（显示前 10 个）</summary>\n\n';
        output += '```\n';
        pathDetail.missSummary.paths.slice(0, 10).forEach(p => {
          output += `${p}\n`;
        });
        output += '```\n\n';
        output += `*还有 ${pathDetail.missSummary.paths.length - 10} 个未显示*\n\n`;
        output += '</details>\n\n';
      }
    }
    if (pathDetail.missDescription.count > 0) {
      output += `**缺失 description: ${pathDetail.missDescription.count} 个**\n\n`;
      if (pathDetail.missDescription.paths.length <= 10) {
        output += '<details>\n<summary>查看详情</summary>\n\n';
        output += '```\n';
        pathDetail.missDescription.paths.forEach(p => {
          output += `${p}\n`;
        });
        output += '```\n\n';
        output += '</details>\n\n';
      } else {
        output += '<details>\n<summary>查看详情（显示前 10 个）</summary>\n\n';
        output += '```\n';
        pathDetail.missDescription.paths.slice(0, 10).forEach(p => {
          output += `${p}\n`;
        });
        output += '```\n\n';
        output += `*还有 ${pathDetail.missDescription.paths.length - 10} 个未显示*\n\n`;
        output += '</details>\n\n';
      }
    }
  }

  // Schemas 缺失
  if (schemaDetail.missSchemas.count > 0) {
    output += `#### 📋 Schemas (总计: ${schemaDetail.total})\n\n`;
    output += `**缺失字段的 schema: ${schemaDetail.missSchemas.count} 个**\n\n`;
    
    // 显示前 20 个 schema 的详细信息
    const schemasToShow = schemaDetail.missSchemas.schemas.slice(0, 20);
    if (schemasToShow.length > 0) {
      output += '<details>\n<summary>查看详情</summary>\n\n';
      schemasToShow.forEach(schemaName => {
        const missingFields = schemaDetail.missSchemas.details[schemaName] || [];
        if (missingFields.length > 0) {
          output += `- **${schemaName}** (${missingFields.length} 个缺失字段)\n`;
          if (missingFields.length <= 5) {
            missingFields.forEach(field => {
              output += `  - ${field}\n`;
            });
          } else {
            missingFields.slice(0, 5).forEach(field => {
              output += `  - ${field}\n`;
            });
            output += `  - *还有 ${missingFields.length - 5} 个字段*\n`;
          }
        } else {
          output += `- **${schemaName}**\n`;
        }
      });
      
      if (schemaDetail.missSchemas.schemas.length > 20) {
        output += `\n*还有 ${schemaDetail.missSchemas.schemas.length - 20} 个 schema 未显示*\n`;
      }
      output += '\n</details>\n\n';
    }
  }

  // Tags 缺失
  if (tagDetail.missDisplayName.count > 0 || tagDetail.missDescription.count > 0) {
    output += `#### 🏷️ Tags (总计: ${tagDetail.total})\n\n`;
    if (tagDetail.missDisplayName.count > 0) {
      output += `**缺失 displayName: ${tagDetail.missDisplayName.count} 个**\n\n`;
      if (tagDetail.missDisplayName.tags.length <= 10) {
        output += '<details>\n<summary>查看详情</summary>\n\n';
        output += '```\n';
        tagDetail.missDisplayName.tags.forEach(t => {
          output += `${t}\n`;
        });
        output += '```\n\n';
        output += '</details>\n\n';
      } else {
        output += '<details>\n<summary>查看详情（显示前 10 个）</summary>\n\n';
        output += '```\n';
        tagDetail.missDisplayName.tags.slice(0, 10).forEach(t => {
          output += `${t}\n`;
        });
        output += '```\n\n';
        output += `*还有 ${tagDetail.missDisplayName.tags.length - 10} 个未显示*\n\n`;
        output += '</details>\n\n';
      }
    }
    if (tagDetail.missDescription.count > 0) {
      output += `**缺失 description: ${tagDetail.missDescription.count} 个**\n\n`;
      if (tagDetail.missDescription.tags.length <= 10) {
        output += '<details>\n<summary>查看详情</summary>\n\n';
        output += '```\n';
        tagDetail.missDescription.tags.forEach(t => {
          output += `${t}\n`;
        });
        output += '```\n\n';
        output += '</details>\n\n';
      } else {
        output += '<details>\n<summary>查看详情（显示前 10 个）</summary>\n\n';
        output += '```\n';
        tagDetail.missDescription.tags.slice(0, 10).forEach(t => {
          output += `${t}\n`;
        });
        output += '```\n\n';
        output += `*还有 ${tagDetail.missDescription.tags.length - 10} 个未显示*\n\n`;
        output += '</details>\n\n';
      }
    }
  }

  return output;
}

/**
 * 主函数
 */
function main() {
  const localesDir = path.resolve(__dirname, '../swagger/locales');
  const outputLogPath = path.join(__dirname, 'check-missing.log');

  // 读取版本列表（从新到旧）
  const versionsPath = path.resolve(__dirname, './versions.json');
  let versions = [];
  try {
    versions = JSON.parse(fs.readFileSync(versionsPath, 'utf-8'));
  } catch (error) {
    console.error('无法读取 versions.json，将扫描所有文件:', error.message);
  }

  console.log('开始扫描翻译文件...\n');
  console.log(`扫描目录: ${localesDir}`);
  console.log(`输出文件: ${outputLogPath}\n`);

  let logContent = '';
  logContent += '## 📋 翻译缺失检查报告\n\n';
  logContent += `**生成时间:** ${new Date().toLocaleString('zh-CN')}\n\n`;
  logContent += '---\n\n';

  let totalProcessed = 0;
  let totalWithMissing = 0;
  let totalMissingCount = 0;

  // 按版本顺序处理（从新到旧）
  const languages = ['zh', 'en'];
  
  versions.forEach(version => {
    languages.forEach(language => {
      // 处理版本号映射（2.x -> 2x, 3.x -> 3x）
      let localesVersion = version;
      if (version.startsWith('3.')) {
        localesVersion = '3.4.4'; // 3.x 版本使用 3.4.4
      } else if (version.startsWith('2.')) {
        localesVersion = '2.8.0'; // 2.x 版本使用 2.8.0
      }

      const filePath = path.join(localesDir, language, `${localesVersion}.json`);
      
      if (!fs.existsSync(filePath)) {
        return; // 文件不存在，跳过
      }

      const result = scanTranslationFile(filePath);
      
      if (result) {
        totalProcessed++;
        
        const formatted = formatLogEntry(version, language, result);
        if (formatted) {
          totalWithMissing++;
          const totalMissing = 
            result.pathDetail.missSummary.count +
            result.pathDetail.missDescription.count +
            result.schemaDetail.missSchemas.count +
            result.tagDetail.missDisplayName.count +
            result.tagDetail.missDescription.count;
          totalMissingCount += totalMissing;
          logContent += formatted;
        }
      }
    });
  });

  // 如果没有缺失项，显示成功消息
  if (totalMissingCount === 0 && totalProcessed > 0) {
    logContent += '\n✅ **所有翻译文件完整，没有缺失项！**\n\n';
  } else if (totalProcessed === 0) {
    logContent += '\n⚠️ **未找到需要检查的翻译文件**\n\n';
  }

  // 添加汇总信息
  logContent += '\n---\n\n';
  logContent += '## 📊 汇总统计\n\n';
  logContent += '| 项目 | 数量 |\n';
  logContent += '|------|------|\n';
  logContent += `| 处理文件数 | ${totalProcessed} |\n`;
  logContent += `| 有缺失的文件数 | ${totalWithMissing} |\n`;
  logContent += `| 总缺失项数 | **${totalMissingCount}** |\n`;

  // 写入日志文件
  fs.writeFileSync(outputLogPath, logContent, 'utf-8');

  console.log(`\n扫描完成！`);
  console.log(`处理文件: ${totalProcessed} 个`);
  console.log(`有缺失的文件: ${totalWithMissing} 个`);
  console.log(`总缺失项数: ${totalMissingCount} 项`);
  console.log(`报告已保存到: ${outputLogPath}`);
}

// 执行主函数
if (require.main === module) {
  main();
}

module.exports = { scanTranslationFile, hasMissingTranslations };
