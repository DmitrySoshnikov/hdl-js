/**
 * The MIT License (MIT)
 * Copyright (c) 2017-present Dmitry Soshnikov <dmitry.soshnikov@gmail.com>
 */

'use strict';

const Or8Way = require('../Or8Way');
const GateTestUtil = require('../../gate-test-util');

describe('Or8Way', () => {
  it('Or8Way interface', () => {
    expect(() => GateTestUtil.autoTestGate(Or8Way)).not.toThrow();
  });
});
