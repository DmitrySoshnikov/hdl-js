/**
 * The MIT License (MIT)
 * Copyright (c) 2017-present Dmitry Soshnikov <dmitry.soshnikov@gmail.com>
 */

'use strict';

const Mux = require('../Mux');
const Pin = require('../../Pin');
const GateTestUtil = require('../gate-test-util');

describe('Mux', () => {

  it('Mux interface', () => {
    // Inputs.
    const a = new Pin({name: 'a'});
    const b = new Pin({name: 'b'});

    // Selector input.
    const sel = new Pin({name: 'sel'});

    // Output.
    const out = new Pin({name: 'out'});

    const mux = new Mux({
      inputPins: [a, b, sel],
      outputPins: [out],
    });

    expect(mux.getName()).toBe('Mux');
    expect(mux.getInputPins()).toEqual([a, b, sel]);
    expect(mux.getOutputPins()).toEqual([out]);

    const truthTable = [
      {a: 0, b: 0, sel: 0, out: 0},
      {a: 0, b: 0, sel: 1, out: 0},
      {a: 0, b: 1, sel: 0, out: 0},
      {a: 0, b: 1, sel: 1, out: 1},
      {a: 1, b: 0, sel: 0, out: 1},
      {a: 1, b: 0, sel: 1, out: 0},
      {a: 1, b: 1, sel: 0, out: 1},
      {a: 1, b: 1, sel: 1, out: 1},
    ];

    expect(() => GateTestUtil.testTruthTable(truthTable, mux))
      .not.toThrow();
  });

});