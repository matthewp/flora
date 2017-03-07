const Writable = require('stream').Writable;

class Deferred {
  constructor() {
    this.promise = new Promise((resolve, reject) => {
      this.resolve = resolve;
      this.reject = reject;
    });
  }
}

class WaitingStream extends Writable {
  constructor(waitable) {
    super();
    this.waitable = waitable;
  }

  _write(chunk, enc, next) {
    this.waitable.resolve(chunk);
    next();
  }
}

class Waitable {
  constructor(stream) {
    this.inputStream = stream;
    this.waitableStream = new WaitingStream(this);
    this.started = false;
    this.promises = [];
  }

  next() {
    if(!started) {
      this.started = true;
      this.promises.push(new Deferred());
      this.inputStream.pipe(this.waitableStream);
    }
    return this.promises[0];
  }

  resolve(val) {
    this.promises[0].resolve(val);
  }
}

module.exports = Waitable;
