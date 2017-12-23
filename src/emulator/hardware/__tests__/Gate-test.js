/**
 * The MIT License (MIT)
 * Copyright (c) 2017-present Dmitry Soshnikov <dmitry.soshnikov@gmail.com>
 */

'use strict';

const Gate = require('../Gate');
const Pin = require('../Pin');


// Inputs.
const a = new Pin({name: 'a', value: 1});
const b = new Pin({name: 'b', value: 0});

// Output.
const out = new Pin({name: 'out', value: 0});

const gate = new Gate({
  name: 'And',
  inputPins: [a, b],
  outputPins: [out],
});

describe('Gate', () => {

  it('gate interface', () => {
    expect(gate.getName()).toBe('And');
    expect(gate.getInputPins()).toEqual([a, b]);
    expect(gate.getOutputPins()).toEqual([out]);

    // Abstract class.
    expect(() => gate.eval()).toThrow(
      'Abstract method `Gate#eval` should be implemented in a concrete class.'
    );
  });

  it('infer name from constructor', () => {
    class And extends Gate {}
    expect((new And()).getName()).toBe('And');
  });

  it('sets/gets pin values', () => {
    const values = {a: 1, b: 1, out: 1};

    gate.setPinValues(values);

    expect(gate.getPinValues()).toEqual(values);

    expect(gate.getPin('a').getValue()).toEqual(values.a);
    expect(gate.getPin('b').getValue()).toEqual(values.b);
    expect(gate.getPin('out').getValue()).toEqual(values.out);
  });

  it('executes on data', () => {
    const And = require('../builtin-gates/And');

    const and = new And({
      inputPins: [a, b],
      outputPins: [out],
    });

    // Full data.
    let data = And.Spec.truthTable;
    let {result, conflicts} = and.execOnData(data);

    expect(result).toEqual(data);
    expect(conflicts.length).toBe(0);

    // Partial data
    data = [{a: 1, b: 1, out: 1}];
    ({result, conflicts} = and.execOnData(data));

    expect(result).toEqual(data);
    expect(conflicts.length).toBe(0);

    // Invalid data.
    data = [{a: 1, b: 1, out: 0}];
    ({result, conflicts} = and.execOnData(data));

    expect(result).not.toEqual(data);
    expect(conflicts.length).toBe(1);
    expect(conflicts[0]).toEqual({row: 0, pins: {out: 1}});

    // Sets the outputs, no conflicts.
    data = [{a: 1, b: 1}];
    ({result, conflicts} = and.execOnData(data));

    expect(result).toEqual([{a: 1, b: 1, out: 1}]);
    expect(conflicts.length).toBe(0);
  });

});