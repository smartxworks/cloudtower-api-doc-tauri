import yargsInteractive from "yargs-interactive";
import path from "path";
import _ from 'lodash';
import fs from "fs";
import { execSync } from 'child_process';
import converter from 'widdershins';
import puppeteer from 'puppeteer';
import PDFMerger from 'pdf-merger-js';
import { mdToPdf } from 'md-to-pdf';
import { wrapSpecWithI18n } from "../swagger/utils/wrap"
import { SupportLanguage, specMap } from "../swagger/utils"
import "../swagger/i18n";

const versions = Object.keys(specMap);
const outputDocDir = `CloudTower-API-pdf`;
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
    if(!fs.existsSync(outputDocDir)) {
      fs.mkdirSync(outputDocDir);
    }
    const swagger = getSwaggerFile(version);
    [SupportLanguage.zh].forEach(lng => {
      const swaggerWithLocales = wrapSpecWithI18n(swagger, lng, version);
      buildAPIDocs(swaggerWithLocales, version, lng);
    })
    // Object.keys(SupportLanguage).forEach(lng => {
    //   buildDocusaurusDoc(lng);
    // })
  });

const getSwaggerFile = (v) => {
  return require(path.resolve(__dirname, `../static/specs/${v}-swagger.json`))
}

const splitMarkdownFile = (filePath: string, chunkSize: number) => {
  const content = fs.readFileSync(filePath, 'utf-8');
  const lines = content.split('\n');
  const files = [];
  let chunk = [];
  let chunkIndex = 0;

  lines.forEach((line, index) => {
    chunk.push(line);
    if ((index + 1) % chunkSize === 0 || index === lines.length - 1) {
      const chunkFilePath = `${filePath.replace('.md', '')}_part${chunkIndex}.md`;
      files.push(chunkFilePath);
      fs.writeFileSync(chunkFilePath, chunk.join('\n'));
      chunk = [];
      chunkIndex++;
    }
  });
  return files;
};

const mergePdfFiles = async (pdfFiles: string[], outputFilePath: string) => {
  const merger = new PDFMerger();
  for (const pdfFile of pdfFiles) {
    await merger.add(pdfFile);
  }
  await merger.save(outputFilePath);
};


const buildAPIDocs = (swagger, version, lng) => {
  // converter.convert(swagger, {
  //   search: false,
  //   omitHeader: true,
  //   resolve: true,
  //   omitBody: true,
  //   maxDepth: 2,
  // })
  // .then(str => {
    const filename = lng === 'zh' ?  `CloudTower API 参考 v${version}.md` : `CloudTower API Reference v${version}.md`;
    const file = path.join(outputDocDir, filename);

    const files = splitMarkdownFile(file, 10000);
    files.forEach((file) => {
      mdToPdf({ path: file }, { dest: file.replace('.md', '.pdf') })
    })
    mergePdfFiles(files.map(f => f.replace('.md', '.pdf')), file.replace('.md', '.pdf'));
  // })
  // .catch(err => {
  //   console.error('err', err);
  // });
}

const buildDocusaurusDoc = (lng) => {
  const filename = lng === 'zh'? 'CloudTower API 文档' : 'CloudTower API Docs';
  const commands = [
    `npx docs-to-pdf`,
    `--initialDocURLs="https://code.smartx.com/${lng === 'zh' ? '' : 'en'}"`,
    `--contentSelector="article"`,
    `--paginationSelector="a.pagination-nav__link.pagination-nav__link--next"`,
    `--coverTitle="${filename}"`,
    `--outputPDFFilename="${path.join(outputDocDir, filename)}.pdf"`,
  ];
  execSync(commands.join(' '));
}


// const docIt = (str:string, filename:string, lng:string) => {
//   const docsDir = './CloudTower-API-doc_docx';
//   if(!fs.existsSync(docsDir)) {
//     fs.mkdirSync(docsDir);
//   }
//   nodePandoc(str, `-f markdown -t docx -o ${docsDir}${filename}-${lng}.docx`, (err, result) => {
//     if (err) {
//       console.error('Oh Nos: ',err);
//     }
//     return result;
//   })
// }
