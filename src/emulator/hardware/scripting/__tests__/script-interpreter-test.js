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
});
