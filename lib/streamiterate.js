const Writable = require('stream').Writable;

class Deferred {
  constructor() {
    this.promise = new Promise((resolve, reject) => {
      this.resolve = resolve;
      this.reject = reject;
    });
  }
}

class CalledBack extends Writable {
  constructor(onData, onEnd) {
    super({ objectMode: true });
    this.dataCallback = onData;
    this.endCallback = onEnd;
  }

  _write(chunk, enc, next) {
    this.dataCallback(chunk);
    next();
  }

  end() {
    this.endCallback();
    super.end();
  }
}

module.exports = function(stack, stream, scope, alias, startIndex, endIndex){
  let index = 0;
  function next() {
    let dfd = new Deferred();
    // We really need to make sure these are stacked in the right order
    stack.push([
      dfd.promise.then(val => {
        if(!val) return;
        return scope.add(val).add({
          [alias]: val,
          index: index++
        });
      }),
      startIndex,
      endIndex
    ]);
    return dfd;
  }

  let dfd = next();

  let writable = new CalledBack(
    function onData(chunk){
      dfd.resolve(chunk);
      dfd = next();
    },
    function onEnd(){
      dfd.resolve();
    }
  );

  stream.pipe(writable);
};
