/**
 * The MIT License (MIT)
 * Copyright (c) 2017-present Dmitry Soshnikov <dmitry.soshnikov@gmail.com>
 */

'use strict';

const BuiltInGate = require('../BuiltInGate');

const {int16Table, int16} = require('../../../util/numbers');

/**
 * Canonical truth table for the `ALU` gate.
 */
// prettier-ignore
const TRUTH_TABLE = int16Table([
  {x: 0b0000000000000000, y: 0b1111111111111111, zx: 1, nx: 0, zy: 1, ny: 0, f: 1, no: 0, out: 0b0000000000000000, zr: 1, ng: 0},
  {x: 0b0000000000000000, y: 0b1111111111111111, zx: 1, nx: 1, zy: 1, ny: 1, f: 1, no: 1, out: 0b0000000000000001, zr: 0, ng: 0},
  {x: 0b0000000000000000, y: 0b1111111111111111, zx: 1, nx: 1, zy: 1, ny: 0, f: 1, no: 0, out: 0b1111111111111111, zr: 0, ng: 1},
  {x: 0b0000000000000000, y: 0b1111111111111111, zx: 0, nx: 0, zy: 1, ny: 1, f: 0, no: 0, out: 0b0000000000000000, zr: 1, ng: 0},
  {x: 0b0000000000000000, y: 0b1111111111111111, zx: 1, nx: 1, zy: 0, ny: 0, f: 0, no: 0, out: 0b1111111111111111, zr: 0, ng: 1},
  {x: 0b0000000000000000, y: 0b1111111111111111, zx: 0, nx: 0, zy: 1, ny: 1, f: 0, no: 1, out: 0b1111111111111111, zr: 0, ng: 1},
  {x: 0b0000000000000000, y: 0b1111111111111111, zx: 1, nx: 1, zy: 0, ny: 0, f: 0, no: 1, out: 0b0000000000000000, zr: 1, ng: 0},
  {x: 0b0000000000000000, y: 0b1111111111111111, zx: 0, nx: 0, zy: 1, ny: 1, f: 1, no: 1, out: 0b0000000000000000, zr: 1, ng: 0},
  {x: 0b0000000000000000, y: 0b1111111111111111, zx: 1, nx: 1, zy: 0, ny: 0, f: 1, no: 1, out: 0b0000000000000001, zr: 0, ng: 0},
  {x: 0b0000000000000000, y: 0b1111111111111111, zx: 0, nx: 1, zy: 1, ny: 1, f: 1, no: 1, out: 0b0000000000000001, zr: 0, ng: 0},
  {x: 0b0000000000000000, y: 0b1111111111111111, zx: 1, nx: 1, zy: 0, ny: 1, f: 1, no: 1, out: 0b0000000000000000, zr: 1, ng: 0},
  {x: 0b0000000000000000, y: 0b1111111111111111, zx: 0, nx: 0, zy: 1, ny: 1, f: 1, no: 0, out: 0b1111111111111111, zr: 0, ng: 1},
  {x: 0b0000000000000000, y: 0b1111111111111111, zx: 1, nx: 1, zy: 0, ny: 0, f: 1, no: 0, out: 0b1111111111111110, zr: 0, ng: 1},
  {x: 0b0000000000000000, y: 0b1111111111111111, zx: 0, nx: 0, zy: 0, ny: 0, f: 1, no: 0, out: 0b1111111111111111, zr: 0, ng: 1},
  {x: 0b0000000000000000, y: 0b1111111111111111, zx: 0, nx: 1, zy: 0, ny: 0, f: 1, no: 1, out: 0b0000000000000001, zr: 0, ng: 0},
  {x: 0b0000000000000000, y: 0b1111111111111111, zx: 0, nx: 0, zy: 0, ny: 1, f: 1, no: 1, out: 0b1111111111111111, zr: 0, ng: 1},
  {x: 0b0000000000000000, y: 0b1111111111111111, zx: 0, nx: 0, zy: 0, ny: 0, f: 0, no: 0, out: 0b0000000000000000, zr: 1, ng: 0},
  {x: 0b0000000000000000, y: 0b1111111111111111, zx: 0, nx: 1, zy: 0, ny: 1, f: 0, no: 1, out: 0b1111111111111111, zr: 0, ng: 1},
  {x: 0b0000000000010001, y: 0b0000000000000011, zx: 1, nx: 0, zy: 1, ny: 0, f: 1, no: 0, out: 0b0000000000000000, zr: 1, ng: 0},
  {x: 0b0000000000010001, y: 0b0000000000000011, zx: 1, nx: 1, zy: 1, ny: 1, f: 1, no: 1, out: 0b0000000000000001, zr: 0, ng: 0},
  {x: 0b0000000000010001, y: 0b0000000000000011, zx: 1, nx: 1, zy: 1, ny: 0, f: 1, no: 0, out: 0b1111111111111111, zr: 0, ng: 1},
  {x: 0b0000000000010001, y: 0b0000000000000011, zx: 0, nx: 0, zy: 1, ny: 1, f: 0, no: 0, out: 0b0000000000010001, zr: 0, ng: 0},
  {x: 0b0000000000010001, y: 0b0000000000000011, zx: 1, nx: 1, zy: 0, ny: 0, f: 0, no: 0, out: 0b0000000000000011, zr: 0, ng: 0},
  {x: 0b0000000000010001, y: 0b0000000000000011, zx: 0, nx: 0, zy: 1, ny: 1, f: 0, no: 1, out: 0b1111111111101110, zr: 0, ng: 1},
  {x: 0b0000000000010001, y: 0b0000000000000011, zx: 1, nx: 1, zy: 0, ny: 0, f: 0, no: 1, out: 0b1111111111111100, zr: 0, ng: 1},
  {x: 0b0000000000010001, y: 0b0000000000000011, zx: 0, nx: 0, zy: 1, ny: 1, f: 1, no: 1, out: 0b1111111111101111, zr: 0, ng: 1},
  {x: 0b0000000000010001, y: 0b0000000000000011, zx: 1, nx: 1, zy: 0, ny: 0, f: 1, no: 1, out: 0b1111111111111101, zr: 0, ng: 1},
  {x: 0b0000000000010001, y: 0b0000000000000011, zx: 0, nx: 1, zy: 1, ny: 1, f: 1, no: 1, out: 0b0000000000010010, zr: 0, ng: 0},
  {x: 0b0000000000010001, y: 0b0000000000000011, zx: 1, nx: 1, zy: 0, ny: 1, f: 1, no: 1, out: 0b0000000000000100, zr: 0, ng: 0},
  {x: 0b0000000000010001, y: 0b0000000000000011, zx: 0, nx: 0, zy: 1, ny: 1, f: 1, no: 0, out: 0b0000000000010000, zr: 0, ng: 0},
  {x: 0b0000000000010001, y: 0b0000000000000011, zx: 1, nx: 1, zy: 0, ny: 0, f: 1, no: 0, out: 0b0000000000000010, zr: 0, ng: 0},
  {x: 0b0000000000010001, y: 0b0000000000000011, zx: 0, nx: 0, zy: 0, ny: 0, f: 1, no: 0, out: 0b0000000000010100, zr: 0, ng: 0},
  {x: 0b0000000000010001, y: 0b0000000000000011, zx: 0, nx: 1, zy: 0, ny: 0, f: 1, no: 1, out: 0b0000000000001110, zr: 0, ng: 0},
  {x: 0b0000000000010001, y: 0b0000000000000011, zx: 0, nx: 0, zy: 0, ny: 1, f: 1, no: 1, out: 0b1111111111110010, zr: 0, ng: 1},
  {x: 0b0000000000010001, y: 0b0000000000000011, zx: 0, nx: 0, zy: 0, ny: 0, f: 0, no: 0, out: 0b0000000000000001, zr: 0, ng: 0},
  {x: 0b0000000000010001, y: 0b0000000000000011, zx: 0, nx: 1, zy: 0, ny: 1, f: 0, no: 1, out: 0b0000000000010011, zr: 0, ng: 0},
]);

