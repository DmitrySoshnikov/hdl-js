/**
 * The MIT License (MIT)
 * Copyright (c) 2017-present Dmitry Soshnikov <dmitry.soshnikov@gmail.com>
 */

'use strict';

const And16 = require('../And16');
const GateTestUtil = require('../gate-test-util');

describe('And16', () => {
  it('And16 interface', () => {
    expect(() => GateTestUtil.autoTestGate(And16))
      .not.toThrow();
  });
});