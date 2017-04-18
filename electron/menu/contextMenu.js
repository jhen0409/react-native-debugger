import { BrowserWindow } from 'electron';
import contextMenu from 'electron-context-menu';
import { item, n, toggleDevTools } from './util';

const getWin = () => BrowserWindow.getFocusedWindow();

export default () =>
  contextMenu({
    showInspectElement: process.env.NODE_ENV === 'development',
    prepend: () => [
      item('Toggle React DevTools', n, () => toggleDevTools(getWin(), 'react')),
      item('Toggle Redux DevTools', n, () => toggleDevTools(getWin(), 'redux')),
    ],
  });
