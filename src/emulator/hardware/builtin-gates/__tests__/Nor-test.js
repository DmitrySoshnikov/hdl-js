/**
 * The MIT License (MIT)
 * Copyright (c) 2017-present Dmitry Soshnikov <dmitry.soshnikov@gmail.com>
 */

'use strict';

const Nor = require('../Nor');
const GateTestUtil = require('../../gate-test-util');

describe('Nor', () => {
  it('Nor interface', () => {
    expect(() => GateTestUtil.autoTestGate(Nor))
      .not.toThrow();
  });
});