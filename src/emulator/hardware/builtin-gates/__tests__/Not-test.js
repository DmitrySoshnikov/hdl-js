/**
 * The MIT License (MIT)
 * Copyright (c) 2017-present Dmitry Soshnikov <dmitry.soshnikov@gmail.com>
 */

'use strict';

const Not = require('../Not');
const GateTestUtil = require('../../gate-test-util');

describe('Not', () => {
  it('Not interface', () => {
    expect(() => GateTestUtil.autoTestGate(Not)).not.toThrow();
  });
});
