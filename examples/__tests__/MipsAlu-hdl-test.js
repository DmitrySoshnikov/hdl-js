/**
 * The MIT License (MIT)
 * Copyright (c) 2017-present Dmitry Soshnikov <dmitry.soshnikov@gmail.com>
 */

'use strict';

const HDLClassFactory = require('../../src/emulator/hardware/HDLClassFactory');

describe('MipsAlu.hdl', () => {
  it('spec', () => {
    const And = HDLClassFactory.fromHDLFile(__dirname + '/../MipsAlu.hdl');

    const spec = And.Spec;

    expect(spec).toEqual({
      description: `Compiled from HDL composite Gate class "MipsAlu".`,

      inputPins: [
        {name: 'a', size: 1},
        {name: 'b', size: 1},

        {name: 'na', size: 1},
        {name: 'nb', size: 1},

        {name: 'less', size: 1},
        {name: 'cin', size: 1},

        {name: 'op', size: 2},
      ],

      outputPins: [
        {name: 'out', size: 1},

        {name: 'cout', size: 1},
        {name: 'set', size: 1},
      ],

      internalPins: [
        {name: 'not_a', size: 1},
        {name: 'A', size: 1},

        {name: 'not_b', size: 1},
        {name: 'B', size: 1},

        {name: 'A_and_B', size: 1},
        {name: 'A_or_B', size: 1},
        {name: 'A_plus_B', size: 1},
      ],

      truthTable: [],
    });
  });

  it('parts', () => {
    const mipsAlu =
      HDLClassFactory.fromHDLFile(__dirname + '/../MipsAlu.hdl')
      .defaultFromSpec();

    const partNames = mipsAlu.getParts().map(part => part.getClass().name);
    expect(partNames).toEqual([
      'Not',
      'Mux',
      'Not',
      'Mux',
      'And',
      'Or',
      'FullAdder',
      'Mux4Way16',
    ]);
  });

  it('truthTable', () => {
    const mipsAlu =
      HDLClassFactory.fromHDLFile(__dirname + '/../MipsAlu.hdl')
      .defaultFromSpec();

    // Random table.
    const truthTable = [
      {a: 1, b: 0, na: 1, nb: 0, less: 0, cin: 0, op: 0b00, not_a: 0, A: 0, not_b: 1, B: 0, A_and_B: 0, A_or_B: 0, A_plus_B: 0, out: 0, cout: 0, set: 0},
      {a: 0, b: 1, na: 1, nb: 0, less: 0, cin: 1, op: 0b10, not_a: 1, A: 1, not_b: 0, B: 1, A_and_B: 1, A_or_B: 1, A_plus_B: 1, out: 1, cout: 1, set: 1},
      {a: 0, b: 0, na: 1, nb: 1, less: 0, cin: 1, op: 0b11, not_a: 1, A: 1, not_b: 1, B: 1, A_and_B: 1, A_or_B: 1, A_plus_B: 1, out: 0, cout: 1, set: 1},
      {a: 0, b: 0, na: 0, nb: 0, less: 1, cin: 0, op: 0b11, not_a: 1, A: 0, not_b: 1, B: 0, A_and_B: 0, A_or_B: 0, A_plus_B: 0, out: 1, cout: 0, set: 0},
      {a: 0, b: 1, na: 0, nb: 1, less: 1, cin: 1, op: 0b10, not_a: 1, A: 0, not_b: 0, B: 0, A_and_B: 0, A_or_B: 0, A_plus_B: 1, out: 1, cout: 0, set: 1},
    ];

    const {result} = mipsAlu.execOnData(truthTable);
    expect(result).toEqual(truthTable);
  });
});