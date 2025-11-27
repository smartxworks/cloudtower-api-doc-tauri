#!/usr/bin/env node

/**
 * only run when in LAN
 */
import fs from 'fs';
import path from 'path';
import http from 'http';
import https from 'https';
import { fileURLToPath } from 'url';

// Get current directory (for ES modules)
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// GitLab terminology JSON URL
const TERMINOLOGY_RAW_URL = 'http://gitlab.smartx.com/api/v4/projects/215/repository/files/packages%2Fterminology%2Fsrc%2Fterminology.json/raw';
// Get GitLab token from environment variable
const GITLAB_TOKEN = process.env.GITLAB_TOKEN || process.env.GITLAB_PRIVATE_TOKEN;

// ANSI colors for output
const colors = {
    green: '\x1b[32m',
    yellow: '\x1b[33m',
    blue: '\x1b[34m',
    cyan: '\x1b[36m',
    gray: '\x1b[90m',
    red: '\x1b[31m',
    reset: '\x1b[0m',
    bold: '\x1b[1m'
};

// Check for GitLab token at startup
if (!GITLAB_TOKEN) {
    console.error(`${colors.red}❌ Error: GitLab token is required!${colors.reset}`);
    console.error(`${colors.yellow}Please set GITLAB_TOKEN or GITLAB_PRIVATE_TOKEN environment variable.${colors.reset}`);
    console.error(`${colors.gray}Example: export GITLAB_TOKEN=your_token_here${colors.reset}\n`);
    process.exit(1);
}

console.log(`${colors.blue}🔄 Syncing terminology from GitLab...${colors.reset}\n`);

// No escaping needed - terms are used as-is
const safeRegex = (str) => str;

/**
 * 从 GitLab 获取 terminology.json 文件
 * @param {string} urlString - 可选的 URL（用于处理重定向）
 * @returns {Promise<Object>} Terminology 对象
 */
function fetchTerminologyFromGitLab(urlString = TERMINOLOGY_RAW_URL) {
    return new Promise((resolve, reject) => {
        const url = new URL(urlString);
        
        const options = {
            hostname: url.hostname,
            port: url.port || (url.protocol === 'https:' ? 443 : 80),
            path: url.pathname + (url.search || ''),
            method: 'GET',
            headers: {
                'User-Agent': 'Node.js Terminology Sync Script',
                'Private-Token': GITLAB_TOKEN,
                'Authorization': `Bearer ${GITLAB_TOKEN}`
            }
        };
        
        const protocol = url.protocol === 'https:' ? https : http;
        const req = protocol.request(options, (res) => {
            // 打印响应头用于调试
            if (process.env.DEBUG) {
                console.log(`${colors.gray}Response status: ${res.statusCode}${colors.reset}`);
                console.log(`${colors.gray}Content-Type: ${res.headers['content-type']}${colors.reset}`);
            }
            
            if (res.statusCode === 301 || res.statusCode === 302) {
                // 处理重定向
                const redirectUrl = res.headers.location;
                console.log(`${colors.cyan}Following redirect to: ${redirectUrl}${colors.reset}`);
                return fetchTerminologyFromGitLab(redirectUrl).then(resolve).catch(reject);
            }
            
            if (res.statusCode === 401 || res.statusCode === 403) {
                reject(new Error(
                    `Authentication failed (${res.statusCode}). Please check your GitLab token.\n` +
                    'Make sure GITLAB_TOKEN or GITLAB_PRIVATE_TOKEN is set correctly.\n' +
                    `URL: ${urlString}`
                ));
                return;
            }
            
            if (res.statusCode !== 200) {
                reject(new Error(
                    `Failed to fetch terminology: ${res.statusCode} ${res.statusMessage}\n` +
                    `URL: ${urlString}`
                ));
                return;
            }
            
            let data = '';
            res.setEncoding('utf8');
            res.on('data', (chunk) => {
                data += chunk;
            });
            
            res.on('end', () => {
                // 检查返回的内容是否是 HTML（可能是错误页面）
                const trimmedData = data.trim();
                if (trimmedData.startsWith('<!DOCTYPE') || trimmedData.startsWith('<html') || trimmedData.startsWith('<?xml')) {
                    // 尝试提取错误信息
                    let errorMsg = 'GitLab returned HTML instead of JSON.';
                    const titleMatch = data.match(/<title>(.*?)<\/title>/i);
                    if (titleMatch) {
                        errorMsg += ` Page title: ${titleMatch[1]}`;
                    }
                    
                    reject(new Error(
                        `${errorMsg}\n\n` +
                        `Possible causes:\n` +
                        `1. Authentication failed (check your token)\n` +
                        `2. URL is incorrect or file doesn't exist\n` +
                        `3. Insufficient permissions\n` +
                        `4. GitLab instance requires different authentication method\n\n` +
                        `URL: ${urlString}\n` +
                        `Response preview: ${data.substring(0, 300)}...`
                    ));
                    return;
                }
                
                try {
                    const terminology = JSON.parse(data);
                    resolve(terminology);
                } catch (error) {
                    reject(new Error(
                        `Failed to parse JSON: ${error.message}\n` +
                        `Response preview: ${data.substring(0, 200)}...`
                    ));
                }
            });
        });
        
        req.on('error', (err) => {
            reject(err);
        });
        
        req.setTimeout(10000, () => {
            req.destroy();
            reject(new Error('Request timeout'));
        });
        
        req.end();
    });
}

