'use strict';

const env = require('./env.json');
const path = require('path');

// Given an original file, return the name of the target/output file
function outfile(originalFile){
  const base = path.basename(originalFile);
  return path.resolve(env.out, base + ".flv");
}

// Given an original file, return the name of the metadata file
function metafile(originalFile){
  const base = path.basename(originalFile);
  return path.resolve(env.info, base + ".json");
}

module.exports = {
  outfile,
  metafile
}
