/**
 * The MIT License (MIT)
 * Copyright (c) 2017-present Dmitry Soshnikov <dmitry.soshnikov@gmail.com>
 */

'use strict';

const Mux8Way16 = require('../Mux8Way16');
const GateTestUtil = require('../../gate-test-util');

describe('Mux8Way16', () => {
  it('Mux8Way16 interface', () => {
    expect(() => GateTestUtil.autoTestGate(Mux8Way16)).not.toThrow();
  });
});
