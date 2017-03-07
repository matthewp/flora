const flora = require('../lib/flora');

exports.readAll = function(stream){
  let parts = [];

  return new Promise((resolve, reject) => {
    stream.on('data', d => {
      parts.push('' + d);
    });
    stream.on('end', () => {
      resolve(parts);
    });
    stream.on('error', err => {
      reject(err);
    });
  });
};

exports.render = function(tmpl){
  let render = flora(tmpl);
  return function(data){
    let stream = render(data);
    return exports.readAll(stream);
  };
};

exports.trim = function(str){
  return str.replace(/\s/g,'');
};
