/**
 * The MIT License (MIT)
 * Copyright (c) 2017-present Dmitry Soshnikov <dmitry.soshnikov@gmail.com>
 */

'use strict';

const Gate = require('../../Gate');
const RAM4K = require('../RAM4K');
const GateTestUtil = require('../../gate-test-util');

describe('RAM4K', () => {
  it('RAM4K interface', () => {
    expect(() => GateTestUtil.autoTestGate(RAM4K))
      .not.toThrow();
  });

  it('storage', () => {
    Gate.resetClock();

    const ram4KChip = new RAM4K(RAM4K.Spec);

    ram4KChip
      .setPinValues({
        in: 0b0000000000010101,
        load: 1,
        address: 0,
      })
      .clockCycle();

    expect(ram4KChip.getValueAt(0)).toBe(0b0000000000010101);

    ram4KChip
      .setPinValues({
        in: 255,
        load: 1,
        address: 4095,
      })
      .clockCycle();

    expect(ram4KChip.getValueAt(4095)).toBe(255);

    expect(() => ram4KChip.getValueAt(4099)).toThrow(
      new TypeError(
        `Chip "RAM4K": invalid address 4099, while the size is 4096.`
      )
    );
  });
});