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

describe('script-interpreter', () => {
  it('nextStep', () => {
    const script = new ScriptInterpreter({
      file: EXAMPLES_DIR + '/And.tst',
      workingDirectory,
    });

    script.nextStep();
    script.nextStep();
    script.nextStep();
    script.nextStep();
    script.nextStep();

    const expectedOut = [
      '|   a   |   b   |  out  |',
      '|   0   |   0   |   0   |',
      '|   0   |   1   |   0   |',
      '|   1   |   0   |   0   |',
      '|   1   |   1   |   1   |',
      '',
    ].join('\n');

    const actualOut = fs.readFileSync(workingDirectory + '/And.out', 'utf-8');

    expect(actualOut).toBe(expectedOut);
  });
});
