/*
 * Create an Apollo Client to test the bridge messages sent
 * wouldn't break the debugger proxy.
 */

/* eslint-disable */
import ApolloClient from 'apollo-boost';

new ApolloClient({
  uri: 'https://fakerql.com/graphql',
});
