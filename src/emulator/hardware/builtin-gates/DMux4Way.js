/**
 * The MIT License (MIT)
 * Copyright (c) 2017-present Dmitry Soshnikov <dmitry.soshnikov@gmail.com>
 */

'use strict';

const BuiltInGate = require('../BuiltInGate');

const {int16Table} = require('../../../util/numbers');

/**
 * Canonical truth table for the `DMux4Way` gate.
 */
const TRUTH_TABLE = int16Table([
  {in: 0, sel: 0b00, a: 0, b: 0, c: 0, d: 0},
  {in: 0, sel: 0b01, a: 0, b: 0, c: 0, d: 0},
  {in: 0, sel: 0b10, a: 0, b: 0, c: 0, d: 0},
  {in: 0, sel: 0b11, a: 0, b: 0, c: 0, d: 0},
  {in: 1, sel: 0b00, a: 1, b: 0, c: 0, d: 0},
  {in: 1, sel: 0b01, a: 0, b: 1, c: 0, d: 0},
  {in: 1, sel: 0b10, a: 0, b: 0, c: 1, d: 0},
  {in: 1, sel: 0b11, a: 0, b: 0, c: 0, d: 1},
]);

/**
 * 1 bit 4-way demultiplexor.
 *
 * The 2-bit sel choose to which output to channel the input (0->a .. 3->d).
 * The other outputs are set to 0.
 *
 * {a, b, c, d} = {in, 0, 0, 0} if sel == 00
 *                {0, in, 0, 0} if sel == 01
 *                {0, 0, in, 0} if sel == 10
 *                {0, 0, 0, in} if sel == 11
 *
 * Abstract:
 *
 *   IN in, sel[2];
 *   OUT a, b, c, d;
 *
 *   PARTS:
 *
 *   DMux(in=in, sel=sel[1], a=ab, b=cd);
 *   DMux(in=ab, sel=sel[0], a=a, b=b);
 *   DMux(in=cd, sel=sel[0], a=c, b=d);
 */
class DMux4Way extends BuiltInGate {
  eval() {
    const _in = this.getInputPins()[0].getValue();
    const sel = this.getInputPins()[1].getValue();

    this.getOutputPins()[0].setValue(sel === 0 ? _in : 0);
    this.getOutputPins()[1].setValue(sel === 1 ? _in : 0);
    this.getOutputPins()[2].setValue(sel === 2 ? _in : 0);
    this.getOutputPins()[3].setValue(sel === 3 ? _in : 0);
  }
}

/**
 * Specification of the `DMux4Way` gate.
 */
DMux4Way.Spec = {
  name: 'DMux4Way',

  description: [
    '1 bit 4-way demultiplexor.',
    '',
    'The 2-bit sel choose to which output to channel the input (0->a .. 3->d).',
    'The other outputs are set to 0.',
  ].join('\n'),

  inputPins: [
    'in',
    {name: 'sel', size: 2},
  ],

  outputPins: ['a', 'b', 'c', 'd'],

  truthTable: TRUTH_TABLE,
};

module.exports = DMux4Way;