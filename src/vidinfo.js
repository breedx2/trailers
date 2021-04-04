'use strict';
const { execFileSync, spawnSync } = require("child_process");
const fs = require('fs');
const path = require('path');
const env = require('./env.json');

// Gets metadata about a video file and writes it to a descriptor

function cropdetect(file){
  const script = `${__dirname}/../scripts/cropdetect.sh`;
  const cmdResult = execFileSync(script, [file]).toString().trim();
  const lines = cmdResult.split("\n");
  const result = {};
  lines.shift();
  lines.forEach(line => {
    const [countStr, crop] = line.trim().split(/\s+/);
    const count = parseInt(countStr);
    // don't include super small intervals (< 10)
    if(count > 10) result[crop] = parseInt(count);
  });
  return result;
}

function probe(file){
    // const cmdResult = execFileSync("ffprobe", [file]).toString().trim();
    const cmdResult = spawnSync("ffprobe", [file]);
    const lines = cmdResult.stderr.toString().trim().split("\n");
    lines.shift();
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
  console.log('Probing file for basic metadata...');
  const result = probe(file);
  console.log('Gathering border crop info...');
  result.cropinfo = cropdetect(file);
  return result;
}

function rebuildInfo(file){
  console.log('Gathering file info...');
  const info = getinfo(file);
  const base = path.basename(file);
  const outfile = path.resolve(env.info, base + ".json");
  fs.writeFileSync(outfile, JSON.stringify(info, null, '  '));
  console.log(`Wrote info to ${outfile}`);
}


if (require.main === module) {
  // Called directly
  // const cropInfo = cropdetect(process.argv[2]);
  // console.log(cropInfo);
  // const probeInfo = probe(process.argv[2]);
  // console.log(probeInfo);
  rebuildInfo(process.argv[2]);
}


module.exports = {
  cropdetect
}
