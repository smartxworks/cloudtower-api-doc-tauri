#!/usr/bin/env node
const fs = require("fs");
const url = require('url');
const http = require('http');
const path = require('path');
const versions = require('../versions.json')

const SCHEMA_URL = `http://192.168.28.9/schema/v3/`
const sync = () => {
  for(const v of versions) {
    const fileUrl = new url.URL(v.replace('v', ''), SCHEMA_URL);
    const fileName = `${v}-swagger.json`;
    const filePath = path.resolve(__dirname, `../swagger/specs/${fileName}`)
    http.get(fileUrl.href, function(response) {
      let content = '';
      response.on('data', (chunk) => content += chunk);
      response.on('end', () => {
        if(response.statusCode === 200) {
          const formatContent = JSON.stringify(JSON.parse(content), null, 2)
          fs.writeFileSync(filePath, formatContent, 'utf-8')
        }
      })
    });
  }
};
sync();
