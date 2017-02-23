import flora from './flora.js';
import parse from './node/parser.js';
import document from './node/document.js';
import serialize from './node/serialize.js';
import streams from 'stream';

const { Readable } = streams;

const ASYNC = Symbol.for('async-node');

class SerializeStream extends Readable {
  constructor(frag) {
    this.gen = serialize(frag);
    this.next = Promise.resolve();
  }

  _read() {
    this.next.then(() => {
      var res = this.gen.next();
      if(res.done) {
        this.push(null);
      } else {
        if(res.node[ASYNC]) {
          this.next = res.node[ASYNC];
        }

        this.push(res.value.buffer);
      }
    });
  }
}

flora.document = document;

flora.fromString = function(str){
  let template = parse(str);
  let hydrate = flora(template);

  return function(data){
    let frag = hydrate(data);
    return new SerializeStream(frag);
    //return serialize(frag);
  };
};

export default flora;
