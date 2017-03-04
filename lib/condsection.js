const parseExpression = require('./expression');
const Section = require('./section');

class CondSection extends Section {
  constructor(attrValue) {
    super('cond');
    this.expression = parseExpression(attrValue);
    this.omit = true;
  }
}

module.exports = CondSection;
