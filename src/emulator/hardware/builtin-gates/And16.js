/**
 * The MIT License (MIT)
 * Copyright (c) 2017-present Dmitry Soshnikov <dmitry.soshnikov@gmail.com>
 */

'use strict';

const BuiltInGate = require('../BuiltInGate');

/**
 * A bitwise 16-bit And gate.
 */
class And16 extends BuiltInGate {
  /**
   * IN a[16], b[16];
   * OUT out[16];
   *
   * for i = 0..15: out[i] = (a[i] and b[i])
   *
   * Abstract:
   *
   *   And(a=a[0], b=b[0], out=out[0]);
   *   And(a=a[1], b=b[1], out=out[1]);
   *   ...
   *
   * Technically use JS bitwise operations at needed index.
   *
   * The inputs and output are stored as PinBus instances.
   */
  eval() {
    const a = this.getInputPins()[0].getValue();
    const b = this.getInputPins()[1].getValue();

    // In JS implemenation doesn't differ from the simple `And` gate.
    this.getOutputPins()[0].setValue(a & b);
  }
}

module.exports = And16;