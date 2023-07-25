import React from 'react'
import {
  StyleSheet, View, Text, TouchableHighlight,
} from 'react-native'
import { useSelector, useDispatch } from 'react-redux'
import {
  decrement,
  increment,
  incrementAsync,
  incrementIfOdd,
  selectCount,
} from './counterSlice'

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5FCFF',
  },
  title: {
    marginBottom: 20,
    fontSize: 25,
    textAlign: 'center',
    fontWeight: 'bold',
  },
  text: {
    fontSize: 20,
    textAlign: 'center',
    margin: 10,
  },
})

export function Counter() {
  const count = useSelector(selectCount)
  const dispatch = useDispatch()
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Redux example</Text>
      <Text style={styles.text}>
        Clicked:
        {count}
        {' '}
        times
      </Text>
      <TouchableHighlight onPress={() => dispatch(increment())}>
        <Text style={styles.text}>+</Text>
      </TouchableHighlight>
      <TouchableHighlight onPress={() => dispatch(decrement())}>
        <Text style={styles.text}>-</Text>
      </TouchableHighlight>
      <TouchableHighlight onPress={() => dispatch(incrementIfOdd(count))}>
        <Text style={styles.text}>Increment if odd</Text>
      </TouchableHighlight>
      <TouchableHighlight onPress={() => dispatch(incrementAsync())}>
        <Text style={styles.text}>Increment async</Text>
      </TouchableHighlight>
    </View>
  )
}

export default Counter
