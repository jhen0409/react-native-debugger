/* eslint-disable react/style-prop-object */
import { StatusBar } from 'expo-status-bar'
import React from 'react'
import { StyleSheet, View } from 'react-native'
import ReduxApp from './examples/redux/App'
import ApolloApp from './examples/apollo/App'

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
})

export default function App() {
  return (
    <View style={styles.container}>
      <ReduxApp />
      <ApolloApp />
      <StatusBar style="auto" />
    </View>
  )
}
