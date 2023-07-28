import React from 'react'
import { StyleSheet, Text, View } from 'react-native'
import { ApolloClient, InMemoryCache, ApolloProvider } from '@apollo/client'
import SimpleQuery from './SimpleQuery'

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
})

const client = new ApolloClient({
  uri: 'https://spacex-production.up.railway.app/',
  cache: new InMemoryCache(),
})

export default function App() {
  return (
    <ApolloProvider client={client}>
      <View style={styles.container}>
        <Text style={styles.title}>Apollo Client example</Text>
        <SimpleQuery />
      </View>
    </ApolloProvider>
  )
}
