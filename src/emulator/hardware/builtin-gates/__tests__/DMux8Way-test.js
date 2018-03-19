/**
 * The MIT License (MIT)
 * Copyright (c) 2017-present Dmitry Soshnikov <dmitry.soshnikov@gmail.com>
 */

'use strict';

const DMux8Way = require('../DMux8Way');
const GateTestUtil = require('../../gate-test-util');

describe('DMux8Way', () => {
  it('DMux8Way interface', () => {
    expect(() => GateTestUtil.autoTestGate(DMux8Way)).not.toThrow();
  });
});
