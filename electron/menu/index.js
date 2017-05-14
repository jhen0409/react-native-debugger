/* eslint global-require: 0 */

import createMenuTemplateDarwin from './darwin';
import createMenuTemplateLinuxWin from './linux+win';

const createMenuTemplate = process.platform === 'darwin'
  ? createMenuTemplateDarwin
  : createMenuTemplateLinuxWin;

export { createMenuTemplate };
