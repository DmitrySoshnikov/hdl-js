/**
 * The MIT License (MIT)
 * Copyright (c) 2017-present Dmitry Soshnikov <dmitry.soshnikov@gmail.com>
 */

'use strict';

const Gate = require('../../Gate');
const GateTestUtil = require('../../gate-test-util');
const PC = require('../PC');

const {int16Table} = require('../../../../util/typed-numbers');

/**
 * Testing data.
 */
const data = int16Table([
  {$clock:  -0,  in:      0,  reset: 0,  load: 0,  inc: 0,  out:      0},
  {$clock:  +0,  in:      0,  reset: 0,  load: 0,  inc: 0,  out:      0},
  {$clock:  -1,  in:      0,  reset: 0,  load: 0,  inc: 0,  out:      0},
  {$clock:  +1,  in:      0,  reset: 0,  load: 0,  inc: 1,  out:      0},
  {$clock:  -2,  in:      0,  reset: 0,  load: 0,  inc: 1,  out:      1},
  {$clock:  +2,  in: -32123,  reset: 0,  load: 0,  inc: 1,  out:      1},
  {$clock:  -3,  in: -32123,  reset: 0,  load: 0,  inc: 1,  out:      2},
  {$clock:  +3,  in: -32123,  reset: 0,  load: 1,  inc: 1,  out:      2},
  {$clock:  -4,  in: -32123,  reset: 0,  load: 1,  inc: 1,  out: -32123},
  {$clock:  +4,  in: -32123,  reset: 0,  load: 0,  inc: 1,  out: -32123},
  {$clock:  -5,  in: -32123,  reset: 0,  load: 0,  inc: 1,  out: -32122},
  {$clock:  +5,  in: -32123,  reset: 0,  load: 0,  inc: 1,  out: -32122},
  {$clock:  -6,  in: -32123,  reset: 0,  load: 0,  inc: 1,  out: -32121},
  {$clock:  +6,  in:  12345,  reset: 0,  load: 1,  inc: 0,  out: -32121},
  {$clock:  -7,  in:  12345,  reset: 0,  load: 1,  inc: 0,  out:  12345},
  {$clock:  +7,  in:  12345,  reset: 1,  load: 1,  inc: 0,  out:  12345},
  {$clock:  -8,  in:  12345,  reset: 1,  load: 1,  inc: 0,  out:      0},
  {$clock:  +8,  in:  12345,  reset: 0,  load: 1,  inc: 1,  out:      0},
  {$clock:  -9,  in:  12345,  reset: 0,  load: 1,  inc: 1,  out:  12345},
  {$clock:  +9,  in:  12345,  reset: 1,  load: 1,  inc: 1,  out:  12345},
  {$clock: -10,  in:  12345,  reset: 1,  load: 1,  inc: 1,  out:      0},
  {$clock: +10,  in:  12345,  reset: 0,  load: 0,  inc: 1,  out:      0},
  {$clock: -11,  in:  12345,  reset: 0,  load: 0,  inc: 1,  out:      1},
  {$clock: +11,  in:  12345,  reset: 1,  load: 0,  inc: 1,  out:      1},
  {$clock: -12,  in:  12345,  reset: 1,  load: 0,  inc: 1,  out:      0},
  {$clock: +12,  in:      0,  reset: 0,  load: 1,  inc: 1,  out:      0},
  {$clock: -13,  in:      0,  reset: 0,  load: 1,  inc: 1,  out:      0},
  {$clock: +13,  in:      0,  reset: 0,  load: 0,  inc: 1,  out:      0},
  {$clock: -14,  in:      0,  reset: 0,  load: 0,  inc: 1,  out:      1},
  {$clock: +14,  in:  22222,  reset: 1,  load: 0,  inc: 0,  out:      1},
  {$clock: -15,  in:  22222,  reset: 1,  load: 0,  inc: 0,  out:      0},
]);

describe('PC', () => {
  it('PC interface', () => {
    expect(() => GateTestUtil.autoTestGate(PC))
      .not.toThrow();
  });

  it('testing data', () => {
    Gate.resetClock();

    expect(() => GateTestUtil.testTruthTable(data, PC.defaultFromSpec()))
      .not.toThrow();
  });
});