/**
 * The MIT License (MIT)
 * Copyright (c) 2017-present Dmitry Soshnikov <dmitry.soshnikov@gmail.com>
 */

'use strict';

const Nor16Way = require('../Nor16Way');
const GateTestUtil = require('../../gate-test-util');

describe('Nor16Way', () => {
  it('Nor16Way interface', () => {
    expect(() => GateTestUtil.autoTestGate(Nor16Way))
      .not.toThrow();
  });
});