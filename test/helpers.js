const through = require('through2');

async function readAll(stream) {
  let values = [];
  return new Promise((resolve, reject) => {
    stream.on('error', err => reject(err));
    stream.pipe(through(function(val, enc, next){
      values.push(val.toString().trim());
      next();
    }, function(){
      resolve(values);
    }));
  });
}

exports.readAll = readAll;
