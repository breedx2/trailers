'use strict';

const env = require('../env.json');
const fs = require('fs');
const path = require('path');
const filenames = require('./filenames');
const { execFileSync } = require("child_process");
const { program } = require('commander');

const DEFAULT_LENGTH_MINUTES = 120;
const TEMP_INDEX_FILE = '/tmp/trailer-reel-files.txt';
const TEMP_FLV = 'trailers.tmp.flv';
const FINAL_FLV = 'trailers.flv';


program.name('makereel')
  .description('Makes the trailer reel')
  .option('-s --strategy <strat>', 'file list strategy', 'SHUFFLE')
  .option('-d --duration <min>', 'target duration in minutes', DEFAULT_LENGTH_MINUTES)
  .parse();

const options = program.opts();
console.log(options)

if(!['SHUFFLE', 'NEWEST'].includes(options.strategy)){
  console.log('strategy must be one of SHUFFLE or NEWEST')
  process.exit(1);
}

const strategy = options.strategy;
const targetLengthMinutes = options.duration;

const fileList = getFileList(strategy);

let totSec = 0;

const fd = fs.openSync(TEMP_INDEX_FILE, 'w');

while(fileList.length && (totSec < targetLengthMinutes * 60)) {
  const item = fileList.pop();
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

function getFileList(strategy){
  switch(strategy){
    case 'SHUFFLE':
      return getShuffledFiles();
    case 'NEWEST':
      return getNewestFirst();
  }
}

function getShuffledFiles(){
  console.log('Getting shuffled file list...');
  const files = getFlvFiles();
  return multiShuffle(files);
}

function getNewestFirst(){
  console.log('Getting files with newest first...')
  const files = getFlvFiles();
  const mappedFiles = files.map(item => { 
    const fullpath = path.resolve(env.out, item[0]);
    const stat = fs.statSync(fullpath);
    return [item[0], item[1], stat.mtimeMs];
  });
  mappedFiles.sort((a,b) => a[2] - b[2]);
  return mappedFiles.map(item => item.slice(0,2));
}

function getFlvFiles(){
  const dirEnts = fs.readdirSync(env.out, { withFileTypes: true});
  return dirEnts.filter(de => de.isFile())
    .map(de => de.name)
    .filter(file => file.endsWith('.flv'))
    .map(addLength);
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

function multiShuffle(array){
  for(let i=0; i < 10; i++){
    array = shuffle(array);
  }
  return array;
}

function shuffle(array) {
  let i = array.length;
  while (i--) {
    const ri = Math.floor(Math.random() * (i + 1));
    [array[i], array[ri]] = [array[ri], array[i]];
  }
  return array;
}
