#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const https = require('https');
const http = require('http');

// SDK 配置映射
const SDK_CONFIG = {
  go: {
    repo: 'smartxworks/cloudtower-go-sdk',
    title: 'Go',
    outputPath: path.join(__dirname, '../docs/sdks/go.md'),
    description: 'Golang 环境下的 CloudTower SDK，适用于 golang 1.16 及以上版本'
  },
  java: {
    repo: 'smartxworks/cloudtower-java-sdk',
    title: 'Java',
    outputPath: path.join(__dirname, '../docs/sdks/java.md'),
    description: 'Java 环境下的 CloudTower SDK，适用于 Java 1.8 及以上版本'
  },
  python: {
    repo: 'smartxworks/cloudtower-python-sdk',
    title: 'Python',
    outputPath: path.join(__dirname, '../docs/sdks/python.md'),
    description: 'Python 环境下的 CloudTower SDK，适用于 2.7 和 3.4 及以上版本'
  }
};

/**
 * 从 GitHub 获取 README.md 内容
 * @param {string} repo - 仓库路径，格式: owner/repo
 * @param {string} branch - 分支名，默认为 'master'
 * @returns {Promise<string>} README 内容
 */
function fetchReadmeFromGitHub(repo, branch = 'master') {
  return new Promise((resolve, reject) => {
    const url = `https://raw.githubusercontent.com/${repo}/${branch}/README.md`;
    
    const protocol = url.startsWith('https') ? https : http;
    
    protocol.get(url, (res) => {
      if (res.statusCode === 301 || res.statusCode === 302) {
        // 处理重定向
        return fetchReadmeFromGitHub(res.headers.location).then(resolve).catch(reject);
      }
      
      if (res.statusCode !== 200) {
        reject(new Error(`Failed to fetch README: ${res.statusCode} ${res.statusMessage}`));
        return;
      }
      
      let data = '';
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        resolve(data);
      });
    }).on('error', (err) => {
      reject(err);
    });
  });
}

/**
 * 处理 README 内容，添加 frontmatter 并处理格式
 * @param {string} content - 原始 README 内容
 * @param {Object} config - SDK 配置
 * @returns {string} 处理后的内容
 */
function processReadmeContent(content, config) {
  // 移除可能存在的 frontmatter
  content = content.replace(/^---\s*\n[\s\S]*?\n---\s*\n/, '');
  
  // 添加 Docusaurus frontmatter
  const frontmatter = `---
title: ${config.title}
---

${config.description}

`;
  
  // 确保内容以换行符结尾
  if (!content.endsWith('\n')) {
    content += '\n';
  }
  
  return frontmatter + content;
}

/**
 * 同步单个 SDK 的 README
 * @param {string} sdkName - SDK 名称 (go, java, python)
 * @param {string} branch - GitHub 分支，默认为 'master'
 */
async function syncSdkReadme(sdkName, branch = 'master') {
  const config = SDK_CONFIG[sdkName];
  
  if (!config) {
    throw new Error(`Unknown SDK: ${sdkName}. Available: ${Object.keys(SDK_CONFIG).join(', ')}`);
  }
  
  console.log(`正在同步 ${config.title} SDK README...`);
  console.log(`仓库: ${config.repo}`);
  console.log(`分支: ${branch}`);
  
  try {
    // 获取 README 内容
    const readmeContent = await fetchReadmeFromGitHub(config.repo, branch);
    
    // 处理内容
    const processedContent = processReadmeContent(readmeContent, config);
    
    // 确保输出目录存在
    const outputDir = path.dirname(config.outputPath);
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }
    
    // 写入文件
    fs.writeFileSync(config.outputPath, processedContent, 'utf8');
    
    console.log(`✓ 成功同步到: ${config.outputPath}`);
    console.log(`  内容长度: ${processedContent.length} 字符\n`);
    
    return { success: true, path: config.outputPath };
  } catch (error) {
    console.error(`✗ 同步 ${config.title} SDK 失败:`, error.message);
    return { success: false, error: error.message };
  }
}

/**
 * 同步所有 SDK 的 README
 * @param {string} branch - GitHub 分支，默认为 'master'
 */
async function syncAllSdkReadmes(branch = 'master') {
  console.log('开始同步所有 SDK README...\n');
  
  const results = [];
  
  for (const sdkName of Object.keys(SDK_CONFIG)) {
    const result = await syncSdkReadme(sdkName, branch);
    results.push({ sdk: sdkName, ...result });
  }
  
  console.log('\n同步完成！');
  console.log('结果汇总:');
  results.forEach(({ sdk, success, path, error }) => {
    if (success) {
      console.log(`  ✓ ${sdk}: ${path}`);
    } else {
      console.log(`  ✗ ${sdk}: ${error}`);
    }
  });
  
  const successCount = results.filter(r => r.success).length;
  const failCount = results.length - successCount;
  
  console.log(`\n成功: ${successCount}, 失败: ${failCount}`);
  
  if (failCount > 0) {
    process.exit(1);
  }
}

// 命令行参数处理
const args = process.argv.slice(2);
const sdkName = args[0];
const branch = args[1] || 'master';

if (sdkName && SDK_CONFIG[sdkName]) {
  // 同步单个 SDK
  syncSdkReadme(sdkName, branch).then((result) => {
    if (!result.success) {
      process.exit(1);
    }
  });
} else if (sdkName === 'all' || !sdkName) {
  // 同步所有 SDK
  syncAllSdkReadmes(branch);
} else {
  console.error(`用法: node sync-sdk-readme.js [sdk-name|all] [branch]`);
  console.error(`\nSDK 名称: ${Object.keys(SDK_CONFIG).join(', ')}, all`);
  console.error(`示例:`);
  console.error(`  node sync-sdk-readme.js go          # 同步 Go SDK`);
  console.error(`  node sync-sdk-readme.js all        # 同步所有 SDK`);
  console.error(`  node sync-sdk-readme.js go main    # 从 main 分支同步 Go SDK`);
  process.exit(1);
}
