/**
 * The MIT License (MIT)
 * Copyright (c) 2017-present Dmitry Soshnikov <dmitry.soshnikov@gmail.com>
 */

'use strict';

const RAM64 = require('../RAM64');
const GateTestUtil = require('../../gate-test-util');

const {SystemClock} = require('../../Clock');

describe('RAM64', () => {
  it('RAM64 interface', () => {
    expect(() => GateTestUtil.autoTestGate(RAM64)).not.toThrow();
  });

  it('storage', () => {
    SystemClock.reset();

    const ram64Chip = new RAM64(RAM64.Spec);

    ram64Chip
      .setPinValues({
        in: 0b0000000000010101,
        load: 1,
        address: 0,
      })
      .clockCycle();

    expect(ram64Chip.getValueAt(0)).toBe(0b0000000000010101);

    ram64Chip
      .setPinValues({
        in: 255,
        load: 1,
        address: 63,
      })
      .clockCycle();

    expect(ram64Chip.getValueAt(63)).toBe(255);

    expect(() => ram64Chip.getValueAt(67)).toThrow(
      new TypeError(`Chip "RAM64": invalid address 67, while the size is 64.`)
    );
  });
});
