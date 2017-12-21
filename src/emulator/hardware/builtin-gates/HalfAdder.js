/**
 * The MIT License (MIT)
 * Copyright (c) 2017-present Dmitry Soshnikov <dmitry.soshnikov@gmail.com>
 */

'use strict';

const BuiltInGate = require('../BuiltInGate');

/**
 * Canonical truth table for the `HalfAdder` gate.
 */
const TRUTH_TABLE = [
  {a: 0, b: 0, sum: 0, carry: 0},
  {a: 0, b: 1, sum: 1, carry: 0},
  {a: 1, b: 0, sum: 1, carry: 0},
  {a: 1, b: 1, sum: 0, carry: 1},
];

/**
 * A HalfAdder.
 * `sum` returns the LSB of the sum of the two bits a and b.
 * `carry` returns the carry bit.
 */
class HalfAdder extends BuiltInGate {
  /**
   * sum = a ^ b
   * carry = a & b
   */
  eval() {
    const a = this.getInputPins()[0].getValue();
    const b = this.getInputPins()[1].getValue();

    this.getOutputPins()[0].setValue(a ^ b);
    this.getOutputPins()[1].setValue(a & b);
  }
}

/**
 * Specification of the `HalfAdder` gate.
 */
HalfAdder.Spec = {
  inputPins: ['a', 'b'],
  outputPins: ['sum', 'carry'],
  truthTable: TRUTH_TABLE,
};

module.exports = HalfAdder;