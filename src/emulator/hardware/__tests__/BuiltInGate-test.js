/**
 * The MIT License (MIT)
 * Copyright (c) 2017-present Dmitry Soshnikov <dmitry.soshnikov@gmail.com>
 */

'use strict';

const BuiltInGate = require('../BuiltInGate');
const Pin = require('../Pin');

describe('BuiltInGate', () => {
  it('BuiltInGate interface', () => {
    // Inputs.
    const a = new Pin({name: 'a', value: 1});
    const b = new Pin({name: 'b', value: 0});

    // Output.
    const out = new Pin({name: 'out', value: 0});

    class MyBuiltInGate extends BuiltInGate {}

    MyBuiltInGate.Spec = {
      name: 'MyBuiltInGate',
      description: 'MyBuiltInGate',
      inputPins: ['a', 'b'],
      outputPins: ['out'],
      truthTable: [],
    };

    const gate = new MyBuiltInGate({
      name: 'And',
      inputPins: [a, b],
      outputPins: [out],
    });

    expect(gate.getName()).toBe('And');
    expect(gate.getInputPins()).toEqual([a, b]);
    expect(gate.getOutputPins()).toEqual([out]);
    expect(() => gate.eval()).not.toThrow();
  });

  it('default from spec', () => {
    const And = require('../builtin-gates/And');
    const and = And.defaultFromSpec();

    expect(and.getName()).toBe(And.name);
    expect(and.getInputPins().length).toEqual(2);
    expect(and.getOutputPins().length).toEqual(1);

    expect(() => and.getPin('a')).not.toThrow();
    expect(() => and.getPin('b')).not.toThrow();
    expect(() => and.getPin('out')).not.toThrow();

    // Pin[16]:

    const Not16 = require('../builtin-gates/Not16');
    const not16 = Not16.defaultFromSpec();

    expect(not16.getName()).toBe(Not16.name);
    expect(not16.getInputPins().length).toEqual(1);
    expect(not16.getOutputPins().length).toEqual(1);

    expect(not16.getPin('in').getSize()).toBe(16);
    expect(not16.getPin('out').getSize()).toBe(16);
  });

  it('getHDLCode', () => {
    const And16 = require('../builtin-gates/And16');

    const expectedHDLCode = `/**
 * Implements bitwise 16-bit And & operation.
 */
CHIP And16 {
  IN a[16], b[16];
  OUT out[16];

  BUILTIN And16;
}`;

    expect(And16.getHDLCode()).toBe(expectedHDLCode);
  });

  it('generateTruthTable: simple', () => {
    const and = require('../builtin-gates/And').defaultFromSpec();

    expect(and.generateTruthTable()).toEqual([
      {a: 0, b: 0, out: 0},
      {a: 0, b: 1, out: 0},
      {a: 1, b: 0, out: 0},
      {a: 1, b: 1, out: 1},
    ]);
  });

  it('generateTruthTable: complex', () => {
    const and16 = require('../builtin-gates/And16').defaultFromSpec();

    const generatedTT = and16.generateTruthTable();
    expect(generatedTT.length).toBe(5);

    const {result: actualTT, conflicts} = and16.execOnData(generatedTT);

    expect(actualTT).toEqual(generatedTT);
    expect(conflicts.length).toBe(0);
  });

  it('generateTruthTable: enforceRandom', () => {
    const and = require('../builtin-gates/And').defaultFromSpec();

    const generatedTT = and.generateTruthTable({enforceRandom: true});
    expect(generatedTT.length).toBe(5);

    const {result: actualTT, conflicts} = and.execOnData(generatedTT);

    expect(actualTT).toEqual(generatedTT);
    expect(conflicts.length).toBe(0);
  });
});
