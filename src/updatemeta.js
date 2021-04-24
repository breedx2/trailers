'use strict';

// Updates all metadata.
// If meta file is missing, creates it new
// If hash of original is missing, computes it

const path = require('path');
const env = require('../env.json');
const { execFileSync, spawnSync } = require("child_process");
const fs = require('fs');
const vidinfo = require('./vidinfo');
const filenames = require('./filenames');

const dirEnts = fs.readdirSync(env.original, { withFileTypes: true});

dirEnts.filter(de => de.isFile())
  .map(de => de.name)
  .filter(filenames.isVideoFileExtension)
  .map(infile => [infile, filenames.metafile(infile)])
  .forEach(([infile,outfile]) => {
    const original = `${env.original}/${infile}`;
    console.log(`Checking ${original}...`);
    if(vidinfo.metaNeedsUpdate(`${original}`)){
      console.log(`Needs update: ${original}`)
      vidinfo.rebuildInfo(original);
    }
  });
