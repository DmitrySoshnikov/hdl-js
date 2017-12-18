/**
 * The MIT License (MIT)
 * Copyright (c) 2017-present Dmitry Soshnikov <dmitry.soshnikov@gmail.com>
 */

'use strict';

const Not = require('../Not');
const Pin = require('../../Pin');
const GateTestUtil = require('../gate-test-util');

describe('Not', () => {

  it('Not interface', () => {
    // Input.
    const a = new Pin({name: 'a'});

    // Output.
    const out = new Pin({name: 'out'});

    const not = new Not({
      inputPins: [a],
      outputPins: [out],
    });

    expect(not.getName()).toBe('Not');
    expect(not.getInputPins()).toEqual([a]);
    expect(not.getOutputPins()).toEqual([out]);

    const truthTable = [
      {a: 0, out: 1},
      {a: 1, out: 0},
    ];

    expect(() => GateTestUtil.testTruthTable(truthTable, not))
      .not.toThrow();
  });

});