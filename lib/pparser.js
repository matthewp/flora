const htmlparser = require('htmlparser2');
const parseExpression = require('./expression');
const CondSection = require('./condsection');
const { notImplemented } = require('./util');
const Section = require('./section');
const Stack = require('./stack');

module.exports = function(str){
  let omitted = new Set();
  let depth = 0;
  let stack = new Stack();
  stack.push(new Section());

  var parser = new htmlparser.Parser({
    onopentag: function(name, attrs){
      depth++;
      let section = stack.peek();

      if(name === 'template') {
        let { each, if: cond } = attrs;

        if(each) {
          notImplemented('[each]');
        } else if(cond) {
          omitted.add(depth);
          stack.push(new CondSection(attrs.if));
          return;
        }
      }

      section.add(`<${name}`);

      for(let attrName in attrs) {
        let attrValue = attrs[attrName];
        let expr = parseExpression(attrValue);

        if(expr.hasBinding) {
          stack.push(expr);
          section = new Section();
          stack.push(section);
        } else {
          section.add(` ${attrName}="${attrValue}"`);
        }
      }

      section.add('>');
    },
    ontext: function(text){
      let expr = parseExpression(text);
      if(expr.hasBinding){
        stack.push(expr);
        stack.push(new Section());
      } else {
        stack.peek().add(text);
      }
    },
    onclosetag: function(name){
      let tagDepth = depth;
      depth--;
      let section = stack.peek();

      if(omitted.has(tagDepth)) {
        omitted.delete(tagDepth);
        stack.push(new Section());
        return;
      }

      section.add(`</${name}>`);
    }
  }, {decodeEntities: true});
  parser.write(str);
  parser.end();

  return stack;
};
