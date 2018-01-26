/**
 * The MIT License (MIT)
 * Copyright (c) 2017-present Dmitry Soshnikov <dmitry.soshnikov@gmail.com>
 */

'use strict';

const fs = require('fs');
const parser = require('./parser');
const emulator = require('./emulator/hardware');

const {HDLClassFactory} = emulator;

/**
 * An API object for HDL processing.
 */
const hdl = {
  /**
   * Parser module exposed.
   */
  parser,

  /**
   * Emulator module exposed.
   */
  emulator,

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

  /**
   * Similar to `parse`, but reads a file first.
   */
  parseFile(fileName, options) {
    return this.parse(fs.readFileSync(fileName, 'utf-8'), options);
  },

  /**
   * Loads a custom composite gate class from HDL file.
   */
  fromHDLFile(fileName) {
    return HDLClassFactory.fromHDLFile(fileName);
  },

  /**
   * Loads a custom composite gate class from HDL file.
   */
  fromHDL(hdl) {
    return HDLClassFactory.fromHDL(hdl);
  },
};

module.exports = hdl;