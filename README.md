# hdl-js

[![Build Status](https://travis-ci.org/DmitrySoshnikov/hdl-js.svg?branch=master)](https://travis-ci.org/DmitrySoshnikov/hdl-js) [![npm version](https://badge.fury.io/js/hdl-js.svg)](https://badge.fury.io/js/hdl-js)

Hardware description language (HDL) parser, and Hardware simulator.

## Table of Contents

- [Installation](#installation)
- [Development](#development)
- [Parser](#parser)
  - [Usage as a CLI](#usage-as-a-cli)
  - [Usage from Node](#usage-from-node)
- [Emulator](#emulator)
  - [Built-in gates](#built-in-gates)
  - [Viewing gate specification](#viewing-gate-specification)
  - [Specifying output format](#specifying-output-format)
  - [Testing gates on passed data](#testing-gates-on-passed-data)
  - [Validating passed data on gate logic](#validating-passed-data-on-gate-logic)
  - [Main chip groups](#main-chip-groups)
    - [Very basic chips](#very-basic-chips)
    - [Basic chips](#basic-chips)
    - [ALU](#alu)
    - [Memory chips](#memory-chips)
  - [Composite gates](#composite-gates)

## Installation

The parser can be installed as an [npm module](https://www.npmjs.com/package/hdl-js):

```
npm install -g hdl-js

hdl-js --help
```

## Development

1. Fork https://github.com/DmitrySoshnikov/hdl-js repo
2. Make your changes
3. Make sure `npm test` still passes (add new tests if needed)
4. Submit a PR

For development from the github repository, run `build` command to generate the parser module:

```
git clone https://github.com/<your-github-account>/hdl-js.git
cd hdl-js
npm install
npm run build

./bin/hdl-js --help
```

> NOTE: You need to run `build` command every time you change the grammar file.

## Parser

The `hdl-js` is implemented as an automatic LR parser using [Syntax](https://www.npmjs.com/package/syntax-cli) tool. The parser module is generated from the corresponding [grammar](https://github.com/DmitrySoshnikov/hdl-js/blob/master/src/parser/hdl.g) file.


### Usage as a CLI

Check the options available from CLI:

```
hdl-js --help
```

```
Usage: hdl-js [options]

Options:
  --help, -h          Show help                                        [boolean]
  --version, -v       Show version number                              [boolean]
  --gate, -g          Name of a built-in gate or path to an HDL file
  --parse, -p         Parse the HDL file, and print AST
  --list, -l          List supported built-in gates
  --describe, -d      Prints gate's specification
  --exec-on-data, -e  Evaluates gate's logic on passed data; validates outputs
                      if passed
  --format, -f        Values format (binary, hexidecimal, decimal)
                                                  [choices: "bin", "hex", "dec"]
```

> NOTE: the implementation of some built-in chips, and the HDL format is heavily inspired by the wonderful [nand2tetris](http://nand2tetris.org/) course by Noam Nisan and Shimon Schocken.

For the [examples/And.hdl](https://github.com/DmitrySoshnikov/hdl-js/blob/master/examples/And.hdl) file:

```
/**
 * And gate:
 * out = 1 if (a == 1 and b == 1)
 *       0 otherwise
 */

CHIP And {
  IN a, b;
  OUT out;

  PARTS:

  Nand(a=a, b=b, out=n);
  Nand(a=n, b=n, out=out);
}
```

Running the:

```
./bin/hdl-js --gate examples/And.hdl --parse
```

We get the parsed AST:

```js
{
  type: 'Chip',
  name: 'And',
  inputs: [
    {
      type: 'Name',
      value: 'a'
    },
    {
      type: 'Name',
      value: 'b'
    }
  ],
  outputs: [
    {
      type: 'Name',
      value: 'out'
    }
  ],
  parts: [
    {
      type: 'ChipCall',
      name: 'Nand',
      arguments: [
        {
          type: 'Argument',
          name: {
            type: 'Name',
            value: 'a'
          },
          value: {
            type: 'Name',
            value: 'a'
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
            value: 'b'
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
            value: 'n'
          }
        }
      ]
    },
    {
      type: 'ChipCall',
      name: 'Nand',
      arguments: [
        {
          type: 'Argument',
          name: {
            type: 'Name',
            value: 'a'
          },
          value: {
            type: 'Name',
            value: 'n'
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
            value: 'n'
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
        }
      ]
    }
  ],
  builtins: [],
  clocked: [],
}
```

#### Usage from Node

The parser can also be used as a Node module:

```js
const fs = require('fs');
const hdl = require('hdl-js');

const hdlFile = fs.readFileSync('./examples/And.hdl', 'utf-8');

console.log(hdl.parse(hdlFile)); // HDL AST
```

## Emulator

[Hardware emulator](https://github.com/DmitrySoshnikov/hdl-js/tree/master/src/emulator/hardware) module simulates and tests logic gates and chips implemented in the HDL, and also provides canonical implementation of the [built-in chips](https://github.com/DmitrySoshnikov/hdl-js/tree/master/src/emulator/hardware/builtin-gates).

### Built-in gates

In general, all the gates can be built manually in HDL from the very basic Nand or Nor gates. However, `hdl-js` also provides implementation of most of the computer chips, built directly in JavaScript. You can use these gates as building blocks with faster implementation, and also to check your own implementation in case you build custom versions of these chips.

The `--list` (`-l`) command shows all the _built-in gates_ available in the emulator. The gates can be analyzed, executed, and used further as basic building blocks in construction of _compound gates_.

```
./bin/hdl-js --list

Built-in gates:

- And
- And16
- Or
- ...
```

Once you know a gate of interest, you can introspect its specification.

### Viewing gate specification

To see the specification of a particular gate, we can use `--describe` (`-d`) option, passing the name of a needed `--gate` (`-g`):

```
./bin/hdl-js --gate And --describe
```

Result:

```
"And" gate:

Description:

  Implements bitwise 1-bit And & operation.

Inputs:

  - a
  - b

Outputs:

  - out

Truth table:

┌───┬───┬─────┐
│ a │ b │ out │
├───┼───┼─────┤
│ 0 │ 0 │  0  │
├───┼───┼─────┤
│ 0 │ 1 │  0  │
├───┼───┼─────┤
│ 1 │ 0 │  0  │
├───┼───┼─────┤
│ 1 │ 1 │  1  │
└───┴───┴─────┘
```

> NOTE: the `--gate` option handles both, built-in gates by name, and custom gates from HDL files.

From Node the specification of a built-in gate is exposed via `Spec` option on the gate class:

```js
const hdl = require('hdl-js');

const {And} = hdl.emulator.BuiltInGates;

console.log(And.Spec);

/*

Output:

{
  description: 'Implements bitwise 1-bit And & operation.',

  inputPins: ['a', 'b'],

  outputPins: ['out'],

  truthTable: [
    {a: 0, b: 0, out: 0},
    {a: 0, b: 1, out: 0},
    {a: 1, b: 0, out: 0},
    {a: 1, b: 1, out: 1},
  ]
}

*/
```

### Specifying output format

Using `--format` option it is possible to control the format of the input/output values. For example, the truth table of the `And16` gate in binary (default), and hexadecimal formats:

```
./bin/hdl-js --gate And16 --describe
```

Binary output format:

```
┌──────────────────┬──────────────────┬──────────────────┐
│      a[16]       │      b[16]       │     out[16]      │
├──────────────────┼──────────────────┼──────────────────┤
│ 0000000000000000 │ 0000000000000000 │ 0000000000000000 │
├──────────────────┼──────────────────┼──────────────────┤
│ 0000000000000000 │ 1111111111111111 │ 0000000000000000 │
├──────────────────┼──────────────────┼──────────────────┤
│ 1111111111111111 │ 1111111111111111 │ 1111111111111111 │
├──────────────────┼──────────────────┼──────────────────┤
│ 1010101010101010 │ 0101010101010101 │ 0000000000000000 │
├──────────────────┼──────────────────┼──────────────────┤
│ 0011110011000011 │ 0000111111110000 │ 0000110011000000 │
├──────────────────┼──────────────────┼──────────────────┤
│ 0001001000110100 │ 1001100001110110 │ 0001000000110100 │
└──────────────────┴──────────────────┴──────────────────┘
```

With `--format hex`:

```
./bin/hdl-js --gate And16 --describe --format hex
```

Hexidecimal output format:

```
┌───────┬───────┬─────────┐
│ a[16] │ b[16] │ out[16] │
├───────┼───────┼─────────┤
│ 0000  │ 0000  │  0000   │
├───────┼───────┼─────────┤
│ 0000  │ FFFF  │  0000   │
├───────┼───────┼─────────┤
│ FFFF  │ FFFF  │  FFFF   │
├───────┼───────┼─────────┤
│ AAAA  │ 5555  │  0000   │
├───────┼───────┼─────────┤
│ 3CC3  │ 0FF0  │  0CC0   │
├───────┼───────┼─────────┤
│ 1234  │ 9876  │  1034   │
└───────┴───────┴─────────┘
```

### Testing gates on passed data

It is possible to manually test and evaluate the outputs of a gate based on its inputs:

```js
const hdl = require('hdl-js');

const {
  emulator: {

    /**
     * `Pin` class is used to define inputs, and outputs.
     */
    Pin,

    BuiltInGates: {
      And,
    }
  }
} = hdl;

const and = new And({
  inputPins: [
    new Pin({name: 'a', value: 1}),
    new Pin({name: 'b', value: 1}),
  ],

  outputPins: [
    new Pin({name: 'out'}),
  ],
});

// Run the logic.
and.eval();

// Check "out" pin value:
console.log(and.getOutputPins()[0].getValue()); // 1
```

Input and output pins can also be passed as _plain objects_, rather than as `Pin` instances:

```js
const hdl = require('hdl-js');

const {
  And,
  And16,
} = hdl.emulator.BuiltInGates;

// Simple names:

const and1 = new And({
  inputPins: ['a', 'b'],
  outputPins: ['out'],
});

and1.setPinValues({a: 1, b: 0});
and1.eval();

console.log(and1.getPin('out').getValue()); // 0

// Spec with values and sizes:

const and2 = new And16({
  inputPins: [
    {name: 'a', size: 16, value: 1},
    {name: 'b', size: 16, value: 0},
  ],
  outputPins: [
    {name: 'out', size: 16},
  ],
});

and2.eval();
console.log(and2.getPin('out').getValue()); // 0
```

It is possible to execute and test gate logic on the set of data:

```js
// const and = new And({ ... });

// Test the gate on set of inputs, get the results
// for the outputs.

const inputData = [
  {a: 1, b: 0},
  {a: 1, b: 1},
];

const {result} = and.execOnData(inputData);

console.log(result);

/*

Output for `result`:

[
  {a: 1, b: 0, out: 0},
  {a: 1, b: 1, out: 1},
]

*/
```

### Validating passed data on gate logic

In addition, if _output pins_ are passed, the `execOnData` will validates them, and report conflicting pins, if the expected values differ from the actual ones:


```js
// const and = new And({ ... });

// Pass the output pins as well:

const data = [
  {a: 1, b: 0, out: 1}, // invalid output
  {a: 1, b: 1, out: 1}, // valid
];

let {
  result,
  conflicts,
} = and.execOnData(data);

// Result is a correct truth table:
console.log(result);

/*

Output for `result`:

[
  {a: 1, b: 0, out: 0},
  {a: 1, b: 1, out: 1},
]

*/

// Conflicts contain conflicting entries: {row, pins}.
console.log(conflicts);

/*

Conflicts output:

[
  {
    row: 0,
    pins: {
      out: {
        expected: 1,
        actual: 0,
      },
    },
  },
]

*/
```

From the CLI it's controlled via the `--exec-on-data` (`-e`) option.

In the example below we validate the gate logic, passing (incorrect in this case) expected value for the `out` pin of the `Or` gate:

```
./bin/hdl-js -g Or -e '[{"a": 1, "b": 1, "out": 0}]'

Found 1 conflicts in:

  - row: 0, pins: out

┌───┬───┬───────┐
│ a │ b │  out  │
├───┼───┼───────┤
│ 1 │ 1 │ 0 / 1 │
└───┴───┴───────┘
```

It is possible using actual number values in binary (`0b1111`), hexidecimal (`0xF`), and decimal (`15`) formats. Otherwise, the values have to be passed as strings (`'FFFF'` for `0xFFFF`) with correct `--format` option:

```
./bin/hdl-js -g Not16 -e '[{in: 0xFFFF}]' -f hex
```

Output:

```
Truth table for data:

┌────────┬─────────┐
│ in[16] │ out[16] │
├────────┼─────────┤
│  FFFF  │  0000   │
└────────┴─────────┘
```

### Main chip groups

All gates are grouped into the following categories:

#### Very basic chips

This group includes two gates which can be used to build _anything else_.

- [Nand](https://github.com/DmitrySoshnikov/hdl-js/blob/master/src/emulator/hardware/builtin-gates/Nand.js) (negative-And)
- [Nor](https://github.com/DmitrySoshnikov/hdl-js/blob/master/src/emulator/hardware/builtin-gates/Nor.js) (negative-Or)

For example, as was shown above, the basic `And` chip can be built on top of two connected `Nand` gates:

```
CHIP And {
  IN a, b;
  OUT out;

  PARTS:

  Nand(a=a, b=b, out=n);
  Nand(a=n, b=n, out=out);
}
```

#### Basic chips

The basic group of chips includes primitive building blocks for more complex chips. The basic chips themselves are built from the [very basic chips](#very-basic-chips). The group includes:

- [And](https://github.com/DmitrySoshnikov/hdl-js/blob/master/src/emulator/hardware/builtin-gates/And.js)
- [And16](https://github.com/DmitrySoshnikov/hdl-js/blob/master/src/emulator/hardware/builtin-gates/And16.js)
- [Or](https://github.com/DmitrySoshnikov/hdl-js/blob/master/src/emulator/hardware/builtin-gates/Or.js)
- [Or16](https://github.com/DmitrySoshnikov/hdl-js/blob/master/src/emulator/hardware/builtin-gates/Or16.js)
- [Or8Way](https://github.com/DmitrySoshnikov/hdl-js/blob/master/src/emulator/hardware/builtin-gates/Or8Way.js)
- [Not](https://github.com/DmitrySoshnikov/hdl-js/blob/master/src/emulator/hardware/builtin-gates/Not.js)
- [Not16](https://github.com/DmitrySoshnikov/hdl-js/blob/master/src/emulator/hardware/builtin-gates/Not16.js)
- [Xor](https://github.com/DmitrySoshnikov/hdl-js/blob/master/src/emulator/hardware/builtin-gates/Xor.js)
- [Mux](https://github.com/DmitrySoshnikov/hdl-js/blob/master/src/emulator/hardware/builtin-gates/Mux.js) (multiplexer)
- [Mux16](https://github.com/DmitrySoshnikov/hdl-js/blob/master/src/emulator/hardware/builtin-gates/Mux16.js)
- [Mux4Way16](https://github.com/DmitrySoshnikov/hdl-js/blob/master/src/emulator/hardware/builtin-gates/Mux4Way16.js)
- [Mux8Way16](https://github.com/DmitrySoshnikov/hdl-js/blob/master/src/emulator/hardware/builtin-gates/Mux8Way16.js)
- [DMux](https://github.com/DmitrySoshnikov/hdl-js/blob/master/src/emulator/hardware/builtin-gates/DMux.js) (demultiplexer)
- [DMux4Way](https://github.com/DmitrySoshnikov/hdl-js/blob/master/src/emulator/hardware/builtin-gates/DMux4Way.js)
- [DMux8Way](https://github.com/DmitrySoshnikov/hdl-js/blob/master/src/emulator/hardware/builtin-gates/DMux8Way.js)

For example, the more complex [HalfAdder](https://github.com/DmitrySoshnikov/hdl-js/blob/master/src/emulator/hardware/builtin-gates/HalfAdder.js) chip can be built on top of Xor, and And gates:

```
CHIP HalfAdder {
  IN a, b;    // 1-bit inputs
  OUT sum,    // Right bit of a + b
      carry;  // Left bit of a + b

  PARTS:

  Xor(a=a, b=b, out=sum);
  And(a=a, b=b, out=carry);
}
```

The `Mux` (multiplexer) gate, which provides basic _selection_ (or _"if"_ operation), and being a basic chip, can itself be built from other basic chips from this group, such as `Not`, `And`, and `Or`.

To see the _full specification_ and _truth table_ of a needed gate, use `--describe` (`-d`) option from CLI.

#### ALU

The _arithmetic-logic unit_ is an abstraction which encapsulates inside several operations, implemented as smaller sub-chips. Usually ALU accepts two numbers, and based on the _OpCode (operation code)_, evaluates needed result. This group of chips includes:

- [HalfAdder](https://github.com/DmitrySoshnikov/hdl-js/blob/master/src/emulator/hardware/builtin-gates/HalfAdder.js) (2 bits adder)
- [FullAdder](https://github.com/DmitrySoshnikov/hdl-js/blob/master/src/emulator/hardware/builtin-gates/FullAdder.js) (3 bits adder)
- [Add16](https://github.com/DmitrySoshnikov/hdl-js/blob/master/src/emulator/hardware/builtin-gates/Add16.js)
- [Inc16](https://github.com/DmitrySoshnikov/hdl-js/blob/master/src/emulator/hardware/builtin-gates/Inc16.js)
- ALU

The ALU chip itself evaluates both, arithmetic (such as addition), and logic (such as `And`, `Or`, etc) operations.

#### Memory chips

The basic building block for memory chips is a [Flip-Flop](https://en.wikipedia.org/wiki/Flip-flop_(electronics)). In particular, in this specific case, it's the _DFF (Data/Delay Flip-Flop)_.

On top of `DFF` other storage chips, such as 1 `Bit` abstraction, or 16-bit `Register` abstraction, are built. The group includes the following chips:

- [DFF](https://github.com/DmitrySoshnikov/hdl-js/blob/master/src/emulator/hardware/builtin-gates/DFF.js) (Data/Delay Flip-Flop)
- [Bit](https://github.com/DmitrySoshnikov/hdl-js/blob/master/src/emulator/hardware/builtin-gates/Bit.js) (1-bit memory unit)
- [Register](https://github.com/DmitrySoshnikov/hdl-js/blob/master/src/emulator/hardware/builtin-gates/Register.js) (16-bit memory unit)
- ARegister (Address Register)
- DRegister (Data Register)
- PC (Program Counter)
- [RAM](https://github.com/DmitrySoshnikov/hdl-js/blob/master/src/emulator/hardware/builtin-gates/RAM.js) (Random Access Memory)
- [RAM8](https://github.com/DmitrySoshnikov/hdl-js/blob/master/src/emulator/hardware/builtin-gates/RAM8.js)
- [RAM64](https://github.com/DmitrySoshnikov/hdl-js/blob/master/src/emulator/hardware/builtin-gates/RAM64.js)
- [RAM512](https://github.com/DmitrySoshnikov/hdl-js/blob/master/src/emulator/hardware/builtin-gates/RAM512.js)
- [RAM4K](https://github.com/DmitrySoshnikov/hdl-js/blob/master/src/emulator/hardware/builtin-gates/RAM4K.js)
- [RAM16K](https://github.com/DmitrySoshnikov/hdl-js/blob/master/src/emulator/hardware/builtin-gates/RAM16K.js)

Memory chips are synchronized by the [clock](https://en.wikipedia.org/wiki/Clock_signal), and operate on _rising_ and _falling_ edges of the [clock cycle](https://en.wikipedia.org/wiki/Clock_rate). Specification, and truth table of such chips contains `$clock` information, where negative values (e.g. `-0`) mean low logical level, and positive (`+0`) -- high logical level, or the rising edge.

Running the:

```
hdl-js --gate Bit --describe
```

Shows the clock information:

```
"Bit" gate:

Description:

  1 bit memory register.

  If load[t]=1 then out[t+1] = in[t] else out does not change.

  Clock rising edge updates internal state from the input,
  if the `load` is set; otherwise, preserves the state.

    ↗ : state = load ? in : state

  Clock falling edge propagates the internal state to the output:

    ↘ : out = state

Inputs:

  - in
  - load

Outputs:

  - out

Truth table:

┌────────┬────┬──────┬─────┐
│ $clock │ in │ load │ out │
├────────┼────┼──────┼─────┤
│   -0   │ 0  │  0   │  0  │
├────────┼────┼──────┼─────┤
│   +0   │ 1  │  1   │  0  │
├────────┼────┼──────┼─────┤
│   -1   │ 1  │  0   │  1  │
├────────┼────┼──────┼─────┤
│   +1   │ 1  │  0   │  1  │
├────────┼────┼──────┼─────┤
│   -2   │ 1  │  0   │  1  │
├────────┼────┼──────┼─────┤
│   +2   │ 0  │  1   │  1  │
├────────┼────┼──────┼─────┤
│   -3   │ 0  │  0   │  0  │
└────────┴────┴──────┴─────┘
```

The _internal state_ of a clocked chip can _only_ change on the _rising edge_. While the _output_ is _committed_ (usually to reflect the internal state) on the _falling edge_ of the clock. This _delay_ of the output is exactly reflected in the DFF, that is _Delay_ Flip-Flop, name.

### Composite gates

TODO; WIP