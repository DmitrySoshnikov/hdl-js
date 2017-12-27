/**
 * The MIT License (MIT)
 * Copyright (c) 2017-present Dmitry Soshnikov <dmitry.soshnikov@gmail.com>
 */

'use strict';

const Add16 = require('../Add16');
const GateTestUtil = require('../../gate-test-util');

describe('Add16', () => {
  it('Add16 interface', () => {
    expect(() => GateTestUtil.autoTestGate(Add16))
      .not.toThrow();
  });
});