// Try to load terminology from GitLab
async function loadFromTowerTerminology() {
    try {
        console.log(`${colors.cyan}📥 Fetching terminology from GitLab...${colors.reset}`);
        const Terminology = await fetchTerminologyFromGitLab();
        
        // Extract terms from zh-CN and en-US
        const terms = ['zh-CN', 'en-US'].reduce((arr, lng) => {
            if (Terminology[lng]) {
                return Array.from(new Set(arr.concat(Object.values(Terminology[lng]))));
            }
            return arr;
        }, []);

        console.log(`${colors.green}✅ Loaded ${terms.length} terms from GitLab${colors.reset}`);
        return terms;
    } catch (error) {
        console.warn(`${colors.yellow}⚠️  Failed to load terminology from GitLab: ${error.message}${colors.reset}`);
    }
    
    return null;
}

// Load terminology (try GitLab first, fallback to hardcoded)
async function loadTerminology() {
    const terms = await loadFromTowerTerminology();
    // 确保返回数组而不是字符串
    if (!terms || !Array.isArray(terms)) {
        console.warn(`${colors.yellow}⚠️  No terms loaded, returning empty array${colors.reset}`);
        return [];
    }
    return terms;
}

// Generate regex pattern for the terms
function generateRegexPattern(terms) {
    if (!Array.isArray(terms) || terms.length === 0) {
        throw new Error('Terms must be a non-empty array');
    }
    const escapedTerms = terms.map(safeRegex);
    const forbiddenValues = escapedTerms.join('|');
    return `(?i)(^|[^a-zA-Z])(${forbiddenValues})([^a-zA-Z]|$)`;
}

// Update utils/terminology.yml file
function updateUtilsTerminologyYaml(regexPattern) {
    const filePath = path.join(__dirname, 'utils', 'terminology.yml');
    
    try {
        // Read current file to preserve structure
        let content = fs.readFileSync(filePath, 'utf-8');
        
        // Replace the regex line
        const regexLinePattern = /^(\s*regex:\s*)(.+)$/m;
        if (regexLinePattern.test(content)) {
            content = content.replace(regexLinePattern, `$1${regexPattern}`);
            fs.writeFileSync(filePath, content, 'utf-8');
            console.log(`${colors.green}✅ Updated utils/terminology.yml${colors.reset}`);
            return true;
        } else {
            console.log(`${colors.yellow}⚠️  Could not find regex pattern in utils/terminology.yml${colors.reset}`);
            return false;
        }
    } catch (error) {
        console.log(`${colors.yellow}❌ Error updating utils/terminology.yml: ${error.message}${colors.reset}`);
        return false;
    }
}

// Read regex from utils/terminology.yml
function readRegexFromUtilsYaml() {
    try {
        const filePath = path.join(__dirname, 'utils', 'terminology.yml');
        const content = fs.readFileSync(filePath, 'utf-8');
        const match = content.match(/regex:\s*(.+?)$/m);
        
        if (match && match[1]) {
            return match[1].trim();
        }
    } catch (error) {
        console.log(`${colors.yellow}⚠️  Could not read regex from utils/terminology.yml: ${error.message}${colors.reset}`);
    }
    return null;
}

// Main execution
async function main() {
    // Step 1: Load terminology
    const terms = await loadTerminology();
    
    if (!terms || !Array.isArray(terms) || terms.length === 0) {
        console.error(`${colors.red}❌ Error: No terms loaded. Cannot generate regex pattern.${colors.reset}`);
        console.error(`${colors.yellow}Please check your GitLab token and URL.${colors.reset}`);
        process.exit(1);
    }
    
    const regexPattern = generateRegexPattern(terms);
    
    console.log(`${colors.cyan}📊 Generated regex pattern with ${terms.length} terms${colors.reset}\n`);
    
    // Step 2: Update utils/terminology.yml (single source of truth)
    console.log(`${colors.bold}Step 1: Updating single source of truth${colors.reset}`);
    const utilsUpdated = updateUtilsTerminologyYaml(regexPattern);
    
    if (!utilsUpdated) {
        console.log(`${colors.yellow}\n⚠️  Failed to update utils/terminology.yml, aborting sync${colors.reset}`);
        process.exit(1);
    }
    
    console.log('');
    
    // Step 3: Read from utils/terminology.yml and sync to other files
    console.log(`${colors.bold}Step 2: Syncing to YAML rule files${colors.reset}`);
    const sourceRegex = readRegexFromUtilsYaml();
    
    if (!sourceRegex) {
        console.log(`${colors.yellow}\n⚠️  Could not read regex from utils/terminology.yml, aborting sync${colors.reset}`);
        process.exit(1);
    }
}

// Run the script
main().catch((error) => {
    console.error(`${colors.yellow}❌ Fatal error: ${error.message}${colors.reset}`);
    process.exit(1);
});

