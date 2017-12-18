/**
 * The MIT License (MIT)
 * Copyright (c) 2017-present Dmitry Soshnikov <dmitry.soshnikov@gmail.com>
 */

const Gate = require('./Gate');

/**
 * A gate consisting of several sub-parts implementation
 * (usually a user-defined gate).
 */
class CompositeGate extends Gate {
  /**
   * Creates a gate instance with the given name.
   */
  constructor({
    name,
    inputPins = [],
    outputPins = [],
    internalPins = [],
    parts = [],
  }) {
    super({
      name,
      inputPins,
      outputPins,
    });

    this._internalPins = internalPins;
    this._parts = parts;
  }

  /**
   * Returns internal pins of this gate.
   */
  getInternalPins() {
    return this._internalPins;
  }

  /**
   * Returns implementation parts (gates) of this gate..
   */
  getParts() {
    return this._parts;
  }

  /**
   * Evaluates this gate.
   */
  eval() {
    for (const part of this._parts) {
      part.eval();
    }
  }
}

module.exports = CompositeGate;