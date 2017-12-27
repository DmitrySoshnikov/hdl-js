/**
 * The MIT License (MIT)
 * Copyright (c) 2017-present Dmitry Soshnikov <dmitry.soshnikov@gmail.com>
 */

'use strict';

const Inc16 = require('../Inc16');
const GateTestUtil = require('../../gate-test-util');

describe('Inc16', () => {
  it('Inc16 interface', () => {
    expect(() => GateTestUtil.autoTestGate(Inc16))
      .not.toThrow();
  });
});