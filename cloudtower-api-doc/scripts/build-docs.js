#!/usr/bin/env node
const yargsInteractive = require("yargs-interactive");
const path = require("path");
const httpSnippet = require('httpsnippet');
const _ = require('lodash');
const fs = require('fs');
const i18next = require('i18next');
const converter = require('widdershins');
const nodePandoc = require('node-pandoc');
const { describeSchema } = require('./describe');
const versions = require('../versions.json')

const SupportLanguage = {
  zh: "zh",
  en: "en",
}

const tagsGroup = [
  {
    name: 'ClusterManagement',
    tags: [
      "Cluster",
      "ClusterSettings",
      "SnmpTransport",
      "SnmpTrapReceiver",
      "MigrateTransmitter"
    ]
  },
  {
    name: "MetroXClusterManagement",
    tags: [
      "Witness",
      "WitnessService",
      "Zone",
      "ZoneTopo",
    ]
  },
  {
    name: "VmwareManagement",
    tags: [
      "VcenterAccount",
      "VsphereEsxiAccount"
    ]
  },
  {
    name: "AlertManagement",
    tags: [
      "AlertNotifier",
      "Alert",
      "GlobalAlertRule",
      "AlertRule"
    ]
  },
  {
    name: "VmManagement",
    tags: [
      "ElfImage",
      "VmDisk",
      "VmFolder",
      "VmNic",
      "VmPlacementGroup",
      "Vm",
      "VmSnapshot",
      "VmTemplate",
      "VmVolume",
      "VmVolumeSnapshot"
    ]
  },
  {
    name: "CloudTowerSetting",
    tags: [
      "Application",
      "ClusterImage",
      "ClusterUpgradeHistory",
      "Deploy",
      "GlobalSettings",
      "License",
      "SvtImage"
    ]
  },
  {
    name: "HardwareManagement",
    tags: [
      "BrickTopo",
      "RackTopo",
      "ClusterTopo",
      "DiscoveredHost",
      "Disk",
      "Host",
      "Ipmi",
      "NodeTopo",
      "PmemDimm",
      "UsbDevice"
    ]
  },
  {
    name: "StorageManagement",
    tags: [
      "ConsistencyGroup",
      "ConsistencyGroupSnapshot",
      "ElfDataStore",
      "ElfStoragePolicy",
      "IscsiConnection",
      "Iscsi",
      "IscsiLun",
      "IscsiLunSnapshot",
      "IscsiTarget",
      "NamespaceGroup",
      "NfsExport",
      "NfsInode",
      "NvmfNamespace",
      "NvmfNamespaceSnapshot",
      "NvmfSubsystem",
      "StoragePolicyConector"
    ]
  },
  {
    name: "SharedManagement",
    tags: [
      "ContentLibraryImage",
      "ContentLibraryVmTemplate"
    ]
  },
  {
    name: "DatacneterAndOrgManagement",
    tags: [
      "Datacenter",
      "Organization"
    ]
  },
  {
    name: "EntityFileterManagement",
    tags: [
      "EntityFilter",
      "VmEntityFilterResult"
    ]
  },
  {
    name: "ErManagement",
    tags: [
      "EverouteCluster",
      "EverouteLicense",
      "EveroutePackage",
      "IsolationPolicy",
      "SecurityPolicy"
    ]
  },
  {
    name: "MonitorManagement",
    tags: [
      "Graph",
      "View",
      "Metrics"
    ]
  },
  {
    name: "LabelManagement",
    tags: [
      "Label"
    ]
  },
  {
    name: "LogManagement",
    tags: [
      "LogCollection",
      "LogServiceConfig"
    ]
  },
  {
    name: "NetworkManagement",
    tags: [
      "Nic",
      "Vds",
      "Vlan"
    ]
  },
  {
    name: "ReportManagement",
    tags: [
      "ReportTask",
      "ReportTemplate",
      "TableReporter"
    ]
  },
  {
    name: "SnapshotManagement",
    tags: [
      "SnapshotGroup",
      "SnapshotPlan",
      "SnapshotPlanTask"
    ]
  },
  {
    name: "AuditManagement",
    tags: [
      "SystemAuditLog",
      "UserAuditLog"
    ]
  },
  {
    name: "TaskManagement",
    tags:[
      "Task",
      "UploadTask"
    ]
  },
  {
    name: "UserManagement",
    tags:[
      "UserRoleNext",
      "User"
    ]
  },
  {
    name: "BackupManagement",
    tags: [
      "BackupLicense",
      "BackupPackage",
      "BackupPlanExecution",
      "BackupPlan",
      "BackupRestoreExecution",
      "BackupRestorePoint",
      "BackupService",
      "BackupStoreRepository",
      "BackupTargetExecution"
    ]
  },
  {
    "name": "Other",
    "tags": [
      "ApiInfo"
    ]
  }
];

