const assert = require('assert');
const {html, map} = require('../lib/index');
const { readAll } = require('./helpers');

describe('TextNodes', function(){
  it('basics works', async function(){
    function tmpl({name}) {
      return html`
        <span class="msg">Hello <strong>${name}</strong>!</span>
      `;
    }

    let expected = ['<span class="msg">Hello <strong>', 'World', '</strong>!</span>'];

    let values = await readAll(tmpl({
      name: Promise.resolve('World')
    }));

    assert.deepEqual(values, expected);
  });

  it('Null/undefined values are blanks', async function(){
    function tmpl(data) {
      return html`
        <span>${data.one}</span><span>${data.two}</span>
      `;
    }

    let expected = ['<span>','</span><span>','</span>'];

    let values = await readAll(tmpl({
      one: void 0,
      two: null
    }));

    assert.deepEqual(values, expected);
  });

  it('A promise can resolve to a stream', async function(){
    function tmpl({name}) {
      async function strongName() {
        return html`<strong>${name}</strong>`;
      }

      return html`
        <span class="msg">Hello ${strongName()}!</span>
      `;
    }

    let expected = ['<span class="msg">Hello', '<strong>', 'World',
      '</strong>', '!</span>'];

    let values = await readAll(tmpl({
      name: Promise.resolve('World')
    }));

    assert.deepEqual(values, expected);
  });
});
