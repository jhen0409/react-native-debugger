const initialState = 0;

const actionsMap = {
  increment(state) {
    return state + 1;
  },
  decrement(state) {
    return state - 1;
  },
};

export default (state = initialState, action) => {
  const reduceFn = actionsMap[action.type];
  if (!reduceFn) return state;
  return reduceFn(state, action);
};
