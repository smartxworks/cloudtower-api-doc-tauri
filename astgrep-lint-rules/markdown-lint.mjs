import markdown from '@ast-grep/lang-markdown'
import { registerDynamicLanguage, parse } from '@ast-grep/napi'
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

registerDynamicLanguage({ markdown })

// Get current directory (for ES modules)
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ANSI Color codes
const colors = {
    red: '\x1b[31m',
    green: '\x1b[32m',
    yellow: '\x1b[33m',
    blue: '\x1b[34m',
    magenta: '\x1b[35m',
    cyan: '\x1b[36m',
    white: '\x1b[37m',
    gray: '\x1b[90m',
    reset: '\x1b[0m',
    bold: '\x1b[1m'
};

// Function to read terminology regex from YAML file
function loadTerminologyRegexFromYaml() {
    try {
        const yamlPath = path.join(__dirname, 'utils', 'terminology.yml');
        const content = fs.readFileSync(yamlPath, 'utf-8');
        
        // Simple regex to extract the value after "regex:"
        // Matches: regex: <value>
        const match = content.match(/regex:\s*(.+?)$/m);
        
        if (match && match[1]) {
            const regexValue = match[1].trim();
            console.log(`${colors.green}✅ Loaded terminology regex from utils/terminology.yml${colors.reset}`);
            return regexValue;
        } else {
            throw new Error('Could not find regex pattern in YAML file');
        }
    } catch (error) {
        console.error(`${colors.yellow}⚠️ Failed to load terminology.yml: ${error.message}${colors.reset}`);
        console.log(`${colors.gray}Using fallback regex pattern${colors.reset}`);
        // Fallback regex if file reading fails
        return '(?i)(^|[^a-zA-Z])(SmartX|CloudTower)([^a-zA-Z]|$)';
    }
}

// Configuration
const config = {
    // File path patterns to scan (regex patterns)
    filePatterns: [
        /.+\.md$/i,             // API doc markdown files
    ],
    
    // File path patterns to exclude from linting (regex patterns)
    excludePatterns: [
        // Add your exclude patterns here
        // Example: /node_modules/,
        // Example: /\.git/,
        "contribute.md"
    ],
    
    // Base directory to start scanning
    baseDir: '.',
    
    // Load terminology regex from YAML file
    terminologyRegex: loadTerminologyRegexFromYaml()
};

// Function to collect all markdown files matching patterns
function collectFiles(dir, patterns, excludePatterns = []) {
    const files = [];
    
    function walkDir(currentDir) {
        try {
            const entries = fs.readdirSync(currentDir, { withFileTypes: true });
            
            for (const entry of entries) {
                const fullPath = path.join(currentDir, entry.name);
                
                if (entry.isDirectory()) {
                    // Skip node_modules and .git directories
                    if (entry.name !== 'node_modules' && entry.name !== '.git') {
                        walkDir(fullPath);
                    }
                } else if (entry.isFile()) {
                    // Check if file matches any pattern
                    const relativePath = path.relative('.', fullPath);
                    const matchesPattern = patterns.some(pattern => pattern.test(relativePath));
                    
                    if (matchesPattern) {
                        // Check if file should be excluded
                        const shouldExclude = excludePatterns.some(pattern => pattern.test(relativePath));
                        if (!shouldExclude) {
                            files.push(fullPath);
                        }
                    }
                }
            }
        } catch (error) {
            // Skip directories we can't read
        }
    }
    
    walkDir(dir);
    return files;
}

// Allowed exceptions for terminology regex
const allowedExceptions = [
    'ClusterType.SMTX_OS',
    'Hypervisor.ELF',
    'VmVolumeElfStoragePolicyType',
    'elf_image_id'
];

// Function to escape special regex characters
function escapeRegex(str) {
    return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

// Function to build exception regex from array
function buildExceptionRegex(exceptions) {
    const escapedExceptions = exceptions.map(escapeRegex);
    const pattern = escapedExceptions.join('|');
    return `(?i)(^|[^a-zA-Z])(${pattern})([^a-zA-Z]|$)`;
}
// Function to format error output with colors
function formatError(node, filePath, fileContent) {
    const range = node.range();
    const lines = fileContent.split('\n');
    const lineNum = range.start.line + 1; // 1-based line number
    const colNum = range.start.column + 1; // 1-based column number
    const lineContent = lines[range.start.line];
    
    // Calculate highlight position and length
    const startCol = range.start.column;
    const endCol = range.end.column;
    const highlight = '^'.repeat(Math.max(1, endCol - startCol));
    
    console.log(`${colors.red}error[no-terminology-markdown]${colors.reset}: Found restricted terminology in markdown`);
    console.log(`${colors.blue}     ┌─ ${filePath}:${lineNum}:${colNum}${colors.reset}`);
    console.log(`${colors.blue}     │${colors.reset}`);
    console.log(`${colors.blue}${lineNum.toString().padStart(5)} │${colors.reset} ${lineContent}`);
    console.log(`${colors.blue}     │${colors.reset} ${' '.repeat(startCol)}${colors.red}${highlight}${colors.reset}`);
    console.log(``);
}

// Function to check a single file
function checkFile(filePath) {
    const errors = [];
    
    try {
        const fileContent = fs.readFileSync(filePath, 'utf-8');
        const sg = parse('markdown', fileContent);
        
        const nodes = sg.root().findAll({
            rule: {
                any: [
                    { kind: 'inline' },
                    { kind: 'code_fence_content' },
                ],
                regex: config.terminologyRegex,
                not: {
                    regex: buildExceptionRegex(allowedExceptions)
                }
            },
        });
        
        nodes.forEach(node => {
            errors.push({ node, filePath, fileContent });
        });
    } catch (error) {
        console.error(`${colors.yellow}Warning: Could not read file ${filePath}: ${error.message}${colors.reset}`);
    }
    
    return errors;
}

// Main execution
function main() {
    console.log(`${colors.cyan}🔍 Scanning markdown files for restricted terminology...${colors.reset}\n`);
    
    // Collect all files to check
    const files = collectFiles(config.baseDir, config.filePatterns, config.excludePatterns);
    
    if (files.length === 0) {
        console.log(`${colors.yellow}No markdown files found matching the patterns.${colors.reset}`);
        return;
    }
    
    console.log(`${colors.gray}Found ${files.length} files to check${colors.reset}`);
    
    // Check all files and collect errors
    const allErrors = [];
    let checkedFiles = 0;
    
    for (const file of files) {
        const errors = checkFile(file);
        allErrors.push(...errors);
        checkedFiles++;
        
        if (errors.length > 0) {
            console.log(`${colors.gray}  ✗ ${path.relative('.', file)} (${errors.length} error${errors.length > 1 ? 's' : ''})${colors.reset}`);
        }
    }
    
    console.log('');
    
    // Output all errors
    allErrors.forEach(({ node, filePath, fileContent }) => {
        formatError(node, path.relative('.', filePath), fileContent);
    });
    
    // Summary
    if (allErrors.length > 0) {
        console.log(`${colors.red}${colors.bold}Error: ${allErrors.length} error(s) found in code.${colors.reset}`);
        console.log(`${colors.gray}Help: Scan succeeded and found error level diagnostics in the codebase.${colors.reset}`);
        console.log(``);
        process.exit(1);
    } else {
        console.log(`${colors.green}✅ No restricted terminology found in ${checkedFiles} files!${colors.reset}`);
    }
}

// Run the script
main();
