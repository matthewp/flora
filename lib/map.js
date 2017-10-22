const arrayToStream = require('stream-array');
const isStream = require('is-stream');
const { Transform, Writable } = require('stream');

function mapStream(stream, cb) {
  let outStream = new Transform();
  outStream._transform = function(val, enc, next){
    next(null, val);
  };

  let writable = new Writable({
    objectMode: true,
    write(data, enc, next) {
      let val = cb(data);
      if(isStream(val)) {
        val.pipe(outStream, { end: false });
        val.on('error', next);
        val.on('end', () => next(null, data));
      } else {
        // TODO
        throw new Error('Using map with non-stream entries is not currently supported.');
      }
    }
  });

  writable.on('finish', () => {
    outStream.end();
  });

  stream.pipe(writable, { end: true });

  return outStream;
}

exports.mapStream = mapStream;

function map(listLike, cb) {
  var list = listLike;
  if(Array.isArray(listLike)) {
    list = arrayToStream(listLike);
  }
  return mapStream(list, cb);
}

exports.map = map;
