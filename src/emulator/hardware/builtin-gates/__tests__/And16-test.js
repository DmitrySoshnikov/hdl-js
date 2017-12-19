/**
 * The MIT License (MIT)
 * Copyright (c) 2017-present Dmitry Soshnikov <dmitry.soshnikov@gmail.com>
 */

'use strict';

const And16 = require('../And16');
const PinBus = require('../../PinBus');
const GateTestUtil = require('../gate-test-util');

describe('And16', () => {

  it('And16 interface', () => {
    // Inputs.
    const a16 = new PinBus({name: 'a', size: 16});
    const b16 = new PinBus({name: 'b', size: 16});

    // Output.
    const out16 = new PinBus({name: 'out', size: 16});

    const and16 = new And16({
      inputPins: [a16, b16],
      outputPins: [out16],
    });

    expect(and16.getName()).toBe('And16');
    expect(and16.getInputPins()).toEqual([a16, b16]);
    expect(and16.getOutputPins()).toEqual([out16]);

    const truthTable = [
      {a: 0b0000000000000000, b: 0b0000000000000000, out: 0b0000000000000000},
      {a: 0b0000000000000000, b: 0b1111111111111111, out: 0b0000000000000000},
      {a: 0b1111111111111111, b: 0b1111111111111111, out: 0b1111111111111111},
      {a: 0b1010101010101010, b: 0b0101010101010101, out: 0b0000000000000000},
      {a: 0b0011110011000011, b: 0b0000111111110000, out: 0b0000110011000000},
      {a: 0b0001001000110100, b: 0b1001100001110110, out: 0b0001000000110100},
    ];

    expect(() => GateTestUtil.testTruthTable(truthTable, and16))
      .not.toThrow();

    // Check the last set values at index 2:
    expect(and16.getPin('a').getValueAt(2)).toBe(1);
    expect(and16.getPin('b').getValueAt(2)).toBe(1);
    expect(and16.getPin('out').getValueAt(2)).toBe(1);
  });

});