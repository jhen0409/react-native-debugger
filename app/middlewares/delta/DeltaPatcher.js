/**
 * Copyright (c) 2015-present, Facebook, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @format
 */

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
      pre: '',
      post: '',
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
    // Make sure that the first received delta is a fresh one.
    if (!this._initialized && !deltaBundle.base) {
      throw new Error('DeltaPatcher should receive a fresh Delta when being initialized');
    }

    this._initialized = true;

    // Reset the current delta when we receive a fresh delta.
    if (deltaBundle.base) {
      this._lastBundle = {
        id: deltaBundle.revisionId,
        pre: deltaBundle.pre,
        post: deltaBundle.post,
        modules: new Map(deltaBundle.modules),
      };
    }

    this._lastNumModifiedFiles =
    deltaBundle.modules.length;

    if (deltaBundle.deleted) {
      this._lastNumModifiedFiles += deltaBundle.deleted.length;
    }

    this._lastBundle.id = deltaBundle.revisionId;

    if (this._lastNumModifiedFiles > 0) {
      this._lastModifiedDate = new Date();
    }

    for (const [key, value] of deltaBundle.modules) {
      this._lastBundle.modules.set(key, value);
    }

    if (deltaBundle.deleted) {
      for (const id of deltaBundle.deleted) {
        this._lastBundle.modules.delete(id);
      }
    }


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
      [this._lastBundle.pre],
      Array.from(this._lastBundle.modules.values()),
      [this._lastBundle.post],
    );
  }

  getSizeOfAllModules() {
    return this._lastBundle.pre.size + this._lastBundle.modules.size + this._lastBundle.post.size;
  }
}

DeltaPatcher._deltaPatchers = new Map();
