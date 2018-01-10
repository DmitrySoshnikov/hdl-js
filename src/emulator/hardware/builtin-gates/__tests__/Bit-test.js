/**
 * The MIT License (MIT)
 * Copyright (c) 2017-present Dmitry Soshnikov <dmitry.soshnikov@gmail.com>
 */

'use strict';

const Bit = require('../Bit');
const GateTestUtil = require('../../gate-test-util');

describe('Bit', () => {
  it('Bit interface', () => {
    expect(() => GateTestUtil.autoTestGate(Bit))
      .not.toThrow();
  });
});