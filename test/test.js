const assert = require('assert');
//const flora = require('../flora.node.js').fromString;
const {html} = require('../lib/index');
const fs = require('fs');
const through = require('through2');

let compares = function(tmpl, expected, data){
  let res = tmpl(data);

  assert.equal(res.trim(), expected.trim());
};

async function readAll(stream) {
  let values = [];
  return new Promise((resolve) => {
    stream.pipe(through(function(val, enc, next){
      values.push(val.toString().trim());
      next();
    }, function(){
      resolve(values);
    }));
  });
}

describe('TextNodes', function(){
  it('basics works', async function(){
    function tmpl({name}) {
      return html`
        <span class="msg">Hello <strong>${name}</strong>!</span>
      `;
    }

    let expected = ['<span class="msg">Hello <strong>', 'World', '</strong>!</span>'];

    let values = await readAll(tmpl({name: 'World'}));
    assert.deepEqual(values, expected);
  });
});

describe('Attributes', function(){
  it('basics works', async function(){
    function tmpl({myClass, name}) {
      return html`
        <span class="${myClass}">Hello ${name}</span>
      `
    }

    let expected = [
      '<span class="',
      'blue',
      '">Hello',
      'Wilbur',
      '</span>'
    ];

    let values = await readAll(tmpl({
      myClass: 'blue',
      name: 'Wilbur'
    }));

    assert.deepEqual(values, expected);
  });
});
