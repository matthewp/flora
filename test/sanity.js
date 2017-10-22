const {Readable} = require('stream');
const {
  html, map
} = require('../lib');

const timeBetween = 1000;

const items = [
  'Walk the dog',
  'Eat food',
  'Clean the kitchen',
  'Mow the lawn',
  'Play slots',
  'Earn some money',
  'Run for president'
];

const stream = new Readable({
  objectMode: true,
  read() {
    let item = items.shift() || null;
    setTimeout(() => {
      this.push(item);
    }, timeBetween);
  }
});

let out = html`
  <!doctype html>
  <html lang="en">
  <title>Todo list</title>
  <main>
    <h1>Todo list</h1>
    <ul>
      ${map(stream, item => (
        html`
          <li>${item}</li>
        `
      ))}
    </ul>
  </main>
`;

out.pipe(process.stdout);
