/**
 * The MIT License (MIT)
 * Copyright (c) 2017-present Dmitry Soshnikov <dmitry.soshnikov@gmail.com>
 */

'use strict';

const Mux4Way16 = require('../Mux4Way16');
const GateTestUtil = require('../../gate-test-util');

describe('Mux4Way16', () => {
  it('Mux4Way16 interface', () => {
    expect(() => GateTestUtil.autoTestGate(Mux4Way16)).not.toThrow();
  });
});
