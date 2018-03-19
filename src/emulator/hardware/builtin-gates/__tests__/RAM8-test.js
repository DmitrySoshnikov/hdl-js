/**
 * The MIT License (MIT)
 * Copyright (c) 2017-present Dmitry Soshnikov <dmitry.soshnikov@gmail.com>
 */

'use strict';

const RAM8 = require('../RAM8');
const GateTestUtil = require('../../gate-test-util');

const {SystemClock} = require('../../Clock');

describe('RAM8', () => {
  it('RAM8 interface', () => {
    expect(() => GateTestUtil.autoTestGate(RAM8)).not.toThrow();
  });

  it('storage', () => {
    SystemClock.reset();

    const ram8Chip = new RAM8(RAM8.Spec);

    ram8Chip
      .setPinValues({
        in: 0b0000000000010101,
        load: 1,
        address: 0,
      })
      .clockCycle();

    expect(ram8Chip.getValueAt(0)).toBe(0b0000000000010101);

    ram8Chip
      .setPinValues({
        in: 255,
        load: 1,
        address: 2,
      })
      .clockCycle();

    expect(ram8Chip.getValueAt(2)).toBe(255);

    expect(() => ram8Chip.getValueAt(15)).toThrow(
      new TypeError(`Chip "RAM8": invalid address 15, while the size is 8.`)
    );
  });
});
