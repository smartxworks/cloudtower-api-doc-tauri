const fs = require("fs");
const nodePath = require("path");

const { Gitlab } = require("@gitbeaker/node");

const Api = new Gitlab({
  token: process.env.GITLAB_TOKEN,
  host: "http://gitlab.smartx.com/",
  version: 4,
});

const SDK_DIR = 'sdk-schema'
const SWAGGER_DIFF = 454;
const sync = async () => {
  const dir = await Api.Repositories.tree(SWAGGER_DIFF, {
    ref: 'master',
    path: SDK_DIR
  });
  for(const { path, name } of dir) {
    const result = await Api.RepositoryFiles.show(
      SWAGGER_DIFF,
      path,
      "master"
    );
    const fileName = `v${name.replace('.json', '')}-swagger.json`;
    const file = Buffer.from(result.content, result.encoding).toString("utf-8");
    const filePath = nodePath.resolve(__dirname, `../swagger/specs/${fileName}`)
    fs.writeFileSync(filePath, file);
  }
};
sync();
