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
    super({name, value: new Int16Array([value])});

    // Call explicitly `setValue` to handle bit-strings.
    if (value) {
      this.setValue(value);
    }

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
   * Override `setValue` to handle both, bit-strings: '0000000000000000'
   * raw binary numbers: 0b0000000000000000.
   */
  setValue(value) {
    if (typeof value === 'string') {
      value = Number.parseInt(value, 2);
    }
    this._value[0] = value;
  }

  /**
   * Returns value of this pin bus.
   */
  getValue() {
    return this._value[0];
  }

  /**
   * Updates the value of a particular bit in this bus.
   */
  setValueAt(index, value) {
    this._checkIndex(index);

    // Set 1.
    if (value === 1) {
      this._value[0] |= (1 << index);
      return;
    }

    // Set 0 ("clear").
    this._value[0] &= ~(1 << index);
  }

  /**
   * Returns the value of a particular bit of this bus.
   */
  getValueAt(index) {
    this._checkIndex(index);
    return (this._value[0] >> index) & 1;
  }

  /**
   * Returns slice (sub-bus) of this bus.
   */
  getSlice(from, to) {
    this._checkIndex(from);
    this._checkIndex(to);
    return (this._value[0] >> from) & ((1 << (to + 1 - from)) - 1);
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