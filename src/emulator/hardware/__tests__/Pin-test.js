/**
 * The MIT License (MIT)
 * Copyright (c) 2017-present Dmitry Soshnikov <dmitry.soshnikov@gmail.com>
 */

'use strict';

const Pin = require('../Pin');

const a16 = new Pin({
  name: 'a[16]',
  size: 16,
  value: 0b0101010101010101,
});

describe('Pin', () => {

  it('Pin interface', () => {
    const a = new Pin({name: 'a', value: 1});

    expect(a.getName()).toBe('a');
    expect(a.getValue()).toBe(1);
    expect(a.getSize()).toBe(1);

    a.setValue(0);
    expect(a.getValue()).toBe(0);
  });

  it('to full name', () => {
    expect(Pin.toFullName('a')).toBe('a');
    expect(Pin.toFullName({name: 'a'})).toBe('a');
    expect(Pin.toFullName({name: 'a', size: 1})).toBe('a');
    expect(Pin.toFullName({name: 'a', size: 16})).toBe('a[16]');
  });

  it('string value converted to number', () => {
    let a = new Pin({name: 'a', value: '1'});
    expect(a.getValue()).toBe(1);

    a = new Pin({name: 'a', value: 1});
    a.setValue('1');
    expect(a.getValue()).toBe(1);
  });

  // -------------------------------------------------------------
  // Bus

  it('size[16] interface', () => {
    expect(a16.getName()).toBe('a[16]');
    expect(a16.getValue()).toBe(0b0101010101010101);
    expect(a16.getSize()).toBe(16);
  });

  it('deafult value', () => {
    let a = new Pin({name: 'a'});
    expect(a.getValue()).toBe(0);
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

  it('set slice', () => {
    const a = new Pin({
      name: 'a',
      size: 5,
      value: 0b10101,
    });

    a.setSlice(1, 3, 0b101);

    // Slice: a[1..3] = 0b101
    expect(a.getSlice(1, 3)).toBe(0b101);
    expect(a.getValue()).toBe(0b11011);

    // The whole value: a[0..4] = a = 0b01010
    a.setSlice(0, 4, 0b01010);
    expect(a.getValue()).toBe(0b01010);

    // One bit: a[0..0] = a[0] = 0b1
    a.setSlice(0, 0, 0b1);
    expect(a.getValue()).toBe(0b01011);
  });

  it('check index', () => {
    expect(() => a16.setValueAt(31, 1)).toThrow();
    expect(() => a16.setValueAt(-1, 1)).toThrow();

    expect(() => a16.getValueAt(31)).toThrow();
    expect(() => a16.getValueAt(-1)).toThrow();

    expect(() => a16.getSlice(0, 31)).toThrow();
    expect(() => a16.getSlice(-1, 15)).toThrow();
  });

  it('set value', () => {
    const a16 = new Pin({
      name: 'a',
      size: 16,
    });

    // Number value.
    a16.setValue(0b0101010101010101);
    expect(a16.getValue()).toBe(0b0101010101010101);

    a16.setValue('0101010101010101');
    expect(a16.getValue()).toBe(0b0101010101010101);
  });

  it('pin events', () => {
    const a16 = new Pin({
      name: 'a',
      size: 16,
      value: 0,
    });

    let _new, _old, _index;

    a16.on('change', (newValue, oldValue, index) => {
      _new = newValue;
      _old = oldValue;
      _index = index;
    });

    a16.setValue(255);
    expect(_old).toBe(0);
    expect(_new).toBe(255);

    a16.setValue(0b111);
    expect(_old).toBe(255);
    expect(_new).toBe(0b111);

    a16.setValueAt(1, 0);
    expect(_old).toBe(0b111);
    expect(_new).toBe(0b101);
    expect(_index).toBe(1);
  });

});