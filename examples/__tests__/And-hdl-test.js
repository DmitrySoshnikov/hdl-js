/**
 * The MIT License (MIT)
 * Copyright (c) 2017-present Dmitry Soshnikov <dmitry.soshnikov@gmail.com>
 */

'use strict';

const HDLClassFactory = require('../../src/emulator/hardware/HDLClassFactory');

describe('And.hdl', () => {
  it('spec', () => {
    const And = HDLClassFactory.fromHDLFile(__dirname + '/../And.hdl');

    const spec = And.Spec;

    expect(spec).toEqual({
      name: 'And',

      description: `Compiled from HDL composite Gate class "And".`,

      inputPins: [
        {name: 'a', size: 1},
        {name: 'b', size: 1},
      ],

      outputPins: [
        {name: 'out', size: 1},
      ],

      internalPins: [
        {name: 'n', size: 1},
      ],

      truthTable: [],
    });
  });

  it('parts', () => {
    const and =
      HDLClassFactory.fromHDLFile(__dirname + '/../And.hdl')
      .defaultFromSpec();

    const partNames = and.getParts().map(part => part.getClass().name);
    expect(partNames).toEqual(['Nand', 'Nand']);
  });

  it('truthTable', () => {
    const and =
      HDLClassFactory.fromHDLFile(__dirname + '/../And.hdl')
      .defaultFromSpec();

    const truthTable = [
      {a: 0, b: 0, n: 1, out: 0},
      {a: 0, b: 1, n: 1, out: 0},
      {a: 1, b: 0, n: 1, out: 0},
      {a: 1, b: 1, n: 0, out: 1},
    ];

    const {result} = and.execOnData(truthTable);
    expect(result).toEqual(truthTable);
  });
});