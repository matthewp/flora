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
  }

  _read() {
    // go through the section
    debugger;

    this.promise.then(promiseValue => {
      let result = this.generator.next(promiseValue);
      let { done } = result;

      if(done) {
        this.push(null);
        return;
      } else {
        let { value: promise } = result.value;
        if(isPromise(promise)) {
          this.promise = promise;
        }
        this.push(result.value.buffer);
      }
    });
  }

  *serialize() {
    let scope = this.scope;
    let dir = 0;
    let buffer = '';

    function clearBuffer(value) {
      let b = buffer;
      buffer = '';
      return {
        buffer: b,
        value
      };
    }

    for(let i = 0, len = this.stack.length; i < len; i++) {
      let section = this.stack.item(i);
      let value;

      switch(section.type) {
        case 'cond':
          let truthy = section.isTrue(scope);
          if(isPromise(truthy)) {
            truthy = yield clearBuffer(truthy);
          }

          if(truthy) {
            value = section.buffer;
          } else {
            // jump ahead
            notImplemented('Negative conditionals');
          }
          break;
        case 'expression':
          value = section.getValue(scope);
          break;
        case 'raw':
          value = section.buffer;
          break;
      }

      if(isPromise(value)) {
        value = yield clearBuffer(value);
        buffer = value;
      } else {
        buffer += value;
      }
    }

    yield { buffer };
  }
}

module.exports = StreamingSerializer;
