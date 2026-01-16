# CloudTower API 文档贡献指南


## 工作流程建议

### 添加新版本 API 文档

1. **同步或更新 Swagger 文件**
   ```bash
   # 确保 file.smtx.io/operation-api-schema/smartx 已有
   yarn sync:swagger <oapi-tag> -v <version>
   ```

2. **创建新版本翻译文件**
   ```bash
   yarn api:new
   # 输入新版本号
   ```

3. **补充翻译内容**
   - 编辑 `swagger/locales/{语言}/{版本}.json` 文件
   - 填写所有空字符串的翻译

4. **检查缺失内容**
   ```bash
   yarn api:scan
   ```

5. **生成示例代码**
   ```bash
   yarn api:new-example
   ```

### 更新现有版本

1. **同步或更新 Swagger 文件**（如果 API 有变更）
   ```bash
   yarn sync:swagger <oapi-tag> -v <version>
   ```

2. **更新翻译文件**
   ```bash
   yarn api:update
   # 输入要更新的版本号
   ```
   - 脚本会自动识别新增字段和 API 路径
   - 只为新增内容生成空占位符
   - 保留已有翻译，不会覆盖

3. **（可选）自动填充 WhereInput 翻译**
   ```bash
   yarn api:update --fill-where
   # 或
   node update-api-doc.js --fill-where
   ```
   - 从基础资源类型（如 `Cluster`）自动填充对应的 `WhereInput`（如 `ClusterWhereInput`）翻译
   - 适用于批量填充 `WhereInput` 类型的翻译
   - 只填充空字符串或未存在的字段，不会覆盖已有翻译

4. **补充新增内容的翻译**
   - 编辑 `swagger/locales/{语言}/{版本}.json` 文件
   - 填写新增字段的空字符串翻译

5. **检查缺失内容**
   ```bash
   yarn api:scan
   ```
   - 查看 `scripts/check-missing.log` 文件
   - 按版本从新到旧展示缺失翻译

6. **重新生成示例代码**（如果需要）
   ```bash
   yarn api:new-example -v <version>
   ```

## 脚本说明

本文档说明 `cloudtower-api-doc/scripts/` 目录下各个脚本的功能和使用方法。

###  build-docs.js

**功能**: 构建 API 文档，将 Swagger 规范文件转换为 Markdown 和 DOCX 格式的文档。

**注意**: 由于我们当前的文档结构较大，生成的 DOCX 目前阅读体验较差。仅需要相关格式文件的时候才执行提供。

**使用方法**:
```bash
yarn api:docx
# 交互式输入版本号，或使用 '*' 处理所有版本
```

**注意事项**:
- 每次只处理一个版本
- 建议先用 `--dry-run` 预览更改
- 版本关系参考 `versions.json`
- 空值不作为有效翻译值
- 每次执行的结果会自动保存到 `logs/` 目录下的日志文件中

### create-new-api-doc.js

**功能**: 创建新 API 文档的翻译文件，只处理新增的字段和路径。**自动更新相关配置文件**。

**主要功能**:
- **自动更新配置文件**（如果版本不存在）:
  - 更新 `versions.json`：在数组开头添加新版本
  - 更新 `swagger/i18n.ts`：添加 import 语句、更新 resources、fallbackNS 和 ns 数组
  - 更新 `swagger/utils/swagger.ts`：在 defaultSpecMap 中添加新版本映射
- 对比当前版本和上一个版本的 Swagger 规范
- 识别新增的 schema 字段和 API 路径
- 只为新增内容生成翻译占位符
- 保留已有翻译，不覆盖现有内容

**使用方法**:
```bash
node create-new-api-doc.js
# 交互式输入版本号
```

**工作流程**:
1. **自动更新配置文件**（按顺序执行）:
   - 检查并更新 `versions.json`（如果版本不存在）
   - 检查并更新 `swagger/i18n.ts`（添加 import、resources、fallbackNS、ns）
   - 检查并更新 `swagger/utils/swagger.ts`（添加 defaultSpecMap 条目）
2. 加载当前版本和上一个版本的 Swagger 规范
3. 对比 schema，找出新增字段
4. 对比 paths，找出新增 API
5. 为新增内容生成空的翻译占位符
6. 保存到对应的语言版本文件中

**注意事项**:
- **必须确保 Swagger 规范文件已存在**：脚本会在开始时检查 swagger 文件，如果不存在会抛出错误
- 如果配置文件中已存在该版本，会自动跳过更新并提示
- 配置文件更新失败不会中断翻译文件的创建流程
- 建议在运行脚本前先执行 `sync-swagger.js` 下载 Swagger 规范文件

