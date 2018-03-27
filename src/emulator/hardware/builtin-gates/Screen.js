/**
 * The MIT License (MIT)
 * Copyright (c) 2017-present Dmitry Soshnikov <dmitry.soshnikov@gmail.com>
 */

'use strict';

const RAM = require('./RAM');

const {int16Table} = require('../../../util/numbers');

/**
 * Canonical truth table for the `Screen` gate.
 */
// prettier-ignore
const TRUTH_TABLE = int16Table([
  {$clock: -0, in: 0b0000000000000000, load: 0, address:    0, out: 0b0000000000000000},
  {$clock: +0, in: 0b0000000000010101, load: 1, address:    0, out: 0b0000000000000000},
  {$clock: -1, in: 0b0000000000000001, load: 0, address:    0, out: 0b0000000000010101},
  {$clock: +1, in: 0b0000000000010101, load: 0, address:    0, out: 0b0000000000010101},
  {$clock: -2, in: 0b0000000000010101, load: 0, address:    0, out: 0b0000000000010101},
  {$clock: +2, in: 0b1101001000010101, load: 1, address:    2, out: 0b0000000000000000},
  {$clock: -3, in: 0b1101001000010101, load: 0, address:    2, out: 0b1101001000010101},
  {$clock: +3, in: 0b1111111111111111, load: 1, address: 8191, out: 0b0000000000000000},
  {$clock: -4, in: 0b0000000000000000, load: 1, address: 8191, out: 0b1111111111111111},
  {$clock: +4, in: 0b0000000000000000, load: 1, address: 8191, out: 0b1111111111111111},
  {$clock: -5, in: 0b0000000000000000, load: 0, address: 8191, out: 0b0000000000000000},
]);

/**
 * A 256 x 512 screen, implemented with 8K registers, each register
 * represents 16 pixels.
 *
 * 256 rows, each row contains 32 words (512 / 16).
 *
 * The output is the value stored at the memory location specified by address.
 * If load=1, loads the input into the memory location specified by address.
 */
class Screen extends RAM {
  constructor(options) {
    super(Object.assign({size: 256 * (512 / 16)}, options));
  }

  /**
   * Clears the screen.
   */
  clear() {
    // TODO
  }

  /**
   * Returns a value of a pixel at (row, col) position.
   */
  getPixel(row, col) {
    // TODO
    row;
    col;
  }

  /**
   * Sets a value of a pixel at (row, col) coordinates.
   */
  setPixel(row, col, value) {
    // TODO
    row;
    col;
    value;
  }
}

/**
 * Specification of the `Screen` gate.
 */
Screen.Spec = {
  name: 'Screen',

  description: `A 256 x 512 screen, implemented with 8K registers, each register
represents 16 pixels.

256 rows, each row contains 32 words (512 / 16).

The output is the value stored at the memory location specified by address.
If load=1, loads the input into the memory location specified by address.`,

  inputPins: [
    {name: 'in', size: 16},
    {name: 'load', size: 1},
    {name: 'address', size: 13},
  ],

  outputPins: [{name: 'out', size: 16}],

  truthTable: TRUTH_TABLE,
};

module.exports = Screen;
