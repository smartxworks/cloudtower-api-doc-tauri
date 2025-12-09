const fs = require('fs');
const path = require('path');
const _ = require('lodash');
const fix = (version, lng) => {
    const filePath = path.join(__dirname, lng, `${version}.json`)
    const file = fs.readFileSync(filePath, 'utf-8')
    const json = JSON.parse(file);
    const { schemas, paths } = json;
    const originalJson = require(path.join(__dirname, 'original.json'));
    // loop schemas/paths/tags in swagger json file, fill the value with same key path from original json
    Object.entries(schemas).forEach(([key, value]) => {
        const originalSchema = _.get(originalJson, ['schemas', key]);
        Object.keys(value).forEach((k) => {
            const originalProperty = _.get(originalSchema, k);
            if(originalProperty) {
                // set json
                _.set(json, ['schemas', key, k], originalProperty);
            }
        })
    })
    Object.entries(paths).forEach(([key, value]) => {
        const originalValue = _.get(originalJson, ['paths', key]);
        if(originalValue) {
            _.set(json, ['paths', key], originalValue);
        }
    })

    fs.writeFileSync(filePath, JSON.stringify(json, null, 2), 'utf-8');
}

fix('4.4.0', 'en');