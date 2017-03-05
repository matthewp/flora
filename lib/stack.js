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

  push(item){
    this.stack.push(item);
  }

  pop() {
    return this.stack.pop();
  }

  get length() {
    return this.stack.length;
  }
}

module.exports = Stack;
