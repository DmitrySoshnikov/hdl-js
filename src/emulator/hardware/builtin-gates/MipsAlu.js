/**
 * The MIT License (MIT)
 * Copyright (c) 2017-present Dmitry Soshnikov <dmitry.soshnikov@gmail.com>
 */

'use strict';

const BuiltInGate = require('../BuiltInGate');

/**
 * Canonical truth table for the MipsAlu
 */
const TRUTH_TABLE = [

  // Add
  {a: 1, b: 1, na: 0, nb: 0, less: 0, cin: 0, op: 0b10, out: 0, cout: 1, set: 0 },
  {a: 1, b: 1, na: 0, nb: 0, less: 0, cin: 1, op: 0b10, out: 1, cout: 1, set: 0 },
  {a: 0, b: 0, na: 0, nb: 0, less: 0, cin: 1, op: 0b10, out: 1, cout: 0, set: 0 },

  // Sub
  {a: 1, b: 1, na: 0, nb: 1, less: 0, cin: 1, op: 0b10, out: 0, cout: 1, set: 0 },

  // And
  {a: 1, b: 1, na: 0, nb: 0, less: 0, cin: 0, op: 0b00, out: 1, cout: 0, set: 0 },

  // Or
  {a: 1, b: 1, na: 0, nb: 0, less: 0, cin: 0, op: 0b01, out: 1, cout: 0, set: 0 },
  {a: 0, b: 1, na: 0, nb: 0, less: 0, cin: 0, op: 0b01, out: 1, cout: 0, set: 0 },
  {a: 0, b: 0, na: 0, nb: 0, less: 0, cin: 0, op: 0b01, out: 0, cout: 0, set: 0 },

];

/**
 * A 1-bit MipsAlu
 */
class MipsAlu extends BuiltInGate {
  /**
   * Logic:
   *
   *   a & b: op = 0
   *   a | b: op = 1
   *   a NOR b => ~a & ~b: op = 0, na = 1, nb = 1
   *
   * Math:
   *
   *   a + b: op = 2
   *   a - b: op = 2, nb = 1, cin = 1
   *   b - a: op = 2, na = 1, cin = 1
   *
   */
  eval() {
    const [a, b, na, nb, less, cin, op]
      = this.getInputPins().map(pin => pin.getValue());

    const A = na ? 1 - a : a;
    const B = nb ? 1 - b : b;

    switch (op) {
      case 0b00: {
        this.getOutputPins()[0].setValue(A & B);
        break;
      }
      case 0b01: {
        this.getOutputPins()[0].setValue(A | B);
        break;
      }
      case 0b10: {
        const sum = A + B + cin;
        this.getOutputPins()[0].setValue(sum % 2);
        this.getOutputPins()[1].setValue(Math.trunc(sum / 2));
        break;
      }
      case 0b11: {
        this.getOutputPins()[0].setValue(less);
        break;
      }
    }

  }
}

/**
 * Specification of the `MipsAlu` gate.
 */
MipsAlu.Spec = {
  name: 'MipsAlu',

  description:

`1-bit Mips Alu.

Implements 1-bit MIPS ALU chip.

The actual ALU operation is controlled by the 2-bit "op" input, which takes the following values:

- 0 - AND
- 1 - OR
- 2 - ADD
- 3 - propagate "less" input

Other operations can be achieved by manipulating different inputs, and the "op" code.
For example, to do a subtraction operation "a - b", we need to set cin = 1, and nb = 1.

Setting inputs "na" and "nb" negates the inputs "a" and "b" before performing the operation.
`,
  inputPins: ['a', 'b', 'na', 'nb', 'less', 'cin', 'op'],
  outputPins: ['out', 'cout', 'set'],
  truthTable: TRUTH_TABLE,
};

module.exports = MipsAlu;
