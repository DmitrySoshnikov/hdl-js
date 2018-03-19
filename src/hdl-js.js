/**
 * The MIT License (MIT)
 * Copyright (c) 2017-present Dmitry Soshnikov <dmitry.soshnikov@gmail.com>
 */

'use strict';

const parser = require('./parser');
const emulator = require('./emulator/hardware');
const generator = require('./generator');

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
   * Code generator module exposed.
   */
  generator,

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
   * Facade method; similar to `parse`, but reads a file first.
   */
  parseFile(fileName, options) {
    return parser.parseFile(fileName, options);
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

  /**
   * Generates an HDL code from an AST.
   */
  generateFromAST(ast, options) {
    return generator.generateFromAST(ast, options);
  },

  /**
   * Generates an HDL from a CompositeGate instance.
   */
  generateFromCompositeGate(compositeGate, options) {
    return generator.fromCompositeGate(compositeGate, options);
  },
};

module.exports = hdl;
