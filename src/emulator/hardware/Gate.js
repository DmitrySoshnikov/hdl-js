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
 * Test for a neagtive zero.
 */
function isNegativeZero(value) {
  return value === 0 && (1 / value === -Infinity);
}

/**
 * Converts a number value to decimal string with the sign.
 */
function toSignString(value) {
  if (isNegativeZero(value)) {
    return '-0';
  }

  return (value >= 0 ? '+' : '') + value;
}

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
      name = this.getClass().name;
    }

    this._name = name;

    this._inputPins = Gate.toPins(inputPins);
    this._outputPins = Gate.toPins(outputPins);

    this._buildNamesToPinsMap();
    this.init();
  }

  /**
   * Any extra initialization a gate may provide. Called at construction
   * and reset signal.
   */
  init() {
    // Noop.
    return;
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
   * Returns pin info from Spec.
   */
  static getPinInfo(name) {
    if (!this._pinsInfoMap) {
      this._pinsInfoMap = {
        [Pin.CLOCK]: {
          kind: 'special',
          name: Pin.CLOCK,
        }
      };

      const spec = this.validateSpec(this.Spec);

      const {
        inputPins,
        outputPins,
      } = spec;

      const processPins = (pins, kind) => {
        for (const pin of pins) {
          const name = typeof pin === 'string' ? pin : pin.name;
          this._pinsInfoMap[name] = {kind, name};

          if (typeof pin !== 'string' && pin.hasOwnProperty('size')) {
            this._pinsInfoMap[name].size = pin.size;
          }
        }
      };

      processPins(inputPins, 'input');
      processPins(outputPins, 'output');
    }

    if (!this._pinsInfoMap.hasOwnProperty(name)) {
      throw new Error(
        `Pin "${name}" is not in Spec of "${this.name}" gate.`
      );
    }

    return this._pinsInfoMap[name];
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
    return this;
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

      if (this.getClass().isClocked()) {
        // The -0 is a setup row, don't execute on it.
        if (!isNegativeZero(row[Pin.CLOCK])) {
          Gate.isClockDown() ? this.tick() : this.tock();
          this.getPin(Pin.CLOCK).setValue(Gate.getClockValue());
        }
      } else {
        this.eval();
      }

      const outputRow = {};
      const conflictsForRow = {};

      for (const pinName in this._namesToPinsMap) {
        const expectedValue = int16(row[pinName]);
        const actualValue = this.getPin(pinName).getValue();

        outputRow[pinName] = actualValue;

        // If the (output) pin is provided, validate it.
        if (row.hasOwnProperty(pinName) && expectedValue !== actualValue) {
          conflictsForRow[pinName] = {
            expected: expectedValue,
            actual: actualValue,
          };
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
   *
   * formatRadix is: 2 (bin), 16 (hex), or 10 (dec).
   * formatStringLengh is the max string length of a number in this format.
   */
  static printTruthTable({
    table,
    formatRadix = 2,
    formatStringLengh = 16,
    transformValue = null,
  }) {
    const spec = this.validateSpec(this.Spec);

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

    const clock = this.isClocked()
      ? [Pin.CLOCK]
      : [];

    const printer = new TablePrinter({
      head: [
        ...clock,
        ...inputPins.map(toHeaderColumn),
        ...outputPins.map(toHeaderColumn),
      ],
    });

    table.forEach((row, index) => {
      const tableRow = Object.keys(row).map(name => {
        const pinInfo = this.getPinInfo(name);
        let content;

        // Special pin ($clock, etc).
        if (pinInfo.kind === 'special') {
          content = toSignString(row[name]);
        } else {
          // Normal pin.
          content = (row[name] >>> 0)
            .toString(formatRadix)
            .padStart(formatRadix !== 10 ? pinInfo.size : 0, '0')
            .toUpperCase();

          if (content.length > formatStringLengh) {
            content = content.slice(-formatStringLengh);
          }

          if (transformValue) {
            content = transformValue(content, index, name);
          }
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

  static validateSpec(
    spec,
    specProps = ['inputPins', 'outputPins']
  ) {
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
   * Creates a Pin instance from a spec, or propagates
   * if it's already a Pin instance.
   */
  static toPins(pinSpecs) {
    return pinSpecs.map(pin => {
      if (pin instanceof Pin) {
        return pin;
      }

      const spec = typeof pin === 'string'
        ? {name: pin}
        : pin;

      return new Pin(spec);
    });
  }

  /**
   * Builds a map from a pin name to the pin instance.
   */
  _buildNamesToPinsMap() {
    this._namesToPinsMap = {};

    if (this.getClass().isClocked()) {
      this._namesToPinsMap[Pin.CLOCK] = new Pin({
        name: Pin.CLOCK,
        value: Gate.getClockValue(),
      });
    }

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

  /**
   * Updates the internal state of a clocked gate according to the gate's functionality.
   * (outputs are not updated).
   */
  clockUp() {
    throw new Error(
      'Abstract method `Gate#clockUp` should be implemented '+
      'in a concrete class.'
    );
  }

  /**
   * Updates the outputs of the gate according to its internal state.
   */
  clockDown() {
    throw new Error(
      'Abstract method `Gate#clockDown` should be implemented '+
      'in a concrete class.'
    );
  }

  /**
   * Returns a class object of this gate instance.
   */
  getClass() {
    return this.constructor;
  }

  /**
   * Whether this gate is clocked.
   */
  static isClocked() {
    throw new Error(
      'Abstract static method `Gate.isClocked` should be implemented '+
      'in a concrete class.'
    );
  }

  /**
   * Clock rising edge.
   *
   * First computes the gate's output (from non-clocked information), and
   * then updates the internal state of the gate (which doesn't
   * affect the outputs).
   */
  tick() {
    Gate._clockValue = -Gate._clockValue;
    this.eval();
    this.clockUp();
  }

  /**
   * Clock falling edge.
   *
   * First updates the gate's outputs according to the internal state
   * of the gate, and then computes the outputs from non-clocked information.
   */
  tock() {
    Gate._clockValue = -(Math.abs(Gate._clockValue) + 1);
    this.clockDown();
    this.eval();
  }

  /**
   * Full clock cycle.
   */
  clockCycle() {
    if (Gate.isClockDown()) {
      this.tick();
      this.tock();
    } else {
      this.tock();
      this.tick();
    }
  }

  /**
   * Resets clock.
   *
   * Initial clock value. Each tick: set positive sign,
   * each tock: increase, set negative sign back.
   */
  static resetClock() {
    Gate.setClockValue(-0);
  }

  /**
   * Sets clock value.
   */
  static setClockValue(value) {
    Gate._clockValue = value;
  }

  /**
   * Returns clock value.
   */
  static getClockValue() {
    return Gate._clockValue;
  }

  /**
   * Whether the clock is up.
   */
  static isClockUp() {
    return !this.isClockDown();
  }

  /**
   * Whether the clock is down.
   */
  static isClockDown() {
    return isNegativeZero(Gate._clockValue) || Gate._clockValue < 0;
  }
}

Gate.resetClock();

module.exports = Gate;