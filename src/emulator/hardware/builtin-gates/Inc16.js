/**
 * The MIT License (MIT)
 * Copyright (c) 2017-present Dmitry Soshnikov <dmitry.soshnikov@gmail.com>
 */

'use strict';

const BuiltInGate = require('../BuiltInGate');

const {int16Table} = require('../../../util/numbers');

/**
 * Canonical truth table for the `Inc16` gate.
 */
const TRUTH_TABLE = int16Table([
  {in: 0b0000000000000000, out: 0b0000000000000001},
  {in: 0b1111111111111111, out: 0b0000000000000000},
  {in: 0b0000000000000101, out: 0b0000000000000110},
  {in: 0b1111111111111011, out: 0b1111111111111100},
]);

/**
 * Adds the constant 1 to the input.
 */
class Inc16 extends BuiltInGate {
  /**
   * IN in[16];
   * OUT out[16];
   *
   * Abstract:
   *
   *   HalfAdder(a=in[0], b=1, sum=out[0], carry=c1);
   *   HalfAdder(a=in[1], b=c1, sum=out[1], carry=c2);
   *   ...
   *
   * Technically use JS + operator on 16-bit values.
   */
  eval() {
    const _in = this.getInputPins()[0].getValue();

    this.getOutputPins()[0].setValue(_in + 1);
  }
}

/**
 * Specification of the `Inc16` gate.
 */
Inc16.Spec = {
  name: 'Inc16',

  description: 'Adds the constant 1 to the input.',

  inputPins: [
    {name: 'in', size: 16},
  ],

  outputPins: [
    {name: 'out', size: 16},
  ],

  truthTable: TRUTH_TABLE,
};

module.exports = Inc16;