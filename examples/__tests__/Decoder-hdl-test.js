/**
 * The MIT License (MIT)
 * Copyright (c) 2017-present Dmitry Soshnikov <dmitry.soshnikov@gmail.com>
 */

'use strict';

const HDLClassFactory = require('../../src/emulator/hardware/HDLClassFactory');

describe('Decoder.hdl', () => {
  it('spec', () => {
    const Decoder = HDLClassFactory.fromHDLFile(__dirname + '/../Decoder.hdl');

    const spec = Decoder.Spec;

    expect(spec).toEqual({
      name: 'Decoder',

      description: `Compiled from HDL composite Gate class "Decoder".`,

      inputPins: [
        {name: 'a', size: 1},
        {name: 'b', size: 1},
      ],

      outputPins: [
        {name: 'o1', size: 1},
        {name: 'o2', size: 1},
        {name: 'o3', size: 1},
        {name: 'o4', size: 1},
      ],

      internalPins: [
        {name: 'not_a', size: 1},
        {name: 'not_b', size: 1},
      ],

      truthTable: [],
    });
  });

  it('parts', () => {
    const decoder =
      HDLClassFactory.fromHDLFile(__dirname + '/../Decoder.hdl')
      .defaultFromSpec();

    const partNames = decoder.getParts().map(part => part.getClass().name);
    expect(partNames).toEqual(['Not', 'Not', 'And', 'And', 'And', 'And']);
  });

  it('truthTable', () => {
    const decoder =
      HDLClassFactory.fromHDLFile(__dirname + '/../Decoder.hdl')
      .defaultFromSpec();

    const truthTable = [
      {a: 0, b: 0, not_a: 1, not_b: 1, o1: 1, o2: 0, o3: 0, o4: 0},
      {a: 0, b: 1, not_a: 1, not_b: 0, o1: 0, o2: 1, o3: 0, o4: 0},
      {a: 1, b: 0, not_a: 0, not_b: 1, o1: 0, o2: 0, o3: 1, o4: 0},
      {a: 1, b: 1, not_a: 0, not_b: 0, o1: 0, o2: 0, o3: 0, o4: 1},
    ];

    const {result} = decoder.execOnData(truthTable);
    expect(result).toEqual(truthTable);
  });
});
