/**
 * The MIT License (MIT)
 * Copyright (c) 2017-present Dmitry Soshnikov <dmitry.soshnikov@gmail.com>
 */

'use strict';

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
    name = null,
    inputPins = [],
    outputPins = [],
    internalPins = [],
    parts = [],
  } = {}) {
    super({
      name,
      inputPins,
      outputPins,
    });

    this._internalPins = internalPins;
    this._parts = parts;

    // Add internal pins to the pins map.
    this._internalPins.forEach(
      pin => this._namesToPinsMap[pin.getName()] = pin
    );
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

  /**
   * Whether this gate is clocked.
   */
  static isClocked() {
    // This default value is overridden in the child classes
    // created from HDL files.
    return false;
  }

  /**
   * Handler for the rising edge of the clock: updates internal state,
   * outputs are not updated ("latched").
   */
  clockUp() {
    if (!this.getClass().isClocked()) {
      throw new TypeError(
        `Gate#clockUp: "${this._name}" is not clocked.`
      );
    }

    for (const part of this._parts) {
      part.tick();
    }
  }

  /**
   * Handler for the falling edge of the clock: commits the internal state,
   * values to the output.
   */
  clockDown() {
    if (!this.getClass().isClocked()) {
      throw new TypeError(
        `Gate#clockDown: "${this._name}" is not clocked.`
      );
    }

    for (const part of this._parts) {
      part.tock();
    }
  }
}

module.exports = CompositeGate;