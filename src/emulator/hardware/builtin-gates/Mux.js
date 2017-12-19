/**
 * The MIT License (MIT)
 * Copyright (c) 2017-present Dmitry Soshnikov <dmitry.soshnikov@gmail.com>
 */

'use strict';

const BuiltInGate = require('../BuiltInGate');

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

module.exports = Mux;