### 4. create-new-api-example.js

**功能**: 创建 API 示例代码，生成 curl、Python、Go、Java 等语言的代码示例。

**主要功能**:
- 遍历 Swagger 规范中的所有 API 路径
- 为每个需要请求体的 API 生成示例代码
- 支持生成 curl、Python、Go、Java 代码片段
- 生成示例请求体数据

**使用方法**:
```bash
node create-new-api-example.js -v <version>
# 例如: node create-new-api-example.js -v 4.7.0
```

**输出**: 生成的示例代码保存到 `swagger/examples/swagger-examples.json`

### merge-json.js

**功能**: 合并多个 JSON 文件为一个文件。

**主要功能**:
- 将多个 JSON 文件合并为一个
- 后面的文件会覆盖前面文件的相同键值
- 使用 lodash 的 merge 函数进行深度合并

**使用方法**:
```bash
node merge-json.js <output.json> <input1.json> <input2.json> ...
# 例如: node merge-json.js merged.json file1.json file2.json file3.json
```

**使用场景**: 用于合并多个翻译文件或配置文件， 例如 2.x 和 3.x 版本已经不在推进后，将历史版本文件最终合并且存档为一份完整的翻译文件。

### scan-missing.js

**功能**: 扫描翻译文件中缺失的内容，生成统一的日志报告。

**主要功能**:
- 按版本从新到旧遍历所有翻译文件（中文和英文）
- 检查 paths 中缺失的 summary 和 description
- 检查 schemas 中缺失的字段翻译
- 检查 tags 中缺失的显示名称和描述
- 生成统一的缺失内容报告

**使用方法**:
```bash
yarn api:scan
# 或
node scan-missing.js
```

**输出**: 生成 `scripts/check-missing.log` 文件，包含所有版本的缺失内容

**报告格式**:
- 按版本从新到旧展示
- 每个版本/语言组合包含：
  - 总计缺失项数
  - Paths 缺失详情（summary 和 description）
  - Schemas 缺失详情（包含具体缺失字段）
  - Tags 缺失详情（displayName 和 description）
- 文件末尾包含汇总统计

**报告内容**:
- 路径详情：缺失 summary 和 description 的 API 列表（最多显示 10 个）
- Schema 详情：缺失翻译的 Schema 列表（最多显示 20 个，每个 schema 最多显示 5 个字段）
- Tag 详情：缺失显示名称和描述的 Tag 列表（最多显示 10 个）
- 汇总统计：处理文件数、有缺失的文件数、总缺失项数

### sync-sdk-readme.js

**功能**: 从 GitHub 同步 SDK 的 README 文件到本地文档。

**主要功能**:
- 从 GitHub 仓库获取 Go、Java、Python SDK 的 README
- 添加 Docusaurus frontmatter
- 保存到对应的文档目录

**支持的 SDK**:
- Go: `smartxworks/cloudtower-go-sdk`
- Java: `smartxworks/cloudtower-java-sdk`
- Python: `smartxworks/cloudtower-python-sdk`

**使用方法**:
```bash
# 同步所有 SDK
node sync-sdk-readme.js all

# 同步单个 SDK
node sync-sdk-readme.js go
node sync-sdk-readme.js java
node sync-sdk-readme.js python

# 指定分支
node sync-sdk-readme.js go main
```

**输出路径**:
- Go: `docs/sdks/go.md`
- Java: `docs/sdks/java.md`
- Python: `docs/sdks/python.md`

### sync-swagger.js

**功能**: 从远程服务器同步 Swagger 规范文件。

**主要功能**:
- 从 `http://file.smtx.io/operation-api-schema/smartx` 下载 Swagger 规范
- 根据版本号和 OAPI tag 下载对应的规范文件
- 格式化 JSON 并保存到本地

**使用方法**:
```bash
node sync-swagger.js -t <oapi-tag> -v <version>
# 例如: node sync-swagger.js -t <tag> -v 4.7.0
```

**输出**: 保存到 `static/specs/{version}-swagger.json`

### update-api-doc.js

**功能**: 增量更新现有版本的翻译文件，**只处理当前版本新增的字段**，保留当前版本已有的所有翻译。**不会自动更新配置文件**。

**主要功能**:
- 对比当前版本和上一个版本的 Swagger 规范
- 识别新增的 schema 字段和 API 路径
- 只为新增内容生成翻译占位符（空字符串）
- **保留已有翻译**：如果字段在当前版本已有翻译（即使字段在之前版本存在），保持不变
- **处理 WhereInput 变体字段**：对于 `WhereInput` 类型，自动为新增的基础字段生成所有变体字段（`_not`, `_in`, `_not_in`, `_gt`, `_gte` 等）
- **更新空字符串字段**：即使没有新增字段，也会检查并更新值为空字符串的字段

