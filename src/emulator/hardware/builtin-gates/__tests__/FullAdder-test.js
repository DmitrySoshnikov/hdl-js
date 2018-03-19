/**
 * The MIT License (MIT)
 * Copyright (c) 2017-present Dmitry Soshnikov <dmitry.soshnikov@gmail.com>
 */

'use strict';

const FullAdder = require('../FullAdder');
const GateTestUtil = require('../../gate-test-util');

describe('FullAdder', () => {
  it('FullAdder interface', () => {
    expect(() => GateTestUtil.autoTestGate(FullAdder)).not.toThrow();
  });
});
