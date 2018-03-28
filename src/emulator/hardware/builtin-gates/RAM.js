/**
 * The MIT License (MIT)
 * Copyright (c) 2017-present Dmitry Soshnikov <dmitry.soshnikov@gmail.com>
 */

'use strict';

const colors = require('colors');
const BuiltInGate = require('../BuiltInGate');

const {int16Table} = require('../../../util/numbers');

/**
 * Canonical truth table for the `RAM` gate.
 */
const TRUTH_TABLE = int16Table([
  {
    $clock: -0,
    in: 0b0000000000000000,
    load: 0,
    address: 0,
    out: 0b0000000000000000,
  },
  {
    $clock: +0,
    in: 0b0000000000010101,
    load: 1,
    address: 0,
    out: 0b0000000000000000,
  },
  {
    $clock: -1,
    in: 0b0000000000000001,
    load: 0,
    address: 0,
    out: 0b0000000000010101,
  },
  {
    $clock: +1,
    in: 0b0000000000010101,
    load: 0,
    address: 0,
    out: 0b0000000000010101,
  },
  {
    $clock: -2,
    in: 0b0000000000010101,
    load: 0,
    address: 0,
    out: 0b0000000000010101,
  },
  {
    $clock: +2,
    in: 0b1101001000010101,
    load: 1,
    address: 2,
    out: 0b0000000000000000,
  },
  {
    $clock: -3,
    in: 0b1101001000010101,
    load: 0,
    address: 2,
    out: 0b1101001000010101,
  },
]);

/**
 * RAM chip of a variable size, each memory location is 16 bit-wide.
 *
 * The output is the value stored at the memory location specified by address.
 * If load=1, loads the input into the memory location specified by address.
 *
 * Abstract:
 *
 *  IN in[16], load, address[3];
 *  OUT out[16];
 *
 *  DMux8Way(in=load, sel=address, ...);
 *  Register(in=in, load=l1, out=r1);
 *  Register(in=in, load=l2, out=r2);
 *  ...
 *  Mux8Way16(...);
 */
class RAM extends BuiltInGate {
  /**
   * The size is the number of registers (machine words).
   */
  constructor(options) {
    super(options);
    this._size = options.size || 8;
    this._storage = new Int16Array(this.getSize());

    // Addresses which are updated (used in `reset`).
    this._modifiedAddresses = new Set();
  }

  /**
   * RAM is a sequential gate.
   */
  static isClocked() {
    return true;
  }

  /**
   * Number of machine words (registers) in this memory unit.
   */
  getSize() {
    return this._size;
  }

  /**
   * Returns the storage.
   */
  getStroage() {
    return this._storage;
  }

  /**
   * Sets storage.
   */
  setStorage(storage) {
    this._storage = storage;
    return this;
  }

  /**
   * Returns values at address.
   */
  getValueAt(address) {
    return this._storage[this._checkAddress(address)];
  }

  /**
   * Returns values at address.
   */
  setValueAt(address, value) {
    this._storage[this._checkAddress(address)] = value;
    this._modifiedAddresses.add(address);
    return this;
  }

  /**
   * Resets the memory to all zeros.
   */
  reset() {
    this._modifiedAddresses.forEach(address => {
      this._storage[address] = 0;
    });
    this._modifiedAddresses.clear();
    return this;
  }

  /**
   * Checks address range.
   */
  _checkAddress(address) {
    if (address < 0 || address > this._size - 1) {
      throw new TypeError(
        `Chip "${this.getClass().name}": invalid address ${address}, ` +
          `the max address is ${this._size - 1}.`
      );
    }
    return address;
  }

  /**
   * Update output for address.
   */
  eval() {
    this._updateOutput();
  }

  /**
   * On rising edge RAM updates the value by the address if the
   * `load` is set, otherwise -- preserves the value.
   */
  clockUp() {
    const load = this.getInputPins()[1].getValue();

    if (load) {
      const address = this.getInputPins()[2].getValue();
      const value = this.getInputPins()[0].getValue();

      this.setValueAt(address, value);
    }
  }

  /**
   * On the falling edge RAM propagates
   * the value to the output pin.
   */
  clockDown() {
    this._updateOutput();
  }

  /**
   * Updates the output on address change, and on clock down.
   */
  _updateOutput() {
    const address = this.getInputPins()[2].getValue();
    this.getOutputPins()[0].setValue(this._storage[address]);
  }
}

/**
 * Specification of the `RAM` gate.
 */
RAM.Spec = {
  name: 'RAM',

  description: [
    'Abstract memory chip of a variable size (default 8).',
    '',
    'If load[t]=1 then out[t+1] = in[t] else out does not change.',
    '',
    'Clock rising edge updates the value from the input by the address,',
    'if the `load` is set; otherwise, preserves the state.',
    '',
    `  ${colors.bold('↗')} : value[address] = load ? in : value[address]`,
    '',
    'Clock falling edge propagates the value at the address to the output:',
    '',
    `  ${colors.bold('↘')} : out = value[address]`,
  ].join('\n'),

  inputPins: [
    {name: 'in', size: 16},
    {name: 'load', size: 1},
    {name: 'address', size: 3},
  ],

  outputPins: [{name: 'out', size: 16}],

  truthTable: TRUTH_TABLE,
};

module.exports = RAM;