const initI18n = () => {
  const enComponents = require('../swagger/locales/en/components.json');
  const zhComponents = require('../swagger/locales/zh/components.json');

  const zh1_8Api = require('../swagger/locales/zh/1.8.0.json');
  const en1_8API = require('../swagger/locales/en/1.8.0.json');

  const zh1_9Api = require('../swagger/locales/zh/1.9.0.json');
  const en1_9API = require('../swagger/locales/en/1.9.0.json');

  const zh1_10Api = require('../swagger/locales/zh/1.10.0.json');
  const en1_10Api = require('../swagger/locales/en/1.10.0.json');

  const zh2_0API = require('../swagger/locales/zh/2.0.0.json');
  const en2_0API = require('../swagger/locales/en/2.0.0.json');

  const zh2_1API = require('../swagger/locales/zh/2.1.0.json');
  const en2_1API = require('../swagger/locales/en/2.1.0.json');


  const zh2_2API = require('../swagger/locales/zh/2.2.0.json');
  const en2_2API = require('../swagger/locales/en/2.2.0.json');

  const zh2_3API = require('../swagger/locales/zh/2.3.0.json');
  const en2_3API = require('../swagger/locales/en/2.3.0.json');

  const zh2_4API = require('../swagger/locales/zh/2.4.0.json');
  const en2_4API = require('../swagger/locales/en/2.4.0.json');

  const zh2_5API = require('../swagger/locales/zh/2.5.0.json');
  const en2_5API = require('../swagger/locales/en/2.5.0.json');

  i18next.init({
    resources: {
      [SupportLanguage.en]: {
          ['1_8_0']: en1_8API,
          ['1_9_0']: en1_9API,
          ['1_10_0']: en1_10Api,
          ['2_0_0']: en2_0API,
          ['2_1_0']: en2_1API,
          ['2_2_0']: en2_2API,
          ['2_3_0']: en2_3API,
          ['2_4_0']: en2_4API,
          ['2_5_0']: en2_5API,
          components: enComponents,
      },
      [SupportLanguage.zh]: {
          ['1_8_0']:zh1_8Api,
          ['1_9_0']:zh1_9Api,
          ['1_10_0']: zh1_10Api,
          ['2_0_0']: zh2_0API,
          ['2_1_0']: zh2_1API,
          ['2_2_0']: zh2_2API,
          ['2_3_0']: zh2_3API,
          ['2_4_0']: zh2_4API,
          ['2_5_0']: zh2_5API,
          components: zhComponents,
      },
    },
    lng: SupportLanguage.zh,
    updateMissing: true,
    fallbackLng: [SupportLanguage.en, SupportLanguage.zh],
    fallbackNS: ['1_8_0','1_9_0','1_10_0', '2_0_0', '2_1_0','2_2_0', '2_3_0', '2_4_0', '2_5_0'],
    interpolation: {
      prefix: "{",
      suffix: "}",
      escapeValue: false,
    },
    keySeparator: false,
    ns: ['1_8_0', '1_9_0', '1_10_0','2_0_0', '2_1_0', '2_2_0', '2_3_0', '2_4_0', '2_5_0','components'],
    nsSeparator: ".",
    load: "currentOnly",
    react: {
      bindI18n: "languageChanged addResource",
    },
  });
}


