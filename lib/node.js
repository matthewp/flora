import flora from './flora.js';
import parse from './node/parser.js';
import document from './node/document.js';
import serialize from './node/serialize.js';

flora.document = document;

flora.fromString = function(str){
  let template = parse(str);
  let hydrate = flora(template);

  return function(data){
    let frag = hydrate(data);
    return serialize(frag);
  };
};

export default flora;
