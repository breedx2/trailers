'use strict';

const env = require('../env.json');
const path = require('path');
const { execFileSync, spawnSync } = require("child_process");
const fs = require('fs');
const filenames = require('./filenames');
const makeTrailer = require('./maketrailer');

// Computes the total time for all metadata

const dirEnts = fs.readdirSync(env.info, { withFileTypes: true});

const totalSeconds = dirEnts.filter(de => de.isFile())
  .map(de => de.name)
  .map(metaFilename => {
    console.log(`some meta: ${metaFilename}`);
    const meta = require(`${env.info}/${metaFilename}`);
    const len = meta.len || meta.duration;
    const lenSeconds = toSeconds(len);
    console.log(`   seconds: ${lenSeconds}`);
    return lenSeconds;
  })
  .reduce((acc,cur) => {
    return acc + cur;
  }, 0);

console.log(`total seconds: ${totalSeconds}`);
const hours = Math.floor(totalSeconds / (60*60));
const minutes = (totalSeconds - (hours * 60 * 60)) / 60;
console.log('-----------------------------');
console.log(`${hours} hours ${minutes} minutes`);


function toSeconds(len){
  const parts = len.split(':');
  return parseInt(60*60*parts[0]) +
          parseInt(60*parts[1]) +
          parseFloat(parts[2]);
}
