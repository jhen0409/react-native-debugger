export const TOGGLE_DEVTOOLS = 'TOGGLE_DEVTOOLS';
export const RESIZE_DEVTOOLS = 'RESIZE_DEVTOOLS';

export const toggleDevTools = name =>
  ({
    type: TOGGLE_DEVTOOLS,
    name,
  });

export const resizeDevTools = size =>
  ({
    type: RESIZE_DEVTOOLS,
    size,
  });
