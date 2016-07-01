/* eslint global-require: 0 */
export createContextMenu from './contextMenu';

if (process.platform === 'darwin') {
  exports.createMenuTemplate = require('./darwin').default;
} else {
  exports.createMenuTemplate = require('./linux+win').default;
}
