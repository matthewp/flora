const htmlparser = require('htmlparser2');
const parseExpression = require('./expression');
const CondSection = require('./condsection');
const EachSection = require('./eachsection');
const { notImplemented } = require('./util');
const Section = require('./section');
const Stack = require('./stack');

module.exports = function(str){
  let omitted = new Map();
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
          debugger;
          let eachSection = new EachSection(attrs);
          omitted.set(depth, eachSection);
          stack.push(eachSection);
          return;
        } else if(cond) {
          let condSection = new CondSection(attrs);
          omitted.set(depth, condSection);
          stack.push(condSection);
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
        let omittedSection = omitted.get(tagDepth);
        stack.push(new Section());
        omittedSection.nextIndex = stack.length - 1;
        omitted.delete(tagDepth);
        return;
      }

      section.add(`</${name}>`);
    }
  }, {decodeEntities: true});
  parser.write(str);
  parser.end();

  return stack;
};
