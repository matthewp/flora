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

    this.promise
    .then(promiseValue => {
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
    })
    .catch(err => {
      console.error("HUH",err);
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
      let value;
      let section = this.stack.item(i);
      let scope = this.scope;

      if(iterations.length) {
        let iter = iterations.first();
        scope = iter[0];
        let [,startIndex, endIndex] = iter;

        // Finished an iteration, go back to the top?
        if(endIndex === i) {
          iterations.shift();
          if(iterations.length) {
            i = startIndex;
            continue;
          }
        }

        if(isPromise(scope)) {
          scope = yield scope;
          iter[0] = scope;
        }

        // Finished the end of a stream, jump to the end
        // of this iteration
        if(scope == null) {
          // i honestly don't now why this is needed, could be wrong
          let offset = iterations.length ? 0 : 1;
          i = endIndex - offset;
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
          } else {
            items.forEach((item, j) => {
              let itemScope = scope.add(item).add({
                [section.alias]: item,
                index: j
              });
              iterations.push([itemScope, i, section.nextIndex]);
            });
            continue;
          }
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
