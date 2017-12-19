/**
 * The MIT License (MIT)
 * Copyright (c) 2017-present Dmitry Soshnikov <dmitry.soshnikov@gmail.com>
 */

'use strict';

const HalfAdder = require('../HalfAdder');
const Pin = require('../../Pin');
const GateTestUtil = require('../gate-test-util');

describe('HalfAdder', () => {

  it('HalfAdder interface', () => {
    // Inputs.
    const a = new Pin({name: 'a'});
    const b = new Pin({name: 'b'});

    // Outputs.
    const sum = new Pin({name: 'sum'});
    const carry = new Pin({name: 'carry'});

    const halfAdder = new HalfAdder({
      inputPins: [a, b],
      outputPins: [sum, carry],
    });

    expect(halfAdder.getName()).toBe('HalfAdder');
    expect(halfAdder.getInputPins()).toEqual([a, b]);
    expect(halfAdder.getOutputPins()).toEqual([sum, carry]);

    const truthTable = [
      {a: 0, b: 0, sum: 0, carry: 0},
      {a: 0, b: 1, sum: 1, carry: 0},
      {a: 1, b: 0, sum: 1, carry: 0},
      {a: 1, b: 1, sum: 0, carry: 1},
    ];

    expect(() => GateTestUtil.testTruthTable(truthTable, halfAdder))
      .not.toThrow();
  });

});