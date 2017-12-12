/**
 * The MIT License (MIT)
 * Copyright (c) 2017-present Dmitry Soshnikov <dmitry.soshnikov@gmail.com>
 */

const parser = require('..');

describe('hdl-parser', () => {

  it('basic-file', () => {

    const exampleHDL = `
      CHIP And {
        IN a, b[4];
        OUT out[8], out2;

        PARTS:

        Nand(a=a, b=b[1], out[3]=n);
      }
    `;

    expect(parser.parse(exampleHDL)).toEqual({
      type: 'Chip',
      name: 'And',
      inputs: [
        {
          type: 'Name',
          value: 'a',
        },
        {
          type: 'Name',
          value: 'b',
          size: 4,
        },
      ],
      outputs: [
        {
          type: 'Name',
          value: 'out',
          size: 8,
        },
        {
          type: 'Name',
          value: 'out2',
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
                value: 'a',
              },
              value: {
                type: 'Name',
                value: 'a',
              },
            },
            {
              type: 'Argument',
              name: {
                type: 'Name',
                value: 'b',
              },
              value: {
                type: 'Name',
                value: 'b',
                index: 1,
              },
            },
            {
              type: 'Argument',
              name: {
                type: 'Name',
                value: 'out',
                index: 3,
              },
              value: {
                type: 'Name',
                value: 'n',
              },
            },
          ],
        },
      ],
    });
  });

});