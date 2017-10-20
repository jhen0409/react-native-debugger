import url from 'url';
import qs from 'querystring';

const query = qs.parse(url.parse(location.href).query);

window.query = query;

if (query.editor) {
  process.env.EDITOR = query.editor;
}

if (query.fontFamily) {
  const styleEl = document.createElement('style');
  document.head.appendChild(styleEl);
  styleEl.sheet.insertRule(`div *, span * { font-family: ${query.fontFamily} !important; }`, 0);
}
