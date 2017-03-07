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
  function next() {
    let dfd = new Deferred();
    stack.push([
      dfd.promise.then(val => {
        if(!val) return;
        return scope.add(val).add({
          [alias]: val
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
