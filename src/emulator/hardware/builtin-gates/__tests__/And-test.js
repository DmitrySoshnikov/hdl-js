/**
 * The MIT License (MIT)
 * Copyright (c) 2017-present Dmitry Soshnikov <dmitry.soshnikov@gmail.com>
 */

'use strict';

const And = require('../And');
const GateTestUtil = require('../../gate-test-util');

describe('And', () => {
  it('And interface', () => {
    expect(() => GateTestUtil.autoTestGate(And)).not.toThrow();
  });
});
