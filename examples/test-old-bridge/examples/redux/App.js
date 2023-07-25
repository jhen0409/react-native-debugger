import React from 'react'
import { Provider } from 'react-redux'
import { Counter } from './features/counter/Counter'
import { store } from './app/store'

export default function () {
  return (
    <Provider store={store}>
      <Counter />
    </Provider>
  )
}
