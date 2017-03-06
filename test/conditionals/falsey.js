const assert = require('assert');
const helpers = require('../helpers');

describe('Falsey', function(){
  it('basics works', function(done){
    let tmpl = `
      <span class="msg">Hello <strong>{{name}}</strong>!</span>

      <template if="{{hasUser}}">
        <span>{{handle}}</span>
      </template>
    `;

    let data = {
      name: 'Wilbur',
      hasUser: Promise.resolve(false)
    };

    helpers.render(tmpl)(data).then(parts => {
      assert.equal(parts.length, 2);
      assert.equal(parts[0].trim(),
      '<span class="msg">Hello <strong>Wilbur</strong>!</span>');
      assert.equal(parts[1].trim(),'', 'Should be just space');
    })
    .then(done, done);
  });
});
