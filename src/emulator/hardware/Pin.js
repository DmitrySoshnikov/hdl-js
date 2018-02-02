/**
 * The MIT License (MIT)
 * Copyright (c) 2017-present Dmitry Soshnikov <dmitry.soshnikov@gmail.com>
 */

'use strict';

const EventEmitter = require('events');

const {int16} = require('../../util/numbers');

/**
 * Maximum word size.
 */
const WORD_SIZE = 16;

/**
 * Represents a pin (node) in a gate.
 *
 * If `size` is 1 (default), it's a single pin ("wire"), otherwise,
 * it's a "bus" (set of pins/wires).
 *
 * Encoded as a simple number with bitwise operations for needed bits.
 *
 * Emits 'change' event on `setValue`.
 */
class Pin extends EventEmitter {
  constructor({name, size = 1, value = 0}) {
    super();

    this._name = name;

    if (size < 1 || size > WORD_SIZE) {
      throw new Error(
        `Invalid "size" for ${name} pin, should be ` +
        `in 1-${WORD_SIZE} range.`
      );
    }

    this._size = size;
    this.setValue(value);

    // There might be more than 11 pins (default in Node).
    this.setMaxListeners(Infinity);
  }

  /**
   * Returns name of this pin.
   */
  getName() {
    return this._name;
  }

  /**
   * Returns size of this bus.
   */
  getSize() {
    return this._size;
  }

  /**
   * Sets the value for this pin/bus.
   */
  setValue(value) {
    const oldValue = this._value;
    if (typeof value === 'string') {
      value = Number.parseInt(value, 2);
    }
    this._value = int16(value);
    this.emit('change', this._value, oldValue);
  }

  /**
   * Returns value of this pin bus.
   */
  getValue() {
    return this._value;
  }

  /**
   * Updates the value of a particular bit in this bus.
   */
  setValueAt(index, value) {
    this._checkIndex(index);
    const oldValue = this._value;

    // Set 1.
    if (value === 1) {
      this._value |= (1 << index);
    } else {
      // Set 0 ("clear").
      this._value &= ~(1 << index);
    }

    this.emit('change', this._value, oldValue, index);
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
   * Sets a value of a slice.
   *
   * Value: 0b1010
   * Slice: 0b101
   * From: 0
   * To: 2
   *
   * Result: 0b1101
   */
  setSlice(from, to, slice) {
    this._checkIndex(from);
    this._checkIndex(to);

    const oldValue = this._value;
    const mask = ((1 << (to + 1 - from)) - 1) << from;
    this._value = (oldValue & ~mask) | ((slice << from) & mask);

    this.emit('change', this._value, oldValue, from, to);
  }

  /**
   * Builds a full name of a pin or pin bus:
   *
   * 'a' -> 'a'
   * {name: 'a'} -> 'a'
   * {name: 'a', size: 1} -> 'a'
   * {name: 'a', size: 16} -> 'a[16]'
   */
  static toFullName(name) {
    // Simple string name from Spec.
    if (typeof name === 'string') {
      return name;
    }

    return name.size > 1
      ? `${name.name}[${name.size}]`
      : name.name;
  }

  /**
   * Checks the bounds of the index.
   */
  _checkIndex(index) {
    if (index < 0 || index > this._size - 1) {
      throw new TypeError(
        `Pin "${this.getName()}": out of bounds index ${index}, ` +
        `while the size is ${this._size}.`
      );
    }
  }
}

/**
 * Special $clock "pin". Used to count clock cycles.
 * Usually contains rising: +0, +1, +2, ..., and falling
 * -0, -1, -2, ... edge values.
 */
Pin.CLOCK = '$clock';

module.exports = Pin;