/**
 * The MIT License (MIT)
 * Copyright (c) 2017-present Dmitry Soshnikov <dmitry.soshnikov@gmail.com>
 */

'use strict';

const BuiltInGate = require('../BuiltInGate');

const {int16Table} = require('../../../util/numbers');

/**
 * Canonical truth table for the `Not16` gate.
 */
const TRUTH_TABLE = int16Table([
  {in: 0b0000000000000000, out: 0b1111111111111111},
  {in: 0b1111111111111111, out: 0b0000000000000000},
  {in: 0b1010101010101010, out: 0b0101010101010101},
  {in: 0b0011110011000011, out: 0b1100001100111100},
  {in: 0b0001001000110100, out: 0b1110110111001011},
]);

/**
 * A bitwise 16-bit Not gate.
 */
class Not16 extends BuiltInGate {
  /**
   * IN a[16];
   * OUT out[16];
   *
   * for i = 0..15: out[i] = ~a[i]
   *
   * Abstract:
   *
   *   Not(a=a[0], out=out[0]);
   *   Not(a=a[1], out=out[1]);
   *   ...
   *
   * Technically use JS bitwise operations at needed index.
   */
  eval() {
    const a = this.getInputPins()[0].getValue();

    // JS ~ operator applies bitwise Not for all bits:
    this.getOutputPins()[0].setValue(~a);
  }
}

/**
 * Specification of the `Not16` gate.
 */
Not16.Spec = {
  name: 'Not16',

  description: 'Implements bitwise 16-bit Not ~ operation.',

  inputPins: [{name: 'in', size: 16}],

  outputPins: [{name: 'out', size: 16}],

  truthTable: TRUTH_TABLE,
};

module.exports = Not16;
