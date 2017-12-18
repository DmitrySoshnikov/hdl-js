/**
 * The MIT License (MIT)
 * Copyright (c) 2017-present Dmitry Soshnikov <dmitry.soshnikov@gmail.com>
 */

'use strict';

const And = require('../And');
const Pin = require('../../Pin');
const GateTestUtil = require('../gate-test-util');

describe('BuiltInGate', () => {

  it('And interface', () => {
    // Inputs.
    const a = new Pin({name: 'a', value: 1});
    const b = new Pin({name: 'b', value: 0});

    // Output.
    const out = new Pin({name: 'out'});

    const and = new And({
      inputPins: [a, b],
      outputPins: [out],
    });

    expect(and.getName()).toBe('And');
    expect(and.getInputPins()).toEqual([a, b]);
    expect(and.getOutputPins()).toEqual([out]);

    const truthTable = [
      {a: 0, b: 0, out: 0},
      {a: 0, b: 1, out: 0},
      {a: 1, b: 0, out: 0},
      {a: 1, b: 1, out: 1},
    ];

    expect(() => GateTestUtil.testTruthTable(truthTable, and))
      .not.toThrow();
  });

});