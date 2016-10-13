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

export default MyMap;
