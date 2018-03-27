/**
 * The MIT License (MIT)
 * Copyright (c) 2017-present Dmitry Soshnikov <dmitry.soshnikov@gmail.com>
 */

'use strict';

/**
 * Converts a number to signed 16-bit integer.
 */
function int16(v) {
  if (typeof v === 'string') {
    v = Number.parseInt(v, 2);
  }

  return (v << 16) >> 16;
}

/**
 * Converts all rows in a table to `int16`.
 */
function int16Table(table) {
  for (const row of table) {
    for (const pin in row) {
      if (pin === '$clock') {
        continue;
      }
      row[pin] = int16(row[pin]);
    }
  }
  return table;
}

/**
 * Converts a number to unsigned 16-bit integer.
 */
function uint16(v) {
  return v & 0xffff;
}

/**
 * Test for a neagtive zero.
 */
function isNegativeZero(value) {
  return value === 0 && 1 / value === -Infinity;
}

/**
 * Converts a number value to decimal string with the sign.
 */
function toSignedString(value) {
  if (isNegativeZero(value)) {
    return '-0';
  }

  return (value >= 0 ? '+' : '') + value;
}

/**
 * Returns the value of particular bit in a 16-bit number.
 */
function getBitAt(number, index) {
  return (number >> index) & 1;
}

/**
 * Sets a particular bit to the value.
 */
function setBitAt(number, index, value) {
  // Set 1.
  if (value === 1) {
    number |= 1 << index;
  } else {
    // Set 0 ("clear").
    number &= ~(1 << index);
  }
  return number;
}

/**
 * Returns a bit range.
 */
function getBitRange(number, from, to) {
  return (number >> from) & ((1 << (to + 1 - from)) - 1);
}

/**
 * Sets a bits range.
 */
function setBitRange(number, from, to, range) {
  const mask = ((1 << (to + 1 - from)) - 1) << from;
  return (number & ~mask) | ((range << from) & mask);
}

module.exports = {
  getBitAt,
  getBitRange,
  int16,
  int16Table,
  isNegativeZero,
  setBitAt,
  setBitRange,
  toSignedString,
  uint16,
};
