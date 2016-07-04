import contextMenu from 'electron-context-menu';

export default win =>
  contextMenu({
    prepend: () => [{
      label: 'Toggle React DevTools',
      click() {
        win.webContents.send('toggle-devtools', 'react');
      },
    }, {
      label: 'Toggle Redux DevTools',
      click() {
        win.webContents.send('toggle-devtools', 'redux');
      },
    }],
  });
