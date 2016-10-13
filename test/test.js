const assert = require('assert');
const flora = require('../flora.node.js').fromString;
const fs = require('fs');

let compares = function(tmpl, expected, data){
  let render = flora(tmpl.trim());
  let res = render(data);

  assert.equal(res.trim(), expected.trim());
};

describe('TextNodes', function(){
  it('basics works', function(){
    let tmpl = `
      <template>
        <span class="msg">Hello <strong>{{name}}</strong>!</span>
      </template>
    `;
    let expected = `
      <span class="msg">Hello <strong>World</strong>!</span>
    `;

    compares(tmpl, expected, { name: 'World' });
  });
});

describe('Attributes', function(){
  it.only('basics works', function(){
    let tmpl = `
      <template>
        <span class="{{myClass}}">Hello {{name}}</span>
      <template>
    `;
    let expected = `
      <span class="blue">Hello Wilbur</span>
    `;

    compares(tmpl, expected, {
      myClass: 'blue',
      name: 'Wilbur'
    })
  });
});
