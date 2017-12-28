/**
 * The MIT License (MIT)
 * Copyright (c) 2017-present Dmitry Soshnikov <dmitry.soshnikov@gmail.com>
 */

'use strict';

const BuiltInGate = require('./BuiltInGate');
const BuiltInGates = require('./builtin-gates');
const CompositeGate = require('./CompositeGate');
const Gate = require('./Gate');
const Pin = require('./Pin');

/**
 * Simulates hardware chips (gates) evaluation.
 */
const HardwareEmulator = {
  /**
   * Expose `Gate` class.
   */
  Gate,

  /**
   * Expose `Pin` class.
   */
  Pin,

  /**
   * Expose `BuiltInGate` class.
   */
  BuiltInGate,

  /**
   * Expose `CompositeGate` class.
   */
  CompositeGate,

  /**
   * Expose a map of all built-in gates.
   */
  BuiltInGates,
};

module.exports = HardwareEmulator;