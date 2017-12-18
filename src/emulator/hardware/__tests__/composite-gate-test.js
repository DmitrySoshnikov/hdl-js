/**
 * The MIT License (MIT)
 * Copyright (c) 2017-present Dmitry Soshnikov <dmitry.soshnikov@gmail.com>
 */

'use strict';

const BuiltInGate = require('../BuiltInGate');
const CompositeGate = require('../CompositeGate');
const Pin = require('../Pin');

describe('CompositeGate', () => {

  it('HalfAdder', () => {

    /*
      HalfAdder:

      CHIP HalfAdder {
        IN a, b;    // 1-bit inputs
        OUT sum,    // Right bit of a + b
            carry;  // Left bit of a + b

        PARTS:
        Xor(a=a, b=b, out=sum);
        And(a=a, b=b, out=carry);
      }

    */

    // Inputs.
    const a = new Pin({name: 'a', value: 1});
    const b = new Pin({name: 'b', value: 1});

    // Outputs.
    const sum = new Pin({name: 'sum'});
    const carry = new Pin({name: 'carry'});

    // Xor part.
    const xor = new BuiltInGate({
      name: 'Xor',
      inputPins: [a, b],
      outputPins: [sum],
    });

    xor.eval = function() {
      this.getPin('sum').setValue(
        this.getPin('a').getValue() ^
        this.getPin('b').getValue()
      );
    };

    // And part.
    const and = new BuiltInGate({
      name: 'And',
      inputPins: [a, b],
      outputPins: [carry],
    });

    and.eval = function() {
      this.getPin('carry').setValue(
        this.getPin('a').getValue() &
        this.getPin('b').getValue()
      );
    };

    // HalfAdder.
    const halfAdder = new CompositeGate({
      'name': 'HalfAdder',
      inputPins: [a, b],
      outputPins: [sum, carry],
      parts: [xor, and],
    });

    expect(halfAdder.getInputPins()).toEqual([a, b]);
    expect(halfAdder.getOutputPins()).toEqual([sum, carry]);
    expect(halfAdder.getInternalPins()).toEqual([]);
    expect(halfAdder.getParts()).toEqual([xor, and]);

    halfAdder.eval();

    expect(halfAdder.getPin('sum').getValue()).toBe(0);
    expect(halfAdder.getPin('carry').getValue()).toBe(1);
  });

});