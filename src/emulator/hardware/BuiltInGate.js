/**
 * The MIT License (MIT)
 * Copyright (c) 2017-present Dmitry Soshnikov <dmitry.soshnikov@gmail.com>
 */

'use strict';

const Gate = require('./Gate');
const PinBus = require('./PinBus');
const TablePrinter = require('../../table-printer');

/**
 * Base class for all builtin gates.
 */
class BuiltInGate extends Gate {
  /**
   * Creates a gate instance with the given name.
   */
  constructor({
    name = null,
    inputPins = [],
    outputPins = [],
  } = {}) {
    super({name, inputPins, outputPins});
    this._validate();
  }

  /**
   * Validates inputs, and outputs of this gate.
   */
  _validate() {
    this._validatePins(this.getInputPins(), 'inputPins');
    this._validatePins(this.getOutputPins(), 'outputPins');
  }

  /**
   * Validates pin numbers.
   */
  _validatePins(pins, kind) {
    const spec = BuiltInGate._validateSpec(this.constructor.Spec);

    if (pins.length !== spec[kind].length) {
      throw new Error(
        `"${this._name}" gate: expect ${spec[kind].length} ${kind} ` +
        `(${spec[kind].join(', ')}), got ${pins.length}.`
      );
    }

    // Check that for sized-pins, a `PinBus` is passed.
    spec[kind].forEach((pinName, index) => {
      const size = typeof pinName === 'string'
        ? null
        : pinName.size;
      if (size && !(pins[index] instanceof PinBus)) {
        throw new TypeError(
          `"${this._name}" gate: expect gate #${index} from ${kind} to be ` +
          `an instance of PinBus, ${pins[index].constructor.name} is given.`
        );
      }
    });
  }

  static _validateSpec(spec, gateName) {
    if (!spec) {
      throw new Error(
        `"${gateName}" gate: BuiltIn gates ` +
        `should impelment "Spec" property.`
      );
    }

    if (
      !spec.description ||
      !spec.inputPins ||
      !spec.outputPins ||
      !spec.truthTable
    ) {
      throw new Error(
        `"${gateName}" gate: "Spec" should impelment` +
        `all properties: description, inputPins, outputPins, truthTable.`
      );
    }

    return spec;
  }

  /**
   * Prints truth table.
   */
  static printTruthTable() {
    const {
      inputPins,
      outputPins,
      truthTable,
    } = BuiltInGate._validateSpec(this.Spec);

    const toHeaderColumn = (name) => {
      const content = name = typeof name === 'string'
        ? name
        : `${name.name}[${name.size}]`;

      return {content, hAlign: 'center'};
    };

    const allPins = [...inputPins, ...outputPins];

    const inputPinNames = inputPins.map(input => toHeaderColumn(input));
    const outputPinNames = outputPins.map(output => toHeaderColumn(output));

    const printer = new TablePrinter({
      head: [...inputPinNames, ...outputPinNames],
    });

    truthTable.forEach(row => {
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

  /**
   * Evaluates this gate.
   */
  eval() {
    // Noop.
    return;
  }
}

module.exports = BuiltInGate;