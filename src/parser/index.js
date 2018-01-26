/**
 * The MIT License (MIT)
 * Copyright (c) 2017-present Dmitry Soshnikov <dmitry.soshnikov@gmail.com>
 */

'use strict';

const fs = require('fs');
const hdlParser = require('./generated/hdl-parser');

// By default do not capture locations; callers may override.
hdlParser.setOptions({captureLocations: false});

/**
 * Extensions to the generated parser.
 */
Object.assign(hdlParser, {

  /**
   * Parses a file with HDL code.
   */
  parseFile(fileName, options) {
    return this.parse(fs.readFileSync(fileName, 'utf-8'), options);
  },
});

module.exports = hdlParser;