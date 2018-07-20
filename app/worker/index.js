/**
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 */
/* global __fbBatchedBridge, self, importScripts, postMessage, addEventListener: true */

// Edit from https://github.com/facebook/react-native/blob/master/local-cli/server/util/debuggerWorker.js

import './setup';
import { checkAvailableDevMenuMethods, invokeDevMenuMethodIfAvailable } from './devMenu';
import { reportDefaultReactDevToolsPort } from './reactDevTools';
import devToolsEnhancer, { composeWithDevTools } from './reduxAPI';
import * as RemoteDev from './remotedev';
import { getRequiredModules, ignoreRNDIntervalSpy } from './utils';
import { toggleNetworkInspect } from './networkInspect';

/* eslint-disable no-underscore-dangle */
self.__REMOTEDEV__ = RemoteDev;

devToolsEnhancer.send = RemoteDev.send;
devToolsEnhancer.connect = RemoteDev.connect;

// Deprecated API, these may removed when redux-devtools-extension 3.0 release
self.devToolsExtension = devToolsEnhancer;
self.reduxNativeDevTools = devToolsEnhancer;
self.reduxNativeDevToolsCompose = composeWithDevTools;

self.__REDUX_DEVTOOLS_EXTENSION__ = devToolsEnhancer;
self.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ = composeWithDevTools;

const setupRNDebuggerBeforeImportScript = message => {
  self.__REACT_DEVTOOLS_PORT__ = message.reactDevToolsPort;
  if (message.networkInspect) {
    self.__NETWORK_INSPECT__ = toggleNetworkInspect;
  }
};

const setupRNDebugger = async message => {
  // We need to regularly update JS runtime
  // because the changes of worker message (Redux DevTools, DevMenu)
  // doesn't notify to the remote JS runtime
  self.__RND_INTERVAL__ = setInterval(function() {}, 100); // eslint-disable-line

  const modules = await getRequiredModules(message.moduleSize);
  if (modules) {
    ignoreRNDIntervalSpy(modules);
    checkAvailableDevMenuMethods(modules, message.networkInspect);
    reportDefaultReactDevToolsPort(modules);
  }
};

const messageHandlers = {
  executeApplicationScript(message, sendReply) {
    setupRNDebuggerBeforeImportScript(message);

    Object.keys(message.inject).forEach(key => {
      self[key] = JSON.parse(message.inject[key]);
    });
    let error;
    try {
      importScripts(message.url);
    } catch (err) {
      error = err.message;
    }
    sendReply(null /* result */, error);

    if (!error) {
      setupRNDebugger(message);
    }
    return false;
  },
  emitReduxMessage() {
    // pass to other listeners
    return true;
  },
  invokeDevMenuMethod({ name, args }) {
    invokeDevMenuMethodIfAvailable(name, args);
    return false;
  },
  beforeTerminate() {
    // Clean for notify native bridge
    if (window.__RND_INTERVAL__) {
      clearInterval(window.__RND_INTERVAL__);
      window.__RND_INTERVAL__ = null;
    }
    return false;
  },
};

addEventListener('message', message => {
  const object = message.data;

  const sendReply = (result, error) => {
    postMessage({ replyID: object.id, result, error });
  };

  const handler = messageHandlers[object.method];
  if (handler) {
    // Special cased handlers
    return handler(object, sendReply);
  }
  // Other methods get called on the bridge
  let returnValue = [[], [], [], 0];
  let error;
  try {
    if (typeof __fbBatchedBridge === 'object') {
      returnValue = __fbBatchedBridge[object.method].apply(null, object.arguments);
    } else {
      error = 'Failed to call function, __fbBatchedBridge is undefined';
    }
  } catch (err) {
    error = err.message;
  } finally {
    sendReply(JSON.stringify(returnValue), error);
  }
  return false;
});
