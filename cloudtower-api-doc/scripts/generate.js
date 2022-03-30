const fs = require("fs");
const path = require("path");
const yargsInteractive = require("yargs-interactive");

const traverse = (p, callback) => {
  if (fs.statSync(p).isDirectory()) {
    fs.readdirSync(p).forEach((f) => traverse(path.join(p, f), callback));
  }
  if (fs.statSync(p).isFile()) {
    callback(p);
  }
};

yargsInteractive()
  .usage("$0 <command> [args]")
  .help("help")
  .alias("help", "h")
  .interactive({
    interactive: { default: true },
    includes: {
      description: "Provided the regex of the files to include, leave it blank when you want to include all files",
      type: "input",
    },
  })
  .then((result) => {
    generate(result);
  });
const generateMarkDownJson = async (includes) => {
  const { fromMarkdown } = await import("mdast-util-from-markdown");
  const { gfmTableFromMarkdown } = await import("mdast-util-gfm-table");
  const { gfmTable } = await import("micromark-extension-gfm-table");
  const pMap = (await import("p-map")).default;
  const markdownPath = path.join(__dirname, "../markdown");
  const outputBasePath = path.join(__dirname, "../generated/locales");
  const lngs = fs.readdirSync(markdownPath);
  const regex = new RegExp(includes);
  await pMap(lngs, async (lng) => {
    const markdownLngPath = path.join(markdownPath, lng);
    const outputLngPath = path.join(outputBasePath, lng);
    const paths = [];
    traverse(markdownLngPath, (p) => regex.test(p) && paths.push(p));
    await pMap(paths, async (p) => {
      try {
        const p_list = p.split(path.sep);
        const category = p_list[p_list.length - 2];
        const filename = path.basename(p).split(".").shift();
        const outputApiPath = path.join(
          outputLngPath,
          `${p_list[p_list.length - 3]}.json`
        );
        const apiObj = fs.existsSync(outputApiPath)
          ? require(outputApiPath)
          : {
              paths: {},
              schemas: {},
              tags: [],
            };
        const ast = fromMarkdown(fs.readFileSync(p, "utf-8"), {
          extensions: [gfmTable],
          mdastExtensions: [gfmTableFromMarkdown],
        });
        const getChildrenTextAsString = (children) =>
          children
            .filter((c) => c.type === "text")
            .map((c) => c.value)
            .join("\n");
        switch (category) {
          case "tags": {
            const { children } = ast;
            const tags = [];
            children[0].children.slice(1).forEach(({ children }) => {
              const [name, display, description] = children;
              tags.push({
                name: name ? getChildrenTextAsString(name.children) : '',
                "x-displayName": display ? getChildrenTextAsString(display.children) : '',
                description: description ? getChildrenTextAsString(description.children) : '',
              });
            });
            apiObj.tags = tags;
            break;
          }
          case "schemas": {
            const { children } = ast;
            const schema = {};
            children[0].children.slice(1).forEach(({ children }) => {
              const [parameter, _t, description] = children;
              const paramName = getChildrenTextAsString(parameter.children)
              schema[paramName] = description.children.filter(c => c.type === 'text').map(c => {
                if(paramName === 'enum') {
                  return `* ${c.value}`
                }
                return c.value
              }).join('\n');
            });
            apiObj.schemas[filename] = schema;
            break;
          }
          case "paths": {
            const { children } = ast;
            const summary = children[0].children[1].value.split(":")[1];
            const description = children[1].children[1].value.split(":")[1];
            children[1].children[1].value.split(":")[1];

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
            apiObj.paths['/' + filename] = {
              summary,
              description,
              examples,
              responses,
            };
            break;
          }
          default: {
            console.warn(`unhandled type, ${category}; file path is: ${p}`);
            break;
          }
        }
        await fs.writeFileSync(outputApiPath, JSON.stringify(apiObj, null, 2));
      } catch (err) {
        console.warn(err);
      }
    });
  });
};

const generate = async (result) => {
  await generateMarkDownJson(result.includes);
};

