import contextMenu from 'electron-context-menu';
import { item, n, toggleDevTools } from './util';

export default win =>
  contextMenu({
    showInspectElement: process.env.NODE_ENV === 'development',
    prepend: () => [
      item('Toggle React DevTools', n, () => toggleDevTools(win, 'react')),
      item('Toggle Redux DevTools', n, () => toggleDevTools(win, 'redux')),
    ],
  });
