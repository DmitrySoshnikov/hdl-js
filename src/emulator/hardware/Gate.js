/**
 * The MIT License (MIT)
 * Copyright (c) 2017-present Dmitry Soshnikov <dmitry.soshnikov@gmail.com>
 */

'use strict';

const fs = require('fs');
const parser = require('../../parser');
const Pin = require('./Pin');
const TablePrinter = require('../../table-printer');

const {int16} = require('../../util/typed-numbers');

/**
 * Abstract gate class, base for `BuiltInGate`, and `CompositeGate`.
 */
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

    // Entries with conflicting data: {row, pins}.
    const conflicts = [];

    table.forEach((row, index) => {
      // Evaluate the row.
      this.setPinValues(row);
      this.eval();

      const outputRow = {};
      const conflictsForRow = {};

      for (const pinName in this._namesToPinsMap) {
        const expectedValue = int16(row[pinName]);
        const actualValue = this.getPin(pinName).getValue();

        outputRow[pinName] = actualValue;

        //console.log({pinName, expectedValue, actualValue});

        // If the (output) pin is provided, validate it.
        if (row.hasOwnProperty(pinName) && expectedValue !== actualValue) {
          conflictsForRow[pinName] = actualValue;
        }
      }

      if (Object.keys(conflictsForRow).length > 0) {
        conflicts.push({row: index, pins: conflictsForRow});
      }

      result.push(outputRow);
    });

    return {result, conflicts};
  }

  /**
   * Prints truth table of this gate.
   *
   * If `transformValue` function is passed, it's called with
   * the current row, column, and value.
   */
  static printTruthTable({table, transformValue = null}) {
    const spec = this.validateSpec(this.Spec, [
      'inputPins',
      'outputPins',
    ]);

    const {
      inputPins,
      outputPins,
    } = spec;

    const toHeaderColumn = (name) => {
      return {
        content: Pin.toFullName(name),
        hAlign: 'center',
      };
    };

    const allPins = [...inputPins, ...outputPins];

    const printer = new TablePrinter({
      head: [
        ...inputPins.map(toHeaderColumn),
        ...outputPins.map(toHeaderColumn),
      ],
    });

    table.forEach((row, index) => {
      const tableRow = Object.keys(row).map(key => {
        const binary = (row[key] >>> 0).toString(2);

        const pin = allPins.find(name => {
          return typeof name === 'string'
            ? name === key
            : name.name === key;
        });

        let content = binary.padStart(pin.size || 0, '0');

        // 16-bit max in this machine.
        if (content.length > 16) {
          content = content.slice(16);
        }

        if (transformValue) {
          content = transformValue(content, index, key);
        }

        return {
          content,
          hAlign: 'center',
        };
      });
      printer.push(tableRow);
    });

    console.info(printer.toString());
    console.info('');
  }

  static validateSpec(spec, specProps) {
    if (!spec) {
      throw new Error(`All gates should implement "Spec" property.`);
    }

    specProps.forEach(prop => {
      if (!spec.hasOwnProperty(prop)) {
        throw new Error(
          `"${this.name}" gate: "Spec" should impelment` +
          `all properties: ${specProps.join(', ')}.`
        );
      }
    });

    return spec;
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