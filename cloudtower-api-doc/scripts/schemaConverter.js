// fork from: https://github.com/paljs/prisma-tools/blob/main/packages/schema/src/json.ts
const { existsSync, readFileSync } = require('fs');
class ConvertSchemaToObject {
  schemaObject = {
    models: [],
    enums: [],
  };
  data;

  constructor(data) {
    this.data = data;
  }

  get models() {
    return this.data.match(/\n(model(\s)[\s\S]*?})/g);
  }

  get enums() {
    return this.data.match(/\n(enum(\s)[\s\S]*?})/g);
  }

  blockLines(block) {
    return block.split(/\n/).filter((v) => v);
  }

  getType(line) {
    return line[1].replace("?", "").replace("[]", "");
  }

  getKind(type) {
    return this.data.includes(`enum ${type} `)
      ? "enum"
      : this.data.includes(`model ${type} `)
      ? "object"
      : "scalar";
  }

  getClassName(lines) {
    return this.lineArray(lines[0])[1];
  }

  lineArray(line) {
    return line
      .replace(/[\n\r]/g, "")
      .split(" ")
      .filter((v) => v);
  }

  getMap(line) {
    const value = line.match(/@map\((.*?)\)/);
    if (value) {
      return value[1]
        .replace(/name/, "")
        .replace(":", "")
        .replace(" ", "")
        .replace(/"/g, "");
    }
    return undefined;
  }

  getRelation(line) {
    const relationString = line.match(/@relation\((.*?)\)/);
    if (relationString) {
      const relation = {};
      const name = relationString[1].match(/"(\w+)"/);
      if (name) {
        relation.name = name[1];
      }
      ["fields", "references"].forEach((item) => {
        const pattern = new RegExp(`${item}:[\\s\\S]\\[(.*?)\\]`);
        const values = relationString[1].match(pattern);
        if (values) {
          const asArray = values[1]
            .replace(/ /g, "")
            .split(",")
            .filter((v) => v);
          if (asArray.length > 0) {
            relation[item] = asArray;
          }
        }
      });
      return relation;
    }
    return undefined;
  }

  run() {
    this.getModels();
    this.getEnums();
    return this.schemaObject;
  }

  getModels() {
    if (this.models) {
      for (const model of this.models) {
        const lines = this.blockLines(model);
        const modelObject = {
          name: this.getClassName(lines),
          fields: [],
        };
        let documentation = "";
        for (let i = 1; i + 1 < lines.length; i++) {
          const line = this.lineArray(lines[i]);
          if (line[0].includes("//")) {
            documentation = documentation
              ? documentation + "\n" + line.join(" ")
              : line.join(" ");
          } else if (line[0].includes("@@")) {
            modelObject.map = this.getMap(lines[i]);
          } else {
            const type = this.getType(line);
            const field = {
              name: line[0],
              type,
              isId: line.includes("@id"),
              unique: line.includes("@unique"),
              list: line[1].includes("[]"),
              required: !line[1].includes("[]") && !line[1].includes("?"),
              kind: this.getKind(type),
              documentation,
              map: this.getMap(lines[i]),
            };

            if (field.kind === "object") {
              field.relation = this.getRelation(lines[i]);
            }
            modelObject.fields.push(field);
            documentation = "";
          }
        }
        modelObject.documentation = documentation;
        modelObject.fields
          .filter((item) => item.kind !== "object")
          .forEach((item) => {
            let relationField = false;
            modelObject.fields
              .filter((field) => field.kind === "object")
              .forEach((field) => {
                if (!relationField) {
                  relationField = !!field.relation?.fields?.includes(item.name);
                }
              });
            item.relationField = relationField;
          });
        this.schemaObject.models.push({ ...modelObject });
      }
    }
  }

  getEnums() {
    if (this.enums) {
      for (const item of this.enums) {
        const lines = this.blockLines(item);
        const itemObject = {
          name: this.getClassName(lines),
          fields: [],
        };
        for (let i = 1; i + 1 < lines.length; i++) {
          const line = this.lineArray(lines[i]);
          !line[0].includes("//") && itemObject.fields.push(line[0]);
        }
        this.schemaObject.enums.push({ ...itemObject });
      }
    }
  }
}

module.exports = {
  ConvertSchemaToObject,
};
