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
  return v & 0xFFFF;
}

module.exports = {
  int16,
  int16Table,
  uint16,
};