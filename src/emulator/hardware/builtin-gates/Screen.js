/**
 * The MIT License (MIT)
 * Copyright (c) 2017-present Dmitry Soshnikov <dmitry.soshnikov@gmail.com>
 */

'use strict';

const RAM = require('./RAM');

const {int16Table, getBitAt, setBitAt} = require('../../../util/numbers');

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

const WORD_SIZE = 16;
const ROWS = 256;
const COLUMNS = 512;
const WORDS_IN_ROW = COLUMNS / WORD_SIZE;

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
    super(Object.assign({size: ROWS * WORDS_IN_ROW}, options));
  }

  /**
   * Clears the screen.
   */
  clear() {
    this.reset();
    return this;
  }

  /**
   * Returns a value of a pixel at (row, column) position.
   *
   * word = Screen[32 * row + column / 16]
   * bit number: column / 16
   */
  getPixelAt(row, column) {
    const word = this.getWordForLocation(row, column);
    return getBitAt(word, column % WORD_SIZE);
  }

  /**
   * Sets a value of a pixel at (row, column) coordinates.
   */
  setPixelAt(row, column, value) {
    const address = this.getAddressForLocation(row, column);
    let word = this.getValueAt(address);
    word = setBitAt(word, column % WORD_SIZE, value);
    this.setValueAt(address, word);
    return this;
  }

  /**
   * Returns a word corresponding to row, and column.
   *
   * Screen[32 * row + column / 16]
   */
  getWordForLocation(row, column) {
    return this._storage[this.getAddressForLocation(row, column)];
  }

  /**
   * Returns absolute address corresponding to location.
   */
  getAddressForLocation(row, column) {
    this._checkLocation(row, column);
    return WORDS_IN_ROW * row + Math.trunc(column / WORD_SIZE);
  }

  /**
   * Validates locations.
   */
  _checkLocation(row, column) {
    if (row < 0 || row > ROWS - 1) {
      throw new TypeError(
        `Screen: invalid row ${row}, max row is ${ROWS - 1}.`
      );
    }

    if (column < 0 || column > COLUMNS - 1) {
      throw new TypeError(
        `Screen: invalid column ${column}, max column is ${COLUMNS - 1}.`
      );
    }
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
