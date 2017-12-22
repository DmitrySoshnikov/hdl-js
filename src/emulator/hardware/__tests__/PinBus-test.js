/**
 * The MIT License (MIT)
 * Copyright (c) 2017-present Dmitry Soshnikov <dmitry.soshnikov@gmail.com>
 */

'use strict';

const PinBus = require('../PinBus');

const a16 = new PinBus({
  name: 'a[16]',
  size: 16,
  value: 0b0101010101010101,
});

describe('PinBus', () => {

  it('PinBus interface', () => {
    expect(a16.getName()).toBe('a[16]');
    expect(a16.getValue()).toBe(0b0101010101010101);
    expect(a16.getSize()).toBe(16);
  });

  it('values at index', () => {
    expect(a16.getValueAt(0)).toBe(1);
    expect(a16.getValueAt(1)).toBe(0);
    expect(a16.getValueAt(2)).toBe(1);
    expect(a16.getValueAt(3)).toBe(0);
    expect(a16.getValueAt(4)).toBe(1);
    expect(a16.getValueAt(5)).toBe(0);
    expect(a16.getValueAt(6)).toBe(1);
    expect(a16.getValueAt(7)).toBe(0);
    expect(a16.getValueAt(8)).toBe(1);
    expect(a16.getValueAt(9)).toBe(0);
    expect(a16.getValueAt(10)).toBe(1);
    expect(a16.getValueAt(11)).toBe(0);
    expect(a16.getValueAt(12)).toBe(1);
    expect(a16.getValueAt(13)).toBe(0);
    expect(a16.getValueAt(14)).toBe(1);
    expect(a16.getValueAt(15)).toBe(0);
  });

  it('updates a value at index to 1', () => {
    a16.setValueAt(1, 1);
    expect(a16.getValueAt(1)).toBe(1);
    expect(a16.getValue()).toBe(0b0101010101010111);
  });

  it('updates a value at index to 0', () => {
    a16.setValueAt(1, 0);
    expect(a16.getValueAt(1)).toBe(0);
    expect(a16.getValue()).toBe(0b0101010101010101);
  });

  it('returns slices', () => {
    // Get slice 0..7:
    expect(a16.getSlice(0, 7)).toBe(0b01010101);

    // Get slice 8..15:
    expect(a16.getSlice(8, 15)).toBe(0b01010101);

    // Get slice 3..5:
    expect(a16.getSlice(3, 5)).toBe(0b010);

    // Get slice 0..15:
    expect(a16.getSlice(0, 15)).toBe(0b0101010101010101);
  });

  it('check index', () => {
    expect(() => a16.setValueAt(31, 1)).toThrow();
    expect(() => a16.setValueAt(-1, 1)).toThrow();

    expect(() => a16.getValueAt(31)).toThrow();
    expect(() => a16.getValueAt(-1)).toThrow();

    expect(() => a16.getSlice(0, 31)).toThrow();
    expect(() => a16.getSlice(-1, 15)).toThrow();
  });

});