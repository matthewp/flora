const Readable = require('stream').Readable;

class StreamingSerializer extends Readable {
  constructor(section, scope) {
    super();
    this.section = section;
    this.scope = scope;
  }

  _read() {
    // go through the section
    debugger;
  }
}

module.exports = StreamingSerializer;
