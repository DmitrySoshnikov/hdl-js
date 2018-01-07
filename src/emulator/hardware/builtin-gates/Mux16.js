/**
 * The MIT License (MIT)
 * Copyright (c) 2017-present Dmitry Soshnikov <dmitry.soshnikov@gmail.com>
 */

'use strict';

const BuiltInGate = require('../BuiltInGate');

const {int16Table} = require('../../../util/typed-numbers');

/**
 * Canonical truth table for the `Mux16` gate.
 */
const TRUTH_TABLE = int16Table([
  {a: 0b0000000000000000, b: 0b0000000000000000, sel: 0, out: 0b0000000000000000},
  {a: 0b0000000000000000, b: 0b0000000000000000, sel: 1, out: 0b0000000000000000},
  {a: 0b0000000000000000, b: 0b0001001000110100, sel: 0, out: 0b0000000000000000},
  {a: 0b0000000000000000, b: 0b0001001000110100, sel: 1, out: 0b0001001000110100},
  {a: 0b1001100001110110, b: 0b0000000000000000, sel: 0, out: 0b1001100001110110},
  {a: 0b1001100001110110, b: 0b0000000000000000, sel: 1, out: 0b0000000000000000},
  {a: 0b1010101010101010, b: 0b0101010101010101, sel: 0, out: 0b1010101010101010},
  {a: 0b1010101010101010, b: 0b0101010101010101, sel: 1, out: 0b0101010101010101},
]);

/**
 * A 16-bit Mux gate.
 */
class Mux16 extends BuiltInGate {
  /**
   * IN a[16], b[16], sel;
   * OUT out[16];
   *
   * for i = 0..15 out[i] = a[i] if sel == 0
   *                        b[i] if sel == 1
   * Abstract:
   *
   *   Mux(a=a[0], b=b[0], sel=sel, out=out[0]);
   *   Mux(a=a[1], b=b[1], sel=sel, out=out[1]);
   *   ...
   *
   * Technically at JS implementation is the same as in 1-bit Mux.
   */
  eval() {
    const a = this.getInputPins()[0].getValue();
    const b = this.getInputPins()[1].getValue();

    const sel = this.getInputPins()[2].getValue();

    this.getOutputPins()[0].setValue(sel === 0 ? a : b);
  }
}

/**
 * Specification of the `Mux16` gate.
 */
Mux16.Spec = {
  description: 'Implements bitwise 16-bit And & operation.',

  inputPins: [
    // Data pins.
    {name: 'a', size: 16},
    {name: 'b', size: 16},

    // 1-bit selector.
    {name: 'sel', size: 1},
  ],

  outputPins: [
    {name: 'out', size: 16},
  ],

  truthTable: TRUTH_TABLE,
};

module.exports = Mux16;