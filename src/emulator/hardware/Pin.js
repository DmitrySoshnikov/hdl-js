/**
 * The MIT License (MIT)
 * Copyright (c) 2017-present Dmitry Soshnikov <dmitry.soshnikov@gmail.com>
 */

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
}

module.exports = Pin;