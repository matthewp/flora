const assert = require('assert');
const {html, map} = require('../lib/index');
const { readAll } = require('./helpers');

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
      myClass: Promise.resolve().then(_ => 'blue'),
      name: 'Wilbur'
    }));

    assert.deepEqual(values, expected);
  });
});
