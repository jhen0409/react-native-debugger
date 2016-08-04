const fs = require('fs');

try {
  fs.mkdirSync('dist/css');
} catch (e) {} // eslint-disable-line

[{
  from: 'node_modules/codemirror/lib/codemirror.css',
  to: 'dist/css/codemirror.css',
}, {
  from: 'node_modules/codemirror/theme/night.css',
  to: 'dist/css/night.css',
}].forEach(({ from, to }) => {
  fs.writeFileSync(
    to,
    fs.readFileSync(from)
  );
});
