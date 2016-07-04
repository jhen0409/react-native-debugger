import { shell } from 'electron';

export default win =>
  [{
    label: 'RND',
    submenu: [{
      label: 'About React Native Debugger',
      selector: 'orderFrontStandardAboutPanel:',
    }, {
      label: 'Close',
      accelerator: 'Ctrl+W',
      click() {
        win.close();
      },
    }],
  }, {
    label: 'Edit',
    submenu: [
      {
        label: 'Undo',
        accelerator: 'Ctrl+Z',
        selector: 'undo:',
      }, {
        label: 'Redo',
        accelerator: 'Shift+Ctrl+Z',
        selector: 'redo:',
      }, {
        type: 'separator',
      }, {
        label: 'Cut',
        accelerator: 'Ctrl+X',
        selector: 'cut:',
      },
      {
        label: 'Copy',
        accelerator: 'Ctrl+C',
        selector: 'copy:',
      },
      {
        label: 'Paste',
        accelerator: 'Ctrl+V',
        selector: 'paste:',
      },
      {
        label: 'Select All',
        accelerator: 'Ctrl+A',
        selector: 'selectAll:',
      },
    ],
  }, {
    label: 'View',
    submenu: [{
      label: 'Reload',
      accelerator: 'Ctrl+R',
      click() {
        win.webContents.reload();
      },
    }, {
      label: 'Toggle Full Screen',
      accelerator: 'F11',
      click() {
        win.setFullScreen(!win.isFullScreen());
      },
    }, {
      label: 'Toggle Developer Tools',
      accelerator: 'Alt+Ctrl+I',
      click() {
        win.toggleDevTools();
      },
    }, {
      label: 'Toggle React DevTools',
      accelerator: 'Alt+Ctrl+J',
      click() {
        win.webContents.send('toggle-devtools', 'react');
      },
    }, {
      label: 'Toggle Redux DevTools',
      accelerator: 'Alt+Ctrl+K',
      click() {
        win.webContents.send('toggle-devtools', 'redux');
      },
    }],
  }, {
    label: 'Help',
    submenu: [{
      label: 'Documentation',
      click() {
        shell.openExternal('https://github.com/jhen0409/react-native-debugger#usage');
      },
    }, {
      label: 'Issues',
      click() {
        shell.openExternal('https://github.com/jhen0409/react-native-debugger/issues');
      },
    }],
  }];
