/* eslint global-require: 0 */

import createContextMenu from './contextMenu';
import createMenuTemplateDarwin from './darwin';
import createMenuTemplateLinuxWin from './linux+win';

const createMenuTemplate = process.platform === 'darwin' ?
  createMenuTemplateDarwin :
  createMenuTemplateLinuxWin;

export { createContextMenu, createMenuTemplate };
