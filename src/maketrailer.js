'use strict';
const { execFileSync, spawnSync } = require("child_process");
const vidinfo = require('./vidinfo.js');
const gencmd = require('./gencmd.js');

const file = process.argv[2];

// TBD re-run vidinfo here always since it's not too slow?

const cmd = gencmd.gencmdFromFile(file);
console.log(cmd)
execFileSync(cmd.cmd, cmd.args, {stdio: 'inherit'});
// spawnSync(cmd.cmd, cmd.args);
