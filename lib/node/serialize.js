let attr = a => ` ${a.name}="${enc(a.value)}"`;
let enc = s => s.replace(/[&'"<>]/g, a => `&#${a};`);

function serialize(el){
  if(el.nodeType === 3) {
    return enc(el.textContent);
  }
  // Document fragment
  if(el.nodeType === 11) {
    return el.childNodes.map(serialize).join('');
  }

  let nodeName = el.nodeName.toLowerCase();

  return '<' + nodeName +
    el.attributes.map(attr).join('') + '>' +
    el.childNodes.map(serialize).join('') + '</' +
    nodeName + '>';
}

export default serialize;
