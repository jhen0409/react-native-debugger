// This is the agent that is injected into the page that an Apollo Client app lives in
// when the Apollo Devtools panel is activated.
import { initBroadCastEvents } from './broadcastQueries';
import { initLinkEvents } from './links';
import { checkVersions } from './checkVersions';

// hook should have been injected before this executes.
let hook;
let bridge;
let connected;

export const sendBridgeReady = () => {
  bridge.send('ready', hook.ApolloClient.version);
};

const connect = () => {
  if (connected) return;
  connected = true;
  if (Number(hook.ApolloClient.version[0]) !== 1) {
    initLinkEvents(hook, bridge);
    initBroadCastEvents(hook, bridge);
  }
  bridge.log('backend ready.');
  sendBridgeReady();
  checkVersions(hook, bridge);
};

export const initBackend = (b, h, uuid) => {
  bridge = b;
  hook = h;
  connect(uuid);
};
