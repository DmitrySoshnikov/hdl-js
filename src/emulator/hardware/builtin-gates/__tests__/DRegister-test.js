/**
 * The MIT License (MIT)
 * Copyright (c) 2017-present Dmitry Soshnikov <dmitry.soshnikov@gmail.com>
 */

'use strict';

const GateTestUtil = require('../../gate-test-util');
const DRegister = require('../DRegister');

describe('DRegister', () => {
  it('DRegister interface', () => {
    expect(() => GateTestUtil.autoTestGate(DRegister))
      .not.toThrow();
  });
});