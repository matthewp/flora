'use strict';

function _interopDefault (ex) { return (ex && (typeof ex === 'object') && 'default' in ex) ? ex['default'] : ex; }

var undom = _interopDefault(require('undom'));
var htmlparser = _interopDefault(require('htmlparser2'));

var some = Array.prototype.some;

function hydrate(frag, callbacks, scope) {
  var paths = Object.keys(callbacks);
  var id = +paths.shift();
  var cur = 0;

  traverse(frag);

  function check(node) {
    cur++;
    if(id === cur) {
      var callback = callbacks[id];
      callback(node, scope);
      id = +paths.shift();
    }
    return !id;
  }

  function traverse(node){
    var exit;
    some.call(node.attributes || [], function(){
      exit = check(node);
      if(exit) {
        return true;
      }
    });
    if(exit) return false;

    some.call(node.childNodes, function(child){
      exit = check(child);
      if(exit) {
        return true;
      }

      exit = !traverse(child);
      if(exit) {
        return true;
      }
    });
    return !exit;
  }
}

var live = {
  attr: function(node, result, attrName, model){
    let val = result.value(model);
    node.setAttribute(attrName, val);
  },
  text: function(node, result, model){
    var val = result.value(model);
    node.nodeValue = val;
  },
  prop: function(node, prop){
    return function(val){
      node[prop] = val;
    };
  },
  each: function(node, parentScope, parseResult){
    var hydrate = Bram.template(node);
    var prop = parseResult.props()[0];
    var scopeResult = parentScope.read(prop);
    var placeholder = document.createTextNode('');
    node.parentNode.replaceChild(placeholder, node);

    var observe = function(list){
      var itemMap = new Map();
      var indexMap = new Map();

      var render = function(item, i){
        var scope = parentScope.add(item).add({ item: item, index: i});
        var frag = hydrate(scope);

        var info = {
          item: item,
          nodes: slice.call(frag.childNodes),
          scope: scope,
          index: i
        };
        itemMap.set(item, info);
        indexMap.set(i, info);

        var siblingInfo = indexMap.get(i + 1);
        var parent = placeholder.parentNode;
        if(siblingInfo) {
          var firstChild = siblingInfo.nodes[0];
          parent.insertBefore(frag, firstChild);
        } else {
          parent.appendChild(frag);
        }
      };

      var remove = function(index){
        var info = indexMap.get(index);
        if(info) {
          info.nodes.forEach(function(node){
            node.parentNode.removeChild(node);
          });
          itemMap.delete(info.item);
          indexMap.delete(index);
        }
      };

      list.forEach(render);

      var onarraychange = function(ev, value){
        if(ev.type === 'delete') {
          remove(ev.index);
          return;
        }

        var info = itemMap.get(value);
        if(info) {
          var oldIndex = info.index;
          var hasChanged = oldIndex !== ev.index;
          if(hasChanged) {
            info.scope.model.index = info.index = ev.index;

            var existingItem = indexMap.get(ev.index);
            if(existingItem) {
              indexMap.set(oldIndex, existingItem);
            } else {
              indexMap.delete(oldIndex);
            }
            indexMap.set(ev.index, info);

            var ref = indexMap.get(ev.index + 1);
            if(ref) {
              ref = ref.nodes[0];
            }

            var nodeIdx = info.nodes.length - 1;
            while(nodeIdx >= 0) {
              placeholder.parentNode.insertBefore(info.nodes[nodeIdx], ref);
              nodeIdx--;
            }
          }
        } else {
          remove(ev.index);
          render(value, ev.index);
        }
      };

      Bram.addEventListener(list, Bram.arrayChange, onarraychange);

      return function(){
        for(var i = 0, len = list.length; i < len; i++) {
          remove(i);
        }
        Bram.removeEventListener(list, Bram.arrayChange, onarraychange);
        itemMap = null;
        indexMap = null;
      };
    };

    var teardown = observe(scopeResult.value);

    Bram.addEventListener(scopeResult.model, prop, function(ev, newValue){
      teardown();
      teardown = observe(newValue);
    });
  },
  if: function(node, parentScope){
    var hydrate = Bram.template(node);
    var rendered = false;
    var child = {};
    var placeholder = document.createTextNode('');
    node.parentNode.replaceChild(placeholder, node);
    return function(val){
      if(!rendered) {
        if(val) {
          var scope = parentScope.add(val);
          var frag = hydrate(scope);
          child.children = slice.call(frag.childNodes);
          child.scope = scope;
          placeholder.parentNode.insertBefore(frag, placeholder.nextSibling);
          rendered = true;
        }
      } else {
        var parent = placeholder.parentNode;
        var sibling = placeholder.nextSibling;
        if(val) {
          child.children.forEach(function(node){
            parent.insertBefore(node, sibling);
          });
        } else {
          child.children.forEach(function(node){
            parent.removeChild(node);
          });
        }
      }
    };
  }
};

