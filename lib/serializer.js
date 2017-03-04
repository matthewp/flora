const isPromise = require('is-promise');
const Readable = require('stream').Readable;


class StreamingSerializer extends Readable {
  constructor(section, scope) {
    super();
    this.section = section;
    this.scope = scope;
    this.generator = this.serialize();
    this.promise = Promise.resolve();
  }

  _read() {
    // go through the section
    debugger;

    this.promise.then(() => {
      let result = this.generator.next();
      let { done } = result;

      if(done) {
        this.push(null);
      } else {
        this.push(result.buffer);
      }

      this.promise = result.value;
    });
  }

  *serialize() {
    let section = this.section;
    let scope = this.scope;
    let dir = 0;
    let buffer = '';

    while(section) {
      let value;

      switch(section.type) {
        case 'text':
          buffer += section.value;
          break;
        case 'cond':
          // change the scope
          break;
        case 'expression':
          value = section.getValue(scope);
          break;
        case 'raw':
          value = null;
      }

      if(isPromise(value)) {
        yield { buffer, value };
        buffer = '';
      }
    }

    yield { buffer };
  }
}

module.exports = StreamingSerializer;
