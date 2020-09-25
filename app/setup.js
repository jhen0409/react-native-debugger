import config from './utils/config';

if (config.editor) {
  process.env.EDITOR = config.editor;
}

if (config.fontFamily) {
  const styleEl = document.createElement('style');
  document.head.appendChild(styleEl);
  styleEl.sheet.insertRule(
    `div *, span * { font-family: ${config.fontFamily} !important; }`,
    0,
  );
}

window.logWelcomeMessage = () => {
  console.warn(
    '[RNDebugger] Welcome! Before using this app, ' +
      'you need to ensure you are using the correct version of ' +
      'React Native Debugger and react-native:',
  );
  console.table({
    'React Native <= 0.61': { 'React Native Debugger Version': 'v0.10' },
    'React Native >= 0.62': { 'React Native Debugger Version': 'v0.11' },
  });
};
