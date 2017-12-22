/**
 * The MIT License (MIT)
 * Copyright (c) 2017-present Dmitry Soshnikov <dmitry.soshnikov@gmail.com>
 */

'use strict';

const fs = require('fs');
const path = require('path');

/**
 * A map of all built-in gates.
 */
const BuiltInGates = {};

const builtinGates = fs.readdirSync(__dirname)
  .filter(file => /^[A-Z]/.test(file));

for (const gate of builtinGates) {
  const gateName = path.basename(gate, '.js');
  BuiltInGates[gateName] = require('./' + gateName);
}

module.exports = BuiltInGates;