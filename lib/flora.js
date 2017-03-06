const parse = require('./pparser');
const Scope = require('./scope');
const SerializerStream = require('./serializer');

module.exports = function(template){
  let stack = parse(template);

  return function(scope){
    if(!(scope instanceof Scope)) {
      scope = new Scope(scope);
    }

    return new SerializerStream(stack, scope);
  };
};
