'use strict';

const env = require('../env.json');
const fs = require('fs');
const path = require('path');
const filenames = require('./filenames');
const { execFileSync } = require("child_process");

const TARGET_LENGTH_MINUTES = 90;
const TEMP_INDEX_FILE = '/tmp/trailer-reel-files.txt';
const TEMP_FLV = 'trailers.tmp.flv';
const FINAL_FLV = 'trailers.flv';

const shuffled = getShuffledFiles();
let totSec = 0;

const fd = fs.openSync(TEMP_INDEX_FILE, 'w');

while(shuffled.length && (totSec < TARGET_LENGTH_MINUTES * 60)) {
  const item = shuffled.pop();
  const escaped = item[0].replace(/'/g, "'\\''");
  fs.writeFileSync(fd, `file '${env.out}/${escaped}\n`);
  totSec += item[1];
}
fs.closeSync(fd);
console.log(`Total seconds: ${totSec}`);

concatFirstPass();
console.log('Files joined!  Time for final encode...');
finalEncode();
console.log('Cleaning up temp...');
fs.unlink(TEMP_INDEX_FILE, () => { });
fs.unlink(TEMP_FLV, () => { });
console.log(`All done: ${FINAL_FLV}`);

function finalEncode(){
  const args = [
    '-i', TEMP_FLV,
    '-c:v', 'libx264',
    '-vf', 'scale=-1:720',
    '-crf', '18',
    '-c:a', 'aac',
    '-ar', '44100',
    '-ac', '2',
    FINAL_FLV
  ];
  execFileSync('ffmpeg', args, {stdio: 'inherit'});
}


function concatFirstPass(){
  const args = [
    '-f', 'concat',
    '-safe', '0',
    '-i', TEMP_INDEX_FILE,
    '-c', 'copy',
    TEMP_FLV
  ]
  execFileSync('ffmpeg', args, {stdio: 'inherit'});
}

function getShuffledFiles(){
  const dirEnts = fs.readdirSync(env.out, { withFileTypes: true});
  const files = dirEnts.filter(de => de.isFile())
    .map(de => de.name)
    .filter(file => file.endsWith('.flv'))
    .map(addLength);
  return shuffle(files);
}

function addLength(file){
  const original = path.basename(file.replace(/.flv$/, ''));
  const metafile = filenames.metafile(original);
  const meta = require(metafile);
  const len = meta.len || meta.duration;
  const lenSeconds = toSeconds(len);
  return [file,lenSeconds];
}

function toSeconds(len){
  const parts = len.split(':');
  return parseInt(60*60*parts[0]) +
          parseInt(60*parts[1]) +
          parseFloat(parts[2]);
}

function shuffle(array) {
  let i = array.length;
  while (i--) {
    const ri = Math.floor(Math.random() * (i + 1));
    [array[i], array[ri]] = [array[ri], array[i]];
  }
  return array;
}
