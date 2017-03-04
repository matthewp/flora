var slice = Array.prototype.slice;

function ParseResult(){
  this.type = 'expression';
  this._value = null;
  this.values = new Map();
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

parse.Expression = ParseResult;

module.exports = parse;
