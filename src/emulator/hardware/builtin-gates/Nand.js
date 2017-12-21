/**
 * The MIT License (MIT)
 * Copyright (c) 2017-present Dmitry Soshnikov <dmitry.soshnikov@gmail.com>
 */

'use strict';

const BuiltInGate = require('../BuiltInGate');

/**
 * Canonical truth table for the `Nand` gate.
 */
const TRUTH_TABLE = [
  {a: 0, b: 0, out: 1},
  {a: 0, b: 1, out: 1},
  {a: 1, b: 0, out: 1},
  {a: 1, b: 1, out: 0},
];

/**
 * A bitwise 1-bit Nand (negative-And) gate.
 */
class Nand extends BuiltInGate {
  /**
   * Nand is the very basic chip on top of which any other chip can
   * be built: https://en.wikipedia.org/wiki/NAND_gate.
   *
   * In the internal implementation we build it on top of the `&` operation.
   */
  eval() {
    const a = this.getInputPins()[0].getValue();
    const b = this.getInputPins()[1].getValue();

    this.getOutputPins()[0].setValue(0x1 - (a & b));
  }
}

/**
 * Specification of the `And` gate.
 */
Nand.Spec = {
  inputPins: ['a', 'b'],
  outputPins: ['out'],
  truthTable: TRUTH_TABLE,
};

module.exports = Nand;