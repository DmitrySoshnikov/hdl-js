/**
 * The MIT License (MIT)
 * Copyright (c) 2017-present Dmitry Soshnikov <dmitry.soshnikov@gmail.com>
 */

'use strict';

const BuiltInGate = require('../BuiltInGate');

/**
 * Canonical truth table for the `FullAdder` gate.
 */
const TRUTH_TABLE = [
  {a: 0, b: 0, c: 0, sum: 0, carry: 0},
  {a: 0, b: 0, c: 1, sum: 1, carry: 0},
  {a: 0, b: 1, c: 0, sum: 1, carry: 0},
  {a: 0, b: 1, c: 1, sum: 0, carry: 1},
  {a: 1, b: 0, c: 0, sum: 1, carry: 0},
  {a: 1, b: 0, c: 1, sum: 0, carry: 1},
  {a: 1, b: 1, c: 0, sum: 0, carry: 1},
  {a: 1, b: 1, c: 1, sum: 1, carry: 1},
];

/**
 * A FullAdder.
 *
 * The `sum` returns the LSB of the sum of the three bits a, b and c.
 * The `carry` returns the carry bit.
 */
class FullAdder extends BuiltInGate {
  /**
   * t = a + b + c
   * sum = t % 2
   * carry = t / 2
   */
  eval() {
    const a = this.getInputPins()[0].getValue();
    const b = this.getInputPins()[1].getValue();
    const c = this.getInputPins()[2].getValue();

    const t = a + b + c;

    this.getOutputPins()[0].setValue(t % 2); // sum
    this.getOutputPins()[1].setValue(Math.trunc(t / 2)); // carry
  }
}

/**
 * Specification of the `FullAdder` gate.
 */
FullAdder.Spec = {
  description: [
    'Implements 3-bits adder (full-adder) gate.',
    '',
    'The `sum` returns LSB (the least significant bit) of the sum',
    'of the three bits `a`, `b` and `c`.',
    '',
    'The `carry` returns the carry bit.',
  ].join('\n'),

  inputPins: ['a', 'b', 'c'],
  outputPins: ['sum', 'carry'],

  truthTable: TRUTH_TABLE,
};


module.exports = FullAdder;