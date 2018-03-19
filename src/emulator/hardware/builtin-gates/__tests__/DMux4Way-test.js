/**
 * The MIT License (MIT)
 * Copyright (c) 2017-present Dmitry Soshnikov <dmitry.soshnikov@gmail.com>
 */

'use strict';

const DMux4Way = require('../DMux4Way');
const GateTestUtil = require('../../gate-test-util');

describe('DMux4Way', () => {
  it('DMux4Way interface', () => {
    expect(() => GateTestUtil.autoTestGate(DMux4Way)).not.toThrow();
  });
});
