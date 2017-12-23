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
   * Sets values of the input/ouput pins.
   */
  setPinValues(values) {
    for (const pinName in values) {
      this.getPin(pinName).setValue(values[pinName]);
    }
  }

  /**
   * Sets values of the input/ouput pins.
   */
  getPinValues() {
    const data = {};
    for (const pinName in this._namesToPinsMap) {
      data[pinName] = this.getPin(pinName).getValue();
    }
    return data;
  }

  /**
   * Tests this gate on the input/output data.
   *
   * If only inputs are provided in the data,
   * evaluates the output.
   *
   * If both inputs, and outputs are provided, evaluates
   * the outputs, and also returns found conflicts if some
   * evaluated output doesn't equal to the provided.
   */
  execOnData(table) {
    const result = [];

    // Map from row index to conflicting
    // output values.
    const conflicts = new Map();

    table.forEach((row, index) => {
      // Evaluate the row.
      this.setPinValues(row);
      this.eval();

      const outputRow = {};
      const conflictsForRow = {};

      for (const pinName in this._namesToPinsMap) {
        const expectedValue = row[pinName];
        const actualValue = this.getPin(pinName).getValue();

        outputRow[pinName] = actualValue;

        // If the (output) pin is provided, validate it.
        if (row.hasOwnProperty(pinName) && expectedValue !== actualValue) {
          conflictsForRow[pinName] = actualValue;
        }
      }

      if (Object.keys(conflictsForRow).length > 0) {
        conflicts.set(index, conflictsForRow);
      }

      result.push(outputRow);
    });

    return {result, conflicts};
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