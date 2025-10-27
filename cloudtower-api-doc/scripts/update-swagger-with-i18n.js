#!/usr/bin/env node
const yargsInteractive = require("yargs-interactive");
const nodePath = require("path");
const fsExtra = require("fs-extra");
const _ = require('lodash');
const i18next = require("i18next");

// 所有版本列表（用于 fallback）
const fallbackNS = [
  "4_7_0",
  "4_6_1",
  "4_6_0",
  "4_5_0",
  "4_4_2",
  "4_4_1",
  "4_4_0",
  "4_3_0",
  "4_2_0",
  "4_1_0",
  "4_0_0",
  "3_4_4",
  "3_4_0",
  "3_3_0",
  "3_2_0",
  "3_1_0",
  "3_0_0",
  "2_8_0",
  "2_7_0",
  "2_6_0",
  "2_5_0",
  "2_4_0",
  "2_3_0",
  "2_2_0",
  "2_1_0",
  "2_0_0",
  "1_10_0",
  "1_9_0",
  "1_8_0",
];


const APIInfo = {
  title: "CloudTower APIs",
  version: "",
  description: "cloudtower operation API and SDK"
};

// 辅助函数
const getNs = (version) => {
  return version.split('.').join('_');
};

const getFallbackNS = (version) => {
  const ns = getNs(version);
  const index = fallbackNS.indexOf(ns);
  return index >= 0 ? fallbackNS.slice(index) : fallbackNS;
};


// 初始化 i18next
const initI18next = ({ version, language }) => {
  const ns = getNs(version);
  const localesDir = nodePath.resolve(
    process.cwd(),
    'cloudtower-api-doc',
    'swagger',
    'locales',
    language
  );

  // 加载所有版本的翻译资源
  const resources = {};
  fallbackNS.forEach((versionNs) => {
    const versionStr = versionNs.replace(/_/g, '.');
    const localePath = nodePath.join(localesDir, `${versionStr}.json`);
    if (fsExtra.existsSync(localePath)) {
      resources[versionNs] = fsExtra.readJsonSync(localePath);
    }
  });

  // 加载 components 翻译
  const componentsPath = nodePath.join(localesDir, 'components.json');
  if (fsExtra.existsSync(componentsPath)) {
    resources.components = fsExtra.readJsonSync(componentsPath);
  }

  // 初始化 i18next
  i18next.init({
    lng: language,
    fallbackLng: null,
    fallbackNS: getFallbackNS(version),
    resources: {
      [language]: resources
    },
    returnEmptyString: false,
    returnNull: false,
    interpolation: {
      prefix: "{",
      suffix: "}",
      escapeValue: false,
    },
    keySeparator: false,
    ns: [...fallbackNS, 'components'],
    nsSeparator: ".",
    load: "currentOnly",
  });

  return { ns, i18n: i18next };
};

