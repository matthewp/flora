# flora

> __flora-tmpl__ on npm.

Streaming templates.

<a href="https://en.wikipedia.org/wiki/Flora_Finch">
  <img alt="Flora Finch, silent film actress"
   style="height:200px;" src="https://user-images.githubusercontent.com/361671/31863166-b36389fc-b717-11e7-8b79-e8585faf8034.jpg"/>
</a>

![flora_finch]()

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
