/**
 * The MIT License (MIT)
 * Copyright (c) 2017-present Dmitry Soshnikov <dmitry.soshnikov@gmail.com>
 */

'use strict';

const Mux = require('../Mux');
const GateTestUtil = require('../../gate-test-util');

describe('Mux', () => {
  it('Mux interface', () => {
    expect(() => GateTestUtil.autoTestGate(Mux)).not.toThrow();
  });
});