// 递归处理 schema 描述（使用 i18next）
const describeSchema = ({ schema, prefix, cloneSpec, i18n, ns, schemaName }) => {
  const schemaObj = _.get(cloneSpec, prefix);
  if (!schemaObj) return;

  const type = schemaObj['type'];
  
  // 处理对象类型
  if (type === "object") {
    if (!schemaObj['properties']) {
      _.set(cloneSpec, [...prefix, "title"], prefix[prefix.length - 1]);
    } else {
      Object.keys(schemaObj['properties']).forEach((key) => {
        const property = schemaObj['properties'][key];
        
        // 处理 allOf 引用
        if (property['allOf']) {
          const allOfRef = property['allOf'][0]['$ref'];
          if (allOfRef) {
            _.set(cloneSpec, [...prefix, "properties", key, "title"], allOfRef.split('/').pop());
          }
          // 使用 i18next 获取翻译（支持 fallback）
          const des = i18n.t(`${ns}.schemas.${schemaName}.${key}`, { lng: i18n.language });
          if (des && !des.includes(`${ns}.schemas.${schemaName}.${key}`)) {
            _.set(cloneSpec, [...prefix, "properties", key, "description"], des);
          }
        }
        
        // 递归处理嵌套对象
        if (property.type === 'object' || property.properties) {
          describeSchema({
            schema: property,
            prefix: [...prefix, 'properties', key],
            cloneSpec,
            i18n,
            ns,
            schemaName: `${schemaName}.${key}`
          });
        }
        
        // 处理数组类型
        if (property.type === 'array' && property.items) {
          const items = property.items;
          if (items.type === 'object' || items.properties) {
            describeSchema({
              schema: items,
              prefix: [...prefix, 'properties', key, 'items'],
              cloneSpec,
              i18n,
              ns,
              schemaName: `${schemaName}.${key}`
            });
          }
        }
      });
    }
  }
  
  // 处理数组类型
  if (type === 'array' && schemaObj.items) {
    const items = schemaObj.items;
    if (items.type === 'object' || items.properties) {
      describeSchema({
        schema: items,
        prefix: [...prefix, 'items'],
        cloneSpec,
        i18n,
        ns,
        schemaName
      });
    }
  }
  
  // 使用 i18next 获取当前级别的描述（支持 fallback）
  const schemaKey = `${ns}.schemas.${schemaName}`;
  const schemaTranslations = i18n.t(schemaKey, { 
    lng: i18n.language, 
    returnObjects: true 
  });
  
  // 检查是否真的获取到了翻译（不是返回的 key）
  if (typeof schemaTranslations === 'string' && !schemaTranslations.includes(schemaKey)) {
    _.set(cloneSpec, [...prefix, "description"], schemaTranslations);
  } else if (typeof schemaTranslations === 'object' && schemaTranslations !== null) {
    // 处理对象类型的翻译（包含多个属性的描述）
    Object.keys(schemaTranslations).forEach((key) => {
      if (key === 'AND' || key === 'OR' || key === 'NOT' || !key.includes(schemaName)) {
        // 这是属性翻译，不是 key 本身
        const keyPath = key.split('.').flatMap(k => ['properties', k]).slice(1);
        if (schemaTranslations[key]) {
          _.set(cloneSpec, [...prefix, "properties", ...keyPath, 'description'], schemaTranslations[key]);
        }
      }
    });
  }
};

