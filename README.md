# flora

> __flora-tmpl__ on npm.



[![Flora Finch, silent film actress](https://user-images.githubusercontent.com/361671/31864759-7ce1b858-b731-11e7-9984-0b60ba9ff9bd.jpg)](https://en.wikipedia.org/wiki/Flora_Finch)

Streaming templates.

[![Streaming HTML](https://asciinema.org/a/GD3kGM9Pqb4y3UcraKAiRnk2o.png)](https://asciinema.org/a/GD3kGM9Pqb4y3UcraKAiRnk2o)


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
