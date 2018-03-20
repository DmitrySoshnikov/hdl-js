/**
 * The MIT License (MIT)
 * Copyright (c) 2017-present Dmitry Soshnikov <dmitry.soshnikov@gmail.com>
 */

'use strict';

const ALU = require('../ALU');
const GateTestUtil = require('../../gate-test-util');

describe('ALU', () => {
  it('ALU interface', () => {
    expect(() => GateTestUtil.autoTestGate(ALU)).not.toThrow();
  });
});
