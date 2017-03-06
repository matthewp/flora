const isPromise = require('is-promise');
const Readable = require('stream').Readable;
const { notImplemented } = require('./util');


class StreamingSerializer extends Readable {
  constructor(stack, scope) {
    super();
    this.stack = stack;
    this.scope = scope;
    this.generator = this.serialize();
    this.promise = Promise.resolve();
    this.buffer = '';
    this._streamingComplete = false;
  }

  _read() {
    if(this._streamingComplete) return;

    this.promise.then(promiseValue => {
      let result = this.generator.next(promiseValue);
      let { done } = result;

      if(done) {
        this._streamingComplete = true;
        if(this.buffer) {
          this.push(this.clearBuffer());
        }

        this.push(null);
        return;
      } else {
        let promise = result.value;
        if(isPromise(promise)) {
          this.promise = promise;
        }
        this.push(this.clearBuffer());
      }
    });
  }

  clearBuffer() {
    let b = this.buffer;
    this.buffer = '';
    return b;
  }

  *serialize() {
    let scope = this.scope;
    let dir = 0;

    for(let i = 0, len = this.stack.length; i < len; i++) {
      let section = this.stack.item(i);
      let value;

      switch(section.type) {
        case 'cond':
          let truthy = section.isTrue(scope);
          if(isPromise(truthy)) {
            truthy = yield truthy;
          }

          if(truthy) {
            value = section.buffer;
          } else {
            i = section.nextIndex - 1;
            continue;
          }
          break;
        case 'each':
          let items = section.items(scope);
          break;
        case 'expression':
          value = section.value(scope);
          break;
        case 'raw':
          value = section.buffer;
          break;
      }

      if(isPromise(value)) {
        this.buffer = yield value;
      } else {
        this.buffer += value;
      }
    }
  }
}

module.exports = StreamingSerializer;
