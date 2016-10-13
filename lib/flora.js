import hydrate from './hydrate.js';
import inspect from './inspect.js';
import Scope from './scope.js';

var flora = function(template){
  var paths = inspect(template.content, {id:0}, {});

  return function(scope){
    let document = flora.document;
    if(!(scope instanceof Scope)) {
      scope = new Scope(scope);
    }

    var frag = document.importNode(template.content, true);
    hydrate(frag, paths, scope);
    return frag;
  };
};

export default flora;
