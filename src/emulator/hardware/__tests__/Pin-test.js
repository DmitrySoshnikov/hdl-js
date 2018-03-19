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

  it('returns ranges', () => {
    // Get range 0..7:
    expect(a16.getRange(0, 7)).toBe(0b01010101);

    // Get range 8..15:
    expect(a16.getRange(8, 15)).toBe(0b01010101);

    // Get range 3..5:
    expect(a16.getRange(3, 5)).toBe(0b010);

    // Get range 0..15:
    expect(a16.getRange(0, 15)).toBe(0b0101010101010101);
  });

  it('set range', () => {
    const a = new Pin({
      name: 'a',
      size: 5,
      value: 0b10101,
    });

    a.setRange(1, 3, 0b101);

    // Range: a[1..3] = 0b101
    expect(a.getRange(1, 3)).toBe(0b101);
    expect(a.getValue()).toBe(0b11011);

    // The whole value: a[0..4] = a = 0b01010
    a.setRange(0, 4, 0b01010);
    expect(a.getValue()).toBe(0b01010);

    // One bit: a[0..0] = a[0] = 0b1
    a.setRange(0, 0, 0b1);
    expect(a.getValue()).toBe(0b01011);
  });

  it('check index', () => {
    expect(() => a16.setValueAt(31, 1)).toThrow();
    expect(() => a16.setValueAt(-1, 1)).toThrow();

    expect(() => a16.getValueAt(31)).toThrow();
    expect(() => a16.getValueAt(-1)).toThrow();

    expect(() => a16.getRange(0, 31)).toThrow();
    expect(() => a16.getRange(-1, 15)).toThrow();
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

  it('connectTo: simple value', () => {
    const a = new Pin({name: 'a', size: 16});
    const b = new Pin({name: 'b', size: 16});

    // `b` receives value from `a`:
    a.connectTo(b);

    a.setValue(15);
    expect(b.getValue()).toBe(15);

    // `b` doesn't receive value anymore:
    a.disconnectFrom(b);

    a.setValue(20);
    expect(b.getValue()).toBe(15);
  });

  it('connectTo: index', () => {
    const a = new Pin({name: 'a', size: 16});
    const b = new Pin({name: 'b', size: 16});

    // `b[1]` receives value from `a[2]`:
    a.connectTo(b, {
      sourceSpec: {index: 2},
      destinationSpec: {index: 1},
    });

    // Original `b` value.
    b.setValue(0b101);

    a.setValue(0b100);
    expect(b.getValueAt(1)).toBe(1);
    expect(b.getValue()).toBe(0b111);

    a.setValueAt(2, 0);
    expect(b.getValueAt(1)).toBe(0);
    expect(b.getValue()).toBe(0b101);

    // `b` doesn't receive value anymore:
    a.disconnectFrom(b);

    a.setValueAt(2, 1);
    expect(b.getValueAt(1)).toBe(0);
    expect(b.getValue()).toBe(0b101);
  });

  it('connectTo: range', () => {
    const a = new Pin({name: 'a', size: 16});
    const b = new Pin({name: 'b', size: 16});

    // `b[0..3]` receives value from `a[4..7]`:
    a.connectTo(b, {
      sourceSpec: {range: {from: 4, to: 7}},
      destinationSpec: {range: {from: 0, to: 3}},
    });

    // Original `b` value.
    b.setValue(0b11110000);

    a.setValue(0b11110000);
    expect(b.getRange(0, 3)).toBe(0b1111);
    expect(b.getValue()).toBe(0b11111111);

    a.setRange(4, 7, 0b1010);
    expect(b.getRange(0, 3)).toBe(0b1010);
    expect(b.getValue()).toBe(0b11111010);

    // `b` doesn't receive value anymore:
    a.disconnectFrom(b);

    a.setRange(4, 7, 0b1111);
    expect(b.getRange(0, 3)).toBe(0b1010);
    expect(b.getValue()).toBe(0b11111010);
  });

  it('getSourcePin', () => {
    const a = new Pin({name: 'a', size: 16});
    const b = new Pin({name: 'b', size: 16});

    expect(b.getSourcePin()).toBe(null);

    a.connectTo(b);
    expect(b.getSourcePin()).toBe(a);

    a.disconnectFrom(b);
    expect(b.getSourcePin()).toBe(null);
  });

  it('connectTo: connect info', () => {
    const a = new Pin({name: 'a', size: 16});
    const b = new Pin({name: 'b', size: 16});

    const sourceSpec = {index: 2};
    const destinationSpec = {index: 1};

    a.connectTo(b, {
      sourceSpec,
      destinationSpec,
    });

    const connectInfo = a.getListeningPinsMap().get(b);

    expect(typeof connectInfo.listener).toBe('function');
    expect(connectInfo.sourceSpec).toBe(sourceSpec);
    expect(connectInfo.destinationSpec).toBe(destinationSpec);
  });
});
