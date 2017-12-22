/**
 * The MIT License (MIT)
 * Copyright (c) 2017-present Dmitry Soshnikov <dmitry.soshnikov@gmail.com>
 */

'use strict';

const Gate = require('./Gate');
const PinBus = require('./PinBus');

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
    const spec = this.constructor.Spec;

    if (!spec) {
      throw new Error(
        `"${this.getName()}" gate: BuiltIn gates ` +
        `should impelment "Spec" property`
      );
    }

    if (pins.length !== spec[kind].length) {
      throw new Error(
        `"${this._name}" gate: expect ${spec[kind].length} ${kind} ` +
        `(${spec[kind].join(', ')}), got ${pins.length}.`
      );
    }

    // Check that for sized-pins, a `PinBus` is passed.
    spec[kind].forEach((pinName, index) => {
      const size = typeof pinName === 'string'
        ? null
        : pinName.size;
      if (size && !(pins[index] instanceof PinBus)) {
        throw new TypeError(
          `"${this._name}" gate: expect gate #${index} from ${kind} to be ` +
          `an instance of PinBus, ${pins[index].constructor.name} is given.`
        );
      }
    });
  }

  /**
   * Evaluates this gate.
   */
  eval() {
    // Noop.
    return;
  }
}

module.exports = BuiltInGate;