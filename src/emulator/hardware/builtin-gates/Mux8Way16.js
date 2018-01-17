/**
 * The MIT License (MIT)
 * Copyright (c) 2017-present Dmitry Soshnikov <dmitry.soshnikov@gmail.com>
 */

'use strict';

const BuiltInGate = require('../BuiltInGate');

const {int16Table} = require('../../../util/numbers');

/**
 * Canonical truth table for the `Mux8Way16` gate.
 */
const TRUTH_TABLE = int16Table([
  {a: 0b0000000000000000, b: 0b0000000000000000, c: 0b0000000000000000, d: 0b0000000000000000, e: 0b0000000000000000, f: 0b0000000000000000, g: 0b0000000000000000, h: 0b0000000000000000, sel: 0b000, out: 0b0000000000000000},
  {a: 0b0000000000000000, b: 0b0000000000000000, c: 0b0000000000000000, d: 0b0000000000000000, e: 0b0000000000000000, f: 0b0000000000000000, g: 0b0000000000000000, h: 0b0000000000000000, sel: 0b001, out: 0b0000000000000000},
  {a: 0b0000000000000000, b: 0b0000000000000000, c: 0b0000000000000000, d: 0b0000000000000000, e: 0b0000000000000000, f: 0b0000000000000000, g: 0b0000000000000000, h: 0b0000000000000000, sel: 0b010, out: 0b0000000000000000},
  {a: 0b0000000000000000, b: 0b0000000000000000, c: 0b0000000000000000, d: 0b0000000000000000, e: 0b0000000000000000, f: 0b0000000000000000, g: 0b0000000000000000, h: 0b0000000000000000, sel: 0b011, out: 0b0000000000000000},
  {a: 0b0000000000000000, b: 0b0000000000000000, c: 0b0000000000000000, d: 0b0000000000000000, e: 0b0000000000000000, f: 0b0000000000000000, g: 0b0000000000000000, h: 0b0000000000000000, sel: 0b100, out: 0b0000000000000000},
  {a: 0b0000000000000000, b: 0b0000000000000000, c: 0b0000000000000000, d: 0b0000000000000000, e: 0b0000000000000000, f: 0b0000000000000000, g: 0b0000000000000000, h: 0b0000000000000000, sel: 0b101, out: 0b0000000000000000},
  {a: 0b0000000000000000, b: 0b0000000000000000, c: 0b0000000000000000, d: 0b0000000000000000, e: 0b0000000000000000, f: 0b0000000000000000, g: 0b0000000000000000, h: 0b0000000000000000, sel: 0b110, out: 0b0000000000000000},
  {a: 0b0000000000000000, b: 0b0000000000000000, c: 0b0000000000000000, d: 0b0000000000000000, e: 0b0000000000000000, f: 0b0000000000000000, g: 0b0000000000000000, h: 0b0000000000000000, sel: 0b111, out: 0b0000000000000000},
  {a: 0b0001001000110100, b: 0b0010001101000101, c: 0b0011010001010110, d: 0b0100010101100111, e: 0b0101011001111000, f: 0b0110011110001001, g: 0b0111100010011010, h: 0b1000100110101011, sel: 0b000, out: 0b0001001000110100},
  {a: 0b0001001000110100, b: 0b0010001101000101, c: 0b0011010001010110, d: 0b0100010101100111, e: 0b0101011001111000, f: 0b0110011110001001, g: 0b0111100010011010, h: 0b1000100110101011, sel: 0b001, out: 0b0010001101000101},
  {a: 0b0001001000110100, b: 0b0010001101000101, c: 0b0011010001010110, d: 0b0100010101100111, e: 0b0101011001111000, f: 0b0110011110001001, g: 0b0111100010011010, h: 0b1000100110101011, sel: 0b010, out: 0b0011010001010110},
  {a: 0b0001001000110100, b: 0b0010001101000101, c: 0b0011010001010110, d: 0b0100010101100111, e: 0b0101011001111000, f: 0b0110011110001001, g: 0b0111100010011010, h: 0b1000100110101011, sel: 0b011, out: 0b0100010101100111},
  {a: 0b0001001000110100, b: 0b0010001101000101, c: 0b0011010001010110, d: 0b0100010101100111, e: 0b0101011001111000, f: 0b0110011110001001, g: 0b0111100010011010, h: 0b1000100110101011, sel: 0b100, out: 0b0101011001111000},
  {a: 0b0001001000110100, b: 0b0010001101000101, c: 0b0011010001010110, d: 0b0100010101100111, e: 0b0101011001111000, f: 0b0110011110001001, g: 0b0111100010011010, h: 0b1000100110101011, sel: 0b101, out: 0b0110011110001001},
  {a: 0b0001001000110100, b: 0b0010001101000101, c: 0b0011010001010110, d: 0b0100010101100111, e: 0b0101011001111000, f: 0b0110011110001001, g: 0b0111100010011010, h: 0b1000100110101011, sel: 0b110, out: 0b0111100010011010},
  {a: 0b0001001000110100, b: 0b0010001101000101, c: 0b0011010001010110, d: 0b0100010101100111, e: 0b0101011001111000, f: 0b0110011110001001, g: 0b0111100010011010, h: 0b1000100110101011, sel: 0b111, out: 0b1000100110101011},
]);

