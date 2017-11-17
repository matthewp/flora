function toString(val) {
  if(Array.isArray(val)) {
    return val.join('');
  } else if(val == null) {
    return '';
  }
  return val.toString();
}

module.exports = toString;
