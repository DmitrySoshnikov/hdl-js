/**
 * The MIT License (MIT)
 * Copyright (c) 2017-present Dmitry Soshnikov <dmitry.soshnikov@gmail.com>
 */

'use strict';

const Mux16 = require('../Mux16');
const GateTestUtil = require('../../gate-test-util');

describe('Mux16', () => {
  it('Mux16 interface', () => {
    expect(() => GateTestUtil.autoTestGate(Mux16)).not.toThrow();
  });
});
