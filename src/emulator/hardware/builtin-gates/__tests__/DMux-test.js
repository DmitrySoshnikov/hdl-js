/**
 * The MIT License (MIT)
 * Copyright (c) 2017-present Dmitry Soshnikov <dmitry.soshnikov@gmail.com>
 */

'use strict';

const DMux = require('../DMux');
const GateTestUtil = require('../../gate-test-util');

describe('DMux', () => {
  it('DMux interface', () => {
    expect(() => GateTestUtil.autoTestGate(DMux))
      .not.toThrow();
  });
});