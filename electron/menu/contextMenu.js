const contextMenu = require('electron-context-menu');

module.exports = getWindow =>
  contextMenu({
    prepend: () => [{
      label: 'Toggle React DevTools',
      click() {
        getWindow().webContents.send('toggle-devtools', 'react');
      },
    }, {
      label: 'Toggle Redux DevTools',
      click() {
        getWindow().webContents.send('toggle-devtools', 'redux');
      },
    }],
  });
