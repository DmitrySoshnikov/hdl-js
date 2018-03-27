/**
 * The MIT License (MIT)
 * Copyright (c) 2017-present Dmitry Soshnikov <dmitry.soshnikov@gmail.com>
 */

'use strict';

const EventEmitter = require('events');

const {
  getBitAt,
  getBitRange,
  int16,
  setBitAt,
  setBitRange,
} = require('../../util/numbers');

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
    this._maxAllowed = Math.pow(2, this._size) - 1;
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

    if (value > this._maxAllowed) {
      throw new TypeError(
        `Pin "${this.getName()}": value ${value} doesn't match pin's width. ` +
          `Max allowed is ${this._maxAllowed} (size ${this._size}).`
      );
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

    // Always adjust to int16 on individual bits set
    this._value = int16(setBitAt(this._value, index, value));

    this.emit('change', this._value, oldValue, index);
  }

  /**
   * Returns the value of a particular bit of this bus.
   */
  getValueAt(index) {
    this._checkIndex(index);
    return getBitAt(this._value, index);
  }

  /**
   * Returns range (sub-bus) of this bus.
   */
  getRange(from, to) {
    this._checkIndex(from);
    this._checkIndex(to);
    return getBitRange(this._value, from, to);
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
    this._value = setBitRange(this._value, from, to, range);

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

    const listener = () => pinValueSetter(thisPinValueGetter());

    const connectInfo = {
      listener,
      sourceSpec,
      destinationSpec,
    };

    this._listeningPinsMap.set(pin, connectInfo);
    pin._sourcePin = this;

    this.on('change', listener);
    return this;
  }

  /**
   * Unplugs this pin from other pin.
   */
  disconnectFrom(pin) {
    if (!this._listeningPinsMap.has(pin)) {
      return;
    }

    const {listener} = this._listeningPinsMap.get(pin);

    this._listeningPinsMap.delete(pin);
    pin._sourcePin = null;

    this.removeListener('change', listener);
    return this;
  }

  /**
   * Returns listening pins map. The key is a pin, the
   * value is a ConnectionInfo, which includes the listener
   * function, and connection properties (index, range, etc).
   */
  getListeningPinsMap() {
    return this._listeningPinsMap;
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

    return name.size > 1 ? `${name.name}[${name.size}]` : name.name;
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
