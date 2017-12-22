/**
 * The MIT License (MIT)
 * Copyright (c) 2017-present Dmitry Soshnikov <dmitry.soshnikov@gmail.com>
 */

'use strict';

const HalfAdder = require('../HalfAdder');
const GateTestUtil = require('../../gate-test-util');

describe('HalfAdder', () => {
  it('HalfAdder interface', () => {
    expect(() => GateTestUtil.autoTestGate(HalfAdder))
      .not.toThrow();
  });
});