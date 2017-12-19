/**
 * The MIT License (MIT)
 * Copyright (c) 2017-present Dmitry Soshnikov <dmitry.soshnikov@gmail.com>
 */

'use strict';

const BuiltInGate = require('../BuiltInGate');

/**
 * A HalfAdder.
 * `sum` returns the LSB of the sum of the two bits a and b.
 * `carry` returns the carry bit.
 */
class HalfAdder extends BuiltInGate {
  /**
   * sum = a ^ b
   * carry = a & b
   */
  eval() {
    const a = this.getInputPins()[0].getValue();
    const b = this.getInputPins()[1].getValue();

    this.getOutputPins()[0].setValue(a ^ b);
    this.getOutputPins()[1].setValue(a & b);
  }
}

module.exports = HalfAdder;