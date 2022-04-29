const fs = require('fs');
const path = require('path');

const { Gitlab } = require("@gitbeaker/node");
const TOWER_PROJECT_ID = 215;

const Api = new Gitlab({
  token: process.env.GITLAB_TOKEN,
  host: "http://gitlab.smartx.com/",
  version: 4,
});

const getLocales = (filename) => {
  const zhLocalesDir = path.resolve(__dirname, "../swagger/locales/zh");
  const enLocalesDir = path.resolve(__dirname, "../swagger/locales/en");
  const zhLocalesFile = path.join(zhLocalesDir, `${filename}.json`);
  const enLocalesFile = path.join(enLocalesDir, `${filename}.json`);
  if (fs.existsSync(zhLocalesFile)) {
    return {
      zhLocalesPath: zhLocalesFile,
      enLocalesPath: enLocalesFile,
    };
  } else {
    throw new Error(`${zhLocalesFile} is not exists!`);
  }
};

const writeLocales = (locales) => {
  const { en, zh } = locales;
  const write = (content) => {
    const { locales, localesPath } = content;
    const updatedLocales = { ...locales, ...require(localesPath) };
    const sortedLocales = {};
    Object.keys(updatedLocales).sort().forEach(key => sortedLocales[key] = updatedLocales[key]);
    fs.writeFileSync(
      localesPath,
      JSON.stringify(sortedLocales, null, 2)
    );
  };
  write(en);
  write(zh);
};

const fetchGitLabFile = async (file_path, commit) => {
  const file = await Api.RepositoryFiles.show(
     TOWER_PROJECT_ID,
     file_path,
     commit,
   ).catch((error) => {
     console.log(`error occur when ${file_path}`, error)
     return { content: '', encoding: 'utf-8'}
   })
   return Buffer.from(file.content, file.encoding).toString(
     "utf-8"
   );
 }

module.exports = {
  getLocales,
  writeLocales,
  Api,
  TOWER_PROJECT_ID,
  fetchGitLabFile
}

