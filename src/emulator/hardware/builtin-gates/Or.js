/**
 * The MIT License (MIT)
 * Copyright (c) 2017-present Dmitry Soshnikov <dmitry.soshnikov@gmail.com>
 */

'use strict';

const BuiltInGate = require('../BuiltInGate');

/**
 * Canonical truth table for the `Or` gate.
 */
const TRUTH_TABLE = [
  {a: 0, b: 0, out: 0},
  {a: 0, b: 1, out: 1},
  {a: 1, b: 0, out: 1},
  {a: 1, b: 1, out: 1},
];

/**
 * A bitwise 1-bit Or gate.
 */
class Or extends BuiltInGate {
  /**
   * a | b
   */
  eval() {
    const a = this.getInputPins()[0].getValue();
    const b = this.getInputPins()[1].getValue();

    this.getOutputPins()[0].setValue(a | b);
  }
}

/**
 * Specification of the `Or` gate.
 */
Or.Spec = {
  name: 'Or',
  description: 'Implements bitwise 1-bit Or | operation.',
  inputPins: ['a', 'b'],
  outputPins: ['out'],
  truthTable: TRUTH_TABLE,
};

module.exports = Or;