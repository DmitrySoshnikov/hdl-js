/**
 * The MIT License (MIT)
 * Copyright (c) 2017-present Dmitry Soshnikov <dmitry.soshnikov@gmail.com>
 */

'use strict';

const FullAdder = require('../FullAdder');
const Pin = require('../../Pin');
const GateTestUtil = require('../gate-test-util');

describe('FullAdder', () => {

  it('FullAdder interface', () => {
    // Inputs.
    const a = new Pin({name: 'a'});
    const b = new Pin({name: 'b'});
    const c = new Pin({name: 'c'});

    // Outputs.
    const sum = new Pin({name: 'sum'});
    const carry = new Pin({name: 'carry'});

    const fullAdder = new FullAdder({
      inputPins: [a, b, c],
      outputPins: [sum, carry],
    });

    expect(fullAdder.getName()).toBe('FullAdder');
    expect(fullAdder.getInputPins()).toEqual([a, b, c]);
    expect(fullAdder.getOutputPins()).toEqual([sum, carry]);

    const truthTable = [
      {a: 0, b: 0, c: 0, sum: 0, carry: 0},
      {a: 0, b: 0, c: 1, sum: 1, carry: 0},
      {a: 0, b: 1, c: 0, sum: 1, carry: 0},
      {a: 0, b: 1, c: 1, sum: 0, carry: 1},
      {a: 1, b: 0, c: 0, sum: 1, carry: 0},
      {a: 1, b: 0, c: 1, sum: 0, carry: 1},
      {a: 1, b: 1, c: 0, sum: 0, carry: 1},
      {a: 1, b: 1, c: 1, sum: 1, carry: 1},
    ];

    expect(() => GateTestUtil.testTruthTable(truthTable, fullAdder))
      .not.toThrow();
  });

});