const assert = require('assert');
const helpers = require('../helpers');

describe('Each', function(){
  describe('With an Array', function(){
    it('Everything in one chunk', function(done){
      let tmpl = `
        <template each="{{sports}}" as="sport">
          <li>{{sport}}</li>
        </template>
      `;

      let data = {
        sports: ['golf', 'tennis']
      };

      helpers.render(tmpl)(data).then(parts => {
        assert.equal(parts.length, 1);
        assert.equal(parts[0].trim(),
        '<li>golf</li>\n        \n          <li>tennis</li>');
      })
      .then(done, done);
    });
  });
});
