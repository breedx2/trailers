'use strict';

const { spawnSync } = require("child_process");
const filenames = require('./filenames');
const fs = require('fs');

// Similar to this, but possibly considers the start and len
// in the metadata file if found

// ffmpeg -i "$1" -filter:a volumedetect -f null /dev/null 2>&1 | \
//     grep max_volume | sed -e "s/^.*max_volume/max_volume/"


function volumedetect(file){
  console.log('Gathering max volume from file...');

  const [cmd, args] = _buildCommand(file);
  // console.log(cmd, args);

  const cmdResult = spawnSync(cmd, args);
  const lines = cmdResult.stderr.toString().trim().split("\n");
  const vol = lines.filter(line => line.includes('max_volume'))
    .map(line => line.replace(/^.*max_volume: /, ''))
    .map(line => line.replace(/ dB/, 'dB'))
    [0];
  return vol;
}

function _buildCommand(file){
  const timeInfo = _getTimeInfo(file);
  const args = [];
  if(timeInfo.start){
    args.push('-ss', timeInfo.start);
  }
  args.push('-i', file);
  args.push('-filter:a', 'volumedetect');
  args.push('-f', 'null');
  if(timeInfo.len){
    args.push('-t', timeInfo.len);
  }
  args.push('/dev/null');

  return ['ffmpeg', args];
}

function _getTimeInfo(file){
  const metafile = filenames.metafile(file);
  const result = {};
  if(fs.existsSync(metafile)){
    const meta = require(metafile);
    if(meta.start){
      console.log(`User specified start: ${meta.start}`);
      result.start = meta.start;
    }
    if(meta.len){
      console.log(`User specified length: ${meta.len}`);
      result.len = meta.len;
    }
  }
  return result;
}

module.exports = volumedetect;
