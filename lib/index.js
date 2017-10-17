const { Readable, Transform, Writable } = require('stream');
const isPromise = require('is-promise');
const isStream = require('is-stream');

const toString = val => {
  if(Array.isArray(val)) {
    return val.join('');
  }
  return '' + val;
};

class HTML extends Readable {
  constructor(strings, values) {
    super();
    this._strings = strings;
    this._values = values;
    this._v = null;
    this._index = 0;
    this._waiting = false;
    this._reading = false;
  }

  _read(size) {
    if(this._waiting) {
      return;
    } if(!this._reading) {
      this.nextString();
    } else {
      this.nextValue();
    }
  }

  nextString() {
    let i = this._index++;
    this._reading = true;
    this.push(this._strings[i]);
  }

  async nextValue() {
    console.log('reading');
    if(this._v === null) {
      this._v = getValues(this._values);
    }
    let result = this._v.next();
    if(result.done) {
      this.push(null);
      return;
    }

    let value = result.value;

    if(isPromise(value)) {
      value = await value;
    } else if(isStream(value)) {
      value.pipe(new Writable({
        objectMode: true,
        write(val, enc, next){
          if(isStream(val)) {

            val.on('data', d => {
              this.push(d);
            });

            val.on('end', function(){
              console.log('done');
            })
          } else {
            this.push(val);
            next();
          }
        }
      }));
      return;
    }

    this._reading = false;
    this.push(toString(value));
  }
}

exports.html = function(strings, ...values){
  return new HTML(strings, values);
};

function* getValues(values) {
  for(let i = 0, len = values.length; i < len; i++) {
    let value = values[i];

    yield value;
  }
}

exports.map = function(stream, cb){
  let outStream = new Transform({ objectMode: true });
  outStream._transform = function(item, enc, next){
    let ret = cb(item);
    next(null, ret);
  };
  return stream.pipe(outStream);
};