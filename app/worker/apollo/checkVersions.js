import genUuid from "uuid/v1";

export const checkVersions = async (hook, bridge) => {
  const uuid = genUuid();

  const { version } = hook.ApolloClient;
  const { devToolsVersion } = hook;

  if (!devToolsVersion) return;
  const graphQLParams = {
    query: `
    query CompatibilityMessages(
      $uuid: String
      $devToolsVersion: String!
      $versions: [VersionInput]
    ) {
      compatibilityMessages(
        uuid: $uuid,
        devToolsVersion: $devToolsVersion,
        versions: $versions
      ) {
        message
      }
    }
  `,
    variables: {
      uuid,
      devToolsVersion,
      versions: [{ packageName: "apollo-client", version }],
    },
  };

  fetch("https://devtools.apollodata.com/graphql", {
    method: "post",
    mode: "cors",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
    },
    body: JSON.stringify(graphQLParams),
  })
    .then(function(response) {
      return response.json();
    })
    .then(function(response) {
      if (!response.data.compatibilityMessages) return;
      response.data.compatibilityMessages.forEach(cm => {
        bridge.send(
          `console.info('Apollo devtools message:', "${cm.message}")`,
        );
      });
    });
};
