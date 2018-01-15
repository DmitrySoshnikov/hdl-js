/**
 * The MIT License (MIT)
 * Copyright (c) 2017-present Dmitry Soshnikov <dmitry.soshnikov@gmail.com>
 */

'use strict';

const PC = require('../PC');
const GateTestUtil = require('../../gate-test-util');

describe('PC', () => {
  it('PC interface', () => {
    expect(() => GateTestUtil.autoTestGate(PC))
      .not.toThrow();
  });
});