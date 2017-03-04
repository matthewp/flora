class Section {
  constructor(type) {
    this.type = type || 'raw';
    this.buffer = '';
    this.parent = null;
  }

  add(cur) {
    if(typeof cur === 'string') {
      this.buffer += cur;
    } else {
      this.close();

      // an Expression
      this.append(cur);
    }
  }

  item(index) {
    return this.children[index];
  }

  next(index) {
    return this.children[index + 1];
  }

  append(section) {
    let len = this.children.length;
    if(len) {
      let cur = this.children[len - 1];
      cur.nextSibling = section;
    } else {
      this.firstChild = section;
    }
    section.parent = this;
    this.children.push(section);
  }

  close() {
    if(this.buffer) {
      let section = { type: 'text', value: this.buffer };
      this.append(section);
    }
    this.buffer = '';
  }
}

module.exports = Section;
