import yargsInteractive from "yargs-interactive";
import path from "path";
import _ from 'lodash';
import fs from "fs";
import { execSync } from 'child_process';
import converter from 'widdershins';
import PDFMerger from "pdf-merger-js";
import { mdToPdf } from 'md-to-pdf';
import { wrapSpecWithI18n } from "../swagger/utils/wrap"
import { SupportLanguage, specMap } from "../swagger/utils"
import "../swagger/i18n";

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
  .then(async (result) => {
    const { version } = result;
    const outputDocDir = getOutputDir(version);
    if(!fs.existsSync(outputDocDir)) {
      fs.mkdirSync(outputDocDir);
    }
    const swagger = getSwaggerFile(version);
    await Promise.all(Object.keys(SupportLanguage).map(async lng => {
      const swaggerWithLocales = wrapSpecWithI18n(swagger, lng, version);
      await Promise.all([
        buildAPIDocs(swaggerWithLocales, version, lng),
        buildDocusaurusDoc(lng, version)
      ]);
    }))
    execSync(`tar -czvf ${outputDocDir}.tar.gz ${outputDocDir}`);
    execSync(`mv ${outputDocDir}.tar.gz ${path.resolve(__dirname, '../static/pdfs')}`);
    fs.rmSync(outputDocDir, { recursive: true });
  });

const getSwaggerFile = (v) => {
  return require(path.resolve(__dirname, `../static/specs/${v}-swagger.json`))
}

const getOutputDir = (v) => {
  return `CloudTower-API-${v}-pdf`;
}

const splitMarkdownFile = (filePath: string, chunkSize: number) => {
  const content = fs.readFileSync(filePath, 'utf-8');
  const lines = content.split('\n');
  const files:string[] = [];
  let chunk:string[] = [];
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


const buildAPIDocs = async(swagger, version, lng) => {
  const str = await converter.convert(swagger, {
    search: false,
    omitHeader: true,
    resolve: true,
    omitBody: true,
    maxDepth: 2,
  }).catch(() => '');
  const filename = lng === 'zh' ?  `CloudTower API 参考 v${version}.md` : `CloudTower API Reference v${version}.md`;
  const file = path.join(getOutputDir(version), filename);
  fs.writeFileSync(file, str);
  const files = splitMarkdownFile(file, 20000);
  const pdfFiles = files.map(f => f.replace('.md', '.pdf'));
  await Promise.all(files.map(async (f) => {
    await mdToPdf({ path: f }, { 
      dest: f.replace('.md', '.pdf'),
      launch_options: { 
        args: ['--no-sandbox', '--disable-setuid-sandbox'],
        timeout: 60000 // Increase timeout to 60 seconds
      }
    });
  }))
  await mergePdfFiles(pdfFiles, file.replace('.md', '.pdf'));
  files.concat(pdfFiles).concat([file]).forEach(f => fs.unlinkSync(f));
}

const buildDocusaurusDoc = (lng, version) => {
  const filename = lng === 'zh'? `CloudTower API 文档 v${version}` : `CloudTower API Docs v${version}`;
  const commands = [
    `npx docs-to-pdf`,
    `--initialDocURLs="https://code.smartx.com/${lng === 'zh' ? '' : 'en'}"`,
    `--contentSelector="article"`,
    `--paginationSelector="a.pagination-nav__link.pagination-nav__link--next"`,
    `--coverTitle="${filename}"`,
    `--outputPDFFilename="${path.join(getOutputDir(version), filename)}.pdf"`,
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