let MyMap;

if(typeof Map === 'function') {
  MyMap = Map;
} else {
  myMap = function(){
    this._obj = {};
  };

  MyMap.prototype.set = function(key, value){
    this._obj[key] = value;
  };

  MyMap.prototype.get = function(key){
    return this._obj[key];
  };

  MyMap.prototype.forEach = function(cb){
    var map = this;
    var obj = this._obj;
    Object.keys(obj).forEach(function(key){
      var value = obj[key];
      cb(value, key, map);
    });
  };
}

var Map$1 = MyMap;

function ParseResult(){
  this._value = null;
  this.values = new Map$1();
  this.raw = '';
  this.hasBinding = false;
  this.includesNonBindings = false;
  this.count = 0;
}

ParseResult.prototype.getValue = function(scope){
  return scope.read(this._value).value;
}

ParseResult.prototype.getStringValue = function(scope){
  var out = this.raw;

  this.values.forEach(function(entryValue, i){
    var value = scope.read(entryValue).value;
    out = value ? out.substr(0, i) + value + out.substr(i) : undefined;
  });

  return out;
};

ParseResult.prototype.value = function(model){
  var useString = this.includesNonBindings || this.count > 1;
  return useString
    ? this.getStringValue(model)
    : this.getValue(model);
};

ParseResult.prototype.throwIfMultiple = function(msg){
  if(this.count > 1) {
    msg = msg || 'Only a single binding is allowed in this context.';
    throw new Error(msg);
  }
};

function parse(str){
  var i = 0,
    len = str.length,
    result = new ParseResult(),
    inBinding = false,
    lastChar = '',
    pos = 0,
    char,
    cur = null;

  while(i < len) {
    lastChar = char;
    char = str[i];

    if(!inBinding) {
      if(char === '{') {
        if(lastChar === '{') {
          result.hasBinding = true;
          pos = result.raw.length;
          if(result.values.has(pos)) {
            pos++;
          }
          result.count++;
          cur = '';
          result.values.set(pos, '');
          inBinding = true;
        }

        i++;
        continue;
      }
      result.raw += char;
    } else {
      if(char === '}') {
        if(lastChar === '}') {
          inBinding = false;
          result.values.set(pos, cur);
        }
        i++;
        continue;
      }
      cur += char;
    }

    i++;
  }

  if(result.count === 1) {
    result._value = cur;
  }

  result.includesNonBindings = result.raw.length > 0;
  return result;
}

var forEach = Array.prototype.forEach;

function inspect(node, ref, paths) {
  var ignoredAttrs = {};

  switch(node.nodeType) {
    // Element
    case 1:
      var templateAttr;
      if(node.nodeName === 'TEMPLATE' && (templateAttr = specialTemplateAttr(node))) {
        var result = parse(node.getAttribute(templateAttr));
        if(result.hasBinding) {
          result.throwIfMultiple();
          ignoredAttrs[templateAttr] = true;
          paths[ref.id] = function(node, model){
            if(templateAttr === 'each') {
              live.each(node, model, result, node);
            } else {
              setupBinding(model, result, live[templateAttr](node, model));
            }
          };
        }
      }
      break;
    // TextNode
    case 3:
      var result = parse(node.nodeValue);
      if(result.hasBinding) {
        paths[ref.id] = function(node, model){
          live.text(node, result, model);
        };
      }
      break;
  }

  forEach.call(node.attributes || [], function(attrNode){
    // TODO see if this is important
    ref.id++;

    if(ignoredAttrs[attrNode.name])
      return;

    var name = attrNode.name;
    var property = isPropAttr(name);
    var result = parse(attrNode.value);
    if(result.hasBinding) {
      paths[ref.id] = function(node, model){
        if(property) {
          throw new Error('Properties not yet implemented');
        }
        live.attr(node, result, name, model);
      };
    } else if(property) {
      console.log('still do this');
    }
  });

  var childNodes = node.childNodes;
  forEach.call(childNodes, function(node){
    ref.id++;
    inspect(node, ref, paths);
  });

  return paths;
}

