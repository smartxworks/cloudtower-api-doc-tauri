import yargsInteractive from "yargs-interactive";
import path from "path";
import httpSnippet from 'httpsnippet';
import _ from 'lodash';
import fs from 'fs';
import i18next from 'i18next';
import converter from 'widdershins';
import nodePandoc from 'node-pandoc';
import { describeSchema } from './describe';
import { tagsGroup  } from "../swagger/utils/constant"
import { SupportLanguage, specMap } from "../swagger/utils"
import "../swagger/i18n";

const versions = Object.keys(specMap);

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
  return require(path.resolve(__dirname, `../static/specs/${v}-swagger.json`))
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
    const apiDoc = i18next.t(`${version.split('.').join('_')}.paths.${p}`, {lng, returnObjects: true }) as { description: string, summary: string };
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
          url: `https://YOUR_TOWER_URL/v2/api${p}`,
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
        } as any);
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

const docIt = (str:string, filename:string, lng:string) => {
  const docsDir = './CloudTower-API-doc_docx';
  if(!fs.existsSync(docsDir)) {
    fs.mkdirSync(docsDir);
  }
  nodePandoc(str, `-f markdown -t docx -o ${docsDir}${filename}-${lng}.docx`, (err, result) => {
    if (err) {
      console.error('Oh Nos: ',err);
    }
    return result;
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
    const filename = `CloudTower_API_DOC-${version}`;
    docIt(str, filename, lng)
  })
  .catch(err => {
    console.error('err', err);
  });
}

