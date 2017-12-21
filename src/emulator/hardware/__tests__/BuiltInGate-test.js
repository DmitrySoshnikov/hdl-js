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

});