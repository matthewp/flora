const htmlparser = require('htmlparser2');
const parseExpression = require('./expression');
const Section = require('./section');
const Stack = require('./stack');

module.exports = function(str){
  let rootSection = new Section();
  let stack = new Stack();
  stack.push(rootSection);

  var parser = new htmlparser.Parser({
    onopentag: function(name, attrs){
      let section = stack.peek();
      let addTag = true;

      if(name === 'template') {
        let { each, if: cond } = attrs;

        if(each) {

        } else if(cond) {
          section.close();
          section = new Section('cond');
          stack.push(section);
        }
      }

      if(addTag) {
        section.add(`<${name}`);

        for(let attrName in attrs) {
          let attrValue = attrs[attrName];
          let expr = parseExpression(attrValue);

          if(expr.hasBinding) {
            section.add(expr);
          } else {
            section.add(` ${attrName}="${attrValue}"`);
          }
        }

        section.add('>');
      }
    },
    ontext: function(text){
      stack.peek().add(text);
    },
    onclosetag: function(name){
      let section = stack.peek();
      section.add(`</${name}>`);
    }
  }, {decodeEntities: true});
  parser.write(str);
  parser.end();

  return rootSection;
}
