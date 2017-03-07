const assert = require('assert');
const helpers = require('../helpers');
const streamify = require('stream-array');

describe('Each', function(){
  describe('With an Array', function(){
    it('Everything in one chunk', function(done){
      let tmpl = `
        <div>before</div>
        <template each="{{sports}}" as="sport">
          <li>{{sport}}</li>
        </template>
        <div>after</div>
      `;

      let data = {
        sports: ['golf', 'tennis']
      };

      helpers.render(tmpl)(data).then(parts => {
        assert.equal(parts.length, 1);
        assert.equal(helpers.trim(parts[0]),
        '<div>before</div><li>golf</li><li>tennis</li><div>after</div>');
      })
      .then(done, done);
    });
  });

  describe.only('With a Stream', function(){
    it('Chunks out each item', function(done){
      let tmpl = `
        <div>before</div>
        <template each="{{sports}}" as="sport">
          <li>{{sport}}</li>
        </template>
        <div>after</div>
      `;

      let data = {
        sports: streamify(['golf','tennis'])
      };

      helpers.render(tmpl)(data).then(parts => {
        console.log(parts);
      })
      .then(done, done);
    });
  });
});
