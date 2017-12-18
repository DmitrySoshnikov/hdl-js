/**
 * The MIT License (MIT)
 * Copyright (c) 2017-present Dmitry Soshnikov <dmitry.soshnikov@gmail.com>
 */

'use strict';

const parser = require('../../parser');
const fs = require('fs');

class Gate {

  /**
   * Creates a gate instance with the given name.
   */
  constructor({
    name = null,
    inputPins = [],
    outputPins = [],
  } = {}) {
    // Infer name from the class if not passed explicitly.
    if (!name) {
      name = this.constructor.name;
    }

    this._name = name;
    this._inputPins = inputPins;
    this._outputPins = outputPins;

    this._buildNamesToPinsMap();
  }

  /**
   * Returns the name of this gate.
   */
  getName() {
    return this._name;
  }

  /**
   * Returns input pins of this gate.
   */
  getInputPins() {
    return this._inputPins;
  }

  /**
   * Returns output pins of this gate.
   */
  getOutputPins() {
    return this._outputPins;
  }

  /**
   * Returns a pin (input or output) by name.
   */
  getPin(name) {
    if (!this._namesToPinsMap.hasOwnProperty(name)) {
      throw new Error(
        `Pin "${name}" is not registered on "${this._name}" gate.`
      );
    }
    return this._namesToPinsMap[name];
  }

  /**
   * Creates a gate from an HDL file.
   */
  static fromHDLFile(fileName) {
    const ast = parser.parse(fs.readFileSync(fileName, 'utf-8'));
    return Gate.fromAST(ast);
  }

  /**
   * Creates a gate from an AST.
   */
  static fromAST(ast) {
    throw new Error('Gate.fromAST: Not implemented yet!', ast);
  }

  /**
   * Builds a map from a pin name to the pin instance.
   */
  _buildNamesToPinsMap() {
    this._namesToPinsMap = [];
    this._inputPins.forEach(
      pin => this._namesToPinsMap[pin.getName()] = pin
    );
    this._outputPins.forEach(
      pin => this._namesToPinsMap[pin.getName()] = pin
    );
  }

  /**
   * Evaluates the output values of this gate.
   */
  eval() {
    throw new Error(
      'Abstract method `Gate#eval` should be implemented in a concrete class.'
    );
  }
}

module.exports = Gate;