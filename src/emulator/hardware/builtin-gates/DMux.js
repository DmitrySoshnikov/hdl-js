/**
 * The MIT License (MIT)
 * Copyright (c) 2017-present Dmitry Soshnikov <dmitry.soshnikov@gmail.com>
 */

'use strict';

const BuiltInGate = require('../BuiltInGate');

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

module.exports = DMux;