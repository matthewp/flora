const parseExpression = require('./expression');
const Section = require('./section');

class EachSection extends Section {
  constructor(attrs) {
    super('each');
    this.expression = parseExpression(attrs.each);
    this.alias = attrs.as || 'item';
  }

  items(scope) {
    let expr = this.expression;
    return expr.getValue(scope);
  }
}

module.exports = EachSection;
