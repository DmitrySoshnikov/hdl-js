/**
 * The MIT License (MIT)
 * Copyright (c) 2017-present Dmitry Soshnikov <dmitry.soshnikov@gmail.com>
 */

'use strict';

const Gate = require('./Gate');
const BuiltInGate = require('./BuiltInGate');
const CompositeGate = require('./CompositeGate');

/**
 * Simulates hardware chips (gates) evaluation.
 */
const HardwareEmulator = {
  /**
   * Expose `Gate` class.
   */
  Gate,

  /**
   * Expose `BuiltInGate` class.
   */
  BuiltInGate,

  /**
   * Expose `CompositeGate` class.
   */
  CompositeGate,
};

module.exports = HardwareEmulator;