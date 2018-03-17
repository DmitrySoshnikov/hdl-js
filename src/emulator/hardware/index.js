/**
 * The MIT License (MIT)
 * Copyright (c) 2017-present Dmitry Soshnikov <dmitry.soshnikov@gmail.com>
 */

'use strict';

const BuiltInGate = require('./BuiltInGate');
const BuiltInGates = require('./builtin-gates');
const Clock = require('./Clock');
const CompositeGate = require('./CompositeGate');
const Gate = require('./Gate');
const HDLClassFactory = require('./HDLClassFactory');
const Pin = require('./Pin');
const ScriptInterpreter = require('./scripting/ScriptInterpreter');

/**
 * Simulates hardware chips (gates) evaluation.
 */
const HardwareEmulator = {
  /**
   * Expose `Clock` class.
   */
  Clock,

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
   * Expose `HDLClassFactory` object.
   */
  HDLClassFactory,

  /**
   * Expose a map of all built-in gates.
   */
  BuiltInGates,

  /**
   * Script interpreter module.
   */
  ScriptInterpreter,
};

module.exports = HardwareEmulator;
