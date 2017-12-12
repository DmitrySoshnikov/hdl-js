/**
 * The MIT License (MIT)
 * Copyright (c) 2017-present Dmitry Soshnikov <dmitry.soshnikov@gmail.com>
 */

const fs = require('fs');
const parser = require('..');

describe('hdl-parser', () => {

  it('basic-file', () => {

    const exampleHDL = fs.readFileSync(
      __dirname + '/../../../examples/And.hdl',
      'utf-8'
    );

    expect(parser.parse(exampleHDL)).toEqual({
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
    });
  });


  it('lower-case', () => {

    const exampleHDL = `
      chip Sum {
        in x, y;
        out out;
        parts:
          Add(x=x, y=y, out=out);
      }
    `;

    expect(parser.parse(exampleHDL)).toEqual({
      type: 'Chip',
      name: 'Sum',
      inputs: [
        'x',
        'y',
      ],
      outputs: [
        'out',
      ],
      parts: [
        {
          type: 'ChipCall',
          name: 'Add',
          arguments: [
            {
              type: 'Argument',
              name: 'x',
              value: 'x',
            },
            {
              type: 'Argument',
              name: 'y',
              value: 'y',
            },
            {
              type: 'Argument',
              name: 'out',
              value: 'out',
            },
          ],
        },
      ],
    });

  });
});