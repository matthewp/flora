import document from './document.js';
import htmlparser from 'htmlparser2';

class Stack {
  constructor() {
    this.body = document.createElement('body');
    this.stack = [this.body];
  }

  peek() {
    return this.stack[this.stack.length - 1];
  }

  push(el){
    this.stack.push(el);
  }

  pop() {
    return this.stack.pop();
  }
}

export default function(str){
  let stack = new Stack();

  var parser = new htmlparser.Parser({
    onopentag: function(name, attrs){
      let el = document.createElement(name);

      Object.keys(attrs).forEach(attrName => {
        let attrValue = attrs[attrName];
        el.setAttribute(attrName, attrValue);
      });

      stack.peek().appendChild(el);
      stack.push(el);
    },
    ontext: function(text){
        let tn = document.createTextNode(text);
        let el = stack.peek();
        el.appendChild(tn);
    },
    onclosetag: function(name){
      stack.pop();
    }
  }, {decodeEntities: true});
  parser.write(str);
  parser.end();

  let template = stack.body.firstChild;

  if(template.nodeName !== 'TEMPLATE') {
    throw new Error('Root node must be a template but is:', template.nodeName);
  }

  let frag = document.createDocumentFragment();
  let child = template.firstChild, nextChild = child;

  while(nextChild) {
    nextChild = child.nextSibling;
    frag.appendChild(child.cloneNode(true));
    child = nextChild;
  }

  template.content = frag;

  return template;
}
