/**
 * The MIT License (MIT)
 * Copyright (c) 2017-present Dmitry Soshnikov <dmitry.soshnikov@gmail.com>
 */

'use strict';

const EventEmitter = require('events');
const Pin = require('./Pin');
const TablePrinter = require('../../table-printer');

const {SystemClock} = require('./Clock');

const {
  int16,
  isNegativeZero,
  toSignedString,
} = require('../../util/numbers');

/**
 * Abstract gate class, base for `BuiltInGate`, and `CompositeGate`.
 *
 * Emits events for `eval`, `clockUp`, and `clockDown`.
 */
class Gate extends EventEmitter {

  /**
   * Creates a gate instance with the given name.
   */
  constructor(options = null) {
    super();

    if (!options) {
      return this.getClass().defaultFromSpec();
    }

    let {
      name = null,
      inputPins = [],
      outputPins = [],
    } = options;

    // Infer name from the class if not passed explicitly.
    if (!name) {
      name = this.getClass().Spec.name;
    }

    this._name = name;

    this._inputPins = Gate.toPins(inputPins);
    this._outputPins = Gate.toPins(outputPins);

    this._buildNamesToPinsMap();

    // Setup emitter hooks:
    this._setupEventHooks();

    // Extra user-initialization code:
    this.init();

    // Subscribe to the clock events for clocked gates.
    if (this.getClass().isClocked()) {
      SystemClock.on('tick', () => this.tick());
      SystemClock.on('tock', () => this.tock());
      SystemClock.on('change', value => {
        this.getPin(Pin.CLOCK).setValue(value);
      });
    }
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
   * Creates an default instance of this gate from the spec.
   */
  static defaultFromSpec() {
    const {
      inputPins,
      outputPins,
    } = this.validateSpec(this.Spec);

    const toPin = name => {
      return typeof name === 'string'
        ? new Pin({name})
        : new Pin({name: name.name, size: name.size});
    };

    return new this({
      inputPins: inputPins.map(toPin),
      outputPins: outputPins.map(toPin),
    });
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
        internalPins,
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

      if (internalPins) {
        processPins(internalPins, 'internal');
      }
    }

    if (!this._pinsInfoMap.hasOwnProperty(name)) {
      throw new Error(
        `Pin "${name}" is not in Spec of "${this.name}" gate.`
      );
    }

    return this._pinsInfoMap[name];
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
  execOnData(inputData) {
    const result = [];

    // Entries with conflicting data: {row, pins}.
    const conflicts = [];

    inputData.forEach((row, index) => {
      // Always use all input pins: if some pin is not passed, it's set to 0.
      row = Object.assign({}, this._defaultInputValues, row);

      // Evaluate the row.
      this.setPinValues(row);

      // The -0 is a setup row, don't execute on it,
      // otherwise, emulate next clock half-cycle (tick or tock).
      if (this.getClass().isClocked() && !isNegativeZero(row[Pin.CLOCK])) {
        SystemClock.next();
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
   *
   * If `columns` whitelist is passed, only the columns from this list
   * are shown.
   */
  static printTruthTable({
    table,
    columns = [],
    formatRadix = 2,
    formatStringLengh = 16,
    transformValue = null,
  }) {
    const spec = this.validateSpec(this.Spec);

    const {
      inputPins,
      outputPins,
      internalPins = [],
    } = spec;

    const columnsMap = {};
    for (const column of columns) {
      columnsMap[column] = true;
    }

    const toHeaderColumn = (name) => {
      return {
        content: Pin.toFullName(name),
        hAlign: 'center',
      };
    };

    const clockHeader = this.isClocked()
      ? [Pin.CLOCK]
      : [];

    const whitelistHeader = (list) => {
      // All columns.
      if (columns.length === 0) {
        return list;
      }
      // Only whitelist.
      return list.filter(pin => columnsMap.hasOwnProperty(pin.name || pin));
    };

    const whitelistColumns = (row) => {
      // All columns.
      if (columns.length === 0) {
        return row;
      }
      // Only whitelist.
      const whitelistRow = {};
      for (let column in row) {
        if (columnsMap.hasOwnProperty(column)) {
          whitelistRow[column] = row[column];
        }
      }
      return whitelistRow;
    };

    const printer = new TablePrinter({
      head: [
        ...whitelistHeader(clockHeader),
        ...whitelistHeader(inputPins).map(toHeaderColumn),
        ...whitelistHeader(internalPins).map(toHeaderColumn),
        ...whitelistHeader(outputPins).map(toHeaderColumn),
      ],
    });

    table.forEach((row, index) => {
      row = whitelistColumns(row);
      const tableRow = Object.keys(row).map(name => {
        const pinInfo = this.getPinInfo(name);
        let content;

        // Special pin ($clock, etc).
        if (pinInfo.kind === 'special') {
          content = toSignedString(row[name]);
        } else {
          // Normal pin.
          content = (formatRadix !== 10 ? row[name] >>> 0 : row[name])
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
    specProps = ['name', 'inputPins', 'outputPins']
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
   * Generates a (random) truth table for this gate.
   */
  generateTruthTable({enforceRandom = false} = {}) {
    const GateClass = this.getClass();
    const {inputPins} = GateClass.Spec;

    const isSimple = inputPins.every(input => {
      return typeof input === 'string' || input.size === 1;
    });

    const inputData = [];

    // For simple tables generate all permutations.
    if (isSimple && !enforceRandom) {
      // Number of rows.
      const n = Math.pow(2, inputPins.length);
      for (let i = 0; i < n; i++) {
        const row = {};
        // Use 2-radix to get a binary number, and get `0`s, and `1`s
        // for the table from it.
        i.toString(2)
          .padStart(inputPins.length, '0')
          .split('')
          .forEach((bit, idx) => {
            const key = typeof inputPins[idx] === 'string'
              ? inputPins[idx]
              : inputPins[idx].name;
            row[key] = Number(bit);
          });
        inputData.push(row);
      }
    } else {
      // Else, generate random input numbers for 5 rows.
      for (let i = 0; i < 5; i++) {
        const row = {};
        inputPins.forEach(input => {
          const size = input.size || 1;
          const name = typeof input === 'string' ? input : input.name;
          row[name] = randomNumberInRange(0, Math.pow(2, size) - 1);
        });
        inputData.push(row);
      }
    }

    const {result} = this.execOnData(inputData);
    return result;
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
        value: SystemClock.getValue(),
      });
    }

    // All inputs are defaulted to 0. In the `execOnData`, if
    // some pin is not passed it's set to 0.
    this._defaultInputValues = {};

    this._inputPins.forEach(pin => {
      this._namesToPinsMap[pin.getName()] = pin;
      this._defaultInputValues[pin.getName()] = 0;
    });

    if (this._internalPins) {
      this._internalPins.forEach(
        pin => this._namesToPinsMap[pin.getName()] = pin
      );
    }

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
   * Sets up hooks for `eval`, `clockUp`, and `clockDown` by
   * decorating the original methods with the emitter code.
   */
  _setupEventHooks() {
    // `eval`:
    this._originalEval = this.eval;
    this.eval = this._evalEmit;

    // `clockUp`:
    this._originalClockUp = this.clockUp;
    this.clockUp = this._clockUpEmit;

    this._originalClockDown = this.clockDown;
    this.clockDown = this._clockDownEmit;
  }

  /**
   * Decorated `eval` with the emitter code.
   */
  _evalEmit() {
    this._originalEval();
    this.emit('eval');
  }

  /**
   * Decorated `clockUp` with the emitter code.
   */
  _clockUpEmit(clockValue) {
    this._originalClockUp(clockValue);
    this.emit('clockUp', clockValue);
  }

  /**
   * Decorated `clockDown` with the emitter code.
   */
  _clockDownEmit(clockValue) {
    this._originalClockDown(clockValue);
    this.emit('clockDown', clockValue);
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
    this.eval();
    this.clockUp(this.getPin(Pin.CLOCK).getValue());
    return this;
  }

  /**
   * Clock falling edge.
   *
   * First updates the gate's outputs according to the internal state
   * of the gate, and then computes the outputs from non-clocked information.
   */
  tock() {
    this.clockDown(this.getPin(Pin.CLOCK).getValue());
    this.eval();
    return this;
  }

  /**
   * Full clock cycle.
   */
  clockCycle() {
    SystemClock.cycle();
    return this;
  }
}

/**
 * Returns a random integer number in range.
 */
function randomNumberInRange(min, max) {
  return Math.floor(Math.random() * (max - min + 1) + min);
}

module.exports = Gate;