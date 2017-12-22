/**
 * The MIT License (MIT)
 * Copyright (c) 2017-present Dmitry Soshnikov <dmitry.soshnikov@gmail.com>
 */

'use strict';

const Nand = require('../Nand');
const GateTestUtil = require('../../gate-test-util');

describe('Nand', () => {
  it('Nand interface', () => {
    expect(() => GateTestUtil.autoTestGate(Nand))
      .not.toThrow();
  });
});