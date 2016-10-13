import undom from 'undom';

let document = undom();

const Element = document.body.constructor;
const Node = Element.__proto__;

Node.prototype._cloneNode = function() {
  let Ctr = this.constructor;
  let inst = new Ctr(this.nodeType, this.nodeName);
  if(this.nodeType === 3) {
    inst.nodeValue = this.nodeValue;
  }
  if(this.attributes && this.attributes.length) {
    inst.attributes = this.attributes.map(attr => Object.assign({}, attr));
  }
  return inst;
};

Node.prototype.cloneNode = function(deep) {
  var node = this._cloneNode();

  if (deep) {
    var child = this.firstChild, nextChild = child;

    while (nextChild) {
      nextChild = child.nextSibling;
      node.appendChild(child.cloneNode(true));
      child = nextChild;
    }
  }

  return node;
};

class DocumentFragment extends Element {
  constructor() {
    super(11, '#document-fragment');
  }
}

let _appendChild = Element.prototype.appendChild;
Element.prototype.appendChild = function(el){
  if(el instanceof DocumentFragment) {
    let child = el.firstChild, nextSibling = child;
    while(nextSibling) {
      nextSibling = child.nextSibling;
      _appendChild.call(this, child);
      child = nextSibling;
    }
    return el;
  }
  return _appendChild.apply(this, arguments);
};

document.createDocumentFragment = function(){
  return new DocumentFragment();
};

document.importNode = function(frag){
  let newFrag = frag.cloneNode(true);
  return newFrag;
};

export default document;
