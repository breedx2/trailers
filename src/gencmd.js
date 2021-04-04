'use strict'

const path = require('path');
const env = require('./env.json');

// Given metadata about a file, compute the ffmpeg commandline that we
// will want to run

// ffmpeg -i test.mkv -c:v libx264 -vf scale=-1:720 -crf 18 -c:a aac -ar 44100 -ac 2 test.720p2.flv


// Given a video file, generate the ffmpeg command to normalize it
function gencmdFromFile(file){
  const base = path.basename(file);
  const metafile = path.resolve(env.info, base + ".json");
  const meta = require(metafile);
  const start = meta.start ? `-ss ${meta.start}` : '';
  const len = meta.len ? `-t ${meta.len}` : '';

  const vf = buildVf(meta);
  const volumepart = buildVol(meta);
  const outfile = path.resolve(env.out, base + ".flv");
  // ${croppart} \
  const cmd = `ffmpeg \
    ${start} \
    -i '${file}' \
    -vf '${vf}' \
    -c:v libx264 \
    -crf 18 -c:a aac -ar 44100 -ac 2 \
    ${volumepart} \
    -r 23.976 \
    -max_muxing_queue_size 9999 \
    ${len} \
    '${outfile}'
  `;
  return cmd.replace(/\s+/g, ' ');
}

function buildVf(meta){
  const croppart = buildCrop(meta);
  let result = croppart === '' ? '' : croppart + ',';
  return result + "scale=w=1280:h=720:force_original_aspect_ratio=1,pad=1280:720:(ow-iw)/2:(oh-ih)/2";
}

function buildCrop(meta){
  const [w,h,x,y] = meta.cropchoice.split(/:/);
  if((x === '0' && y === '4') || (x === '4' && y === '0')){
    console.log('Crop too small, skipping crop');
    return '';
  }
  return `crop=${meta.cropchoice}`
}

// function buildScale(meta){
//   const [w,h] = getDimensions(meta);
//   const hp = 720.0 / h;
//   // console.log(`DEBUG: hp = ${hp}, w * hp => ${w * hp}`);
//   if(hp * w > 1280) { // too large, cap at width
//     const wp = 1280.0 / w;
//     const dh = 720 - (wp*h);
//     console.log(`wp*h = ${wp*h}, dh = ${dh}`)
//     return `scale=1280:-1`
//   }
//   return `scale=-1:720`;
// }
//
// function buildPad(meta){
//   const [w,h] = getDimensions(meta);
//   const hp = 720.0 / h;
//   console.log(`hp = ${hp}`)
//   if(hp * w > 1280) { // too large, capped at widtph, maybe pad height
//       return 'tbd';
//   }
//   let pad = '';
//   if(1280 - (hp*w) > 0){
//     // const padAmount = (1280 - (hp*w)/2);
//     pad = `pad=1280:720:-1:-1`;
//   }
// }

function buildVol(meta){
  const v = meta.maxvol.replace(/^-/, '');
  if(v === '0.0dB') return '';
  return `-filter:a "volume=${v}"`
}

function getDimensions(meta){
  const [w,h,x,y] = meta.cropchoice.split(/:/);
  if((x === '0' && y === '4') || (x === '4' && y === '0')){
    return meta.size.split(/x/);
  }
  return [w,h];
}

if (require.main === module) {
  // Called directly
  const cmd = gencmdFromFile(process.argv[2]);
  console.log(cmd);
}


module.exports = {

};
