/**
 * The MIT License (MIT)
 * Copyright (c) 2017-present Dmitry Soshnikov <dmitry.soshnikov@gmail.com>
 */

'use strict';

const Or16 = require('../Or16');
const GateTestUtil = require('../../gate-test-util');

describe('Or16', () => {
  it('Or16 interface', () => {
    expect(() => GateTestUtil.autoTestGate(Or16)).not.toThrow();
  });
});
