// IMPORTANT: this script is injected into every page!!!

/**
 * Install the hook on window, which is an event emitter.
 * Note because Chrome content scripts cannot directly modify the window object,
 * we are evaling this function by inserting a script tag. That's why we have
 * to inline the whole event emitter implementation here.
 *
 * special thanks to the Vue devtools for this solution
 */

export function installHook(window, devToolsVersion) {
  let listeners = {};

  // XXX change how ApolloClient connects to the dev tools
  const hook = {
    ApolloClient: null,
    actionLog: [],
    devToolsVersion,
    on(event, fn) {
      event = "$" + event;
      (listeners[event] || (listeners[event] = [])).push(fn);
    },
    once(event, fn) {
      const eventAlias = event;
      event = "$" + event;
      function on() {
        this.off(eventAlias, on);
        fn.apply(this, arguments);
      }
      (listeners[event] || (listeners[event] = [])).push(on);
    },
    off(event, fn) {
      event = "$" + event;
      if (!arguments.length) {
        listeners = {};
      } else {
        const cbs = listeners[event];
        if (cbs) {
          if (!fn) {
            listeners[event] = null;
          } else {
            for (let i = 0, l = cbs.length; i < l; i++) {
              const cb = cbs[i];
              if (cb === fn || cb.fn === fn) {
                cbs.splice(i, 1);
                break;
              }
            }
          }
        }
      }
    },
    emit(event) {
      event = "$" + event;
      let cbs = listeners[event];
      if (cbs) {
        const args = [].slice.call(arguments, 1);
        cbs = cbs.slice();
        for (let i = 0, l = cbs.length; i < l; i++) {
          cbs[i].apply(this, args);
        }
      }
    },
  };

  Object.defineProperty(window, "__APOLLO_DEVTOOLS_GLOBAL_HOOK__", {
    get() {
      return hook;
    },
  });

  // XXX this is a patch to back support previous versions of Apollo Client
  // at somepoint we should remove this.
  // the newer version has the client connecting to the hook, not the other
  // way around that it currently does
  let interval;
  let count = 0;
  function findClient() {
    // only try for 10seconds
    if (count++ > 10) clearInterval(interval);
    if (!!window.__APOLLO_CLIENT__) {
      hook.ApolloClient = window.__APOLLO_CLIENT__;
      hook.ApolloClient.__actionHookForDevTools(
        ({
          state: { queries, mutations },
          dataWithOptimisticResults: inspector,
        }) => {
          hook.actionLog.push({ queries, mutations, inspector });
        },
      );
      clearInterval(interval);
    }
  }

  interval = setInterval(findClient, 1000);
}
