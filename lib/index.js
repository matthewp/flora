const { Readable, Transform, Writable } = require('stream');
const isPromise = require('is-promise');
const isStream = require('is-stream');

const toString = val => {
  if(Array.isArray(val)) {
    return val.join('');
  }
  return val.toString();
};

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

async function readAll(stream, strings, values) {
  let i = 0;
  while(i < values.length) {
    let html = strings[i];
    stream.push(html);

    let p = values[i];
    let val;
    if(isStream(p)) {
      await pipeInto(p, stream);
    } else {
      val = await p;
      stream.push(toString(val));
    }

    i++;
  }
  stream.push(strings[i]);
  stream.push(null);
}

exports.html = function(strings, ...values){
  let reading = false;

  let readable = new Readable({
    read() {
      if(reading) return;
      reading = true;
      readAll(this, strings, values).catch(err => {
        this.emit('error', err);
        this.push(null);
      });
    }
  });

  return readable;
};

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

exports.map = mapStream;
