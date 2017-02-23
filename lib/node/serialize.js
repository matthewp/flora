let attr = a => ` ${a.name}="${enc(a.value)}"`;
let enc = s => s.replace(/[&'"<>]/g, a => `&#${a};`);

const ASYNC = Symbol.for('async-node');

function* serialize(el){
  let buffer = '';
  /*if(el.nodeType === 3) {
    return enc(el.textContent);
  }*/
  // Document fragment
  if(el.nodeType === 11) {
    for(i = 0; i < el.childNodes.length; i++) {
      node = el.childNodes[i];
      if(node[ASYNC]) {
        yield { buffer, node };
        buffer = '';
      }
      gen = serialize(node);
      do {
        res = gen.next();
        yield res.value;
        buffer += '';
      } while(!res.done);
    }
    return;
  }

  let nodeName = el.nodeName.toLowerCase();
  buffer += '<' + nodeName;

  var i, node, gen, res;
  for(i = 0; i < el.attributes.length; i++) {
    node = el.attributes[i];
    if(node[ASYNC]) {
      yield { buffer, node };
      buffer = '';
      //i--; // decrement so we retry this ne
    }
    buffer += attr(node);
  }

  for(i = 0; i < el.childNodes.length; i++) {
    node = el.childNodes[i];
    if(node[ASYNC]) {
      yield { buffer, node };
      buffer = '';
    }
    gen = serialize(node);
    do {
      res = gen.next();
      yield res.value;
      buffer += '';
    } while(!res.done);
  }

  buffer += '</' + nodeName + '>';

  yield { buffer };

  yield { buffer };
}

export default serialize;
