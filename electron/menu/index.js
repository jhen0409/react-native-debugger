/* eslint global-require: 0 */
exports.createContextMenu = require('./contextMenu').default;

if (process.platform === 'darwin') {
  exports.createMenuTemplate = require('./darwin').default;
} else {
  exports.createMenuTemplate = require('./linux+win').default;
}
