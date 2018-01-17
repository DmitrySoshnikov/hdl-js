/**
 * The MIT License (MIT)
 * Copyright (c) 2017-present Dmitry Soshnikov <dmitry.soshnikov@gmail.com>
 */

'use strict';

const {
  int16,
  uint16,
} = require('../numbers');

describe('numbers', () => {

  it('int16', () => {
    expect(int16(0xFFFF)).toBe(-1);
    expect(int16(~0b0000000000000000)).toBe(-1);

    expect(int16(0b1111111111111111)).toBe(-1);
    expect(int16('1111111111111111')).toBe(-1);
  });

  it('int16', () => {
    expect(uint16(0xFFFF)).toBe(0xFFFF);
    expect(uint16(~0b0000000000000000)).toBe(0xFFFF);
  });

});