/**
 * The MIT License (MIT)
 * Copyright (c) 2017-present Dmitry Soshnikov <dmitry.soshnikov@gmail.com>
 */

'use strict';

const BuiltInGate = require('../BuiltInGate');

/**
 * A bitwise 16-bit Not gate.
 */
class Not16 extends BuiltInGate {
  /**
   * IN a[16];
   * OUT out[16];
   *
   * for i = 0..15: out[i] = ~a[i]
   *
   * Abstract:
   *
   *   Not(a=a[0], out=out[0]);
   *   Not(a=a[1], out=out[1]);
   *   ...
   *
   * Technically use JS bitwise operations at needed index.
   *
   * The input and output are stored as PinBus instances.
   */
  eval() {
    const a = this.getInputPins()[0].getValue();

    // JS ~ operator applies bitwise Not for all bits:
    this.getOutputPins()[0].setValue(~a);
  }
}

module.exports = Not16;