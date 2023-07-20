export const increment = () => ({
  type: 'increment',
});

export const decrement = () => ({
  type: 'decrement',
});

export const incrementIfOdd = () => (dispatch, getState) => {
  const { counter } = getState();

  if (counter % 2 === 0) {
    return;
  }

  dispatch(increment());
};

export const incrementAsync = (delay = 1000) => dispatch =>
  setTimeout(() => {
    dispatch(increment());
  }, delay);
