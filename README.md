# hdl-js

[![Build Status](https://travis-ci.org/DmitrySoshnikov/hdl-js.svg?branch=master)](https://travis-ci.org/DmitrySoshnikov/hdl-js) [![npm version](https://badge.fury.io/js/hdl-js.svg)](https://badge.fury.io/js/hdl-js)

Hardware description language (HDL) parser, and Hardware simulator.

### Table of Contents

- [Installation](#installation)
- [Development](#development)
- [Usage as a CLI](#usage-as-a-cli)
- [Usage from Node](#usage-from-node)
- [Emulator](#emulator)
  - [Built-in gates](#built-in-gates)
  - [Composite gates](#composite-gates)

### Installation

The parser can be installed as an [npm module](https://www.npmjs.com/package/hdl-js):

```
npm install -g hdl-js

hdl-js --help
```

### Development

1. Fork https://github.com/DmitrySoshnikov/hdl-js repo
2. Make your changes
3. Make sure `npm test` still passes (add new tests if needed)
4. Submit a PR

The `hdl-js` is implemented as an automatic LR parser using [Syntax](https://www.npmjs.com/package/syntax-cli) tool. The parser module is generated from the corresponding [grammar](https://github.com/DmitrySoshnikov/hdl-js/blob/master/src/parser/hdl.g) file.

For development from the github repository, run `build` command to generate the parser module:

```
git clone https://github.com/<your-github-account>/hdl-js.git
cd hdl-js
npm install
npm run build

./bin/hdl-js --help
```

> NOTE: You need to run `build` command every time you change the grammar file.

### Usage as a CLI

Check the options available from CLI:

```
hdl-js --help
```

```
Usage: hdl-js [options]

Options:
  --help, -h      Show help                                    [boolean]
  --version, -v   Show version number                          [boolean]
  --file, -f      An HDL file containing chip specification
  --parse, -p     Parse the HDL file, and print AST
  --list, -l      List supported built-in gates
  --gate, -g      Name of a built-in gate
  --describe, -d  Prints gate's specification
  --exec-on-data, -e  Evaluates gate's logic on passed data; validates outputs
                      if passed
```

> NOTE: the HDL format is based on the chips format from the [nand2tetris](http://nand2tetris.org/) course by Noam Nisan and Shimon Schocken.

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
./bin/hdl-js -f examples/And.hdl -p
```

We get the parsed AST is:

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

### Usage from Node

The parser can also be used as a Node module:

```js
const fs = require('fs');
const hdl = require('hdl-js');

const hdlFile = fs.readFileSync('./examples/And.hdl', 'utf-8');

console.log(hdl.parse(hdlFile)); // HDL AST
```

# Emulator

[Hardware emulator](https://github.com/DmitrySoshnikov/hdl-js/tree/master/src/emulator/hardware) module simulates and tests logic gates and chips implemented in the HDL, and also provides canonical implementation of the [built-in chips](https://github.com/DmitrySoshnikov/hdl-js/tree/master/src/emulator/hardware/builtin-gates).

### Built-in gates

The `--list` (`-l`) command shows all the _built-in gates_ available in the emulator. The gates can be analyzed, executed, and used further as basic building blocks in construction of _compound gates_.

```
./bin/hdl-js --list

Built-in gates:

- And
- And16
- Or
- ...
```

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
  {row: 0, pins: {out: 0}},
]

*/
```

### Composite gates

TODO; WIP