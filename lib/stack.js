class Stack {
  constructor() {
    this.stack = [];
  }

  item(index) {
    return this.stack[index];
  }

  peek() {
    return this.stack[this.stack.length - 1];
  }

  first() {
    return this.stack[0];
  }

  push(item){
    this.stack.push(item);
  }

  pop() {
    return this.stack.pop();
  }

  shift() {
    return this.stack.shift();
  }

  get length() {
    return this.stack.length;
  }
}

module.exports = Stack;