var specialTemplateAttrs = ['if', 'each'];
function specialTemplateAttr(template){
  var attrName;
  for(var i = 0, len = specialTemplateAttrs.length; i < len; i++) {
    attrName = specialTemplateAttrs[i];
    if(template.getAttribute(attrName))
      return attrName;
  }
}

function isPropAttr(name) {
  return name && name[0] === ':';
}

function Scope(model, parent) {
  this.model = model;
  this.parent = parent;
}

Scope.prototype.read = function(prop){
  return this._read(prop) || {
    model: this.model,
    value: undefined
  };
};

Scope.prototype._read = function(prop){
  var val = this.model[prop];
  if(val != null) {
    return {
      model: this.model,
      value: val
    };
  }
  if(this.parent) {
    return this.parent.read(prop);
  }
}

Scope.prototype.add = function(object){
  var model;
  if(Bram.isModel(object)) {
    model = object;
  } else {
    var type = typeof object;
    if(Array.isArray(object) || type === "object") {
      model = Bram.model(object);
    } else {
      model = object;
    }
  }

  return new Scope(model, this);
};

var flora$1 = function(template){
  var paths = inspect(template.content, {id:0}, {});

  return function(scope){
    let document = flora$1.document;
    if(!(scope instanceof Scope)) {
      scope = new Scope(scope);
    }

    var frag = document.importNode(template.content, true);
    hydrate(frag, paths, scope);
    return frag;
  };
};

let document$1 = undom();

const Element = document$1.body.constructor;
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

document$1.createDocumentFragment = function(){
  return new DocumentFragment();
};

document$1.importNode = function(frag){
  let newFrag = frag.cloneNode(true);
  return newFrag;
};

class Stack {
  constructor() {
    this.body = document$1.createElement('body');
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

var parse$2 = function(str){
  let stack = new Stack();

  var parser = new htmlparser.Parser({
    onopentag: function(name, attrs){
      let el = document$1.createElement(name);

      Object.keys(attrs).forEach(attrName => {
        let attrValue = attrs[attrName];
        el.setAttribute(attrName, attrValue);
      });

      stack.peek().appendChild(el);
      stack.push(el);
    },
    ontext: function(text){
        let tn = document$1.createTextNode(text);
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

  let frag = document$1.createDocumentFragment();
  let child = template.firstChild, nextChild = child;

  while(nextChild) {
    nextChild = child.nextSibling;
    frag.appendChild(child.cloneNode(true));
    child = nextChild;
  }

  template.content = frag;

  return template;
}

let attr = a => ` ${a.name}="${enc(a.value)}"`;
let enc = s => s.replace(/[&'"<>]/g, a => `&#${a};`);

function serialize(el){
  if(el.nodeType === 3) {
    return enc(el.textContent);
  }
  // Document fragment
  if(el.nodeType === 11) {
    return el.childNodes.map(serialize).join('');
  }

  let nodeName = el.nodeName.toLowerCase();

  return '<' + nodeName +
    el.attributes.map(attr).join('') + '>' +
    el.childNodes.map(serialize).join('') + '</' +
    nodeName + '>';
}

flora$1.document = document$1;

flora$1.fromString = function(str){
  let template = parse$2(str);
  let hydrate = flora$1(template);

  return function(data){
    let frag = hydrate(data);
    return serialize(frag);
  };
};

module.exports = flora$1;
