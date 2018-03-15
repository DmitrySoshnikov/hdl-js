/**
 * The MIT License (MIT)
 * Copyright (c) 2017-present Dmitry Soshnikov <dmitry.soshnikov@gmail.com>
 */

'use strict';

const scriptParser = require('../script-parser');
const fs = require('fs');

const EXAMPLES_DIR = __dirname + '/../examples';

describe('script-parser', () => {
  it('and parse', () => {
    const script = fs.readFileSync(EXAMPLES_DIR + '/And.tst', 'utf-8');
    const ast = scriptParser.parse(script);

    expect(ast).toEqual({
      type: 'Script',
      commands: [
        {
          type: 'ControllerCommand',
          name: 'load',
          arguments: ['And.hdl'],
          terminator: ',',
        },
        {
          type: 'ControllerCommand',
          name: 'output-file',
          arguments: ['And.out'],
          terminator: ',',
        },
        {
          type: 'ControllerCommand',
          name: 'compare-to',
          arguments: ['And.cmp'],
          terminator: ',',
        },
        {
          type: 'ControllerCommand',
          name: 'output-list',
          arguments: [
            {
              column: 'a',
              format: 'B',
              left: 3,
              middle: 1,
              right: 3,
            },
            {
              column: 'b',
              format: 'B',
              left: 3,
              middle: 1,
              right: 3,
            },
            {
              column: 'out',
              format: 'B',
              left: 3,
              middle: 1,
              right: 3,
            },
          ],
          terminator: ';',
        },
        {
          type: 'SimulatorCommand',
          name: 'set',
          arguments: [
            {
              type: 'Name',
              value: 'a',
            },
            {
              type: 'Value',
              value: 0,
            },
          ],
          terminator: ',',
        },
        {
          type: 'SimulatorCommand',
          name: 'set',
          arguments: [
            {
              type: 'Name',
              value: 'b',
            },
            {
              type: 'Value',
              value: 0,
            },
          ],
          terminator: ',',
        },
        {
          type: 'SimulatorCommand',
          name: 'eval',
          arguments: [],
          terminator: ',',
        },
        {
          type: 'ControllerCommand',
          name: 'output',
          arguments: [],
          terminator: ';',
        },
        {
          type: 'SimulatorCommand',
          name: 'set',
          arguments: [
            {
              type: 'Name',
              value: 'a',
            },
            {
              type: 'Value',
              value: 0,
            },
          ],
          terminator: ',',
        },
        {
          type: 'SimulatorCommand',
          name: 'set',
          arguments: [
            {
              type: 'Name',
              value: 'b',
            },
            {
              type: 'Value',
              value: 1,
            },
          ],
          terminator: ',',
        },
        {
          type: 'SimulatorCommand',
          name: 'eval',
          arguments: [],
          terminator: ',',
        },
        {
          type: 'ControllerCommand',
          name: 'output',
          arguments: [],
          terminator: ';',
        },
        {
          type: 'SimulatorCommand',
          name: 'set',
          arguments: [
            {
              type: 'Name',
              value: 'a',
            },
            {
              type: 'Value',
              value: 1,
            },
          ],
          terminator: ',',
        },
        {
          type: 'SimulatorCommand',
          name: 'set',
          arguments: [
            {
              type: 'Name',
              value: 'b',
            },
            {
              type: 'Value',
              value: 0,
            },
          ],
          terminator: ',',
        },
        {
          type: 'SimulatorCommand',
          name: 'eval',
          arguments: [],
          terminator: ',',
        },
        {
          type: 'ControllerCommand',
          name: 'output',
          arguments: [],
          terminator: ';',
        },
        {
          type: 'SimulatorCommand',
          name: 'set',
          arguments: [
            {
              type: 'Name',
              value: 'a',
            },
            {
              type: 'Value',
              value: 1,
            },
          ],
          terminator: ',',
        },
        {
          type: 'SimulatorCommand',
          name: 'set',
          arguments: [
            {
              type: 'Name',
              value: 'b',
            },
            {
              type: 'Value',
              value: 1,
            },
          ],
          terminator: ',',
        },
        {
          type: 'SimulatorCommand',
          name: 'eval',
          arguments: [],
          terminator: ',',
        },
        {
          type: 'ControllerCommand',
          name: 'output',
          arguments: [],
          terminator: ';',
        },
      ],
    });
  });

  it('example parse', () => {
    const ast = scriptParser.parseFile(EXAMPLES_DIR + '/Example.tst');

    expect(ast).toEqual({
      type: 'Script',
      commands: [
        {
          type: 'ControllerCommand',
          name: 'load',
          arguments: ['MyGate.hdl'],
          terminator: ',',
        },
        {
          type: 'ControllerCommand',
          name: 'output-file',
          arguments: ['MyGate.out'],
          terminator: ',',
        },
        {
          type: 'ControllerCommand',
          name: 'compare-to',
          arguments: ['MyGate.cmp'],
          terminator: ',',
        },
        {
          type: 'ControllerCommand',
          name: 'output-list',
          arguments: [
            {
              column: 'a',
              format: 'B',
              left: 3,
              middle: 1,
              right: 3,
            },
            {
              column: 'b',
              format: 'X',
              left: 5,
              middle: 2,
              right: 1,
            },
            {
              column: 'out',
              format: 'D',
              left: 1,
              middle: 1,
              right: 1,
            },
            {
              column: 'RAM[16]',
              format: 'X',
              left: 5,
              middle: 5,
              right: 5,
            },
            {
              column: 'z[]',
              format: 'S',
              left: 1,
              middle: 3,
              right: 1,
            },
          ],
          terminator: ';',
        },
        {
          type: 'ControllerCommand',
          name: 'echo',
          arguments: ['Hello world!'],
          terminator: ',',
        },
        {
          type: 'ControllerCommand',
          name: 'echo',
          arguments: ['Single quotes'],
          terminator: ',',
        },
        {
          type: 'ControllerCommand',
          name: 'clear-echo',
          arguments: [],
          terminator: ';',
        },
        {
          type: 'SimulatorCommand',
          name: 'set',
          arguments: [
            {
              type: 'Name',
              value: 'RAM',
              index: 16,
            },
            {
              type: 'Value',
              value: 62960,
              format: 'X',
              raw: '%XF5F0',
            },
          ],
          terminator: ',',
        },
        {
          type: 'SimulatorCommand',
          name: 'set',
          arguments: [
            {
              type: 'Name',
              value: 'a',
            },
            {
              type: 'Value',
              value: -5,
            },
          ],
          terminator: ',',
        },
        {
          type: 'SimulatorCommand',
          name: 'set',
          arguments: [
            {
              type: 'Name',
              value: 'b',
            },
            {
              type: 'Value',
              value: 5,
              format: 'B',
              raw: '%B101',
            },
          ],
          terminator: ',',
        },
        {
          type: 'SimulatorCommand',
          name: 'set',
          arguments: [
            {
              type: 'Name',
              value: 'out',
            },
            {
              type: 'Value',
              value: 15,
              format: 'D',
              raw: '%D15',
            },
          ],
          terminator: ',',
        },
        {
          type: 'SimulatorCommand',
          name: 'eval',
          arguments: [],
          terminator: ',',
        },
        {
          type: 'ControllerCommand',
          name: 'output',
          arguments: [],
          terminator: ';',
        },
        {
          type: 'ControllerCommand',
          name: 'repeat',
          times: {
            type: 'Value',
            value: 5,
          },
          commands: [
            {
              type: 'SimulatorCommand',
              name: 'eval',
              arguments: [],
              terminator: ',',
            },
            {
              type: 'SimulatorCommand',
              name: 'ticktock',
              arguments: [],
              terminator: ';',
            },
          ],
        },
        {
          type: 'ControllerCommand',
          name: 'while',
          condition: {
            type: 'RelationalExpression',
            operator: '<>',
            left: {
              type: 'Name',
              value: 'a',
            },
            right: {
              type: 'Value',
              value: 15,
            },
          },
          commands: [
            {
              type: 'SimulatorCommand',
              name: 'tick',
              arguments: [],
              terminator: ',',
            },
            {
              type: 'SimulatorCommand',
              name: 'tock',
              arguments: [],
              terminator: ';',
            },
          ],
        },
        {
          type: 'ControllerCommand',
          name: 'while',
          condition: {
            type: 'RelationalExpression',
            operator: '>',
            left: {
              type: 'Name',
              value: 'b',
            },
            right: {
              type: 'Value',
              value: 0,
            },
          },
          commands: [
            {
              type: 'SimulatorCommand',
              name: 'set',
              arguments: [
                {
                  type: 'Name',
                  value: 'b',
                },
                {
                  type: 'Value',
                  value: -1,
                },
              ],
              terminator: ',',
            },
            {
              type: 'SimulatorCommand',
              name: 'eval',
              arguments: [],
              terminator: ';',
            },
          ],
        },
        {
          type: 'ControllerCommand',
          name: 'while',
          condition: {
            type: 'RelationalExpression',
            operator: '>=',
            left: {
              type: 'Name',
              value: 'b',
            },
            right: {
              type: 'Value',
              value: 0,
            },
          },
          commands: [
            {
              type: 'SimulatorCommand',
              name: 'tick',
              arguments: [],
              terminator: ',',
            },
          ],
        },
        {
          type: 'ControllerCommand',
          name: 'while',
          condition: {
            type: 'RelationalExpression',
            operator: '<=',
            left: {
              type: 'Name',
              value: 'b',
            },
            right: {
              type: 'Value',
              value: 0,
            },
          },
          commands: [
            {
              type: 'SimulatorCommand',
              name: 'tock',
              arguments: [],
              terminator: ';',
            },
          ],
        },
        {
          type: 'ControllerCommand',
          name: 'while',
          condition: {
            type: 'RelationalExpression',
            operator: '=',
            left: {
              type: 'Name',
              value: 'b',
            },
            right: {
              type: 'Value',
              value: 15,
            },
          },
          commands: [
            {
              type: 'SimulatorCommand',
              name: 'set',
              arguments: [
                {
                  type: 'Name',
                  value: 'b',
                },
                {
                  type: 'Value',
                  value: 10,
                },
              ],
              terminator: ',',
            },
            {
              type: 'SimulatorCommand',
              name: 'eval',
              arguments: [],
              terminator: ',',
            },
          ],
        },
      ],
    });
  });
});
