import { TOGGLE_DEVTOOLS, RESIZE_DEVTOOLS, CHANGE_DEFAULT_THEME } from '../actions/setting';

const initialState = {
  react: true,
  redux: true,
  size: 0.6,
  themeName: null,
};

const actionsMap = {
  [TOGGLE_DEVTOOLS]: (state, action) => ({
    ...state,
    [action.name]: !state[action.name],
  }),
  [RESIZE_DEVTOOLS]: (state, action) => {
    if (!state.redux || !state.react) {
      return state;
    }
    const { size } = action;
    if (size < 0.2) return { ...state, size: 0.2 };
    if (size > 0.8) return { ...state, size: 0.8 };
    return { ...state, size };
  },
  [CHANGE_DEFAULT_THEME]: (state, action) => ({
    ...state,
    themeName: action.themeName,
  }),
};

export default (state = initialState, action) => {
  const reduceFn = actionsMap[action.type];
  if (!reduceFn) return state;
  return reduceFn(state, action);
};