/**
 * The ALU (Arithmetic Logic Unit).
 *
 * Computes one of the following functions:
 *
 * x+y, x-y, y-x, 0, 1, -1, x, y, -x, -y, !x, !y,
 * x+1, y+1, x-1, y-1, x&y, x|y on two 16-bit inputs,
 * according to 6 input bits denoted zx, nx, zy, ny, f, no.
 *
 * In addition, the ALU computes two 1-bit outputs:
 *
 * if the ALU output == 0, zr is set to 1; otherwise zr is set to 0;
 * if the ALU output < 0, ng is set to 1; otherwise ng is set to 0.
 *
 * Implementation: the ALU logic manipulates the x and y inputs
 * and operates on the resulting values, as follows:
 *
 * if (zx === 1) set x = 0        // 16-bit constant
 * if (nx === 1) set x = ~x       // bitwise not
 * if (zy === 1) set y = 0        // 16-bit constant
 * if (ny === 1) set y = ~y       // bitwise not
 * if (f === 1)  set out = x + y  // integer 2's complement addition
 * if (f === 0)  set out = x & y  // bitwise and
 * if (no === 1) set out = !out   // bitwise not
 * if (out === 0) set zr = 1
 * if (out < 0) set ng = 1
 */
class ALU extends BuiltInGate {
  /**
   * Evaluates ALU logic.
   */
  eval() {
    let x = this.getInputPins()[0].getValue();
    let y = this.getInputPins()[1].getValue();

    const zx = this.getInputPins()[2].getValue();
    const nx = this.getInputPins()[3].getValue();
    const zy = this.getInputPins()[4].getValue();
    const ny = this.getInputPins()[5].getValue();
    const f = this.getInputPins()[6].getValue();
    const no = this.getInputPins()[7].getValue();

    let out;

    if (zx === 1) {
      x = 0;
    }

    if (zy === 1) {
      y = 0;
    }

    if (nx === 1) {
      x = int16(~x);
    }

    if (ny === 1) {
      y = int16(~y);
    }

    if (f === 1) {
      out = int16(x + y);
    } else if (f === 0) {
      out = int16(x & y);
    }

    if (no === 1) {
      out = int16(~out);
    }

    this.getOutputPins()[0].setValue(out); // main out
    this.getOutputPins()[1].setValue(out === 0 ? 1 : 0); // zr
    this.getOutputPins()[2].setValue(out < 0 ? 1 : 0); // ng
  }
}

