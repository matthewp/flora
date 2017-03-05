const assert = require('assert');
const flora = require('../lib/fflora');
const helpers = require('./helpers');

describe('Conditionals', function(){
  it('basics works', function(done){
    let tmpl = `
      <span class="msg">Hello <strong>{{name}}</strong>!</span>

      <template if="{{hasUser}}">
        <span>{{handle}}</span>
      </template>
    `;

    let data = {
      name: 'Wilbur',
      hasUser: Promise.resolve().then(_ => {
        data.handle = 'w!lbur';
        return true;
      })
    };

    helpers.render(tmpl)(data).then(parts => {
      assert.equal(parts.length, 2);
      assert.equal(parts[0].trim(),
      '<span class="msg">Hello <strong>Wilbur</strong>!</span>');
      assert.equal(parts[1].trim(),'<span>w!lbur</span>');

    })
    .then(done, done);
  });
});

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
