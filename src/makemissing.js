'use strict';

const env = require('../env.json');
const path = require('path');
const { execFileSync, spawnSync } = require("child_process");
const fs = require('fs');
const filenames = require('./filenames');
const makeTrailer = require('./maketrailer');

// Makes all missing trailers

const dirEnts = fs.readdirSync(env.original, { withFileTypes: true});

dirEnts.filter(de => de.isFile())
  .map(de => de.name)
  .filter(filenames.isVideoFileExtension)
  .map(infile => [infile, filenames.outfile(infile)])
  .filter(([infile,outfile]) => !fs.existsSync(outfile))
  .forEach(([infile,outfile]) => {
    console.log(`Need: ${outfile}`);
    makeTrailer(`${env.original}/${infile}`);
  });
