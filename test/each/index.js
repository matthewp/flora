const assert = require('assert');
const helpers = require('../helpers');

describe.skip('Each', function(){
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
        console.log('parts', parts);
        //assert.equal(parts.length, 1);
        //assert.equal()
      })
      .then(done, done);
    });
  });
});
