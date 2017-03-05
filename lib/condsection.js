const parseExpression = require('./expression');
const Section = require('./section');

class CondSection extends Section {
  constructor(attrValue) {
    super('cond');
    this.expression = parseExpression(attrValue);
    this.omit = true;
  }

  isTrue(scope) {
    let expr = this.expression;
    return expr.getValue(scope);
  }
}

module.exports = CondSection;
