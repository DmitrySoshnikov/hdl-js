/**
 * The MIT License (MIT)
 * Copyright (c) 2017-present Dmitry Soshnikov <dmitry.soshnikov@gmail.com>
 */

'use strict';

const colors = require('colors');
const BuiltInGate = require('../BuiltInGate');

/**
 * Canonical truth table for the `DFF` gate.
 */
const TRUTH_TABLE = [
  {$clock: -0, in: 0, out: 0},
  {$clock: +0, in: 1, out: 0},
  {$clock: -1, in: 0, out: 1},
  {$clock: +1, in: 0, out: 0},
];

/**
 * Data/Delay Flip-Flop chip.
 */
class DFF extends BuiltInGate {
  /**
   * DFF is a sequential gate.
   */
  static isClocked() {
    return true;
  }

  init() {
    /**
     * The state (0/1) of the D-flip-flop.
     */
    this._state = 0;
  }

  /**
   * On rising edge DFF updates the internal state
   * from the input pin.
   */
  clockUp() {
    this._state = this.getInputPins()[0].getValue();
  }

  /**
   * On the falling edge DFF propagates the state
   * to the output pin.
   */
  clockDown() {
    this.getOutputPins()[0].setValue(this._state);
  }
}

/**
 * Specification of the `DFF` gate.
 */
DFF.Spec = {
  name: 'DFF',

  description: [
    'DFF (Data/Delay Flip-Flop) chip.',
    '',
    'Clock rising edge updates internal state from the input:',
    '',
    `  ${colors.bold('↗')} : state = in`,
    '',
    'Clock falling edge propagates the internal state to the output:',
    '',
    `  ${colors.bold('↘')} : out = state`,
  ].join('\n'),

  inputPins: ['in'],
  outputPins: ['out'],

  truthTable: TRUTH_TABLE,
};

module.exports = DFF;
