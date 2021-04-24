'use strict';

const crypto = require('crypto');

function sha1sum(file){
  const hash = crypto.createHash('sha1');
  const fd = fs.openSync(file);

  const len = 1024*16;
  const buff = Buffer.alloc(len);
  while(true){
    const rc = fs.readSync(fd, buff, 0, len);
    if(rc < 0) break;
    hash.update(buff.slice(0,rc), 'utf8')
    if(rc < len) break;
  }
  fs.closeSync(fd);
  return hash.digest('hex');
}


module.exports = {
  sha1sum
}
