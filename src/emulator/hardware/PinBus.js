/**
 * The MIT License (MIT)
 * Copyright (c) 2017-present Dmitry Soshnikov <dmitry.soshnikov@gmail.com>
 */

'use strict';

const Pin = require('./Pin');

/**
 * Represents a pin bus (set of pins) in a gate.
 *
 * Encoded as a simple number with bitwise operations for needed bits.
 */
class PinBus extends Pin {
  constructor({name, size, value = null}) {
    super({name, value});

    if (!size) {
      throw new TypeError(`PinBus "${name}": "size" argument is required.`);
    }

    this._size = size;
  }

  /**
   * Returns size of this bus.
   */
  getSize() {
    return this._size;
  }

  /**
   * Updates the value of a particular bit in this bus.
   */
  setValueAt(index, value) {
    this._checkIndex(index);

    // Set 1.
    if (value === 1) {
      this._value |= (1 << index);
      return;
    }

    // Set 0 ("clear").
    this._value &= ~(1 << index);
  }

  /**
   * Returns the value of a particular bit of this bus.
   */
  getValueAt(index) {
    this._checkIndex(index);
    return (this._value >> index) & 1;
  }

  /**
   * Returns slice (sub-bus) of this bus.
   */
  getSlice(from, to) {
    this._checkIndex(from);
    this._checkIndex(to);
    return (this._value >> from) & ((1 << (to + 1 - from)) - 1);
  }

  /**
   * Checks the bounds of the index.
   */
  _checkIndex(index) {
    if (index < 0 || index > this._size - 1) {
      throw new TypeError(
        `PinBus "${this.getName()}": out of bounds index ${index}, ` +
        `while the size is ${this._size}.`
      );
    }
  }
}

module.exports = PinBus;