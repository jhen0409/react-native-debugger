import React from 'react'
import { StyleSheet, Text, Button } from 'react-native'
import { useQuery } from '@apollo/client'
import gql from 'graphql-tag'

const styles = StyleSheet.create({
  text: {
    fontSize: 20,
    textAlign: 'center',
    margin: 10,
  },
})

const GET_DATA = gql`
  query ExampleQuery {
    company {
      name
      ceo
      employees
    }
  }
`

export default function SimpleQuery() {
  const { loading, error, data, refetch } = useQuery(GET_DATA)

  if (loading) return <Text style={styles.text}>Loading...</Text>
  if (error) return <Text style={styles.text}>Error :({error.message})</Text>

  return (
    <>
      <Text style={styles.text}>Company: {data.company.name}</Text>
      <Text style={styles.text}>CEO: {data.company.ceo}</Text>
      <Text style={styles.text}>Employees: {data.company.employees}</Text>
      <Button onPress={() => refetch()} title="Refetch" />
    </>
  )
}
