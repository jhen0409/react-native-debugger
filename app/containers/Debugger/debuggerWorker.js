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

// NOTE: WebWorker not have `global`
self.global = self;
// redux store enhancer
const devTools = require('../ReduxDevTools/reduxNativeDevTools');

self.reduxNativeDevTools = devTools.default;
self.reduxNativeDevToolsCompose = devTools.composeWithDevTools;

self.devToolsExtension = devTools.default;
self.__REDUX_DEVTOOLS_EXTENSION__ = devTools.default; // eslint-disable-line
self.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ = devTools.composeWithDevTools; // eslint-disable-line

const messageHandlers = {
  executeApplicationScript(message, sendReply) {
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
    if (!self.__RND_INTERVAL__) { // eslint-disable-line
      self.__RND_INTERVAL__ = setInterval(function(){}, 100); // eslint-disable-line
    }
  },
};

addEventListener('message', message => {
  const object = message.data;

  // handle redux message
  if (object.method === 'emitReduxMessage') {
    return true;
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
