/**
 * The MIT License (MIT)
 * Copyright (c) 2017-present Dmitry Soshnikov <dmitry.soshnikov@gmail.com>
 */

'use strict';

const colors = require('colors');
const BuiltInGate = require('../BuiltInGate');

/**
 * Canonical truth table for the `Bit` gate.
 */
const TRUTH_TABLE = [
  {$clock: -0, in: 0, load: 0, out: 0},
  {$clock: +0, in: 1, load: 1, out: 0},
  {$clock: -1, in: 1, load: 0, out: 1},
  {$clock: +1, in: 1, load: 0, out: 1},
  {$clock: -2, in: 1, load: 0, out: 1},
  {$clock: +2, in: 0, load: 1, out: 1},
  {$clock: -3, in: 0, load: 0, out: 0},
];

/**
 * 1 bit memory register.
 * If load[t]=1 then out[t+1] = in[t] else out does not change.
 *
 * Abstract:
 *
 *   IN in, load;
 *   OUT out;
 *
 *   Mux(a=t0, b=in, sel=load, out=t1);
 *   DFF(in=t1, out=t0, out=out);
 */
class Bit extends BuiltInGate {
  /**
   * Bit is a sequential gate.
   */
  static isClocked() {
    return true;
  }

  init() {
    /**
     * The state (0/1) of the bit.
     */
    this._state = 0;
  }

  /**
   * On rising edge Bit updates the internal state
   * if the `load` is set, otherwise -- preserves the state.
   */
  clockUp() {
    const load = this.getInputPins()[1].getValue();

    if (load) {
      this._state = this.getInputPins()[0].getValue();
    }
  }

  /**
   * On the falling edge Bit propagates the state
   * to the output pin.
   */
  clockDown() {
    this.getOutputPins()[0].setValue(this._state);
  }
}

/**
 * Specification of the `Bit` gate.
 */
Bit.Spec = {
  description: [
    '1 bit memory register.',
    '',
    'If load[t]=1 then out[t+1] = in[t] else out does not change.',
    '',
    'Clock rising edge updates internal state from the input,',
    'if the `load` is set; otherwise, preserves the state.',
    '',
    `  ${colors.bold('↗')} : state = load ? in : state`,
    '',
    'Clock falling edge propagates the internal state to the output:',
    '',
    `  ${colors.bold('↘')} : out = state`,
  ].join('\n'),

  inputPins: ['in', 'load'],
  outputPins: ['out'],

  truthTable: TRUTH_TABLE,
};

module.exports = Bit;