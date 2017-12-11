/**
 * The MIT License (MIT)
 * Copyright (c) 2017-present Dmitry Soshnikov <dmitry.soshnikov@gmail.com>
 */

const fs = require('fs');
const parser = require('..');

const exampleHDL = fs.readFileSync(
  __dirname + '/../../../examples/And.hdl',
  'utf-8'
);

const exampleAST = {
  type: 'Chip',
  name: 'And',
  inputs: [
    'a',
    'b',
  ],
  outputs: [
    'out',
  ],
  parts: [
    {
      type: 'ChipCall',
      name: 'Nand',
      arguments: [
        {
          type: 'Argument',
          name: 'a',
          value: 'a',
        },
        {
          type: 'Argument',
          name: 'b',
          value: 'b',
        },
        {
          type: 'Argument',
          name: 'out',
          value: 'n',
        },
      ],
    },
    {
      type: 'ChipCall',
      name: 'Nand',
      arguments: [
        {
          type: 'Argument',
          name: 'a',
          value: 'n',
        },
        {
          type: 'Argument',
          name: 'b',
          value: 'n',
        },
        {
          type: 'Argument',
          name: 'out',
          value: 'out',
        },
      ],
    },
  ],
};

describe('hdl-parser', () => {
  it('basic-file', () => {
    expect(parser.parse(exampleHDL)).toEqual(exampleAST);
  });
});