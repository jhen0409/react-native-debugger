import { execute, ApolloLink, Observable, from } from "apollo-link";
import { getQueryDefinition } from "apollo-utilities";
import gql from "graphql-tag";

/*
 *
 * supports dynamic client schemas set on the context
 *
 * schemas must be an array of the following shape
 *
      {
        definition: schemaString,
        directives: `directive @client on FIELD`,
      }
 *
 */
const apolloClientSchema = {
  directives: "directive @connection(key: String!, filter: [String]) on FIELD",
};
const schemaLink = () =>
  new ApolloLink((operation, forward) => {
    return forward(operation).map(result => {
      let { schemas = [] } = operation.getContext();
      result.extensions = Object.assign({}, result.extensions, {
        schemas: schemas.concat([apolloClientSchema]),
      });
      return result;
    });
  });

// forward all "errors" to next with a good shape for graphiql
const errorLink = () =>
  new ApolloLink((operation, forward) => {
    return new Observable(observer => {
      let sub;
      try {
        sub = forward(operation).subscribe({
          next: observer.next.bind(observer),
          error: networkError =>
            observer.next({
              errors: [
                {
                  message: networkError.message,
                  locations: [networkError.stack],
                },
              ],
            }),
          complete: observer.complete.bind(observer),
        });
      } catch (e) {
        observer.next({
          errors: [{ message: e.message, locations: [e.stack] }],
        });
      }

      return () => {
        if (sub) sub.unsubscribe();
      };
    });
  });

const cacheLink = fetchPolicy =>
  new ApolloLink((operation, forward) => {
    // XXX how do we handle local state here? It *should* still work right?
    if (fetchPolicy === "no-cache") return forward(operation);

    const { cache } = operation.getContext();
    const { variables, query } = operation;
    // quick check if this is a query
    try {
      const def = getQueryDefinition(query);
      const results = cache.readQuery({ query, variables });
      if (results) return Observable.of({ data: results });
    } catch (e) {}

    return forward(operation);
  });

export const initLinkEvents = (hook, bridge) => {
  // handle incoming requests
  const subscriber = request => {
    const { query, variables, operationName, key, fetchPolicy } = JSON.parse(
      request,
    );
    try {
      const userLink = hook.ApolloClient.link;
      const cache = hook.ApolloClient.cache;

      const devtoolsLink = from([
        errorLink(),
        cacheLink(fetchPolicy),
        schemaLink(),
        userLink,
      ]);
      const obs = execute(devtoolsLink, {
        query: gql(query),
        variables,
        operationName,
        context: { __devtools_key__: key, cache },
      });
      obs.subscribe({
        next: data => bridge.send(`link:next:${key}`, JSON.stringify(data)),
        error: err => bridge.send(`link:error:${key}`, JSON.stringify(err)),
        complete: () => bridge.send(`link:complete:${key}`),
      });
    } catch (e) {
      bridge.send(`link:error:${key}`, JSON.stringify(e));
    }
  };

  bridge.on("link:operation", subscriber);
};
