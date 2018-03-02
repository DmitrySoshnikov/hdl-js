/**
 * The MIT License (MIT)
 * Copyright (c) 2017-present Dmitry Soshnikov <dmitry.soshnikov@gmail.com>
 */

'use strict';

const CompositeGate = require('../CompositeGate');
const generator = require('../../../generator');
const Pin = require('../Pin');

class MyGate extends CompositeGate {}

MyGate.Spec = {
  name: 'MyGate',
};

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
    const xor = new MyGate({
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
    const and = new MyGate({
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

    // By default is not clocked.
    expect(halfAdder.getClass().isClocked()).toBe(false);

    expect(halfAdder.getInputPins()).toEqual([a, b]);
    expect(halfAdder.getOutputPins()).toEqual([sum, carry]);
    expect(halfAdder.getInternalPins()).toEqual([]);
    expect(halfAdder.getParts()).toEqual([xor, and]);

    halfAdder.eval();

    expect(halfAdder.getPin('sum').getValue()).toBe(0);
    expect(halfAdder.getPin('carry').getValue()).toBe(1);
  });

  it('toAST', () => {
    const And = require('../builtin-gates/And');
    const And16 = require('../builtin-gates/And16');

    /*

      CHIP MyGate {
        IN x[16], y[16];
        OUT out[16];

        PARTS:

        And(a=x[0], b=y[0], out=out[0]);
        And16(a[0..2]=x[1..3], b=y, out[15]=z, out=out, out[0..2]=m)
        And(a=z, b=m out=out[14]);
      }

    */

    // Inputs:
    const x = new Pin({name: 'x', size: 16});
    const y = new Pin({name: 'y', size: 16});

    // Outputs:
    const out = new Pin({name: 'out', size: 16});

    // Internal pins:
    const z = new Pin({name: 'z'});
    const m = new Pin({name: 'm'});

    // Create part instances.
    const and1 = And.defaultFromSpec();
    const and2 = And16.defaultFromSpec();
    const and3 = And.defaultFromSpec();

    // Connect the pins:

    // --------------------------------------
    // And(a=x[0], b=y[0], out=out[0]);

    // a=x[0]
    x.connectTo(and1.getPin('a'), {
      sourceSpec: {index: 0},
    });

    // b=y[0]
    y.connectTo(and1.getPin('b'), {
      sourceSpec: {index: 0},
    });

    // out=out[0]
    and1.getPin('out').connectTo(out, {
      destinationSpec: {index: 0},
    });

    // --------------------------------------
    // And16(a[0..2]=x[1..3], b=y, out[15]=z, out=out, out[0..2]=m)

    // a[0..2]=x[1..3]
    x.connectTo(and2.getPin('a'), {
      sourceSpec: {range: {from: 1, to: 3}},
      destinationSpec: {range: {from: 0, to: 2}},
    });

    // b=y
    y.connectTo(and2.getPin('b'));

    // out[15]=z
    and2.getPin('out').connectTo(z, {
      sourceSpec: {index: 15},
    });

    // out=out
    and2.getPin('out').connectTo(out);

    // out[0..2]=m
    and2.getPin('out').connectTo(m, {
      sourceSpec: {range: {from: 0, to: 2}},
    });

    // --------------------------------------
    // And(a=z, b=m out=out[14]);

    // a=z
    z.connectTo(and3.getPin('a'));

    // b=m
    m.connectTo(and3.getPin('b'));

    // b=m
    and3.getPin('out').connectTo(out, {
      destinationSpec: {index: 14},
    });

    // Finally, create a gate instance:

    const myGate = new CompositeGate({
      name: 'MyGate',
      inputPins: [x, y],
      outputPins: [out],
      internalPins: [z, m],
      parts: [and1, and2, and3],
    });

    expect(myGate.toAST()).toEqual({
      type: 'Chip',
      name: 'MyGate',

      // IN x[16], y[16];
      inputs: [
        {
          type: 'Name',
          value: 'x',
          size: 16
        },
        {
          type: 'Name',
          value: 'y',
          size: 16
        }
      ],

      // OUT out[16];
      outputs: [
        {
          type: 'Name',
          value: 'out',
          size: 16
        }
      ],

      parts: [
        // And(a=x[0], b=y[0], out=out[0]);
        {
          type: 'ChipCall',
          name: 'And',
          arguments: [
            {
              type: 'Argument',
              name: {
                type: 'Name',
                value: 'a'
              },
              value: {
                type: 'Name',
                value: 'x',
                index: 0
              }
            },
            {
              type: 'Argument',
              name: {
                type: 'Name',
                value: 'b'
              },
              value: {
                type: 'Name',
                value: 'y',
                index: 0
              }
            },
            {
              type: 'Argument',
              name: {
                type: 'Name',
                value: 'out'
              },
              value: {
                type: 'Name',
                value: 'out',
                index: 0
              }
            }
          ]
        },

        //And16(a[0..2]=x[1..3], b=y, out[15]=z, out=out, out[0..2]=m)
        {
          type: 'ChipCall',
          name: 'And16',
          arguments: [
            {
              type: 'Argument',
              name: {
                type: 'Name',
                value: 'a',
                range: {
                  from: 0,
                  to: 2
                }
              },
              value: {
                type: 'Name',
                value: 'x',
                range: {
                  from: 1,
                  to: 3
                }
              }
            },
            {
              type: 'Argument',
              name: {
                type: 'Name',
                value: 'b'
              },
              value: {
                type: 'Name',
                value: 'y'
              }
            },
            {
              type: 'Argument',
              name: {
                type: 'Name',
                value: 'out',
                index: 15
              },
              value: {
                type: 'Name',
                value: 'z'
              }
            },
            {
              type: 'Argument',
              name: {
                type: 'Name',
                value: 'out'
              },
              value: {
                type: 'Name',
                value: 'out'
              }
            },
            {
              type: 'Argument',
              name: {
                type: 'Name',
                value: 'out',
                range: {
                  from: 0,
                  to: 2
                }
              },
              value: {
                type: 'Name',
                value: 'm'
              }
            }
          ]
        },

        // And(a=z, b=m out=out[14]);
        {
          type: 'ChipCall',
          name: 'And',
          arguments: [
            {
              type: 'Argument',
              name: {
                type: 'Name',
                value: 'a'
              },
              value: {
                type: 'Name',
                value: 'z'
              }
            },
            {
              type: 'Argument',
              name: {
                type: 'Name',
                value: 'b'
              },
              value: {
                type: 'Name',
                value: 'm'
              }
            },
            {
              type: 'Argument',
              name: {
                type: 'Name',
                value: 'out'
              },
              value: {
                type: 'Name',
                value: 'out',
                index: 14
              }
            }
          ]
        }
      ],
      builtins: [],
      clocked: [],
    });

    // Check generated HDL code:
    const generatedHDLCode = generator.fromCompositeGate(myGate);

    const expectedHDLCode =
`/**
 * Automatically generated by hdl-js "MyGate" gate.
 */
CHIP MyGate {
  IN x[16], y[16];
  OUT out[16];

  PARTS:

  And(a=x[0], b=y[0], out=out[0]);
  And16(a[0..2]=x[1..3], b=y, out[15]=z, out=out, out[0..2]=m);
  And(a=z, b=m, out=out[14]);
}`;

    expect(generatedHDLCode).toBe(expectedHDLCode);

  });

  it('generateTruthTable: simple', () => {
    const and = require('../HDLClassFactory').fromHDL(`
      CHIP And {
        IN a, b;
        OUT out;

        PARTS:

        Nand(a=a, b=b, out=n);
        Nand(a=n, b=n, out=out);
      }
    `).defaultFromSpec();

    expect(and.generateTruthTable()).toEqual([
      {a: 0, b: 0, n: 1, out: 0},
      {a: 0, b: 1, n: 1, out: 0},
      {a: 1, b: 0, n: 1, out: 0},
      {a: 1, b: 1, n: 0, out: 1},
    ]);
  });

  it('generateTruthTable: complex', () => {
    const and = require('../HDLClassFactory').fromHDL(`
      CHIP And {
        IN a[2], b[2];
        OUT out[2];

        PARTS:

        And(a=a[0], b=b[0], out=out[0]);
        And(a=a[1], b=b[1], out=out[1]);
      }
    `).defaultFromSpec();

    const generatedTT = and.generateTruthTable();
    expect(generatedTT.length).toBe(5);

    const {result: actualTT, conflicts} = and.execOnData(generatedTT);

    expect(actualTT).toEqual(generatedTT);
    expect(conflicts.length).toBe(0);
  });

  it('generateTruthTable: enforceRandom', () => {
    const and = require('../HDLClassFactory').fromHDL(`
      CHIP And {
        IN a, b;
        OUT out;

        PARTS:

        Nand(a=a, b=b, out=n);
        Nand(a=n, b=n, out=out);
      }
    `).defaultFromSpec();

    const generatedTT = and.generateTruthTable({enforceRandom: true});
    expect(generatedTT.length).toBe(5);

    const {result: actualTT, conflicts} = and.execOnData(generatedTT);

    expect(actualTT).toEqual(generatedTT);
    expect(conflicts.length).toBe(0);
  });

});