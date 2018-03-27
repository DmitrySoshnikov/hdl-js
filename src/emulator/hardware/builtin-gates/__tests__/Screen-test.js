/**
 * The MIT License (MIT)
 * Copyright (c) 2017-present Dmitry Soshnikov <dmitry.soshnikov@gmail.com>
 */

'use strict';

const Screen = require('../Screen');
const GateTestUtil = require('../../gate-test-util');

const {SystemClock} = require('../../Clock');

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
});
