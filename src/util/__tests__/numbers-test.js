/**
 * The MIT License (MIT)
 * Copyright (c) 2017-present Dmitry Soshnikov <dmitry.soshnikov@gmail.com>
 */

'use strict';

const {
  getBitAt,
  getBitRange,
  int16,
  setBitAt,
  setBitRange,
  uint16,
} = require('../numbers');

describe('numbers', () => {
  it('int16', () => {
    expect(int16(0xffff)).toBe(-1);
    expect(int16(~0b0000000000000000)).toBe(-1);

    expect(int16(0b1111111111111111)).toBe(-1);
    expect(int16('1111111111111111')).toBe(-1);
  });

  it('uint16', () => {
    expect(uint16(0xffff)).toBe(0xffff);
    expect(uint16(~0b0000000000000000)).toBe(0xffff);
  });

  it('getBitAt', () => {
    expect(getBitAt(0b101, 0)).toBe(1);
    expect(getBitAt(0b101, 1)).toBe(0);
    expect(getBitAt(0b101, 2)).toBe(1);
  });

  it('setBitAt', () => {
    expect(setBitAt(0b101, 0, 0)).toBe(0b100);
    expect(setBitAt(0b101, 1, 1)).toBe(0b111);
    expect(setBitAt(0b101, 2, 0)).toBe(0b001);
  });

  it('getBitRange', () => {
    expect(getBitRange(0b101, 0, 2)).toBe(0b101);
    expect(getBitRange(0b101, 0, 1)).toBe(0b01);
    expect(getBitRange(0b101, 1, 2)).toBe(0b10);
  });

  it('setBitRange', () => {
    expect(setBitRange(0b101, 0, 2, 0b010)).toBe(0b010);
    expect(setBitRange(0b101, 0, 1, 0b10)).toBe(0b110);
    expect(setBitRange(0b101, 1, 2, 0b01)).toBe(0b011);
  });
});
