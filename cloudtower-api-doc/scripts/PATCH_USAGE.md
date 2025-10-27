# Swagger Patch 生成脚本使用说明

## 功能特性

1. **自动版本检测**: 从 `zh-release` 目录读取所有版本，按 semver 排序
2. **智能版本比较**: 自动找到指定版本的前一个版本进行比较
3. **多语言支持**: 
   - `zh-patch`: 从 zh-release 生成，包含中文文档
   - `en-patch`: 基于 zh-patch 生成，文档字段设为空字符串（待翻译）
4. **智能合并**: 默认保留已有 patch 内容，与新生成的内容合并
5. **强制覆盖**: 使用 `--force` 完全覆盖已有 patch
6. **字母排序**: 所有键按字母顺序排序，便于 diff 查看
7. **结构一致**: zh-patch 和 en-patch 保持完全相同的结构

## 使用方法

### 交互式模式（推荐）

```bash
node cloudtower-api-doc/scripts/generate-swagger-patches.js
```

脚本会提示输入：
- 版本号（例如：4.7.0）
- 是否强制覆盖已有 patch（默认：否）

### 非交互式模式

```bash
# 基本用法
printf "4.7.0\nn\n" | node cloudtower-api-doc/scripts/generate-swagger-patches.js

# 强制覆盖模式
printf "4.7.0\ny\n" | node cloudtower-api-doc/scripts/generate-swagger-patches.js
```

## 工作流程

1. **读取版本列表**: 从 `docs-swagger/zh-release` 读取所有 swagger 文件的版本号
2. **版本排序**: 按 semver 规则排序（1.8.0 < 1.9.0 < 1.10.0 < 2.0.0）
3. **确定比较版本**: 自动找到指定版本的前一个版本
4. **生成 zh-patch**: 
   - 从 zh-release 比较两个版本的差异
   - 只提取新增的文档字段（description, summary, title, x-displayName）
   - 如果已有 zh-patch，合并已有内容和新生成内容（已有内容优先）
   - 按字母顺序排序所有键
5. **生成 en-patch**: 
   - 基于 zh-patch 生成相同结构
   - 将所有文档字段设置为空字符串
   - 如果已有 en-patch，合并保留已翻译的内容
6. **输出文件**: 保存到 `zh-patch` 和 `en-patch` 目录

## 示例

### 示例 1: 生成 4.7.0 的 patch

```bash
$ printf "4.7.0\nn\n" | node cloudtower-api-doc/scripts/generate-swagger-patches.js

🚀 开始生成 Swagger Patch 文件...
📦 版本: 4.7.0
🔄 强制覆盖: 否

📚 发现 25 个版本: 1.8.0, 1.9.0, ..., 4.7.0

📝 比较版本: 4.6.0 -> 4.7.0

[ZH] 比较 4.6.0 -> 4.7.0...
  ✅ 新增文档字段: 15 paths, 5 schemas
  🔄 合并已有 patch 和新生成的 patch...
  📊 已有: 569 paths, 1617 schemas
  📊 新增: 15 paths, 5 schemas
  📊 合并后: 569 paths, 1617 schemas
  ✓ Patch 验证通过

[EN] 比较 4.6.0 -> 4.7.0...
  ⚠️  跳过: en-release/4.7.0-swagger.json 不存在

============================================================
📊 生成完成！
============================================================
✅ 成功: 1/2 语言
❌ 失败: 0/2 语言
```

### 示例 2: 强制覆盖已有 patch

```bash
$ printf "4.7.0\ny\n" | node cloudtower-api-doc/scripts/generate-swagger-patches.js

[ZH] 比较 4.6.0 -> 4.7.0...
  ✅ 新增文档字段: 15 paths, 5 schemas
  🔄 --force 模式: 覆盖已有 patch
  ✓ Patch 验证通过
```

## 注意事项

1. **首个版本**: 如果是列表中的第一个版本（如 1.8.0），会与空对象比较
2. **缺失文件**: 如果某个语言的 release 文件不存在，会跳过该语言
3. **版本验证**: 只能为 zh-release 目录中存在的版本生成 patch
4. **合并策略**: 
   - 默认模式：已有 patch 内容 + 新增内容
   - Force 模式：完全使用新生成的内容

## 输出目录结构

```
docs-swagger/
├── zh-release/          # 完整的中文 Swagger 文档
│   ├── 1.8.0-swagger.json
│   ├── 4.7.0-swagger.json
│   └── ...
├── zh-patch/            # 中文增量补丁
│   ├── 1.8.0-patch.json
│   ├── 4.7.0-patch.json
│   └── ...
├── en-release/          # 完整的英文 Swagger 文档
│   └── ...
└── en-patch/            # 英文增量补丁
    └── ...
```

## Patch 文件特点

- ✅ 只包含文档字段（description, summary, title, x-displayName）
- ✅ 所有键按字母顺序排序
- ✅ 可以直接 merge 回 release 文件
- ✅ 保持 Swagger 文档的基本结构
