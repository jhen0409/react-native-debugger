export const TOGGLE_DEVTOOLS = 'TOGGLE_DEVTOOLS';
export const RESIZE_DEVTOOLS = 'RESIZE_DEVTOOLS';
export const CHANGE_DEFAULT_THEME = 'CHANGE_DEFAULT_THEME';

export const toggleDevTools = name => ({
  type: TOGGLE_DEVTOOLS,
  name,
});

export const resizeDevTools = size => ({
  type: RESIZE_DEVTOOLS,
  size,
});

export const changeDefaultTheme = themeName => ({
  type: CHANGE_DEFAULT_THEME,
  themeName,
});
