/**
 * The MIT License (MIT)
 * Copyright (c) 2017-present Dmitry Soshnikov <dmitry.soshnikov@gmail.com>
 */

'use strict';

const BuiltInGate = require('../BuiltInGate');

const {int16Table} = require('../../../util/typed-numbers');

/**
 * Canonical truth table for the `Add16` gate.
 */
const TRUTH_TABLE = int16Table([
  {a: 0b0000000000000000, b: 0b0000000000000000, out: 0b0000000000000000},
  {a: 0b0000000000000000, b: 0b1111111111111111, out: 0b1111111111111111},
  {a: 0b1111111111111111, b: 0b1111111111111111, out: 0b1111111111111110},
  {a: 0b1010101010101010, b: 0b0101010101010101, out: 0b1111111111111111},
  {a: 0b0011110011000011, b: 0b0000111111110000, out: 0b0100110010110011},
  {a: 0b0001001000110100, b: 0b1001100001110110, out: 0b1010101010101010},
]);

/**
 * A 16-bit integer adder.
 */
class Add16 extends BuiltInGate {
  /**
   * IN a[16], b[16];
   * OUT out[16];
   *
   * Abstract:
   *
   *   HalfAdder(a=a[0], b=b[0], sum=out[0], carry=c1);
   *   FullAdder(a=a[1], b=b[1], c=c1, sum=out[1], carry=c2);
   *   ...
   *
   * Technically use JS + operator on 16-bit values.
   */
  eval() {
    const a = this.getInputPins()[0].getValue();
    const b = this.getInputPins()[1].getValue();

    this.getOutputPins()[0].setValue(a + b);
  }
}

/**
 * Specification of the `Add16` gate.
 */
Add16.Spec = {
  description: 'A 16-bit integer adder: out = int16(a + b)',

  inputPins: [
    {name: 'a', size: 16},
    {name: 'b', size: 16},
  ],

  outputPins: [
    {name: 'out', size: 16},
  ],

  truthTable: TRUTH_TABLE,
};

module.exports = Add16;