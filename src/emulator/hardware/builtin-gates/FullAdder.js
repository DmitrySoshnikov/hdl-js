/**
 * The MIT License (MIT)
 * Copyright (c) 2017-present Dmitry Soshnikov <dmitry.soshnikov@gmail.com>
 */

'use strict';

const BuiltInGate = require('../BuiltInGate');

/**
 * A FullAdder.
 * `sum` returns the LSB of the sum of the three bits a, b and c.
 * `carry` returns the carry bit.
 */
class FullAdder extends BuiltInGate {
  /**
   * t = a + b + c
   * sum = t % 2
   * carry = t / 2
   */
  eval() {
    const a = this.getInputPins()[0].getValue();
    const b = this.getInputPins()[1].getValue();
    const c = this.getInputPins()[2].getValue();

    const t = a + b + c;

    this.getOutputPins()[0].setValue(t % 2); // sum
    this.getOutputPins()[1].setValue(Math.trunc(t / 2)); // carry
  }
}

module.exports = FullAdder;