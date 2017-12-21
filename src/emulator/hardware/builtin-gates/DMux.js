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
  {a: 0, sel: 0, out1: 0, out2: 0},
  {a: 0, sel: 1, out1: 0, out2: 0},
  {a: 1, sel: 0, out1: 1, out2: 0},
  {a: 1, sel: 1, out1: 0, out2: 1},
];

/**
 * 1 bit demultiplexer.
 * if sel=0 {out1=a; out2=0} else {out1=0; out2=a}
 */
class DMux extends BuiltInGate {
  eval() {
    const a = this.getInputPins()[0].getValue();
    const sel = this.getInputPins()[1].getValue();

    this.getOutputPins()[0].setValue(sel === 0 ? a : 0);
    this.getOutputPins()[1].setValue(sel === 0 ? 0 : a);
  }
}

/**
 * Specification of the `DMux` gate.
 */
DMux.Spec = {
  inputPins: ['a', 'sel'],
  outputPins: ['out1', 'out2'],
  truthTable: TRUTH_TABLE,
};

module.exports = DMux;