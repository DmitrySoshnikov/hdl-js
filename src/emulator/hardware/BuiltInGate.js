/**
 * The MIT License (MIT)
 * Copyright (c) 2017-present Dmitry Soshnikov <dmitry.soshnikov@gmail.com>
 */

'use strict';

const Gate = require('./Gate');

/**
 * Base class for all builtin gates.
 */
class BuiltInGate extends Gate {
  /**
   * Creates a gate instance with the given name.
   */
  constructor({
    name = null,
    inputPins = [],
    outputPins = [],
  } = {}) {
    super({name, inputPins, outputPins});
    this._validate();
  }

  /**
   * Validates inputs, and outputs of this gate.
   */
  _validate() {
    this._validatePins(this.getInputPins(), 'inputPins');
    this._validatePins(this.getOutputPins(), 'outputPins');
  }

  /**
   * Validates pin numbers.
   */
  _validatePins(pins, kind) {
    const spec = BuiltInGate.validateSpec(this.getClass().Spec);

    if (pins.length !== spec[kind].length) {
      throw new Error(
        `"${this._name}" gate: expect ${spec[kind].length} ${kind} ` +
        `(${spec[kind].join(', ')}), got ${pins.length}.`
      );
    }

    // Check that for sized-pins, a `Pin` is passed.
    spec[kind].forEach((pinName, index) => {
      const size = typeof pinName === 'string'
        ? null
        : pinName.size;
      if (size && pins[index].getSize() !== size) {
        throw new TypeError(
          `"${this._name}" gate: expect gate #${index} from ${kind} to have ` +
          `size ${size}, ${pins[index].getSize()} is given.`
        );
      }
    });
  }

  static validateSpec(spec) {
    return super.validateSpec(spec, [
      'description',
      'inputPins',
      'outputPins',
      'truthTable',
    ]);
  }

  /**
   * Prints truth table.
   */
  static printTruthTable({
    table = null,
    formatRadix,
    formatStringLengh,
    transformValue = null,
  } = {}) {
    super.printTruthTable({
      table: table || BuiltInGate.validateSpec(this.Spec).truthTable,
      formatRadix,
      formatStringLengh,
      transformValue,
    });
  }

  /**
   * Evaluates this gate.
   */
  eval() {
    // Noop.
    return;
  }

  /**
   * Handler for the rising edge of the clock: updates internal state,
   * outputs are not updated ("latched").
   */
  clockUp() {
    // Noop.
    return;
  }

  /**
   * Handler for the falling edge of the clock: commits the internal state,
   * values to the output.
   */
  clockDown() {
    // Noop.
    return;
  }

  /**
   * Whether this gate is clocked.
   */
  static isClocked() {
    // Child classes can override.
    return false;
  }
}

module.exports = BuiltInGate;