/**
 * The MIT License (MIT)
 * Copyright (c) 2017-present Dmitry Soshnikov <dmitry.soshnikov@gmail.com>
 */

'use strict';

const MipsAlu = require('../MipsAlu');
const GateTestUtil = require('../../gate-test-util');

describe('MipsAlu', () => {
  it('MipsAlu interface', () => {
    expect(() => GateTestUtil.autoTestGate(MipsAlu)).not.toThrow();
  });
});
