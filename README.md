# flora

> __flora-tmpl__ on npm.

[![Flora Finch, silent film actress](https://user-images.githubusercontent.com/361671/31864759-7ce1b858-b731-11e7-9984-0b60ba9ff9bd.jpg)](https://en.wikipedia.org/wiki/Flora_Finch)

Streaming templates.

![Streaming HTML](https://user-images.githubusercontent.com/361671/32578154-2abd05a6-c4aa-11e7-95bd-1dc39729c8fc.gif)

# Why

HTML is a format that can be streamed. Meaning the browser can start parsing and showing parts of a web page before the full thing has been downloaded. Your application probably has things it needs to do that take some time; like make database requests.

Parts of your page depend on this data, but much of it does not. Flora allows you to write templates that get to the client as quickly as possible, because only the parts that need to wait, do wait.

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