initI18n();
yargsInteractive()
  .usage("$0 <command> [args]")
  .help("help")
  .alias("help", "h")
  .interactive({
    interactive: { default: true },
    version: {
      description: "Provide swagger json file version",
      type: "input",
    }
  })
  .then((result) => {
    const { version } = result;
    if(version === '*') {
      versions.forEach(version => {
        const swagger = getSwaggerFile(version);
        Object.keys(SupportLanguage).forEach(lng => {
          const swaggerWithLocales = getSwaggerWithLocales(swagger, lng, version);
          buildDocs(swaggerWithLocales, version, lng);
        })
      })
    } else {
      const swagger = getSwaggerFile(version);
      Object.keys(SupportLanguage).forEach(lng => {
        const swaggerWithLocales = getSwaggerWithLocales(swagger, lng, version);
        buildDocs(swaggerWithLocales, version, lng);
      })
    }
  });

const getSwaggerFile = (v) => {
  return require(path.resolve(__dirname, `../swagger/specs/${v}-swagger.json`))
}

const replaceTags = (tag) => {
  const replaceTag = tagsGroup.find(group => group.tags.includes(tag));
  if(replaceTag) {
    return replaceTag.name
  }
  return tag;
}
const genSchemaExample = (params) => {
  const { schema, schemaName, spec, field } = params;
  if(schema.$ref) {
    const refSchema = (schema).$ref;
    const paths = refSchema.split('/').slice(1);
    return genSchemaExample({
      spec,
      schema: _.get(spec, paths),
      field: '',
      schemaName: paths[paths.length - 1],
    })
  } else if((schema).type === 'array'){
    return [ genSchemaExample({
      schema: (schema).items, 
      spec,
      field: '',
      schemaName: schemaName,
    })]
  } else if((schema).type === 'object') {
    const { required, properties } = (schema);
    const example = {};
    if(properties) {
      Object.entries(properties).filter(([key]) => required?.includes(key)).forEach(([key, value]) => {
        example[key] = genSchemaExample({
          schema: value,
          spec,
          field: key,
          schemaName: schemaName,
        });
      })
    }
    if( _.get(properties, ['where', 'allOf', 0, '$ref']) && !(required && required.includes('where'))) {
      const ref = ((properties.where).allOf[0]).$ref;
      const resource = ref.split('/').pop().replace('WhereInput', '').replace('WhereUniqueInput', ''); 
      example['where'] = { id: `${resource}-id` }
    }
    if(schemaName.endsWith('WhereInput') || schemaName.endsWith('WhereUniqueInput')) {
      const resource = schemaName.replace('WhereInput', '').replace('WhereUniqueInput', ''); 
      example['id'] = `${resource}-id`;
    }
    return example;
  } else if(schema.allOf) {
    let example = {};
    (schema).allOf.forEach(schema => {
      const value = genSchemaExample({
        spec,
        schema,
        schemaName,
        field: '',
      })
      example = {...example, ...value}
    })
    return example;
  } else if((schema).anyOf) {
    return {};
  } else {
    const { type, enum:eValues} = schema;
    switch(type) {
      case 'string': {
        if(eValues?.length) {
          return eValues[0]
        }
        else if(field.endsWith('id')) {
          return 'ck74rk21wg5lz0786opdnzz5m';
        } else {
          return `${field}-string`
        }
      }
      case 'boolean': {
        return true;
      }
      case 'integer': {
        return 1;
      }
      case 'number': {
        return 1
      }
    }
    return ''
  }
}

