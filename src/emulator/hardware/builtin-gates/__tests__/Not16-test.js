/**
 * The MIT License (MIT)
 * Copyright (c) 2017-present Dmitry Soshnikov <dmitry.soshnikov@gmail.com>
 */

'use strict';

const Not16 = require('../Not16');
const GateTestUtil = require('../../gate-test-util');

describe('Not16', () => {
  it('Not16 interface', () => {
    expect(() => GateTestUtil.autoTestGate(Not16)).not.toThrow();
  });
});
