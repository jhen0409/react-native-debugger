import config from './utils/config';

if (config.editor) {
  process.env.EDITOR = config.editor;
}

if (config.fontFamily) {
  const styleEl = document.createElement('style');
  document.head.appendChild(styleEl);
  styleEl.sheet.insertRule(`div *, span * { font-family: ${config.fontFamily} !important; }`, 0);
}
