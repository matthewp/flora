const parseExpression = require('./expression');
const Section = require('./section');

class CondSection extends Section {
  constructor(attrs) {
    super('cond');
    this.expression = parseExpression(attrs.if);
    this.omit = true;
  }

  isTrue(scope) {
    let expr = this.expression;
    return expr.getValue(scope);
  }
}

module.exports = CondSection;
