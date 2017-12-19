/**
 * The MIT License (MIT)
 * Copyright (c) 2017-present Dmitry Soshnikov <dmitry.soshnikov@gmail.com>
 */

'use strict';

const Or = require('../Or');
const Pin = require('../../Pin');
const GateTestUtil = require('../gate-test-util');

describe('Or', () => {

  it('Or interface', () => {
    // Inputs.
    const a = new Pin({name: 'a'});
    const b = new Pin({name: 'b'});

    // Output.
    const out = new Pin({name: 'out'});

    const or = new Or({
      inputPins: [a, b],
      outputPins: [out],
    });

    expect(or.getName()).toBe('Or');
    expect(or.getInputPins()).toEqual([a, b]);
    expect(or.getOutputPins()).toEqual([out]);

    const truthTable = [
      {a: 0, b: 0, out: 0},
      {a: 0, b: 1, out: 1},
      {a: 1, b: 0, out: 1},
      {a: 1, b: 1, out: 1},
    ];

    expect(() => GateTestUtil.testTruthTable(truthTable, or))
      .not.toThrow();
  });

});