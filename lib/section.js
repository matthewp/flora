class Section {
  constructor(type) {
    this.type = type || 'raw';
    this.buffer = '';
    this.children = [];
  }

  add(cur) {
    if(typeof cur === 'string') {
      this.buffer += cur;
    } else {
      this.close();

      // an Expression
      this.children.push(cur);
    }
  }

  close() {
    if(this.buffer) {
      this.children.push(this.buffer);
    }
    this.buffer = '';
  }
}

module.exports = Section;
