# flora

> __flora-tmpl__ on npm.

Streaming templates.

[![Flora Finch, silent film actress](https://user-images.githubusercontent.com/361671/31864759-7ce1b858-b731-11e7-9984-0b60ba9ff9bd.jpg)](https://en.wikipedia.org/wiki/Flora_Finch)

WIP, not ready for use.

## Install

```shell
yarn add flora-tmpl
```

## Usage

```js
const { html, map } = require('flora-tmpl');
const streamArray = require('stream-array');

function template({items}) {
  return html`
    <h1>Todos</h1>
    <ul>
      ${map(items, item => (
        html`<li>Item ${item}</li>`
      ))}
    </ul>
  `;
}

template({
  items: streamArray([1, 2, 3])
})
.pipe(...)
```

## License

BSD 2 Clause
