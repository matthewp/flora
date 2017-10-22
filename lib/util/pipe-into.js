const { Writable } = require('stream');

function pipeInto(fromStream, readable) {
  let outStream = fromStream.pipe(new Writable({
    write(data, enc, next) {
      readable.push(data);
      next(null, data);
    }
  }));

  return new Promise(resolve => {
    outStream.on('finish', () => resolve());
  });
}

module.exports = pipeInto;
