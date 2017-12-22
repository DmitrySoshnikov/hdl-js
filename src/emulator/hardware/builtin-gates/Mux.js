/**
 * The MIT License (MIT)
 * Copyright (c) 2017-present Dmitry Soshnikov <dmitry.soshnikov@gmail.com>
 */

'use strict';

const BuiltInGate = require('../BuiltInGate');

/**
 * Canonical truth table for the `Mux` gate.
 */
const TRUTH_TABLE = [
  {a: 0, b: 0, sel: 0, out: 0},
  {a: 0, b: 0, sel: 1, out: 0},
  {a: 0, b: 1, sel: 0, out: 0},
  {a: 0, b: 1, sel: 1, out: 1},
  {a: 1, b: 0, sel: 0, out: 1},
  {a: 1, b: 0, sel: 1, out: 0},
  {a: 1, b: 1, sel: 0, out: 1},
  {a: 1, b: 1, sel: 1, out: 1},
];

/**
 * 1-bit 2-way multiplexor.
 * if sel=1 out=b else out=a.
 */
class Mux extends BuiltInGate {
  eval() {
    const a = this.getInputPins()[0].getValue();
    const b = this.getInputPins()[1].getValue();

    const sel = this.getInputPins()[2].getValue();

    this.getOutputPins()[0].setValue(sel === 0 ? a : b);
  }
}

/**
 * Specification of the `Mux` gate.
 */
Mux.Spec = {
  description: [
    'Implements 1-bit 2-way multiplexor (Mux) gate.',
    '',
    'out = a, when sel = 0',
    'out = b, when sel = 1',
  ].join('\n'),

  inputPins: ['a', 'b', 'sel'],
  outputPins: ['out'],

  truthTable: TRUTH_TABLE,
};

module.exports = Mux;