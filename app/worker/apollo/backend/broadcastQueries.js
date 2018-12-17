export const initBroadCastEvents = (hook, bridge) => {
  let logger = ({
    state: { queries, mutations },
    // XXX replace with universal store format compat way of this
    dataWithOptimisticResults: inspector,
  }) => {
    bridge.send(
      "broadcast:new",
      JSON.stringify({
        queries,
        mutations,
        inspector,
      }),
    );
  };

  bridge.on("panel:ready", () => {
    const client = hook.ApolloClient;
    const initial = {
      queries: client.queryManager
        ? client.queryManager.queryStore.getStore()
        : {},
      mutations: client.queryManager
        ? client.queryManager.mutationStore.getStore()
        : {},
      inspector: client.cache.extract(true),
    };
    bridge.send("broadcast:new", JSON.stringify(initial));
  });

  hook.ApolloClient.__actionHookForDevTools(logger);
};
