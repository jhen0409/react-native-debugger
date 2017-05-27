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

/* eslint-disable no-underscore-dangle */
import { checkAvailableDevMenuMethods, invokeDevMenuMethod } from './devMenu';
import { reportDefaultReactDevToolsPort } from './reactDevTools';

// WebWorker not have `global`
self.global = self;

// redux store enhancer
const devTools = require('./reduxAPI');

self.__REMOTEDEV__ = require('./remotedev');

devTools.default.send = self.__REMOTEDEV__.send;
devTools.default.connect = self.__REMOTEDEV__.connect;

self.reduxNativeDevTools = devTools.default;
self.reduxNativeDevToolsCompose = devTools.composeWithDevTools;

self.devToolsExtension = devTools.default;
self.__REDUX_DEVTOOLS_EXTENSION__ = devTools.default;
self.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ = devTools.composeWithDevTools;

const messageHandlers = {
  executeApplicationScript(message, sendReply) {
    self.__REACT_DEVTOOLS_PORT__ = message.reactDevToolsPort;

    Object.keys(message.inject).forEach(key => {
      self[key] = JSON.parse(message.inject[key]);
    });
    let error;
    try {
      importScripts(message.url);
    } catch (err) {
      error = JSON.stringify(err);
    }
    sendReply(null /* result */, error);
    // Because the worker message not have notify the remote JS runtime (for Electron?)
    // we need to regularly update JS runtime
    if (!self.__RND_INTERVAL__) {
      self.__RND_INTERVAL__ = setInterval(function() {}, 100); // eslint-disable-line
    }

    checkAvailableDevMenuMethods(message.networkInspect);
    reportDefaultReactDevToolsPort();
  },
};

addEventListener('message', message => {
  const object = message.data;

  // handle redux message
  if (object.method === 'emitReduxMessage') {
    return true;
  }

  if (object.method === 'invokeDevMenuMethod') {
    invokeDevMenuMethod(object.name, object.args);
    return false;
  }

  const sendReply = (result, error) => {
    postMessage({ replyID: object.id, result, error });
  };

  const handler = messageHandlers[object.method];
  if (handler) {
    // Special cased handlers
    handler(object, sendReply);
  } else {
    // Other methods get called on the bridge
    let returnValue = [[], [], [], 0];
    try {
      if (typeof __fbBatchedBridge === 'object') {
        returnValue = __fbBatchedBridge[object.method].apply(null, object.arguments);
      }
    } finally {
      sendReply(JSON.stringify(returnValue));
    }
  }
});
