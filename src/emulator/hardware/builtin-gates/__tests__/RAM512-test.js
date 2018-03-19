/**
 * The MIT License (MIT)
 * Copyright (c) 2017-present Dmitry Soshnikov <dmitry.soshnikov@gmail.com>
 */

'use strict';

const RAM512 = require('../RAM512');
const GateTestUtil = require('../../gate-test-util');

const {SystemClock} = require('../../Clock');

describe('RAM512', () => {
  it('RAM512 interface', () => {
    expect(() => GateTestUtil.autoTestGate(RAM512)).not.toThrow();
  });

  it('storage', () => {
    SystemClock.reset();

    const ram512Chip = new RAM512(RAM512.Spec);

    ram512Chip
      .setPinValues({
        in: 0b0000000000010101,
        load: 1,
        address: 0,
      })
      .clockCycle();

    expect(ram512Chip.getValueAt(0)).toBe(0b0000000000010101);

    ram512Chip
      .setPinValues({
        in: 255,
        load: 1,
        address: 511,
      })
      .clockCycle();

    expect(ram512Chip.getValueAt(511)).toBe(255);

    expect(() => ram512Chip.getValueAt(515)).toThrow(
      new TypeError(
        `Chip "RAM512": invalid address 515, while the size is 512.`
      )
    );
  });
});
