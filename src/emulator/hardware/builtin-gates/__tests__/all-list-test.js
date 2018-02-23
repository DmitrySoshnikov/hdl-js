/**
 * The MIT License (MIT)
 * Copyright (c) 2017-present Dmitry Soshnikov <dmitry.soshnikov@gmail.com>
 */

'use strict';

const fs = require('fs');
const path = require('path');

const BuiltInGates = require('../index');

const builtinGatesFromDirectory = fs.readdirSync(__dirname + '/../')
  .filter(file => /^[A-Z]/.test(file))
  .map(file => path.basename(file, '.js'));

describe('list all builtins', () => {
  it('checks list', () => {
    // Make sure to sync the gates in the directory with this list.
    // We do not use `fs` in the actual implementation to support
    // browser environment.
    expect(builtinGatesFromDirectory).toEqual(Object.keys(BuiltInGates));
  });
});