/**
 * 8-way 16-bit multiplexor.
 *
 * The three sel[0..2] bits select the output to be one of the eight input buses
 * (0->a ... 7->h).
 *
 * out = a if sel == 000
 *       b if sel == 001
 *       ...
 *       h if sel == 111
 */
class Mux8Way16 extends BuiltInGate {
  /**
   * IN a[16], b[16], c[16], d[16],
   *    e[16], f[16], g[16], h[16],
   *    sel[3];
   *
   * OUT out[16];
   *
   * Abstract:
   *
   *   Mux4Way16(a=a, b=b, c=c, d=d, sel=sel[0..1], out=abcd);
   *   Mux4Way16(a=e, b=f, c=g, d=h, sel=sel[0..1], out=efgh);
   *   Mux16(a=abcd, b=efgh, sel=sel[2], out=out);
   */
  eval() {
    const a = this.getInputPins()[0].getValue();
    const b = this.getInputPins()[1].getValue();
    const c = this.getInputPins()[2].getValue();
    const d = this.getInputPins()[3].getValue();
    const e = this.getInputPins()[4].getValue();
    const f = this.getInputPins()[5].getValue();
    const g = this.getInputPins()[6].getValue();
    const h = this.getInputPins()[7].getValue();

    const sel = this.getInputPins()[8].getValue();

    let out = 0;

    switch (sel) {
      case 0b000: out = a; break;
      case 0b001: out = b; break;
      case 0b010: out = c; break;
      case 0b011: out = d; break;
      case 0b100: out = e; break;
      case 0b101: out = f; break;
      case 0b110: out = g; break;
      case 0b111: out = h; break;
    }

    this.getOutputPins()[0].setValue(out);
  }
}

/**
 * Specification of the `Mux8Way16` gate.
 */
Mux8Way16.Spec = {
  description: [
    '8-way 16-bit multiplexor.',
    '',
    'The three sel[0..2] bits select the output to be one ',
    'of the eight input buses: (0->a ... 7->h).',
  ].join('\n'),

  inputPins: [
    // Data pins.
    {name: 'a', size: 16},
    {name: 'b', size: 16},
    {name: 'c', size: 16},
    {name: 'd', size: 16},
    {name: 'e', size: 16},
    {name: 'f', size: 16},
    {name: 'g', size: 16},
    {name: 'h', size: 16},

    // Selector.
    {name: 'sel', size: 3},
  ],

  outputPins: [
    {name: 'out', size: 16},
  ],

  truthTable: TRUTH_TABLE,
};

module.exports = Mux8Way16;