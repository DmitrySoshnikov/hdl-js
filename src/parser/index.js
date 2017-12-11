/**
 * The MIT License (MIT)
 * Copyright (c) 2017-present Dmitry Soshnikov <dmitry.soshnikov@gmail.com>
 */

'use strict';

const hdlParser = require('./generated/hdl-parser');

// By default do not capture locations; callers may override.
hdlParser.setOptions({captureLocations: false});

module.exports = hdlParser;