// 主函数：更新 Swagger 文件
const updateSwaggerWithI18n = ({ version, language, outputPath }) => {
  console.log(`\n🚀 开始处理 Swagger 文件...`);
  console.log(`   版本: ${version}`);
  console.log(`   语言: ${language}`);
  
  // 文件路径
  const swaggerPath = nodePath.resolve(
    process.cwd(),
    'cloudtower-api-doc',
    'static',
    'specs',
    `${version}-swagger.json`
  );
  
  const examplesPath = nodePath.resolve(
    process.cwd(),
    'cloudtower-api-doc',
    'swagger',
    'examples',
    'swagger-examples.json'
  );

  // 检查文件是否存在
  if (!fsExtra.existsSync(swaggerPath)) {
    console.error(`❌ Swagger 文件不存在: ${swaggerPath}`);
    process.exit(1);
  }

  // 初始化 i18next（支持 fallback）
  console.log(`\n🔧 初始化 i18next (支持 fallback)...`);
  const { ns, i18n } = initI18next({ version, language });
  console.log(`   当前命名空间: ${ns}`);
  console.log(`   Fallback 链: ${getFallbackNS(version).slice(0, 5).join(', ')}...`);

  // 读取文件
  console.log(`\n📖 读取文件...`);
  const swaggerSpec = fsExtra.readJsonSync(swaggerPath);
  const examples = fsExtra.existsSync(examplesPath)
    ? fsExtra.readJsonSync(examplesPath)
    : {};

  // 克隆 spec
  const cloneSpec = _.cloneDeep(swaggerSpec);
  const { paths } = cloneSpec;

  console.log(`\n🔄 处理 API 路径...`);
  let processedPaths = 0;
  let translatedPaths = 0;
  
  // 处理所有 API 路径
  Object.keys(paths).forEach((path) => {
    const method = Object.keys(paths[path])[0]; // 通常是 'post' 或 'get'
    const operationObj = paths[path][method];
    
    // 使用 i18next 获取翻译（支持 fallback）
    const pathKey = `${ns}.paths.${path}`;
    const apiTranslation = i18n.t(pathKey, { 
      lng: language, 
      returnObjects: true 
    });
    
    // 更新 summary 和 description
    if (typeof apiTranslation === 'object' && apiTranslation !== null && !pathKey.includes(JSON.stringify(apiTranslation))) {
      if (apiTranslation.summary) {
        operationObj.summary = apiTranslation.summary;
        translatedPaths++;
      }
      if (apiTranslation.description) {
        operationObj.description = apiTranslation.description;
      }
    }
    
    // 处理 code samples (示例代码)
    const example = examples[path] || {};
    if (example && Object.keys(example).length > 0) {
      operationObj["x-codeSamples"] = [
        example.curl ? {
          lang: "curl",
          source: example.curl
        } : undefined,
        example.java ? {
          lang: "Java",
          source: example.java,
        } : undefined,
        example.go ? {
          lang: "Go",
          source: example.go,
        } : undefined,
        example.python ? {
          lang: "Python",
          source: example.python,
        } : undefined
      ].filter(Boolean);
      
      // 添加 request body examples
      if (_.has(operationObj, ['requestBody', 'content', 'application/json']) && example.exampleValue) {
        operationObj.requestBody.content['application/json'].examples = {
          Example: {
            description: "",
            summary: "",
            value: example.exampleValue,
          }
        };
      }
    }
    
    cloneSpec.paths[path][method] = operationObj;
    processedPaths++;
  });
  
  console.log(`   ✅ 已处理 ${processedPaths} 个 API 路径`);
  console.log(`   📝 已翻译 ${translatedPaths} 个 API 路径`);

  console.log(`\n🔄 处理 Schemas...`);
  let processedSchemas = 0;
  
  // 处理所有 schemas
  if (cloneSpec.components && cloneSpec.components.schemas) {
    Object.keys(cloneSpec.components.schemas).forEach((schemaName) => {
      describeSchema({
        schema: cloneSpec.components.schemas[schemaName],
        prefix: ["components", "schemas", schemaName],
        cloneSpec,
        i18n,
        ns,
        schemaName,
      });
      processedSchemas++;
    });
  }
  
  console.log(`   ✅ 已处理 ${processedSchemas} 个 Schema`);

  console.log(`\n🔄 处理 Security Schemes...`);
  // 处理 security schemas
  if (cloneSpec.components && cloneSpec.components.securitySchemes) {
    Object.keys(cloneSpec.components.securitySchemes).forEach((schemeName) => {
      const schemaKey = `${ns}.schemas.${schemeName}`;
      const schemaTranslation = i18n.t(schemaKey, { 
        lng: language, 
        returnObjects: true 
      });
      
      if (typeof schemaTranslation === 'object' && schemaTranslation !== null) {
        if (schemaTranslation.description) {
          _.set(cloneSpec, ["components", "securitySchemes", schemeName, "description"], schemaTranslation.description);
        }
        if (schemaTranslation.name) {
          _.set(cloneSpec, ["components", "securitySchemes", schemeName, "x-displayName"], schemaTranslation.name);
        }
      }
    });
  }

  // 更新 API Info
  cloneSpec.info = _.cloneDeep(APIInfo);
  cloneSpec.info.version = version;

  // 确定输出路径
  const defaultOutputPath = nodePath.resolve(
    process.cwd(),
    'cloudtower-api-doc',
    'static',
    'specs',
    `${version}-swagger-${language}.json`
  );
  const finalOutputPath = outputPath || defaultOutputPath;

  // 写入文件
  console.log(`\n💾 写入文件...`);
  console.log(`   输出: ${finalOutputPath}`);
  fsExtra.ensureFileSync(finalOutputPath);
  fsExtra.writeJsonSync(finalOutputPath, cloneSpec, { spaces: 2 });

  console.log(`\n✅ 成功! Swagger 文件已更新并保存`);
  console.log(`\n📊 统计信息:`);
  console.log(`   - API 路径: ${processedPaths} (已翻译: ${translatedPaths})`);
  console.log(`   - Schemas: ${processedSchemas}`);
  console.log(`   - 文件大小: ${(fsExtra.statSync(finalOutputPath).size / 1024 / 1024).toFixed(2)} MB\n`);
};

// 命令行参数处理
yargsInteractive()
  .usage("$0 <command> [args]")
  .help("help")
  .alias("help", "h")
  .interactive({
    interactive: { default: true },
    version: {
      description: "Swagger 文件版本 (例如: 4.6.0)",
      type: "input",
      prompt: "always",
    },
    language: {
      description: "语言 (zh 或 en)",
      type: "list",
      choices: ["zh", "en"],
    },
    output: {
      description: "输出文件路径 (可选，默认为 static/specs/{version}-swagger-{language}.json)",
      type: "input",
    },
  })
  .then((result) => {
    try {
      updateSwaggerWithI18n({
        version: result.version,
        language: result.language,
        outputPath: result.output,
      });
    } catch (error) {
      console.error(`\n❌ 错误: ${error.message}`);
      console.error(error.stack);
      process.exit(1);
    }
  });

