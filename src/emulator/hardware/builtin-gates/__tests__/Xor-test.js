/**
 * The MIT License (MIT)
 * Copyright (c) 2017-present Dmitry Soshnikov <dmitry.soshnikov@gmail.com>
 */

'use strict';

const Xor = require('../Xor');
const Pin = require('../../Pin');
const GateTestUtil = require('../gate-test-util');

describe('Xor', () => {

  it('Xor interface', () => {
    // Inputs.
    const a = new Pin({name: 'a'});
    const b = new Pin({name: 'b'});

    // Output.
    const out = new Pin({name: 'out'});

    const xor = new Xor({
      inputPins: [a, b],
      outputPins: [out],
    });

    expect(xor.getName()).toBe('Xor');
    expect(xor.getInputPins()).toEqual([a, b]);
    expect(xor.getOutputPins()).toEqual([out]);

    const truthTable = [
      {a: 0, b: 0, out: 0},
      {a: 0, b: 1, out: 1},
      {a: 1, b: 0, out: 1},
      {a: 1, b: 1, out: 0},
    ];

    expect(() => GateTestUtil.testTruthTable(truthTable, xor))
      .not.toThrow();
  });

});