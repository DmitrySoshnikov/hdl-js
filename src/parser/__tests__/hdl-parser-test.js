/**
 * The MIT License (MIT)
 * Copyright (c) 2017-present Dmitry Soshnikov <dmitry.soshnikov@gmail.com>
 */

const parser = require('..');

describe('hdl-parser', () => {
  it('basic chip', () => {
    const exampleHDL = `
      CHIP Custom {
        IN a, b[4];
        OUT out[8], out2;

        PARTS:

        Nand(a=a, b=b[1], out[3]=n);
        Nand(a[0..7]=a[1], b=b[8..15], out[3]=n);
      }
    `;

    expect(parser.parse(exampleHDL)).toEqual({
      type: 'Chip',
      name: 'Custom',
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
        },
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
        {
          type: 'ChipCall',
          name: 'Nand',
          arguments: [
            {
              type: 'Argument',
              name: {
                type: 'Name',
                value: 'a',
                range: {
                  from: 0,
                  to: 7,
                },
              },
              value: {
                type: 'Name',
                value: 'a',
                index: 1,
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
                range: {
                  from: 8,
                  to: 15,
                },
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
      builtins: [],
      clocked: [],
    });
  });

  it('builtins', () => {
    const exampleHDL = `
      CHIP RAM64 {

        IN in[16], load, address[6];
        OUT out[16];

        BUILTIN RAM64;
        CLOCKED in, load;
      }
    `;

    expect(parser.parse(exampleHDL)).toEqual({
      type: 'Chip',
      name: 'RAM64',
      inputs: [
        {
          type: 'Name',
          value: 'in',
          size: 16,
        },
        {
          type: 'Name',
          value: 'load',
        },
        {
          type: 'Name',
          value: 'address',
          size: 6,
        },
      ],
      outputs: [
        {
          type: 'Name',
          value: 'out',
          size: 16,
        },
      ],
      parts: [],
      builtins: [
        {
          type: 'Name',
          value: 'RAM64',
        },
      ],
      clocked: [
        {
          type: 'Name',
          value: 'in',
        },
        {
          type: 'Name',
          value: 'load',
        },
      ],
    });
  });

  it('file', () => {
    const ast = parser.parseFile(__dirname + '/../../../examples/And.hdl');
    expect(ast.type).toBe('Chip');
    expect(ast.name).toBe('And');
  });

  it('constants', () => {
    const ast = parser.parse(`
      CHIP MyChip {
        IN a;
        OUT z;

        PARTS:

        Other(a=1, b=0, c=true, d=false, e=15, out=z);
      }
    `);

    expect(ast).toEqual({
      type: 'Chip',
      name: 'MyChip',
      inputs: [
        {
          type: 'Name',
          value: 'a',
        },
      ],
      outputs: [
        {
          type: 'Name',
          value: 'z',
        },
      ],
      parts: [
        {
          type: 'ChipCall',
          name: 'Other',
          arguments: [
            {
              type: 'Argument',
              name: {
                type: 'Name',
                value: 'a',
              },
              value: {
                type: 'Constant',
                value: 1,
                raw: '1',
              },
            },
            {
              type: 'Argument',
              name: {
                type: 'Name',
                value: 'b',
              },
              value: {
                type: 'Constant',
                value: 0,
                raw: '0',
              },
            },
            {
              type: 'Argument',
              name: {
                type: 'Name',
                value: 'c',
              },
              value: {
                type: 'Constant',
                value: 1,
                raw: 'true',
              },
            },
            {
              type: 'Argument',
              name: {
                type: 'Name',
                value: 'd',
              },
              value: {
                type: 'Constant',
                value: 0,
                raw: 'false',
              },
            },
            {
              type: 'Argument',
              name: {
                type: 'Name',
                value: 'e',
              },
              value: {
                type: 'Constant',
                value: 15,
                raw: '15',
              },
            },
            {
              type: 'Argument',
              name: {
                type: 'Name',
                value: 'out',
              },
              value: {
                type: 'Name',
                value: 'z',
              },
            },
          ],
        },
      ],
      builtins: [],
      clocked: [],
    });
  });
});
