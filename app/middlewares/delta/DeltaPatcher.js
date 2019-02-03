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
      id: undefined,
      pre: new Map(),
      post: new Map(),
      modules: new Map(),
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
    const isOld = deltaBundle.id;
    // Make sure that the first received delta is a fresh one.
    if (
      isOld ? !this._initialized && !deltaBundle.reset : !this._initialized && !deltaBundle.base
    ) {
      throw new Error('DeltaPatcher should receive a fresh Delta when being initialized');
    }

    this._initialized = true;

    // Reset the current delta when we receive a fresh delta.
    if (deltaBundle.reset && isOld) {
      this._lastBundle = {
        pre: new Map(),
        post: new Map(),
        modules: new Map(),
        id: undefined,
      };
    } else if (deltaBundle.base) {
      this._lastBundle = {
        id: deltaBundle.revisionId,
        pre: deltaBundle.pre,
        post: deltaBundle.post,
        modules: new Map(deltaBundle.modules),
      };
    }

    this._lastNumModifiedFiles = isOld
      ? deltaBundle.pre.size + deltaBundle.post.size + deltaBundle.delta.size
      : deltaBundle.modules.length;

    if (deltaBundle.deleted) {
      this._lastNumModifiedFiles += deltaBundle.deleted.length;
    }

    this._lastBundle.id = isOld ? deltaBundle.id : deltaBundle.revisionId;

    if (this._lastNumModifiedFiles > 0) {
      this._lastModifiedDate = new Date();
    }

    if (isOld) {
      this._patchMap(this._lastBundle.pre, deltaBundle.pre);
      this._patchMap(this._lastBundle.post, deltaBundle.post);
      this._patchMap(this._lastBundle.modules, deltaBundle.delta);

      this._lastBundle.id = deltaBundle.id;
    } else {
      this._patchMap(this._lastBundle.modules, deltaBundle.modules);

      if (deltaBundle.deleted) {
        for (const id of deltaBundle.deleted) {
          this._lastBundle.modules.delete(id);
        }
      }

      this._lastBundle.id = deltaBundle.revisionId;
    }

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

  getAllModules(isOld) {
    return isOld
      ? [].concat(
        Array.from(this._lastBundle.pre.values()),
        Array.from(this._lastBundle.modules.values()),
        Array.from(this._lastBundle.post.values())
      )
      : [].concat([this._lastBundle.pre], Array.from(this._lastBundle.modules.values()), [
        this._lastBundle.post,
      ]);
  }

  getSizeOfAllModules() {
    // Support legacy DeltaPatcher
    const preSize = this._lastBundle.pre instanceof Map ? this._lastBundle.pre.size : 1;
    const postSize = this._lastBundle.post instanceof Map ? this._lastBundle.post.size : 1;
    return preSize + this._lastBundle.modules.size + postSize;
  }

  _patchMap(original, patch) {
    for (const [key, value] of patch) {
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
