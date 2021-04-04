'use strict';
const { execFileSync } = require("child_process");

// Gets metadata about a video file and writes it to a descriptor

function cropdetect(file){
  const script = `${__dirname}/../scripts/cropdetect.sh`;
  const cmdResult = execFileSync(script, [file]).toString().trim();
  const lines = cmdResult.split("\n");
  const result = {};
  lines.shift();
  lines.forEach((line, i) => {
    const [countStr, crop] = line.trim().split(/\s+/);
    const count = parseInt(countStr);
    // don't include super small intervals (< 10)
    if(count > 10) result[crop] = parseInt(count);
  });
  return result;
}

if (require.main === module) {
  // Called directly
  const cropInfo = cropdetect(process.argv[2]);
  console.log(cropInfo);
}

module.exports = {
  cropdetect
}
