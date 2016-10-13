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

export default Scope;
