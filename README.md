# hdl-js

[![Build Status](https://travis-ci.org/DmitrySoshnikov/hdl-js.svg?branch=master)](https://travis-ci.org/DmitrySoshnikov/hdl-js) [![npm version](https://badge.fury.io/js/hdl-js.svg)](https://badge.fury.io/js/hdl-js)

Hardware definition language (HDL) parser, and Hardware simulator.

### Table of Contents

- [Installation](#installation)
- [Development](#development)
- [Usage as a CLI](#usage-as-a-cli)
- [Usage from Node](#usage-from-node)
- [Emulator](#emulator)

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
  --help, -h     Show help                                       [boolean]
  --version, -v  Show version number                             [boolean]
  --file, -f     An HDL file containing chip specification       [required]
  --parse, -p    Parse the HDL file, and print AST
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

TODO; WIP.