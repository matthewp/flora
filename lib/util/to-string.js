function toString(val) {
  if(Array.isArray(val)) {
    return val.join('');
  }
  return val.toString();
}

module.exports = toString;
