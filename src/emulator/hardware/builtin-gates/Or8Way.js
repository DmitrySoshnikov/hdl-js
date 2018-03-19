/**
 * The MIT License (MIT)
 * Copyright (c) 2017-present Dmitry Soshnikov <dmitry.soshnikov@gmail.com>
 */

'use strict';

const BuiltInGate = require('../BuiltInGate');

const {int16Table} = require('../../../util/numbers');

/**
 * Canonical truth table for the `Or8Way` gate.
 */
const TRUTH_TABLE = int16Table([
  {in: 0b00000000, out: 0b0},
  {in: 0b11111111, out: 0b1},
  {in: 0b00010000, out: 0b1},
  {in: 0b00000001, out: 0b1},
  {in: 0b00100110, out: 0b1},
]);

/**
 * Or of 8 inputs into 1 output.
 * out=1 if one or more of the inputs is 1 and 0 otherwise.
 */
class Or8Way extends BuiltInGate {
  /**
   * IN in[8];
   * OUT out;
   *
   * out = (in[0] | in[1] | ... | in[7])
   *
   * Abstract:
   *
   *   Or(a=in[0], b=in[1], out=out1);
   *   Or(a=out1, b=in[2], out=out2);
   *   ...
   */
  eval() {
    const _in = this.getInputPins()[0].getValue();

    this.getOutputPins()[0].setValue(_in === 0 ? 0 : 1);
  }
}

/**
 * Specification of the `Or8Way` gate.
 */
Or8Way.Spec = {
  name: 'Or8Way',

  description: 'Or | of 8 inputs into 1 output.',

  inputPins: [{name: 'in', size: 8}],

  outputPins: ['out'],

  truthTable: TRUTH_TABLE,
};

module.exports = Or8Way;
