/**
 * The MIT License (MIT)
 * Copyright (c) 2017-present Dmitry Soshnikov <dmitry.soshnikov@gmail.com>
 */

'use strict';

/**
 * Represents a pin (node) in a gate.
 */
class Pin {
  constructor({name, value = null}) {
    this._name = name;
    this._value = value;
  }

  /**
   * Returns the name of this pin.
   */
  getName() {
    return this._name;
  }

  /**
   * Returns the value.
   */
  getValue() {
    return this._value;
  }

  /**
   * Udates the value of this pin.
   */
  setValue(value) {
    return this._value = value;
  }

  /**
   * Builds a full name of a pin or pin bus:
   *
   * 'a' -> 'a'
   * {name: 'a'} -> 'a'
   * {name: 'a', size: 16} -> 'a[16]'
   */
  static toFullName(name) {
    // Simple string name from Spec.
    if (typeof name === 'string') {
      return name;
    }

    // PinBus.
    if (name.name && name.size) {
      return `${name.name}[${name.size}]`;
    }

    // Simple name from AST.
    return name.name;
  }
}

module.exports = Pin;