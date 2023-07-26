/* eslint-disable import/no-extraneous-dependencies */
/*
 * Create an Apollo Client to test the bridge messages sent
 * wouldn't break the debugger proxy.
 */

import { ApolloClient, InMemoryCache } from '@apollo/client'
import gql from 'graphql-tag'

const client = new ApolloClient({
  uri: 'https://spacex-production.up.railway.app/',
  cache: new InMemoryCache(),
})

client.query({
  query: gql`
    query ExampleQuery {
      company {
        ceo
      }
      roadster {
        apoapsis_au
      }
    }
  `,
})
