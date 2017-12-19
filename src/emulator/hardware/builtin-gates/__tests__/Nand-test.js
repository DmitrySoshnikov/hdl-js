/**
 * The MIT License (MIT)
 * Copyright (c) 2017-present Dmitry Soshnikov <dmitry.soshnikov@gmail.com>
 */

'use strict';

const Nand = require('../Nand');
const Pin = require('../../Pin');
const GateTestUtil = require('../gate-test-util');

describe('Nand', () => {

  it('Nand interface', () => {
    // Inputs.
    const a = new Pin({name: 'a'});
    const b = new Pin({name: 'b'});

    // Output.
    const out = new Pin({name: 'out'});

    const nand = new Nand({
      inputPins: [a, b],
      outputPins: [out],
    });

    expect(nand.getName()).toBe('Nand');
    expect(nand.getInputPins()).toEqual([a, b]);
    expect(nand.getOutputPins()).toEqual([out]);

    const truthTable = [
      {a: 0, b: 0, out: 1},
      {a: 0, b: 1, out: 1},
      {a: 1, b: 0, out: 1},
      {a: 1, b: 1, out: 0},
    ];

    expect(() => GateTestUtil.testTruthTable(truthTable, nand))
      .not.toThrow();
  });

});