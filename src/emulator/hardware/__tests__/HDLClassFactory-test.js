/**
 * The MIT License (MIT)
 * Copyright (c) 2017-present Dmitry Soshnikov <dmitry.soshnikov@gmail.com>
 */

'use strict';

const And = require('../builtin-gates/And');
const BuiltInGate = require('../BuiltInGate');
const CompositeGate = require('../CompositeGate');
const fs = require('fs');
const HDLClassFactory = require('../HDLClassFactory');
const Not = require('../builtin-gates/Not');
const Or = require('../builtin-gates/Or');
const parser = require('../../../parser');

const toPinSpec = pin => {
  return {name: pin.getName(), size: pin.getSize()};
};

const MuxHDL = `
  CHIP Mux {
    IN a, b, sel;
    OUT out;

    PARTS:

    Not(in=sel, out=nel);
    And(a=a, b=nel, out=A);
    And(a=b, b=sel, out=B);
    Or(a=A, b=B, out=out);
  }
`;

const EXAMPLES_DIR = __dirname + '/../../../../examples/';

// Compile gate class from HDL.
const MuxClass = HDLClassFactory.fromHDL(MuxHDL);

describe('HDLClassFactory', () => {
  it('fromHDLFile', () => {
    const and = HDLClassFactory
      .fromHDLFile(EXAMPLES_DIR + 'And.hdl')
      .defaultFromSpec();

    and.setPinValues({a: 1, b: 1});
    and.eval();
    expect(and.getPin('out').getValue()).toBe(1);
  });

  it('fromHDL', () => {
    const and = HDLClassFactory
      .fromHDL(
        fs.readFileSync(EXAMPLES_DIR + 'And.hdl', 'utf-8')
      )
      .defaultFromSpec();

    and.setPinValues({a: 1, b: 1});
    and.eval();
    expect(and.getPin('out').getValue()).toBe(1);
  });

  it('fromAST', () => {
    const ast = parser.parse(
      fs.readFileSync(EXAMPLES_DIR + 'And.hdl', 'utf-8')
    );

    const and = HDLClassFactory
      .fromAST(ast)
      .defaultFromSpec();

    and.setPinValues({a: 1, b: 1});
    and.eval();
    expect(and.getPin('out').getValue()).toBe(1);
    expect(and.toAST()).toBe(ast);
  });

  it('fromHDLFile cache', () => {
    const And1Class = HDLClassFactory.fromHDLFile(EXAMPLES_DIR + 'And.hdl');
    const And2Class = HDLClassFactory.fromHDLFile(EXAMPLES_DIR + 'And.hdl');
    expect(And1Class).toBe(And2Class);
  });

  it('fromHDL cache', () => {
    const And1Class = HDLClassFactory.fromHDL(
      fs.readFileSync(EXAMPLES_DIR + 'And.hdl', 'utf-8'),
      EXAMPLES_DIR
    );

    const And2Class = HDLClassFactory.fromHDL(
      fs.readFileSync(EXAMPLES_DIR + 'And.hdl', 'utf-8'),
      EXAMPLES_DIR
    );

    expect(And1Class).toBe(And2Class);

    // From other dir:
    const And3Class = HDLClassFactory.fromHDL(
      fs.readFileSync(EXAMPLES_DIR + 'And.hdl', 'utf-8'),
      './other/dir'
    );

    expect(And3Class).not.toBe(And1Class);
    expect(And3Class).not.toBe(And2Class);
  });

  it('Several instances', () => {
    const And = HDLClassFactory.fromHDLFile(EXAMPLES_DIR + 'And.hdl');

    const and1 = new And({
      inputPins: ['a', 'b'],
      outputPins: ['out'],
    });

    and1.setPinValues({a: 1, b: 1});
    and1.eval();
    expect(and1.getPin('out').getValue()).toBe(1);

    const and2 = new And({
      inputPins: [
        {name: 'a', size: 1},
        {name: 'b', size: 1},
      ],
      outputPins: [
        {name: 'out', size: 1},
      ]
    });

    and2.setPinValues({a: 0, b: 1});
    and2.eval();
    expect(and2.getPin('out').getValue()).toBe(0);

    // and1 still uses own pins:
    and1.eval();
    expect(and1.getPin('out').getValue()).toBe(1);

    const and3 = And.defaultFromSpec();
    and3.setPinValues({a: 1, b: 1});
    and3.eval();
    expect(and1.getPin('out').getValue()).toBe(1);
  });

  it('And example', () => {
    const and = HDLClassFactory
      .fromHDLFile(EXAMPLES_DIR + 'And.hdl')
      .defaultFromSpec();

    const inputData = [
      {a: 0, b: 0},
      {a: 0, b: 1},
      {a: 1, b: 0},
      {a: 1, b: 1},
    ];

    const truthTable = [
      {a: 0, b: 0, n: 1, out: 0},
      {a: 0, b: 1, n: 1, out: 0},
      {a: 1, b: 0, n: 1, out: 0},
      {a: 1, b: 1, n: 0, out: 1},
    ];

    const {result} = and.execOnData(inputData);
    expect(result).toEqual(truthTable);
  });


  it('Compile class', () => {
    expect(typeof MuxClass).toBe('function');
    expect(Object.getPrototypeOf(MuxClass)).toBe(CompositeGate);
  });

  it('Class Spec', () => {
    // Spec.
    const spec = MuxClass.Spec;
    expect(spec.description)
      .toBe('Compiled from HDL composite Gate class "Mux".');

    // Spec inputs.
    expect(spec.inputPins).toEqual([
      {name: 'a', size: 1},
      {name: 'b', size: 1},
      {name: 'sel', size: 1},
    ]);

    // Spec outputs.
    expect(spec.outputPins).toEqual([
      {name: 'out', size: 1},
    ]);

    // Spec truth table (empty).
    expect(spec.truthTable).toEqual([]);
  });

  it('Instance pins', () => {
    const mux = MuxClass.defaultFromSpec();

    // Inputs.
    expect(mux.getInputPins().length).toBe(3);
    expect(mux.getInputPins().map(toPinSpec)).toEqual([
      {name: 'a', size: 1},
      {name: 'b', size: 1},
      {name: 'sel', size: 1},
    ]);

    // Outputs.
    expect(mux.getOutputPins().length).toBe(1);
    expect(mux.getOutputPins().map(toPinSpec)).toEqual([
      {name: 'out', size: 1},
    ]);

    // Internal pins.
    expect(mux.getInternalPins().length).toBe(3);
    expect(mux.getInternalPins().map(toPinSpec)).toEqual([
      {name: 'nel', size: 1},
      {name: 'A', size: 1},
      {name: 'B', size: 1},
    ]);
  });

  it('Parts', () => {
    const mux = MuxClass.defaultFromSpec();
    const parts = mux.getParts();

    expect(parts.length).toBe(4);
    expect(parts[0]).toBeInstanceOf(Not);
    expect(parts[1]).toBeInstanceOf(And);
    expect(parts[2]).toBeInstanceOf(And);
    expect(parts[3]).toBeInstanceOf(Or);
  });

  it('Constant values', () => {
    const myChip = HDLClassFactory
      .fromHDL(`
        CHIP MyChip {
          IN a;
          OUT out;

          PARTS:

          Not(in=false, out=not_false);
          Or(a=a, b=not_false, out=out);
        }
      `)
      .defaultFromSpec();

    const spec = myChip.getClass().Spec;

    // `false` constant is not part of internal pins:
    expect(spec.internalPins).toEqual([
      {name: 'not_false', size: 1},
    ]);

    myChip
      .setPinValues({a: 0})
      .eval();

    expect(myChip.getPinValues()).toEqual({a: 0, not_false: 1, out: 1});
  });

  it('Pin connections', () => {
    const mux = MuxClass.defaultFromSpec();

    const [
      not,
      and1,
      and2,
      or,
    ] = mux.getParts();

    // --- Not(in=sel, out=nel); - when `sel` changes, `in` shoudl change too,
    mux.getPin('sel').setValue(1);
    expect(not.getPin('in').getValue()).toBe(1);

    // --- When `out` of the `Not` changes, internal `nel` should be updated:
    not.getPin('out').setValue(1);
    expect(mux.getPin('nel').getValue()).toBe(1);

    // --- And(a=a, b=nel, out=A);
    mux.getPin('a').setValue(1);
    expect(and1.getPin('a').getValue()).toBe(1);

    mux.getPin('nel').setValue(1);
    expect(and1.getPin('b').getValue()).toBe(1);

    and1.getPin('out').setValue(1);
    expect(mux.getPin('A').getValue()).toBe(1);

    // --- And(a=b, b=sel, out=B);
    mux.getPin('b').setValue(1);
    expect(and2.getPin('a').getValue()).toBe(1);

    mux.getPin('sel').setValue(1);
    expect(and2.getPin('b').getValue()).toBe(1);

    and2.getPin('out').setValue(1);
    expect(mux.getPin('B').getValue()).toBe(1);

    // --- And(a=b, b=sel, out=B);
    mux.getPin('b').setValue(1);
    expect(and2.getPin('a').getValue()).toBe(1);

    mux.getPin('sel').setValue(1);
    expect(and2.getPin('b').getValue()).toBe(1);

    and2.getPin('out').setValue(1);
    expect(mux.getPin('B').getValue()).toBe(1);

    // --- Or(a=A, b=B, out=out);
    mux.getPin('A').setValue(1);
    expect(or.getPin('a').getValue()).toBe(1);

    mux.getPin('B').setValue(1);
    expect(or.getPin('b').getValue()).toBe(1);

    or.getPin('out').setValue(1);
    expect(mux.getPin('out').getValue()).toBe(1);
  });

  it('eval', () => {
    // Canonical `Mux` class.
    const BultInMux = require('../builtin-gates/Mux');

    // Instance of our `Mux` implementation.
    const mux = MuxClass.defaultFromSpec();

    // Check that our implementation results to the same truth table.
    const canonicalTruthTable = BultInMux.Spec.truthTable;

    // Our full table (including internal pins)
    const fullTruthTable = [
      {a: 0, b: 0, sel: 0, out: 0, nel: 1, A: 0, B: 0},
      {a: 0, b: 0, sel: 1, out: 0, nel: 0, A: 0, B: 0},
      {a: 0, b: 1, sel: 0, out: 0, nel: 1, A: 0, B: 0},
      {a: 0, b: 1, sel: 1, out: 1, nel: 0, A: 0, B: 1},
      {a: 1, b: 0, sel: 0, out: 1, nel: 1, A: 1, B: 0},
      {a: 1, b: 0, sel: 1, out: 0, nel: 0, A: 0, B: 0},
      {a: 1, b: 1, sel: 0, out: 1, nel: 1, A: 1, B: 0},
      {a: 1, b: 1, sel: 1, out: 1, nel: 0, A: 0, B: 1}
    ];

    // Test full table:
    let result = mux.execOnData(fullTruthTable).result;
    expect(result).toEqual(fullTruthTable);

    // Test actual table to be equal to canonical:
    const filterInternals = row => {
      const newRow = Object.assign({}, row);
      delete newRow.nel;
      delete newRow.A;
      delete newRow.B;
      return newRow;
    };

    const truthTable = fullTruthTable.map(filterInternals);
    result = mux.execOnData(truthTable).result;
    expect(result.map(filterInternals)).toEqual(canonicalTruthTable);
  });

  it('bit input/output', () => {
    const MyChip = HDLClassFactory.fromHDL(`
      CHIP MyChip {
        IN a[4];
        OUT out[4];

        PARTS:

        Not(in=a[1], out=out[1]);
      }
    `);

    const myChip = MyChip.defaultFromSpec();
    const [not] = myChip.getParts();

    // in=a[1]
    myChip.setPinValues({a: 0b0010});
    expect(not.getPin('in').getValue()).toBe(1);

    myChip.setPinValues({a: 0b1101});
    expect(not.getPin('in').getValue()).toBe(0);

    myChip.eval();
    expect(myChip.getPin('out').getValue()).toBe(0b0010);
  });

  it('range input/output', () => {
    const MyChip = HDLClassFactory.fromHDL(`
      CHIP MyChip {
        IN a[4];
        OUT out[4];

        PARTS:

        Not16(in[1..4]=a, out[0..3]=out[0..3], out[0..2]=tmp);
      }
    `);

    const myChip = MyChip.defaultFromSpec();
    const [not16] = myChip.getParts();

    // in[1..4]=a
    myChip.setPinValues({a: 0b0010});
    expect(not16.getPin('in').getValue()).toBe(0b00100);

    myChip.setPinValues({a: 0b1101});
    expect(not16.getPin('in').getValue()).toBe(0b11010);

    myChip.eval();

    // out[0..3]=out[0..3]
    expect(myChip.getPin('out').getValue()).toBe(0b0101);

    // out[0..2]=tmp
    expect(myChip.getPin('tmp').getValue()).toBe(0b101);
  });

  it('custom HDL parts', () => {
    // In `Mux.hdl` from example directory, `And` gate is loaded
    // from the current directory with custom implementation, rather
    // then taking it from built-ins, while `Not`, and `Or` gates are
    // loaded from built-ins:

    const mux = HDLClassFactory
      .fromHDLFile(EXAMPLES_DIR + 'Mux.hdl')
      .defaultFromSpec();

    expect(mux).toBeInstanceOf(CompositeGate);

    const [
      not,
      and1,
      and2,
      or,
    ] = mux.getParts();

    expect(not).toBeInstanceOf(BuiltInGate);
    expect(and1).toBeInstanceOf(CompositeGate);
    expect(and2).toBeInstanceOf(CompositeGate);
    expect(or).toBeInstanceOf(BuiltInGate);

    const fullTruthTable = [
      {a: 0, b: 0, sel: 0, out: 0, nel: 1, A: 0, B: 0},
      {a: 0, b: 0, sel: 1, out: 0, nel: 0, A: 0, B: 0},
      {a: 0, b: 1, sel: 0, out: 0, nel: 1, A: 0, B: 0},
      {a: 0, b: 1, sel: 1, out: 1, nel: 0, A: 0, B: 1},
      {a: 1, b: 0, sel: 0, out: 1, nel: 1, A: 1, B: 0},
      {a: 1, b: 0, sel: 1, out: 0, nel: 0, A: 0, B: 0},
      {a: 1, b: 1, sel: 0, out: 1, nel: 1, A: 1, B: 0},
      {a: 1, b: 1, sel: 1, out: 1, nel: 0, A: 0, B: 1}
    ];

    // Test full table:
    let result = mux.execOnData(fullTruthTable).result;
    expect(result).toEqual(fullTruthTable);
  });

  it('should use built-in backend', () => {
    const MyAndGate = HDLClassFactory.fromHDL(`
      CHIP And {
        IN a, b;
        OUT out;

        BUILTIN And;
      }
    `);
    expect(MyAndGate).toBe(require('../builtin-gates/And'));
  });

  it('built-in backend for parts', () => {
    const Nand = HDLClassFactory.fromHDL(`
      CHIP Nand {
        IN a, b;
        OUT out;

        PARTS:

        And(a=b, b=b, out=a_and_b);
        Not16(in=a_and_b, out=out);

        BUILTIN And;
      }
    `, EXAMPLES_DIR);

    expect(Object.getPrototypeOf(Nand)).toBe(CompositeGate);

    const nand = Nand.defaultFromSpec();
    const [and, not] = nand.getParts();

    expect(and).toBeInstanceOf(BuiltInGate);
    expect(not).toBeInstanceOf(CompositeGate);
  });

  it('virtualDirectory', () => {
    const virtualDirectory = {
      And: fs.readFileSync(EXAMPLES_DIR + 'And.hdl', 'utf-8'),
    };

    HDLClassFactory.setVirtualDirectory(virtualDirectory);

    expect(HDLClassFactory.fromHDL(virtualDirectory.And))
      .toBe(HDLClassFactory.fromHDL(virtualDirectory.And));

    // Reset back:
    HDLClassFactory.setVirtualDirectory(null);
  });

  it('loadGate', () => {
    const virtualDirectory = {
      And: fs.readFileSync(EXAMPLES_DIR + 'And.hdl', 'utf-8'),
    };

    HDLClassFactory.setVirtualDirectory(virtualDirectory);

    expect(HDLClassFactory.loadGate('And'))
      .toBe(HDLClassFactory.loadGate('And'));

    expect(Object.getPrototypeOf(HDLClassFactory.loadGate('Nand')))
      .toBe(BuiltInGate);

    // Reset back:
    HDLClassFactory.setVirtualDirectory(null);
  });
});