/**
 * The MIT License (MIT)
 * Copyright (c) 2017-present Dmitry Soshnikov <dmitry.soshnikov@gmail.com>
 */

'use strict';

const Xor = require('../Xor');
const GateTestUtil = require('../gate-test-util');

describe('Xor', () => {
  it('Xor interface', () => {
    expect(() => GateTestUtil.autoTestGate(Xor))
      .not.toThrow();
  });
});