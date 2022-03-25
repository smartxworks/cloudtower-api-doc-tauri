const fs = require("fs");
const path = require("path");

const traverse = (p, callback) => {
  if (fs.statSync(p).isDirectory()) {
    fs.readdirSync(p).forEach((f) => traverse(path.join(p, f), callback));
  }
  if (fs.statSync(p).isFile()) {
    callback(p);
  }
};
const generateMarkDownJson = async () => {
  const { fromMarkdown } = await import("mdast-util-from-markdown");
  const { gfmTableFromMarkdown } = await import("mdast-util-gfm-table");
  const { gfmTable } = await import("micromark-extension-gfm-table");
  const markdownPath = path.join(__dirname, "../markdown");
  const outputBasePath = path.join(__dirname, "../generated/locales");
  const lngs = fs.readdirSync(markdownPath);
  await Promise.all(
    lngs.map(async (lng) => {
      const markdownLngPath = path.join(markdownPath, lng);
      const outputLngPath = path.join(outputBasePath, lng);
      const paths = [];
      traverse(markdownLngPath, p => paths.push(p));
      await Promise.all(
        paths.map(
          (p) =>
            new Promise((resolve, reject) => {
              try {
                const p_list = p.split(path.sep);
                const outputApiPath = path.join(outputLngPath, `${p_list[p_list.length - 2]}.json`);
                const apiObj = fs.existsSync(outputApiPath) ? require(outputApiPath) : {};
                const ast = fromMarkdown(fs.readFileSync(p, "utf-8"), {
                  extensions: [gfmTable],
                  mdastExtensions: [gfmTableFromMarkdown],
                });
                const { children } = ast;
                const summary = children[0].children[1].value.split(":")[1];
                const description = children[1].children[1].value.split(":")[1];
                const api = children[2].children[1].value.split(":")[1];
                children[1].children[1].value.split(":")[1];
                const requestBody = {};
                children[5].children.slice(1).forEach(({ children }) => {
                  const [parameter, _t, description] = children;
                  requestBody[parameter.children[0].value] = description
                    .children[0]
                    ? description.children
                        .filter((c) => c.type === "text")
                        .map((c) => c.value)
                        .join("\n")
                    : "";
                });
                const examples = children
                  .filter((c) => c.type === "code" && c.lang === "json")
                  .map(({ value }) => {
                    return JSON.parse(value);
                  });
                const responses = {};
                const responseIndex = children
                  .slice()
                  .reverse()
                  .findIndex((c) => c.type == "table");
                children
                  .slice()
                  .reverse()
                  [responseIndex].children.slice(1)
                  .forEach(({ children }) => {
                    const [code, description] = children;
                    responses[code.children[0].value] = description.children[0]
                      ? description.children[0].value
                      : "";
                  });
                apiObj[api.trim()] = {
                  summary,
                  description,
                  requestBody,
                  examples,
                  responses,
                };
                fs.writeFileSync(outputApiPath, JSON.stringify(apiObj, null, 2));
                resolve();
              } catch (err) {
                console.warn(err);
                reject(err);
              }
            })
        )
      );
    })
  );
};
const generate = async () => {
  await generateMarkDownJson();
};

generate();
