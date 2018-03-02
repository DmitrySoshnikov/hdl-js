/**
 * The MIT License (MIT)
 * Copyright (c) 2017-present Dmitry Soshnikov <dmitry.soshnikov@gmail.com>
 */

'use strict';

const colors = require('colors');
const BuiltInGate = require('../BuiltInGate');

const {int16Table, int16} = require('../../../util/numbers');

/**
 * Canonical truth table for the `PC` gate.
 */
const TRUTH_TABLE = int16Table([
  {$clock: -0, in: 0, load: 0, inc: 0, reset: 0, out: 0},

  // PC = 5
  {$clock: +0, in: 5, load: 1, inc: 0, reset: 0, out: 0},
  {$clock: -1, in: 5, load: 1, inc: 0, reset: 0, out: 5},

  // PC++
  {$clock: +1, in: 5, load: 0, inc: 1, reset: 0, out: 5},
  {$clock: -2, in: 5, load: 0, inc: 1, reset: 0, out: 6},

  // PC++
  {$clock: +2, in: 6, load: 0, inc: 1, reset: 0, out: 6},
  {$clock: -3, in: 6, load: 0, inc: 1, reset: 0, out: 7},

  // Reset (PC = 0)
  {$clock: +3, in: 6, load: 0, inc: 0, reset: 1, out: 6},
  {$clock: -4, in: 6, load: 0, inc: 0, reset: 1, out: 0},

  // Preserve
  {$clock: +4, in: 0, load: 0, inc: 0, reset: 0, out: 0},
  {$clock: -5, in: 0, load: 0, inc: 0, reset: 0, out: 0},
]);

/**
 * A 16-bit counter with load and reset controls.
 *
 * out[t+1] = 0,          when reset[t] = 1
 * out[t+1] = in[t],      when load[t] = 1
 * out[t+1] = out[t] + 1, when inc[t] = 1 (default counting behavior)
 * out[t+1] = out[t],     otherwise (preserves as a register)
 *
 * Abstract:
 *
 *   IN in[16], load, inc, reset;
 *   OUT out[16];
 *
 *   Inc16(in=t0, out=t1);
 *   Mux16(a=t0, b=t1, sel=inc, out=t2);
 *   ...
 *   Register(in=t4, load=true, out=t0, out=out);
 */
class PC extends BuiltInGate {
  /**
   * PC is a sequential gate.
   */
  static isClocked() {
    return true;
  }

  init() {
    /**
     * The 16-bit value of the PC register.
     */
    this._value = 0;
  }

  /**
   * On rising edge PC register updates the internal
   * value according to the logic.
   */
  clockUp() {
    const _in = this.getInputPins()[0].getValue();
    const load = this.getInputPins()[1].getValue();
    const inc = this.getInputPins()[2].getValue();
    const reset = this.getInputPins()[3].getValue();

    if (reset === 1) {
      this._value = 0;
    } else if (load === 1) {
      this._value = int16(_in);
    } else if (inc === 1) {
      this._value++;
    }
  }

  /**
   * On the falling edge PC register propagates
   * the value to the output pin.
   */
  clockDown() {
    this.getOutputPins()[0].setValue(this._value);
  }
}

/**
 * Specification of the `PC` gate.
 */
PC.Spec = {
  name: 'PC',

  description:
`
A 16-bit counter with load and reset controls.

out[t+1] = 0,          when reset[t] = 1
out[t+1] = in[t],      when load[t] = 1
out[t+1] = out[t] + 1, when inc[t] = 1 (default counting behavior)
out[t+1] = out[t],     otherwise, preserves the value

Clock rising edge PC updates the value from the input,
if the \`load\` is set; otherwise, preserves the state.

  ${colors.bold('↗')} : value = in, when ${colors.bold('load')}
               0, when ${colors.bold('reset')}
              +1, when ${colors.bold('inc')}

Clock falling edge PC propagates the value to the output:

  ${colors.bold('↘')} : out = value
`,

  inputPins: [
    // 16-bit value.
    {name: 'in', size: 16},

    // Control bits.
    {name: 'load', size: 1},
    {name: 'inc', size: 1},
    {name: 'reset', size: 1},

  ],
  outputPins: [
    {name: 'out', size: 16},
  ],

  truthTable: TRUTH_TABLE,
};

module.exports = PC;