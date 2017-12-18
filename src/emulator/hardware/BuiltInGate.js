/**
 * The MIT License (MIT)
 * Copyright (c) 2017-present Dmitry Soshnikov <dmitry.soshnikov@gmail.com>
 */

const Gate = require('./Gate');

/**
 * Base class for all builtin gates.
 */
class BuiltInGate extends Gate {
  /**
   * Evaluates this gate.
   */
  eval() {
    // Noop.
    return;
  }
}

module.exports = BuiltInGate;