exports.createContextMenu = require('./contextMenu');

if (process.platform === 'darwin') {
  exports.createMenuTemplate = require('./darwin');
} else {
  exports.createMenuTemplate = require('./linux+win');
}
