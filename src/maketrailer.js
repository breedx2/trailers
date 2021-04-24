'use strict';
const { execFileSync, spawnSync } = require("child_process");
const vidinfo = require('./vidinfo.js');
const gencmd = require('./gencmd.js');

if (require.main === module) {
  const originalFile = process.argv[2];
  if(vidinfo.metafileMissingOrOlder(originalFile)){
    vidinfo.rebuildInfo(originalFile);
  }
  makeTrailer(originalFile);
}


function makeTrailer(file) {
  const cmd = gencmd.gencmdFromFile(file);
  console.log(cmd)
  execFileSync(cmd.cmd, cmd.args, {stdio: 'inherit'});
  // spawnSync(cmd.cmd, cmd.args);
}

module.exports = makeTrailer;
