#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const merge = require('lodash/merge');

/**
 * Merge multiple JSON files into a single file.
 * Later files override keys from earlier files.
 * @param {string} outputFile
 * @param {string[]} inputFiles
 */
function mergeJsonFiles(outputFile, inputFiles) {
  if (!outputFile || !Array.isArray(inputFiles) || inputFiles.length === 0) {
    throw new Error('mergeJsonFiles requires an output file and at least one input file');
  }

  const result = inputFiles.reduce((acc, filePath) => {
    const resolvedPath = path.resolve(filePath);
    const content = JSON.parse(fs.readFileSync(resolvedPath, 'utf8'));
    return merge(acc, content);
  }, {});

  fs.writeFileSync(outputFile, JSON.stringify(result, null, 2), 'utf8');
  return {outputFile, inputFiles: inputFiles.length};
}

module.exports = mergeJsonFiles;

if (require.main === module) {
  if (process.argv.length < 4) {
    console.error('Usage: merge-json output.json input1.json input2.json ...');
    process.exit(1);
  }

  const [,, outputFile, ...inputFiles] = process.argv;
  mergeJsonFiles(outputFile, inputFiles);
  console.log(`Merged ${inputFiles.length} files into ${outputFile}`);
}