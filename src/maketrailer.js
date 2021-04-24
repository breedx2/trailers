'use strict';

const { execFileSync, spawnSync } = require("child_process");
const vidinfo = require('./vidinfo.js');
const gencmd = require('./gencmd.js');

if (require.main === module) {
  const originalFile = process.argv[2];
  makeTrailer(originalFile);
}

function makeTrailer(file) {
  if(vidinfo.metaNeedsUpdate(file)){
    vidinfo.rebuildInfo(file);
  }
  const cmd = gencmd.gencmdFromFile(file);
  console.log(cmd)
  execFileSync(cmd.cmd, cmd.args, {stdio: 'inherit'});
}

module.exports = makeTrailer;
