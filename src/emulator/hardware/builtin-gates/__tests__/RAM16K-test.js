/**
 * The MIT License (MIT)
 * Copyright (c) 2017-present Dmitry Soshnikov <dmitry.soshnikov@gmail.com>
 */

'use strict';

const RAM16K = require('../RAM16K');
const GateTestUtil = require('../../gate-test-util');

const {SystemClock} = require('../../Clock');

describe('RAM16K', () => {
  it('RAM16K interface', () => {
    expect(() => GateTestUtil.autoTestGate(RAM16K)).not.toThrow();
  });

  it('storage', () => {
    SystemClock.reset();

    const ram16KChip = new RAM16K(RAM16K.Spec);

    ram16KChip
      .setPinValues({
        in: 0b0000000000010101,
        load: 1,
        address: 0,
      })
      .clockCycle();

    expect(ram16KChip.getValueAt(0)).toBe(0b0000000000010101);

    ram16KChip
      .setPinValues({
        in: 255,
        load: 1,
        address: 16383,
      })
      .clockCycle();

    expect(ram16KChip.getValueAt(16383)).toBe(255);

    expect(() => ram16KChip.getValueAt(16387)).toThrow(
      new TypeError(
        `Chip "RAM16K": invalid address 16387, while the size is 16384.`
      )
    );
  });
});
