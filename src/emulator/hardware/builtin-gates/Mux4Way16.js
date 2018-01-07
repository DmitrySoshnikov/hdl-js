/**
 * The MIT License (MIT)
 * Copyright (c) 2017-present Dmitry Soshnikov <dmitry.soshnikov@gmail.com>
 */

'use strict';

const BuiltInGate = require('../BuiltInGate');

const {int16Table} = require('../../../util/typed-numbers');

/**
 * Canonical truth table for the `Mux4Way16` gate.
 */
const TRUTH_TABLE = int16Table([
  {a: 0b0000000000000000, b: 0b0000000000000000, c: 0b0000000000000000, d: 0b0000000000000000, sel: 0b00, out: 0b0000000000000000},
  {a: 0b0000000000000000, b: 0b0000000000000000, c: 0b0000000000000000, d: 0b0000000000000000, sel: 0b01, out: 0b0000000000000000},
  {a: 0b0000000000000000, b: 0b0000000000000000, c: 0b0000000000000000, d: 0b0000000000000000, sel: 0b10, out: 0b0000000000000000},
  {a: 0b0000000000000000, b: 0b0000000000000000, c: 0b0000000000000000, d: 0b0000000000000000, sel: 0b11, out: 0b0000000000000000},
  {a: 0b0001001000110100, b: 0b1001100001110110, c: 0b1010101010101010, d: 0b0101010101010101, sel: 0b00, out: 0b0001001000110100},
  {a: 0b0001001000110100, b: 0b1001100001110110, c: 0b1010101010101010, d: 0b0101010101010101, sel: 0b01, out: 0b1001100001110110},
  {a: 0b0001001000110100, b: 0b1001100001110110, c: 0b1010101010101010, d: 0b0101010101010101, sel: 0b10, out: 0b1010101010101010},
  {a: 0b0001001000110100, b: 0b1001100001110110, c: 0b1010101010101010, d: 0b0101010101010101, sel: 0b11, out: 0b0101010101010101},
]);

/**
 * 4-way 16-bit multiplexor.
 * The two sel[0..1] bits select the output to be one of the four input buses:
 * (0->a ... 3->d).
 */
class Mux4Way16 extends BuiltInGate {
  /**
   * IN a[16], b[16], c[16], d[16], sel[2];
   * OUT out[16];
   *
   * Abstract:
   *
   *   Mux16(a=a, b=b, sel=sel[0], out=ab);
   *   Mux16(a=c, b=d, sel=sel[0], out=cd);
   *   Mux16(a=ab, b=cd, sel=sel[1], out=out);
   */
  eval() {
    const a = this.getInputPins()[0].getValue();
    const b = this.getInputPins()[1].getValue();
    const c = this.getInputPins()[2].getValue();
    const d = this.getInputPins()[3].getValue();

    const sel = this.getInputPins()[4].getValue();

    let out = 0;

    switch (sel) {
      case 0b00: out = a; break;
      case 0b01: out = b; break;
      case 0b10: out = c; break;
      case 0b11: out = d; break;
    }

    this.getOutputPins()[0].setValue(out);
  }
}

/**
 * Specification of the `Mux4Way16` gate.
 */
Mux4Way16.Spec = {
  description: [
    '4-way 16-bit multiplexor gate.',
    '',
    'The two sel[0..1] bits select the output to be one ',
    'of the four input buses: (0->a ... 3->d).',
  ].join('\n'),

  inputPins: [
    // Data pins.
    {name: 'a', size: 16},
    {name: 'b', size: 16},
    {name: 'c', size: 16},
    {name: 'd', size: 16},

    // Selector.
    {name: 'sel', size: 2},
  ],

  outputPins: [
    {name: 'out', size: 16},
  ],

  truthTable: TRUTH_TABLE,
};

module.exports = Mux4Way16;