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

    // The pins which listen to 'change' event of this pin.
    this._listeningPinsMap = new Map();

    // The pin which is connected to this pin, and provides source value.
    this._sourcePin = null;
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
   * Returns range (sub-bus) of this bus.
   */
  getRange(from, to) {
    this._checkIndex(from);
    this._checkIndex(to);
    return (this._value >> from) & ((1 << (to + 1 - from)) - 1);
  }

  /**
   * Sets a value of a range.
   *
   * Value: 0b1010
   * Range: 0b101
   * From: 0
   * To: 2
   *
   * Result: 0b1101
   */
  setRange(from, to, range) {
    this._checkIndex(from);
    this._checkIndex(to);

    const oldValue = this._value;
    const mask = ((1 << (to + 1 - from)) - 1) << from;
    this._value = (oldValue & ~mask) | ((range << from) & mask);

    this.emit('change', this._value, oldValue, from, to);
  }

  /**
   * Connects this pin to another one. The other pin
   * then listens to the 'change' event of this pin.
   *
   * If the specs are passed, the values are updated according
   * to these specs. E.g. {index: 3} spec updates a[3] bit,
   * and {range: {from: 1, to: 3}} updates a[1..3].
   */
  connectTo(pin, {sourceSpec = {}, destinationSpec = {}} = {}) {
    if (this._listeningPinsMap.has(pin)) {
      return;
    }

    const thisPinValueGetter = createPinValueGetter(this, sourceSpec);
    const pinValueSetter = createPinValueSetter(pin, destinationSpec);

    const litener = () => pinValueSetter(thisPinValueGetter());

    this._listeningPinsMap.set(pin, litener);
    pin._sourcePin = this;

    this.on('change', litener);
    return this;
  }

  /**
   * Unplugs this pin from other pin.
   */
  disconnectFrom(pin) {
    const listener = this._listeningPinsMap.get(pin);

    if (!listener) {
      return;
    }

    this._listeningPinsMap.delete(pin);
    pin._sourcePin = null;


    this.removeListener('change', listener);
    return this;
  }

  /**
   * Returns the pin which is a source value provider
   * for this pin. Usually the source is set via `connectTo`
   * method.
   */
  getSourcePin() {
    return this._sourcePin;
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

// ----------------------------------------------------------------
// Updates pin value according to spec: full, index or range.
//
function createPinValueSetter(pin, spec) {
  if (spec.hasOwnProperty('index')) {
    return value => pin.setValueAt(spec.index, value);
  } else if (spec.range) {
    return value => pin.setRange(spec.range.from, spec.range.to, value);
  } else {
    return value => pin.setValue(value);
  }
}

// ----------------------------------------------------------------
// Extracts pin value according to spec: full, index or range.
//
function createPinValueGetter(pin, spec) {
  if (spec.hasOwnProperty('index')) {
    return () => pin.getValueAt(spec.index);
  } else if (spec.range) {
    return () => pin.getRange(spec.range.from, spec.range.to);
  }
  return () => pin.getValue();
}

/**
 * Special $clock "pin". Used to count clock cycles.
 * Usually contains rising: +0, +1, +2, ..., and falling
 * -0, -1, -2, ... edge values.
 */
Pin.CLOCK = '$clock';

module.exports = Pin;