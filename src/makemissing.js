'use strict';

const env = require('./env.json');
const path = require('path');
const { execFileSync, spawnSync } = require("child_process");
const fs = require('fs');
const filenames = require('./filenames');

// Makes all missing trailers

function isValidFileExtension(filename){
  const validExtensions = ['.mkv', '.mp4', '.webm'];
  const extension = path.extname(filename.toLowerCase());
  return validExtensions.includes(extension);
}

const dirEnts = fs.readdirSync(env.original, { withFileTypes: true});

dirEnts.filter(de => de.isFile())
  .map(de => de.name)
  .filter(isValidFileExtension)
  .map(infile => [infile, filenames.outfile(infile)])
  .filter(([infile,outfile]) => !fs.existsSync(outfile))
  .forEach(([infile,outfile]) => {
    console.log(`Need: ${outfile}`);
    const cmd = `node ${__dirname}/maketrailer.js "${env.original}/${infile}"`;
    console.log(cmd);

    // execFileSync(cmd.cmd, cmd.args, {stdio: 'inherit'});

  });
