const assert = require('assert');
const flora = require('../lib/flora');
const helpers = require('./helpers');

describe('Basics', function(){
  it('Values can be Promises', function(done){
    this.timeout(30000);
    let tmpl = `
      <span class="msg">Hello {{name}}</span>
    `;

    let data = {
      name: Promise.resolve('Wilbur')
    };

    helpers.render(tmpl)(data).then(parts => {
      assert.equal(parts.length, 2);
      assert.equal(parts[0].trim(),'<span class="msg">');
      assert.equal(parts[1].trim(), 'Hello Wilbur</span>');
    })
    .then(done, done);
  });
});

require('./conditionals/index');
require('./each/index');

describe.skip('TextNodes', function(){
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

describe.skip('Attributes', function(){
  it('basics works', function(){
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
