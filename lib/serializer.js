const isPromise = require('is-promise');
const isStream = require('is-stream');
const iterateOn = require('./streamiterate');
const { notImplemented } = require('./util');
const Readable = require('stream').Readable;
const Stack = require('./stack');

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
    let dir = 0;
    let iterations = new Stack();

    for(let i = 0, len = this.stack.length; i < len; i++) {
      let section = this.stack.item(i);
      let scope = this.scope;
      let value;

      if(iterations.length) {
        let iter = iterations.first();
        scope = iter[0];
        let [,startIndex, endIndex] = iter;
        if(endIndex === i) {
          iterations.shift();
          if(iterations.length) {
            i = startIndex;
            continue;
          }
        }

        if(isPromise(scope)) {
          scope = yield scope;
        } else if(scope == null) {
          i = endIndex;
          continue;
        }
      }

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

          if(isStream(items)) {
            iterateOn(iterations, items, scope, section.alias,
              i, section.nextIndex);
            continue;
          }

          items.forEach((item, j) => {
            let itemScope = scope.add(item).add({
              [section.alias]: item,
              index: j
            });
            iterations.push([itemScope, i, section.nextIndex]);
          });
          continue;
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
