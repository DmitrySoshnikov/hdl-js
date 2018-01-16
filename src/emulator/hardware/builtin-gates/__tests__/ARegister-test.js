/**
 * The MIT License (MIT)
 * Copyright (c) 2017-present Dmitry Soshnikov <dmitry.soshnikov@gmail.com>
 */

'use strict';

const GateTestUtil = require('../../gate-test-util');
const ARegister = require('../DRegister');

describe('ARegister', () => {
  it('ARegister interface', () => {
    expect(() => GateTestUtil.autoTestGate(ARegister))
      .not.toThrow();
  });
});