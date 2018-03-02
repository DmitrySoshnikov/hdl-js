/**
 * The MIT License (MIT)
 * Copyright (c) 2017-present Dmitry Soshnikov <dmitry.soshnikov@gmail.com>
 */

'use strict';

const BuiltInGate = require('../BuiltInGate');

const {int16Table} = require('../../../util/numbers');

/**
 * Canonical truth table for the `DMux8Way` gate.
 */
const TRUTH_TABLE = int16Table([
  {in: 0, sel: 0b000, a: 0, b: 0, c: 0, d: 0, e: 0, f: 0, g: 0, h: 0},
  {in: 0, sel: 0b001, a: 0, b: 0, c: 0, d: 0, e: 0, f: 0, g: 0, h: 0},
  {in: 0, sel: 0b010, a: 0, b: 0, c: 0, d: 0, e: 0, f: 0, g: 0, h: 0},
  {in: 0, sel: 0b011, a: 0, b: 0, c: 0, d: 0, e: 0, f: 0, g: 0, h: 0},
  {in: 0, sel: 0b100, a: 0, b: 0, c: 0, d: 0, e: 0, f: 0, g: 0, h: 0},
  {in: 0, sel: 0b101, a: 0, b: 0, c: 0, d: 0, e: 0, f: 0, g: 0, h: 0},
  {in: 0, sel: 0b110, a: 0, b: 0, c: 0, d: 0, e: 0, f: 0, g: 0, h: 0},
  {in: 0, sel: 0b111, a: 0, b: 0, c: 0, d: 0, e: 0, f: 0, g: 0, h: 0},
  {in: 1, sel: 0b000, a: 1, b: 0, c: 0, d: 0, e: 0, f: 0, g: 0, h: 0},
  {in: 1, sel: 0b001, a: 0, b: 1, c: 0, d: 0, e: 0, f: 0, g: 0, h: 0},
  {in: 1, sel: 0b010, a: 0, b: 0, c: 1, d: 0, e: 0, f: 0, g: 0, h: 0},
  {in: 1, sel: 0b011, a: 0, b: 0, c: 0, d: 1, e: 0, f: 0, g: 0, h: 0},
  {in: 1, sel: 0b100, a: 0, b: 0, c: 0, d: 0, e: 1, f: 0, g: 0, h: 0},
  {in: 1, sel: 0b101, a: 0, b: 0, c: 0, d: 0, e: 0, f: 1, g: 0, h: 0},
  {in: 1, sel: 0b110, a: 0, b: 0, c: 0, d: 0, e: 0, f: 0, g: 1, h: 0},
  {in: 1, sel: 0b111, a: 0, b: 0, c: 0, d: 0, e: 0, f: 0, g: 0, h: 1},
]);

/**
 * 1 bit 8-way demultiplexor.
 *
 * The 3-bit sel choose to which output to channel the input (0->a .. 7->h).
 * The other outputs are set to 0.
 *
 * {a, b, c, d, e, f, g, h} = {in, 0, 0, 0, 0, 0, 0, 0} if sel == 000
 *                            {0, in, 0, 0, 0, 0, 0, 0} if sel == 001
 *                            ...
 *                            {0, 0, 0, 0, 0, 0, 0, in} if sel == 111
 */
class DMux8Way extends BuiltInGate {
  /**
   * IN in, sel[3];
   * OUT a, b, c, d, e, f, g, h;
   *
   * Abstract:
   *
   * DMux(in=in, sel=sel[2], a=abcd, b=efgh);
   * DMux4Way(in=abcd, sel=sel[0..1], a=a, b=b, c=c, d=d);
   * DMux4Way(in=efgh, sel=sel[0..1], a=e, b=f, c=g, d=h);
   */
  eval() {
    const _in = this.getInputPins()[0].getValue();
    const sel = this.getInputPins()[1].getValue();

    this.getOutputPins()[0].setValue(sel === 0b000 ? _in : 0);
    this.getOutputPins()[1].setValue(sel === 0b001 ? _in : 0);
    this.getOutputPins()[2].setValue(sel === 0b010 ? _in : 0);
    this.getOutputPins()[3].setValue(sel === 0b011 ? _in : 0);
    this.getOutputPins()[4].setValue(sel === 0b100 ? _in : 0);
    this.getOutputPins()[5].setValue(sel === 0b101 ? _in : 0);
    this.getOutputPins()[6].setValue(sel === 0b110 ? _in : 0);
    this.getOutputPins()[7].setValue(sel === 0b111 ? _in : 0);
  }
}

/**
 * Specification of the `DMux8Way` gate.
 */
DMux8Way.Spec = {
  name: 'DMux8Way',

  description: [
    '1 bit 8-way demultiplexor.',
    '',
    'The 3-bit sel choose to which output to channel the input (0->a .. 7->h).',
    'The other outputs are set to 0.'
  ].join('\n'),

  inputPins: [
    'in',
    {name: 'sel', size: 3},
  ],

  outputPins: ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'],

  truthTable: TRUTH_TABLE,
};

module.exports = DMux8Way;