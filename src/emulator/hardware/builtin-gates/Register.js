/**
 * The MIT License (MIT)
 * Copyright (c) 2017-present Dmitry Soshnikov <dmitry.soshnikov@gmail.com>
 */

'use strict';

const colors = require('colors');
const BuiltInGate = require('../BuiltInGate');

const {int16Table, int16} = require('../../../util/typed-numbers');

/**
 * Canonical truth table for the `Register` gate.
 */
const TRUTH_TABLE = int16Table([
  {$clock: -0, in: 0b0000000000000000, load: 0, out: 0b0000000000000000},
  {$clock: +0, in: 0b0000000000010101, load: 1, out: 0b0000000000000000},
  {$clock: -1, in: 0b0000000000000001, load: 0, out: 0b0000000000010101},
  {$clock: +1, in: 0b0000000000010101, load: 0, out: 0b0000000000010101},
  {$clock: -2, in: 0b0000000000010101, load: 0, out: 0b0000000000010101},
  {$clock: +2, in: 0b1101001000010101, load: 1, out: 0b0000000000010101},
  {$clock: -3, in: 0b1101001000010101, load: 0, out: 0b1101001000010101},
]);

/**
 * 16-bit register.
 *
 * Abstract:
 *
 *  IN in[16], load;
 *  OUT out[16];
 *
 *  Bit(in=in[0], load=load, out=out[0]);
 *  Bit(in=in[1], load=load, out=out[1]);
 *  ...
 */
class Register extends BuiltInGate {
  /**
   * Register is a sequential gate.
   */
  static isClocked() {
    return true;
  }

  init() {
    /**
     * The 16-bit value of the register.
     */
    this._value = 0;
  }

  /**
   * On rising edge Register updates the value if the
   * `load` is set, otherwise -- preserves the state.
   */
  clockUp() {
    const load = this.getInputPins()[1].getValue();

    if (load) {
      this._value = int16(this.getInputPins()[0].getValue());
    }
  }

  /**
   * On the falling edge Register propagates
   * the value to the output pin.
   */
  clockDown() {
    this.getOutputPins()[0].setValue(this._value);
  }
}

/**
 * Specification of the `Register` gate.
 */
Register.Spec = {
  description: [
    '16-bit memory register.',
    '',
    'If load[t]=1 then out[t+1] = in[t] else out does not change.',
    '',
    'Clock rising edge updates the value from the input,',
    'if the `load` is set; otherwise, preserves the state.',
    '',
    `  ${colors.bold('↗')} : value = load ? in : value`,
    '',
    'Clock falling edge propagates the value to the output:',
    '',
    `  ${colors.bold('↘')} : out = value`,
  ].join('\n'),

  inputPins: [
    {name: 'in', size: 16},
    {name: 'load', size: 1}
  ],
  outputPins: [
    {name: 'out', size: 16},
  ],

  truthTable: TRUTH_TABLE,
};

module.exports = Register;