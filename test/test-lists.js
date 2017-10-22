const assert = require('assert');
const {html, map} = require('../lib/index');
const Readable = require('stream').Readable;
const { readAll } = require('./helpers');
const arrayToStream = require('stream-array');

describe('Lists', function(){
  describe('Streams', function(){
    it('basics works', async function() {
      function tmpl({items}) {
        return html`
          <ul>
            ${map(items, item => {
              return html`<li>Item ${item}</li>`
            })}
          </ul>
        `;
      }

      let values = await readAll(tmpl({
        items: arrayToStream([1, 2, 3])
      }));

      let expected = [
        '<ul>',
        '<li>Item',
        '1',
        '</li>',
        '<li>Item',
        '2',
        '</li>',
        '<li>Item',
        '3',
        '</li>',
        '</ul>'
      ];

      assert.deepEqual(values, expected);
    });
  });

  describe('Arrays', function(){
    it('basics works', async function(){
      function tmpl({items}) {
        return html`
          <ul>
            ${map(items, item => {
              return html`<li>Item ${item}</li>`
            })}
          </ul>
        `;
      }

      let values = await readAll(tmpl({
        items: [1, 2, 3, 4]
      }));

      let expected = [
        '<ul>',
        '<li>Item',
        '1',
        '</li>',
        '<li>Item',
        '2',
        '</li>',
        '<li>Item',
        '3',
        '</li>',
        '<li>Item',
        '4',
        '</li>',
        '</ul>'
      ];

      assert.deepEqual(values, expected);
    });
  });
});
