import contextMenu from 'electron-context-menu';

export default getWindow =>
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
