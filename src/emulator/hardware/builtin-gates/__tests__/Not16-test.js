/**
 * The MIT License (MIT)
 * Copyright (c) 2017-present Dmitry Soshnikov <dmitry.soshnikov@gmail.com>
 */

'use strict';

const Not16 = require('../Not16');
const PinBus = require('../../PinBus');
const GateTestUtil = require('../gate-test-util');

describe('Not16', () => {

  it('Not16 interface', () => {
    // Input.
    const a16 = new PinBus({name: 'a', size: 16});

    // Output.
    const out16 = new PinBus({name: 'out', size: 16});

    const not16 = new Not16({
      inputPins: [a16],
      outputPins: [out16],
    });

    expect(not16.getName()).toBe('Not16');
    expect(not16.getInputPins()).toEqual([a16]);
    expect(not16.getOutputPins()).toEqual([out16]);

    // Since ~ operator inverts all bits, we use bit strings here
    // for comparison of the result.
    //
    // The (~0b0000000000000000).toString(2) is not `0b1111111111111111`,
    // but just '-1' in JS, so we have to do:
    //
    // (~0b0000000000000000 >>> 0).toString(2).slice(16)
    //
    // to get the bit string.
    //
    // For this test override `getValue` of the output.
    //

    const originalGetValue = out16.getValue;

    out16.getValue = function() {
      // The this._value >>> 0 gives 32 bit value,
      // so do slice(16) to get needed 16 bits.
      return (this._value >>> 0).toString(2).slice(16);
    };

    let truthTable = [
      {a: 0b0000000000000000, out: '1111111111111111'},
      {a: 0b1111111111111111, out: '0000000000000000'},
      {a: 0b1010101010101010, out: '0101010101010101'},
      {a: 0b0011110011000011, out: '1100001100111100'},
      {a: 0b0001001000110100, out: '1110110111001011'},
    ];

    expect(() => GateTestUtil.testTruthTable(truthTable, not16))
      .not.toThrow();

    // Restore `getValue` for further tests:
    out16.getValue = originalGetValue;

    // Now with actual numbers:
    truthTable = [
      {a: 0b0000000000000000, out: ~0b0000000000000000},
      {a: 0b1111111111111111, out: ~0b1111111111111111},
      {a: 0b1010101010101010, out: ~0b1010101010101010},
      {a: 0b0011110011000011, out: ~0b0011110011000011},
      {a: 0b0001001000110100, out: ~0b0001001000110100},
    ];

    expect(() => GateTestUtil.testTruthTable(truthTable, not16))
      .not.toThrow();

    // Check the last set values at index 2:
    expect(not16.getPin('a').getValueAt(2)).toBe(1);
    expect(not16.getPin('out').getValueAt(2)).toBe(0);
  });

});