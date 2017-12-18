/**
 * The MIT License (MIT)
 * Copyright (c) 2017-present Dmitry Soshnikov <dmitry.soshnikov@gmail.com>
 */

'use strict';

const BuiltInGate = require('../BuiltInGate');

/**
 * A bitwise 1-bit Not gate.
 */
class Not extends BuiltInGate {
  /**
   * !a
   */
  eval() {
    const a = this.getInputPins()[0].getValue();
    this.getOutputPins()[0].setValue(+!a);
  }
}

module.exports = Not;