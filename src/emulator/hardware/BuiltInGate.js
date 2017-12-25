/**
 * The MIT License (MIT)
 * Copyright (c) 2017-present Dmitry Soshnikov <dmitry.soshnikov@gmail.com>
 */

'use strict';

const Gate = require('./Gate');
const Pin = require('./Pin');
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
   * Creates an default instance of this gate from the spec.
   */
  static defaultFromSpec() {
    const {
      inputPins,
      outputPins,
    } = BuiltInGate.validateSpec(this.Spec);

    const toPin = name => {
      return typeof name === 'string'
        ? new Pin({name})
        : new PinBus({name: name.name, size: name.size});
    };

    return new this({
      inputPins: inputPins.map(toPin),
      outputPins: outputPins.map(toPin),
    });
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
    const spec = BuiltInGate.validateSpec(this.constructor.Spec);

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
  static printTruthTable({table = null, transformValue = null}) {
    super.printTruthTable({
      table: table || BuiltInGate.validateSpec(this.Spec).truthTable,
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
}

module.exports = BuiltInGate;