/**
 * The MIT License (MIT)
 * Copyright (c) 2017-present Dmitry Soshnikov <dmitry.soshnikov@gmail.com>
 */

'use strict';

const ScriptInterpreter = require('../script-interpreter');
const fs = require('fs');
const os = require('os');

const EXAMPLES_DIR = __dirname + '/../examples';
const workingDirectory = os.tmpdir();

const expectedAndOut = [
  '|   a   |   b   |  out  |',
  '|   0   |   0   |   0   |',
  '|   0   |   1   |   0   |',
  '|   1   |   0   |   0   |',
  '|   1   |   1   |   1   |',
  '',
].join('\n');

describe('script-interpreter', () => {
  it('full run', () => {
    const script = new ScriptInterpreter({
      file: EXAMPLES_DIR + '/And.tst',
      workingDirectory,
    });

    script.exec();

    const actualOut = fs.readFileSync(workingDirectory + '/And.out', 'utf-8');
    expect(actualOut).toBe(expectedAndOut);
  });

  it('nextStep', () => {
    const script = new ScriptInterpreter({
      file: EXAMPLES_DIR + '/And.tst',
      workingDirectory,
    });

    // Total And.tst has 5 steps (groups of commands):
    for (let i = 0; i < 5; i++) {
      script.nextStep();
    }

    const actualOut = fs.readFileSync(workingDirectory + '/And.out', 'utf-8');
    expect(actualOut).toBe(expectedAndOut);
  });

  it('nextCommand', () => {
    const script = new ScriptInterpreter({
      file: EXAMPLES_DIR + '/And.tst',
      workingDirectory,
    });

    // Total And.tst has 20 commands:
    for (let i = 0; i < 20; i++) {
      script.nextCommand();
    }

    const actualOut = fs.readFileSync(workingDirectory + '/And.out', 'utf-8');
    expect(actualOut).toBe(expectedAndOut);
  });

  it('repeat', () => {
    const script = new ScriptInterpreter({
      script: `
        load And,
        output-file And.out,
        output-list a%B3.1.3 b%B3.1.3 out%B3.1.3;

        repeat 2 {
          set a 0, set b 0, eval, output;
          set a 1, set b 1, eval, output;
        }
      `,
      workingDirectory,
    });

    script.exec();

    const expectedOut = [
      '|   a   |   b   |  out  |',
      '|   0   |   0   |   0   |',
      '|   1   |   1   |   1   |',
      '|   0   |   0   |   0   |',
      '|   1   |   1   |   1   |',
      '',
    ].join('\n');

    const actualOut = fs.readFileSync(workingDirectory + '/And.out', 'utf-8');
    expect(actualOut).toBe(expectedOut);
  });

  it('while', () => {
    const script = new ScriptInterpreter({
      script: `
        load And16,
        output-file And.out,
        output-list a%B1.16.1 b%B1.16.1 out%B1.16.1;

        while a[1] <> 1 {
          set a[1] 1, set b[1] 0, eval, output;
          set a[2] 1, set b[1] 1, eval, output;
        }
      `,
      workingDirectory,
    });

    script.exec();

    const expectedOut = [
      '|        a         |        b         |       out        |',
      '| 0000000000000010 | 0000000000000000 | 0000000000000000 |',
      '| 0000000000000110 | 0000000000000010 | 0000000000000010 |',
      '',
    ].join('\n');

    const actualOut = fs.readFileSync(workingDirectory + '/And.out', 'utf-8');
    expect(actualOut).toBe(expectedOut);
  });

  it('virtual directory', () => {
    const virtualDirectory = {
      // Gate file:
      'MyGate.hdl': `
        CHIP MyAnd {
          IN x, y;
          OUT z;

          PARTS:

          Nand(a=x, b=y, out=n);
          Nand(a=n, b=n, out=z);
        }
      `,

      // Script file:
      'MyGate.tst': `
        load MyGate.hdl,
        output-file MyGate.out,
        compare-to MyGate.cmp,
        output-list x%B3.1.3 y%B3.1.3 n%B3.1.3 z%B3.1.3;

        set x 1, set y 0, eval, output;
        set x 1, set y 1, eval, output;
      `,

      'MyGate.cmp': [
        '|   x   |   y   |   n   |   z   |',
        '|   1   |   0   |   1   |   0   |',
        '|   1   |   1   |   0   |   1   |',
        '',
      ].join('\n'),
    };

    const script = new ScriptInterpreter({
      script: virtualDirectory['MyGate.tst'],
      workingDirectory: virtualDirectory,
    });

    script.exec();

    expect(virtualDirectory['MyGate.out']).toBe(virtualDirectory['MyGate.cmp']);
  });
});
