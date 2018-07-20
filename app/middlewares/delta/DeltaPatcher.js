/**
 * Copyright (c) 2015-present, Facebook, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @format
 */

import { checkFetchExists, patchFetchPolyfill } from './patchFetchPolyfill';

/* eslint-disable no-underscore-dangle */

/**
 * This file is a copy of the reference `DeltaPatcher`, located in
 * metro. The reason to not reuse that file is that in this context
 * we cannot have flow annotations or CJS syntax (since this file is directly)
 * injected into a static HTML page.
 *
 * TODO: Find a simple and lightweight way to compile `DeltaPatcher` to avoid
 * having this duplicated file.
 */

/**
 * This is a reference client for the Delta Bundler: it maintains cached the
 * last patched bundle delta and it's capable of applying new Deltas received
 * from the Bundler.
 */
export default class DeltaPatcher {
  constructor() {
    this._lastBundle = {
      pre: new Map(),
      post: new Map(),
      modules: new Map(),
      id: undefined,
    };
    this._initialized = false;
    this._lastNumModifiedFiles = 0;
    this._lastModifiedDate = new Date();
  }

  static get(id) {
    let deltaPatcher = this._deltaPatchers.get(id);

    if (!deltaPatcher) {
      deltaPatcher = new DeltaPatcher();
      this._deltaPatchers.set(id, deltaPatcher);
    }

    return deltaPatcher;
  }

  /**
   * Applies a Delta Bundle to the current bundle.
   */
  applyDelta(deltaBundle) {
    // Make sure that the first received delta is a fresh one.
    if (!this._initialized && !deltaBundle.reset) {
      throw new Error('DeltaPatcher should receive a fresh Delta when being initialized');
    }

    this._initialized = true;

    // Reset the current delta when we receive a fresh delta.
    if (deltaBundle.reset) {
      this._lastBundle = {
        pre: new Map(),
        post: new Map(),
        modules: new Map(),
        id: undefined,
      };
    }

    this._lastNumModifiedFiles =
      deltaBundle.pre.size + deltaBundle.post.size + deltaBundle.delta.size;

    if (this._lastNumModifiedFiles > 0) {
      this._lastModifiedDate = new Date();
    }

    this._patchMap(this._lastBundle.pre, deltaBundle.pre);
    this._patchMap(this._lastBundle.post, deltaBundle.post);
    this._patchMap(this._lastBundle.modules, deltaBundle.delta);

    this._lastBundle.id = deltaBundle.id;

    return this;
  }

  getLastBundleId() {
    return this._lastBundle.id;
  }

  /**
   * Returns the number of modified files in the last received Delta. This is
   * currently used to populate the `X-Metro-Files-Changed-Count` HTTP header
   * when metro serves the whole JS bundle, and can potentially be removed once
   * we only send the actual deltas to clients.
   */
  getLastNumModifiedFiles() {
    return this._lastNumModifiedFiles;
  }

  getLastModifiedDate() {
    return this._lastModifiedDate;
  }

  getAllModules() {
    return [].concat(
      Array.from(this._lastBundle.pre.values()),
      Array.from(this._lastBundle.modules.values()),
      Array.from(this._lastBundle.post.values())
    );
  }

  getSizeOfAllModules() {
    return this._lastBundle.pre.size + this._lastBundle.modules.size + this._lastBundle.post.size;
  }

  _patchMap(original, patch) {
    for (const [key, value] of patch.entries()) {
      if (value == null) {
        original.delete(key);
      } else if (checkFetchExists(value)) {
        original.set(key, patchFetchPolyfill(value));
      } else {
        original.set(key, value);
      }
    }
  }
}

DeltaPatcher._deltaPatchers = new Map();
