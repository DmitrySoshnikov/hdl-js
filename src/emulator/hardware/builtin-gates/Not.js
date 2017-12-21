/**
 * The MIT License (MIT)
 * Copyright (c) 2017-present Dmitry Soshnikov <dmitry.soshnikov@gmail.com>
 */

'use strict';

const BuiltInGate = require('../BuiltInGate');

/**
 * Canonical truth table for the `Not` gate.
 */
const TRUTH_TABLE = [
  {in: 0, out: 1},
  {in: 1, out: 0},
];

/**
 * A bitwise 1-bit Not gate.
 */
class Not extends BuiltInGate {
  /**
   * ~in
   */
  eval() {
    const a = this.getInputPins()[0].getValue();
    this.getOutputPins()[0].setValue(1 - a);
  }
}

/**
 * Specification of the `Not` gate.
 */
Not.Spec = {
  inputPins: ['in'],
  outputPins: ['out'],
  truthTable: TRUTH_TABLE,
};

module.exports = Not;