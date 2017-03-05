class Section {
  constructor(type) {
    this.type = type || 'raw';
    this.buffer = '';
  }

  add(cur) {
    this.buffer += cur;
  }
}

module.exports = Section;