/**
 * Specification of the `ALU` gate.
 */
ALU.Spec = {
  name: 'ALU',

  description: `The ALU (Arithmetic Logic Unit).

Computes one of the following functions:

x+y, x-y, y-x, 0, 1, -1, x, y, -x, -y, !x, !y,
x+1, y+1, x-1, y-1, x&y, x|y on two 16-bit inputs,
according to 6 input bits denoted zx, nx, zy, ny, f, no.

In addition, the ALU computes two 1-bit outputs:

if the ALU output == 0, zr is set to 1; otherwise zr is set to 0;
if the ALU output < 0, ng is set to 1; otherwise ng is set to 0.
`,

  inputPins: [
    // Main inputs.
    {name: 'x', size: 16},
    {name: 'y', size: 16},

    // Should zero `x`?
    {name: 'zx', size: 1},

    // Should negate `x`?
    {name: 'nx', size: 1},

    // Should zero `y`?
    {name: 'zy', size: 1},

    // Should negate `y`?
    {name: 'ny', size: 1},

    // Opcode: 1 - And, 0 - Add.
    {name: 'f', size: 1},

    // Should negate `out`?
    {name: 'no', size: 1},
  ],

  outputPins: [
    {name: 'out', size: 16},

    // Is result zero?
    {name: 'zr', size: 1},

    // Is result negative?
    {name: 'ng', size: 1},
  ],

  truthTable: TRUTH_TABLE,
};

module.exports = ALU;
