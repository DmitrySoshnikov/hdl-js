/**
 * The MIT License (MIT)
 * Copyright (c) 2017-present Dmitry Soshnikov <dmitry.soshnikov@gmail.com>
 */

'use strict';

const BuiltInGate = require('../BuiltInGate');

const {int16Table} = require('../../../util/numbers');

/**
 * Canonical truth table for the `Nor8Way` gate.
 */
const TRUTH_TABLE = int16Table([
  {in: 0b0000000000000000, out: 0b1},
  {in: 0b1111111111111111, out: 0b0},
  {in: 0b0001000000010000, out: 0b0},
  {in: 0b0000000100000001, out: 0b0},
  {in: 0b0010011000100110, out: 0b0},
]);

/**
 * Or of 16 inputs into 1 output.
 * out=1 if all inputs are 0, and 0 otherwise.
 */
class Nor16Way extends BuiltInGate {
  /**
   * IN in[16];
   * OUT out;
   *
   * out = (in[0] nor in[1] nor ... nor in[7])
   *
   * Abstract:
   *
   *   Nor(a=in[0], b=in[1], out=out1);
   *   Nor(a=out1, b=in[2], out=out2);
   *   ...
   */
  eval() {
    const _in = this.getInputPins()[0].getValue();

    this.getOutputPins()[0].setValue(_in === 0 ? 1 : 0);
  }
}

/**
 * Specification of the `Nor16Way` gate.
 */
Nor16Way.Spec = {
  name: 'Nor16Way',

  description: 'Nor of 16 inputs into 1 output.',

  inputPins: [{name: 'in', size: 16}],

  outputPins: ['out'],

  truthTable: TRUTH_TABLE,
};

module.exports = Nor16Way;
