/**
 * The MIT License (MIT)
 * Copyright (c) 2017-present Dmitry Soshnikov <dmitry.soshnikov@gmail.com>
 */

'use strict';

const Or = require('../Or');
const GateTestUtil = require('../../gate-test-util');

describe('Or', () => {
  it('Or interface', () => {
    expect(() => GateTestUtil.autoTestGate(Or))
      .not.toThrow();
  });
});