const getSwaggerWithLocales = (spec, lng, version) => {
  const cloneSpec = _.cloneDeep(spec);
  const { components, paths } = cloneSpec;
  const tags = new Set();
  // handle paths
  Object.keys(paths).forEach((p) => {
    const apiDoc = i18next.t(`${version.split('.').join('_')}.paths.${p}`, {lng, returnObjects: true });
    const method = Object.keys(paths[p])[0]
    const operationObj = paths[p][method];
    const { description, summary } = apiDoc;
    operationObj .description = description;
    operationObj .summary = summary;
    if (_.get(operationObj, ['requestBody', 'content'])) {
      Object.keys(
        operationObj .requestBody.content
      ).forEach((meta) => {
        const exampleValue = genSchemaExample({
          schema: operationObj.requestBody.content[meta].schema, 
          spec,
          field: '',
          schemaName: '',
         });
        const snippet = new httpSnippet({
          method,
          url: `http://YOUR_TOWER_URL/v2/api${p}`,
          headers: [
            { name: "Authorization", value: "YOUR_TOKEN" },
            {
              name: "content-language",
              value: "en-US",
              comment: "en-US or zh-CN",
            },
            {
              name: "content-type",
              value: meta
            }
          ],
          postData: {
            mimeType: "application/json",
            text: JSON.stringify(exampleValue),
          },
        });
        operationObj["x-codeSamples"] = [
          {
            lang: "curl",
            source: snippet.convert("shell", "curl", {
              indent: "\t",
              short: true,
            }),
          },
        ];
        operationObj.requestBody.content[
          meta
        ].examples = {
          Example: {
              description: "",
              summary: "",
              value: exampleValue,
          }
        };
      });
    }
    cloneSpec.paths[p][method] = operationObj;
    operationObj.tags = operationObj.tags?.map(tag => {
      const replaceTag = replaceTags(tag);
      tags.add(replaceTag);
      return replaceTag;
    })
  });
  // handle schemas
  Object.keys(components.schemas).forEach((s) => {
    const schema = i18next.t(`${version.split('.').join('_')}.schemas.${s}`, {lng, returnObjects: true});
    describeSchema({
      schema: components.schemas[s],
      prefix: ["components", "schemas", s],
      describeFn: ({ prefix, path }) => {
        _.set(cloneSpec, [...prefix, "description"], schema[path]);
      },
    });
  });
  // handle security schemas
  Object.keys(components.securitySchemes).forEach((s) => {
    const schema = i18next.t(`${version.split('.').join('_')}.schemas.${s}`, {lng, returnObjects: true});
    _.set(cloneSpec, ["components","securitySchemes", s, "description"], schema['description']);
    _.set(cloneSpec, ["components","securitySchemes", s, "x-displayName"], schema['name']);
  });

  cloneSpec.tags = Array.from(tags).map(tag => ({
    name: tag,
    "x-displayName": i18next.t(`components.${tag}`),
    description: ""
  }));
  return cloneSpec;
}

const docIt = (str, filename, lng) => {
  nodePandoc(str, `-f markdown -t docx -o ./CloudTower-API-doc_docx/${filename}-${lng}.docx`, (err, result) => {
    if (err) {
      console.error('Oh Nos: ',err);
    }
    return result;
  })
}
const buildRestDocs = () => {
  const i18nPath = path.resolve(__dirname, '../i18n');
  const needDocFile = ['go.md', 'intro.md', 'java.md', 'python.md']
  fs.readdirSync(i18nPath).forEach(lng => {
    const completeI18nPath = path.join(i18nPath, lng);
    fs.readdirSync(completeI18nPath).forEach(f => {
      if(needDocFile.includes(f)) {
        const str = fs.readFileSync(path.join(completeI18nPath, f), 'utf-8');
        docIt(str, f.replace('.md', ''), lng);
      }
    })
  })
}

const buildDocs = (swagger, version, lng) => {
  converter.convert(swagger, {
    search: false,
    omitHeader: true,
    resolve: true,
    omitBody: true,
    maxDepth: 2,
  })
  .then(str => {
    const filename = `CloudTower_API_DOC-${version}-${lng}`;
    docIt(str, filename)
  })
  .catch(err => {
    console.error('err', err);
  });
  buildRestDocs();
}

