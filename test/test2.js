const assert = require('assert');
const flora = require('../lib/fflora');

let tmpl = `
  <span class="msg">Hello <strong>{{name}}</strong>!</span>

  <template if="{{hasUser}}">
    <span>{{handle}}</span>
  </template>
`;

debugger;

let render = flora(tmpl.trim());
let data = {
  name: 'Wilbur',
  hasUser: Promise.resolve().then(_ => {
    data.handle = 'w!lbur';
    return true;
  })
};
let stream = render(data);
stream.on('data', function(d){
  console.log('got data', d);
});
