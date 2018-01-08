/**
 * The MIT License (MIT)
 * Copyright (c) 2017-present Dmitry Soshnikov <dmitry.soshnikov@gmail.com>
 */

'use strict';

const DFF = require('../DFF');
const GateTestUtil = require('../../gate-test-util');

describe('DFF', () => {
  it('DFF interface', () => {
    expect(() => GateTestUtil.autoTestGate(DFF))
      .not.toThrow();
  });
});