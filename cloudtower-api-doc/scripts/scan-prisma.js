const { getLocales, writeLoclaes, fetchGitLabFile } = require("./utils");
const { ConvertSchemaToObject } = require("./schemaConverter");
const versions = require("./commit.json");

const convertPrismaToPrisma2 = (content) => {
  return content
    .replace(/type\s([a-zA-Z]+)\s\{/g, "model $1 {")
    .replace(/#/g, "//")
    .replace(/:/g, "");
};

const TowerLocalesFileNameMap = {
  'Cluster': 'cluster',
  'Datacenter': 'datacenter',
  'Host': 'host',
  'IscsiTarget': 'iscsiTarget',
  'Label': 'label',
  'Nic': 'nic',
  'Task': 'task',
  'UserAuditLog': 'userAuditLog',
  'VmDisk': 'vm',
  'VmNic': 'vm',
  'Vm': 'vm',
  'VmSnapshot': 'vmSnapshot',
  'User': 'user',
  "UserRoleNext": "userRoleNext",
  "Organization": "common",
  "Zone": "cluster",
  "Witness": "host",
  "ClusterImage": "common",
  "ClusterUpgradeHistory": "common",
  "Ipmi": "common",
   ClusterTopo: "common",
   ZoneTopo: "common",
   RackTopo: "common",
   BrickTopo: "common",
   NodeTopo: "common",
   Disk: "disk",
   PmemDimm: "pmemDimm"
}
const scanPrisma = async () => {
  for (const version in versions) {
    const currentCommit = versions[version];
    const fileContent = await fetchGitLabFile("packages/server/datamodel.prisma", currentCommit)
    const datamodel = new ConvertSchemaToObject(
      '\n' + convertPrismaToPrisma2(fileContent)
    ).run();
    const zh_locales = {};
    const en_locales = {};
    await Promise.all(Object.values(datamodel.models).map(async (model) => {
      let zh = "";
      let en = "";
      const nameMap = TowerLocalesFileNameMap[model.name]
      if(TowerLocalesFileNameMap[model.name]) {
        zh = await fetchGitLabFile(`packages/i18n/src/locales/zh-CN/${nameMap}.json`, currentCommit)
        en = await fetchGitLabFile(`packages/i18n/src/locales/en-US/${nameMap}.json`, currentCommit);
      } else {
        //FIXME: add all
        // console.log(model.name)
      }
      for (const field of model.fields) {
        zh_locales[`${model.name}_${field.name}`] = ( JSON.parse(zh === "" ? "{}" : zh)[field.name] || field.documentation || "")
          .replace(/\/\//g, "")
          .trim();
        en_locales[`${model.name}_${field.name}`] = (JSON.parse(en === "" ? "{}" : en)[field.name] || field.documentation || "")
        .replace(/\/\//g, "")
        .trim();
      }
    }))
    await Promise.all(['zh-CN', 'en-US'].map(async (locale) => {
      const content = await fetchGitLabFile(`packages/i18n/src/locales/${locale}/enum.json`, currentCommit)
      const locales = content === '' ? {} : JSON.parse(content);
      await Promise.all(Object.values(datamodel.enums).map(async(e) => {
        let des = [];
        e.fields.forEach(field => {
          const i18nKey = [e.name, field].join('_');
          if(locales[i18nKey]) {
            des.push([field, locales[i18nKey]].join(' : '))
          } else {
            //FIXME: add all
            // console.log(i18nKey)
          }
        })
        des = des.join('\n')
        if(locale === 'zh-CN') {
          zh_locales[e.name] = des;
        } else {
          en_locales[e.name] = des
        }
      }))
    }))

    const {
      zhLocalesPath: paramsZhLocalesFile,
      enLocalesPath: paramsEnLocalesFile,
    } = getLocales("parameters");

    writeLoclaes({
      en: { locales: en_locales, localesPath: paramsEnLocalesFile },
      zh: { locales: zh_locales, localesPath: paramsZhLocalesFile },
    });
  }
};

scanPrisma();