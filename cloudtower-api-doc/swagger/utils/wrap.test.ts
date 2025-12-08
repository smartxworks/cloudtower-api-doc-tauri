import { describe, it, expect, beforeAll, vi } from 'vitest';
import { OpenAPIV3 } from 'openapi-types';
import i18next from '../i18n';

// Mock swagger.ts 以避免 React/Docusaurus 依赖
vi.mock('./swagger', () => {
  return {
    ISpec: undefined, // 类型定义，实际不需要值
    SupportLanguage: {
      zh: 'zh',
      en: 'en',
    },
  };
});

import { wrapSpecWithI18n } from './wrap';

// 定义 ISpec 类型，避免导入包含 React/Docusaurus 依赖的 swagger.ts
type ISpec = OpenAPIV3.Document;
import { readFileSync, existsSync, readdirSync, writeFileSync, mkdirSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// 检查是否应该更新快照（通过环境变量控制）
const UPDATE_SNAPSHOTS = process.env.UPDATE_SNAPSHOTS === 'true' || process.env.UPDATE_SNAPSHOT === 'true';


const ALL_VERSIONS = [
  "4.7.0",
  "4.6.0",
  "4.5.0",
  "4.4.1",
  "4.4.0",
  "4.3.0",
  "4.2.0",
  "4.1.0",
  "4.0.0",
  "3.4.4",
  "2.8.0",
]

const LANGUAGES = ['zh', 'en'] as const;

// 快照文件目录（使用单独的目录，避免与 vitest 的 .snap 文件混淆）
const SNAPSHOTS_DIR = join(__dirname, '__snapshots_json__');

// 确保快照目录存在
function ensureSnapshotsDir() {
  if (!existsSync(SNAPSHOTS_DIR)) {
    mkdirSync(SNAPSHOTS_DIR, { recursive: true });
  }
}

// 获取快照文件路径
function getSnapshotPath(version: string, language: string): string {
  // 将版本号中的点替换为下划线，作为文件名的一部分
  const safeVersion = version.replace(/\./g, '_');
  return join(SNAPSHOTS_DIR, `${safeVersion}-${language}.json`);
}

// 辅助函数：加载 swagger spec
function loadSwaggerSpec(version: string): ISpec | null {
  const specPath = join(__dirname, '../../static/specs', `${version}-swagger.json`);
  if (!existsSync(specPath)) {
    return null;
  }
  const specContent = readFileSync(specPath, 'utf-8');
  return JSON.parse(specContent) as ISpec;
}

// 辅助函数：读取快照文件
function readSnapshot(version: string, language: string): ISpec | null {
  const snapshotPath = getSnapshotPath(version, language);
  if (!existsSync(snapshotPath)) {
    return null;
  }
  try {
    const snapshotContent = readFileSync(snapshotPath, 'utf-8');
    return JSON.parse(snapshotContent) as ISpec;
  } catch (error) {
    console.error(`Error reading snapshot ${snapshotPath}:`, error);
    return null;
  }
}

// 递归排序对象的所有键，确保快照文件顺序稳定
function sortObjectKeys(obj: any): any {
  if (obj === null || obj === undefined) {
    return obj;
  }
  
  // 如果是数组，保持数组顺序，但递归排序每个元素
  if (Array.isArray(obj)) {
    return obj.map(item => sortObjectKeys(item));
  }
  
  // 如果是基本类型，直接返回
  if (typeof obj !== 'object') {
    return obj;
  }
  
  // 如果是对象，按字母顺序排序所有键，并递归排序值
  const sortedObj: any = {};
  const keys = Object.keys(obj).sort();
  
  for (const key of keys) {
    sortedObj[key] = sortObjectKeys(obj[key]);
  }
  
  return sortedObj;
}

// 辅助函数：写入快照文件
function writeSnapshot(version: string, language: string, data: ISpec): void {
  ensureSnapshotsDir();
  const snapshotPath = getSnapshotPath(version, language);
  // 先对数据进行排序，确保顺序稳定
  const sortedData = sortObjectKeys(data) as ISpec;
  // 使用 JSON.stringify 格式化输出，便于阅读和 diff
  const formatted = JSON.stringify(sortedData, null, 2);
  writeFileSync(snapshotPath, formatted, 'utf-8');
  console.log(`✓ Snapshot updated: ${snapshotPath}`);
}

// 深度比较两个对象（用于更好的错误信息）
function deepEqual(a: any, b: any, path: string = ''): { equal: boolean; message?: string } {
  if (a === b) return { equal: true };
  
  if (a == null || b == null) {
    return { 
      equal: false, 
      message: `Mismatch at ${path}: ${a} !== ${b}` 
    };
  }
  
  if (typeof a !== typeof b) {
    return { 
      equal: false, 
      message: `Type mismatch at ${path}: ${typeof a} !== ${typeof b}` 
    };
  }
  
  if (typeof a !== 'object') {
    return { 
      equal: false, 
      message: `Value mismatch at ${path}: ${a} !== ${b}` 
    };
  }
  
  if (Array.isArray(a) !== Array.isArray(b)) {
    return { 
      equal: false, 
      message: `Array/Object mismatch at ${path}` 
    };
  }
  
  const keysA = Object.keys(a).sort();
  const keysB = Object.keys(b).sort();
  
  if (keysA.length !== keysB.length) {
    return { 
      equal: false, 
      message: `Key count mismatch at ${path}: ${keysA.length} !== ${keysB.length}` 
    };
  }
  
  for (const key of keysA) {
    if (!keysB.includes(key)) {
      return { 
        equal: false, 
        message: `Missing key at ${path}.${key}` 
      };
    }
    const result = deepEqual(a[key], b[key], path ? `${path}.${key}` : key);
    if (!result.equal) {
      return result;
    }
  }
  
  return { equal: true };
}

describe('wrapSpecWithI18n translation snapshots', () => {
  beforeAll(() => {
    // 确保 i18next 已初始化
    if (!i18next.isInitialized) {
      i18next.init();
    }
    // 确保快照目录存在
    ensureSnapshotsDir();
    
    // 如果启用了更新快照模式，打印提示信息
    if (UPDATE_SNAPSHOTS) {
      console.log('\n⚠️  UPDATE_SNAPSHOTS mode is enabled. Snapshots will be updated automatically.\n');
    }
  });

  // 为每个版本和语言组合生成独立的测试用例
  // 每个测试用例使用独立的 JSON 快照文件（不使用 vitest 的 toMatchSnapshot）
  ALL_VERSIONS.forEach(version => {
    LANGUAGES.forEach(language => {
      const testName = `version ${version} - ${language === 'zh' ? 'Chinese' : 'English'}`;
      
      it(testName, () => {
        const spec = loadSwaggerSpec(version);
        if (!spec) {
          // 如果 spec 文件不存在，跳过测试
          expect(true).toBe(true);
          return;
        }

        const result = wrapSpecWithI18n(spec, language, version);
        // 对结果进行排序，确保顺序稳定
        const sortedResult = sortObjectKeys(result) as ISpec;
        const existingSnapshot = readSnapshot(version, language);

        if (!existingSnapshot) {
          // 如果快照不存在，创建新的快照文件
          writeSnapshot(version, language, sortedResult);
          // 使用 expect.fail 来提示用户快照已创建
          expect.fail(
            `\n\n` +
            `═══════════════════════════════════════════════════════════\n` +
            `Snapshot file created: ${getSnapshotPath(version, language)}\n` +
            `Please review the snapshot and run the test again to verify.\n` +
            `═══════════════════════════════════════════════════════════\n`
          );
        } else {
          // 读取快照时也需要排序，确保比较的一致性
          const sortedSnapshot = sortObjectKeys(existingSnapshot) as ISpec;
          // 如果快照存在，比较结果
          const comparison = deepEqual(sortedResult, sortedSnapshot);
          if (!comparison.equal) {
            if (UPDATE_SNAPSHOTS) {
              // 如果启用了更新模式，自动更新快照
              writeSnapshot(version, language, sortedResult);
              // 测试通过，但提示快照已更新
              expect(sortedResult).toBeDefined();
            } else {
              // 如果结果不同且未启用更新模式，提供详细的错误信息和更新提示
              const snapshotPath = getSnapshotPath(version, language);
              expect(sortedResult).toEqual(sortedSnapshot);
              // 上面的 expect 会失败，但我们可以在这里添加额外的提示信息
              // 注意：由于 expect 失败，下面的代码不会执行
            }
          } else {
            // 结果相同，测试通过
            expect(sortedResult).toEqual(sortedSnapshot);
          }
        }
      });
    });
  });
});

