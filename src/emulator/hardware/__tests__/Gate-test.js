/**
 * The MIT License (MIT)
 * Copyright (c) 2017-present Dmitry Soshnikov <dmitry.soshnikov@gmail.com>
 */

'use strict';

const Gate = require('../Gate');
const Pin = require('../Pin');

describe('Gate', () => {

  it('gate interface', () => {
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

});