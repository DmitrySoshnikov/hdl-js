/**
 * The MIT License (MIT)
 * Copyright (c) 2017-present Dmitry Soshnikov <dmitry.soshnikov@gmail.com>
 */

'use strict';

const BuiltInGate = require('../BuiltInGate');

const {int16Table} = require('../../../util/numbers');

/**
 * Canonical truth table for the `Or16` gate.
 */
const TRUTH_TABLE = int16Table([
  {a: 0b0000000000000000, b: 0b0000000000000000, out: 0b0000000000000000},
  {a: 0b0000000000000000, b: 0b1111111111111111, out: 0b1111111111111111},
  {a: 0b1111111111111111, b: 0b1111111111111111, out: 0b1111111111111111},
  {a: 0b1010101010101010, b: 0b0101010101010101, out: 0b1111111111111111},
  {a: 0b0011110011000011, b: 0b0000111111110000, out: 0b0011111111110011},
  {a: 0b0001001000110100, b: 0b1001100001110110, out: 0b1001101001110110},
]);

/**
 * A bitwise 16-bit Or gate.
 */
class Or16 extends BuiltInGate {
  /**
   * IN a[16], b[16];
   * OUT out[16];
   *
   * for i = 0..15: out[i] = (a[i] | b[i])
   *
   * Abstract:
   *
   *   Or(a=a[0], b=b[0], out=out[0]);
   *   Or(a=a[1], b=b[1], out=out[1]);
   *   ...
   *
   * Technically use JS bitwise operations at needed index.
   */
  eval() {
    const a = this.getInputPins()[0].getValue();
    const b = this.getInputPins()[1].getValue();

    // In JS implementation doesn't differ from the simple `Or` gate.
    // Use 16-bit values with 0xFFFF mask.
    this.getOutputPins()[0].setValue((a | b) & 0xFFFF);
  }
}

/**
 * Specification of the `Or16` gate.
 */
Or16.Spec = {
  name: 'Or16',

  description: 'Implements bitwise 16-bit Or | operation.',

  inputPins: [
    {name: 'a', size: 16},
    {name: 'b', size: 16},
  ],

  outputPins: [
    {name: 'out', size: 16},
  ],

  truthTable: TRUTH_TABLE,
};

module.exports = Or16;