**使用方法**:
```bash
# 基本用法
yarn api:update
# 或
node update-api-doc.js
# 交互式输入版本号

# 使用 --fill-where 参数自动填充 WhereInput 翻译
node update-api-doc.js --fill-where
# 或
yarn api:update --fill-where
```

**工作流程**:
1. 检查 Swagger 规范文件是否存在
2. 加载当前版本和上一个版本的 Swagger 规范
3. 对比 schema，找出新增字段（通过 `getNewSchemaFields` 递归对比）
4. 对于 `WhereInput` 类型，为每个新增基础字段生成所有变体字段
5. 对比 paths，找出新增 API
6. 为新增内容生成空的翻译占位符
7. 更新值为空字符串的现有字段
8. 保存到对应的语言版本文件中

**更新逻辑**:
- **新增字段且没有翻译**：添加占位符（空字符串）
- **之前版本有的字段，但当前版本有翻译**：保持不变（不覆盖）
- **之前版本有的字段，当前版本没有翻译**：不处理（因为不是新增字段）
- **字段已存在但值为空字符串**：会更新为新生成的翻译内容

**--fill-where 参数**:
当使用 `--fill-where` 参数时，脚本会自动从基础资源类型填充 `WhereInput` 类型的翻译：
- 自动查找对应的基础资源类型（如 `ClusterWhereInput` → `Cluster`）
- 从基础资源类型的翻译中填充 `WhereInput` 的字段翻译
- 支持所有变体字段的自动填充：
  - 直接匹配：`field` → `field`
  - 变体字段：`field_in` → `field` + "在指定范围中"
  - 变体字段：`field_not` → `field` + "不等于指定数值"
  - 变体字段：`field_gt` → `field` + "大于指定数值"
  - 等等（支持所有 `_in`, `_not`, `_contains`, `_gt`, `_gte`, `_lt`, `_lte` 等后缀）
- 只填充空字符串或未存在的字段，不会覆盖已有翻译
- 适用于批量填充 `WhereInput` 类型的翻译，提高翻译效率

**与 create-new-api-doc.js 的区别**:
- `create-new-api-doc.js`：用于**创建新版本**，会自动更新配置文件（versions.json, i18n.ts, swagger.ts）
- `update-api-doc.js`：用于**更新现有版本**，只更新翻译文件，不更新配置文件

**注意事项**:
- **必须确保 Swagger 规范文件已存在**：脚本会在开始时检查 swagger 文件，如果不存在会抛出错误
- 脚本会保留当前版本已有的所有翻译，不会覆盖
- 对于 `WhereInput` 类型，会自动处理所有查询变体字段（`_not`, `_in`, `_not_in`, `_gt`, `_gte`, `_lt`, `_lte`, `_contains` 等）
- 即使字段已存在但值为空字符串，也会更新为新生成的翻译内容
- **使用 `--fill-where` 参数时**：
  - 确保基础资源类型（如 `Cluster`）已有翻译
  - 只会填充空字符串或未存在的字段，不会覆盖已有翻译
  - 适用于批量填充 `WhereInput` 类型的翻译
- 建议在运行脚本前先执行 `sync-swagger.js` 下载 Swagger 规范文件



## 注意事项

1. **版本顺序**: `versions.json` 中的版本顺序很重要，从新到旧排列。
2. **Merge 版本**: 2.8.0 和 3.4.4 是特殊的 merge 版本，不允许删除已存在的字段
3. **翻译文件格式**: 翻译文件使用 JSON 格式，包含 `schemas`、`paths`、`tags` 三个主要部分（新版本可能没有 `tags`）
4. **空值处理**: 空字符串 `""` 被视为未翻译，需要补充
6. **配置文件自动更新**: `create-new-api-doc.js` 会自动更新相关配置文件，如果版本已存在会跳过更新
7. **变量命名规则**: i18n.ts 中的变量名遵循特定规则：
   - 2.8.0 → `zh2_xAPI` / `en2_xAPI`
   - 3.4.4 → `zh3_xAPI` / `en3_xAPI`
   - 4.7.0 → `zh4_7API` / `en4_7API`
   - 4.4.1 → `zh4_4_1API` / `en4_4_1API`
8. **映射关系**: 具体可以参考 [说明文档](https://docs.google.com/document/d/1h9Wjd2yPfoAyZ-1dCa8IH5ltDK6kYglEzW-w4hu72pA/edit?tab=t.0)