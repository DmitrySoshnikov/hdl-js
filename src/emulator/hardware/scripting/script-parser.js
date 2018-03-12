/**
 * The MIT License (MIT)
 * Copyright (c) 2017-present Dmitry Soshnikov <dmitry.soshnikov@gmail.com>
 */

'use strict';

const ScriptParser = require('./generated/script-parser-gen');
const fs = require('fs');

Object.assign(ScriptParser, {
  /**
   * Parses script file.
   */
  parseFile(filePath, options) {
    return this.parse(fs.readFileSync(filePath, 'utf-8'), options);
  },
});

module.exports = ScriptParser;
