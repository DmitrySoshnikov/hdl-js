/**
 * The MIT License (MIT)
 * Copyright (c) 2017-present Dmitry Soshnikov <dmitry.soshnikov@gmail.com>
 */

'use strict';

const BuiltInGate = require('../BuiltInGate');

/**
 * A bitwise 1-bit Nand (negative-And) gate.
 */
class Nand extends BuiltInGate {
  /**
   * Nand is the very basic chip on top of which any other chip can
   * be built: https://en.wikipedia.org/wiki/NAND_gate.
   *
   * In the internal implementation instead build in on
   * top of the `&` operation.
   */
  eval() {
    const a = this.getInputPins()[0].getValue();
    const b = this.getInputPins()[1].getValue();

    this.getOutputPins()[0].setValue(0x1 - (a & b));
  }
}

module.exports = Nand;