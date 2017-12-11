/**
 * The MIT License (MIT)
 * Copyright (c) 2017-present Dmitry Soshnikov <dmitry.soshnikov@gmail.com>
 */

'use strict';

const parser = require('./src/parser');

/**
 * An API object for HDL processing.
 */
const hdl = {
  /**
   * Parser module exposed.
   */
  parser,

  /**
   * Parses an HDL string, producing an AST.
   *
   * @param string hdlCode
   *
   *   an HDL string.
   *
   * @param Object options
   *
   *   parsing options for this parse call. Default are:
   *
   *     - captureLocations: boolean
   *     - any other custom options
   *
   * @return Object AST
   */
  parse(hdlCode, options) {
    return parser.parse(`${hdlCode}`, options);
  },
};

module.exports = hdl;