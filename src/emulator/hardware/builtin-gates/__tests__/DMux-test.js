/**
 * The MIT License (MIT)
 * Copyright (c) 2017-present Dmitry Soshnikov <dmitry.soshnikov@gmail.com>
 */

'use strict';

const DMux = require('../DMux');
const Pin = require('../../Pin');
const GateTestUtil = require('../gate-test-util');

describe('DMux', () => {

  it('DMux interface', () => {
    // Input.
    const a = new Pin({name: 'a'});

    // Selector input.
    const sel = new Pin({name: 'sel'});

    // Outputs.
    const out1 = new Pin({name: 'out1'});
    const out2 = new Pin({name: 'out2'});

    const dmux = new DMux({
      inputPins: [a, sel],
      outputPins: [out1, out2],
    });

    expect(dmux.getName()).toBe('DMux');
    expect(dmux.getInputPins()).toEqual([a, sel]);
    expect(dmux.getOutputPins()).toEqual([out1, out2]);

    const truthTable = [
      {a: 0, sel: 0, out1: 0, out2: 0},
      {a: 0, sel: 1, out1: 0, out2: 0},
      {a: 1, sel: 0, out1: 1, out2: 0},
      {a: 1, sel: 1, out1: 0, out2: 1},
    ];

    expect(() => GateTestUtil.testTruthTable(truthTable, dmux))
      .not.toThrow();
  });

});