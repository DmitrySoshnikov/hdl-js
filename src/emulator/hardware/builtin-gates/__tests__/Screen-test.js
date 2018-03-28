/**
 * The MIT License (MIT)
 * Copyright (c) 2017-present Dmitry Soshnikov <dmitry.soshnikov@gmail.com>
 */

'use strict';

const Screen = require('../Screen');
const GateTestUtil = require('../../gate-test-util');

const {SystemClock} = require('../../Clock');
const {int16} = require('../../../../util/numbers');

describe('Screen', () => {
  it('Screen interface', () => {
    expect(() => GateTestUtil.autoTestGate(Screen)).not.toThrow();
  });

  it('storage', () => {
    SystemClock.reset();

    const screenChip = Screen.defaultFromSpec();

    screenChip
      .setPinValues({
        in: 0b0000000000010101,
        load: 1,
        address: 0,
      })
      .clockCycle();

    expect(screenChip.getValueAt(0)).toBe(0b0000000000010101);

    screenChip
      .setPinValues({
        in: 255,
        load: 1,
        address: 8191,
      })
      .clockCycle();

    expect(screenChip.getValueAt(8191)).toBe(255);

    expect(() => screenChip.getValueAt(8192)).toThrow(
      new TypeError(
        `Chip "Screen": invalid address 8192, the max address is 8191.`
      )
    );
  });

  it('getAddressForLocation', () => {
    SystemClock.reset();

    const screenChip = Screen.defaultFromSpec();

    expect(screenChip.getAddressForLocation(1, 2)).toBe(32);
    expect(screenChip.getAddressForLocation(1, 3)).toBe(32);

    expect(screenChip.getAddressForLocation(1, 16)).toBe(33);
    expect(screenChip.getAddressForLocation(2, 1)).toBe(64);
  });

  it('getWordForLocation', () => {
    SystemClock.reset();

    const screenChip = Screen.defaultFromSpec();

    screenChip
      .setPinValues({
        in: 0b0000000000010101,
        load: 1,
        address: 32,
      })
      .clockCycle();

    // One row contains 32 words (0-31), so address 32
    // corresponds to the second row (index 1).
    expect(screenChip.getWordForLocation(1, 2)).toBe(0b0000000000010101);
    expect(screenChip.getWordForLocation(1, 3)).toBe(0b0000000000010101);

    screenChip
      .setPinValues({
        in: 255,
        load: 1,
        address: 33,
      })
      .clockCycle();

    expect(screenChip.getWordForLocation(1, 16)).toBe(255);

    screenChip
      .setPinValues({
        in: 150,
        load: 1,
        address: 64,
      })
      .clockCycle();

    expect(screenChip.getWordForLocation(2, 1)).toBe(150);
    expect(screenChip.getWordForLocation(2, 2)).toBe(150);

    expect(() => screenChip.getWordForLocation(256, 1)).toThrow(
      `Screen: invalid row 256, max row is 255.`
    );

    expect(() => screenChip.getWordForLocation(255, 512)).toThrow(
      `Screen: invalid column 512, max column is 511.`
    );
  });

  it('getPixelAt', () => {
    SystemClock.reset();

    const screenChip = Screen.defaultFromSpec();

    screenChip
      .setPinValues({
        in: 0b1000000000010101,
        load: 1,
        address: 32,
      })
      .clockCycle();

    expect(screenChip.getPixelAt(1, 0)).toBe(1);
    expect(screenChip.getPixelAt(1, 1)).toBe(0);
    expect(screenChip.getPixelAt(1, 2)).toBe(1);
    expect(screenChip.getPixelAt(1, 15)).toBe(1);

    screenChip
      .setPinValues({
        in: 0b1000000000010101,
        load: 1,
        address: 33,
      })
      .clockCycle();

    expect(screenChip.getPixelAt(1, 16)).toBe(1);
    expect(screenChip.getPixelAt(1, 17)).toBe(0);

    screenChip
      .setPinValues({
        in: 0b1000000000010101,
        load: 1,
        address: 64,
      })
      .clockCycle();

    expect(screenChip.getPixelAt(2, 0)).toBe(1);
    expect(screenChip.getPixelAt(2, 1)).toBe(0);
  });

  it('setPixelAt', () => {
    SystemClock.reset();

    const screenChip = Screen.defaultFromSpec();

    screenChip
      .setPinValues({
        in: int16(0b1000000000010101),
        load: 1,
        address: 32,
      })
      .clockCycle();

    expect(screenChip.getPixelAt(1, 0)).toBe(1);

    screenChip.setPixelAt(1, 0, 0);
    expect(screenChip.getPixelAt(1, 0)).toBe(0);

    screenChip
      .setPinValues({
        in: 0b1000000000010101,
        load: 1,
        address: 33,
      })
      .clockCycle();

    expect(screenChip.getPixelAt(1, 16)).toBe(1);

    screenChip.setPixelAt(1, 16, 0);
    expect(screenChip.getPixelAt(1, 16)).toBe(0);

    screenChip
      .setPinValues({
        in: 0b1000000000010101,
        load: 1,
        address: 64,
      })
      .clockCycle();

    expect(screenChip.getPixelAt(2, 0)).toBe(1);

    screenChip.setPixelAt(2, 0, 0);
    expect(screenChip.getPixelAt(2, 0)).toBe(0);
  });

  it('clear', () => {
    SystemClock.reset();

    const screenChip = Screen.defaultFromSpec();

    screenChip
      .setPinValues({
        in: int16(0b1000000000010101),
        load: 1,
        address: 32,
      })
      .clockCycle();

    screenChip.clear();

    expect(screenChip.getValueAt(32)).toBe(0);
  });
});
