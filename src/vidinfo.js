'use strict';
const { execFileSync, spawnSync } = require("child_process");
const fs = require('fs');
const env = require('../env.json');
const filenames = require('./filenames');
const checksum = require('./checksum');
const volumedetect = require('./volumedetect');

// Gets metadata about a video file and writes it to a descriptor

function cropdetect(file){
  console.log('Gathering border crop info...');
  const script = `${__dirname}/../scripts/cropdetect.sh`;
  const cmdResult = execFileSync(script, [file]).toString().trim();
  const lines = cmdResult.split("\n");
  const result = {};
  lines.forEach(line => {
    const [countStr, crop] = line.trim().split(/\s+/);
    const count = parseInt(countStr);
    // don't include super small intervals (< 10)
    if(count > 10) result[crop] = parseInt(count);
  });
  return result;
}

function probe(file){
  console.log('Probing file for basic metadata...');
  const cmdResult = spawnSync("ffprobe", [file]);
  const lines = cmdResult.stderr.toString().trim().split("\n");
  const result = {};
  lines.forEach(line => {
    if(line.trim().match(/^Duration:/)){
      result.duration = line.trim().match(/^Duration: (\d\d:\d\d:\d\d.\d\d).*/)[1];
    }
    else if(line.trim().match(/^Stream #0:0: Video/)){
      result.size = line.trim().match(/, (\d+x\d+)(, | \[)/)[1];
      result.fps = line.trim().match(/ (\d+(\.\d+)?) fps/)[1];
    }
  });
  return result;
}

function getinfo(file){
  const result = probe(file);
  result.maxvol = volumedetect(file);
  result.cropinfo = cropdetect(file);
  result.cropchoice = choosecrop(result.cropinfo);
  console.log(`Building checksum...`);
  result.original_checksum = checksum.sha1sum(file);
  return result;
}

function choosecrop(cropinfo){
  const sum = Object.values(cropinfo).reduce((acc,val) => acc + val, 0);
  const max = Object.entries(cropinfo).reduce((acc,[k,v]) => {
    return v > acc[1] ? [k,v] : acc
  }, ['',0]);
  return max[0].replace(/^crop=/, '');
}

function rebuildInfo(file){
  console.log('Gathering file info...');
  const info = getinfo(file);
  const metafile = filenames.metafile(file);
  if(fs.existsSync(metafile)){
    console.log("Output exists, reading extra user content...");
    const oldInfo = JSON.parse(fs.readFileSync(metafile));
    if(oldInfo.start) {
      console.log(`User specified start: ${oldInfo.start}`);
      info.start = oldInfo.start;
    }
    if(oldInfo.len) {
      console.log(`User specified length: ${oldInfo.len}`);
      info.len = oldInfo.len;
    }
  }
  fs.writeFileSync(metafile, JSON.stringify(info, null, '  '));
  console.log(`Wrote info to ${metafile}`);
}

// Returns true if the meta file is missing or if the video file is newer
function metaNeedsUpdate(originalFile){
  const meta = filenames.metafile(originalFile);
  if(!fs.existsSync(meta)) {
    return true;
  }
  const ostats = fs.statSync(originalFile);
  const mstats = fs.statSync(meta);
  if(ostats.mtimeMs > mstats.mtimeMs){
    return true;
  }
  const info = require(meta);
  const sha = checksum.sha1sum(originalFile);
  return sha !== info.original_checksum;
}

if (require.main === module) {
  // Called directly
  rebuildInfo(process.argv[2]);
}

module.exports = {
  cropdetect,
  rebuildInfo,
  metaNeedsUpdate
}
