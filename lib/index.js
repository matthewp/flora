const { Readable } = require('stream');
const toString = val => ''+val;

class HTML extends Readable {
  constructor(strings, values) {
    super();
    this._strings = strings;
    this._values = values;
    this._v = null;
    this._index = 0;
    this._reading = false;
  }

  _read(size) {
    if(!this._reading) {
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
    if(this._v === null) {
      this._v = getValues(this._values);
    }
    let result = this._v.next();
    if(result.done) {
      this.push(null);
      return;
    }

    let value = await result.value;
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

    yield Promise.resolve(value);
  }
}