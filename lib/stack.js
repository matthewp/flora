class Stack {
  constructor() {
    this.stack = [];
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
}

module.exports = Stack;
