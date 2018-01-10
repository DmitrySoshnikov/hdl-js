/**
 * The MIT License (MIT)
 * Copyright (c) 2017-present Dmitry Soshnikov <dmitry.soshnikov@gmail.com>
 */

'use strict';

const Register = require('../Register');
const GateTestUtil = require('../../gate-test-util');

describe('Register', () => {
  it('Register interface', () => {
    expect(() => GateTestUtil.autoTestGate(Register))
      .not.toThrow();
  });
});