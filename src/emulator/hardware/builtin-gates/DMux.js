/**
 * The MIT License (MIT)
 * Copyright (c) 2017-present Dmitry Soshnikov <dmitry.soshnikov@gmail.com>
 */

'use strict';

const BuiltInGate = require('../BuiltInGate');

/**
 * Canonical truth table for the `DMux` gate.
 */
const TRUTH_TABLE = [
  {in: 0, sel: 0, a: 0, b: 0},
  {in: 0, sel: 1, a: 0, b: 0},
  {in: 1, sel: 0, a: 1, b: 0},
  {in: 1, sel: 1, a: 0, b: 1},
];

/**
 * 1 bit demultiplexer.
 * if sel=0 {out1=in; out2=0} else {out1=0; out2=in}
 */
class DMux extends BuiltInGate {
  eval() {
    const _in = this.getInputPins()[0].getValue();
    const sel = this.getInputPins()[1].getValue();

    this.getOutputPins()[0].setValue(sel === 0 ? _in : 0);
    this.getOutputPins()[1].setValue(sel === 0 ? 0 : _in);
  }
}

/**
 * Specification of the `DMux` gate.
 */
DMux.Spec = {
  name: 'DMux',

  description: [
    'Implements 1-bit demultiplexer (DMux) gate.',
    '',
    '{a = in, b = 0 }, when sel = 0',
    '{a = 0,  b = in}, when sel = 1',
  ].join('\n'),

  inputPins: ['in', 'sel'],
  outputPins: ['a', 'b'],

  truthTable: TRUTH_TABLE,
};

module.exports = DMux;
