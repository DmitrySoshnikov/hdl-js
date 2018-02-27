/**
 * The MIT License (MIT)
 * Copyright (c) 2017-present Dmitry Soshnikov <dmitry.soshnikov@gmail.com>
 */

'use strict';

const Gate = require('./Gate');

/**
 * A gate consisting of several sub-parts implementation
 * (usually a user-defined gate).
 */
class CompositeGate extends Gate {
  /**
   * Creates a gate instance with the given name.
   */
  constructor({
    name = null,
    inputPins = [],
    outputPins = [],
    internalPins = [],
    parts = [],
    ast = null,
  } = {}) {
    super({
      name,
      inputPins,
      outputPins,
    });

    this._internalPins = internalPins;
    this._parts = parts;

    // If a composite gate is created from AST,
    // it directly provides it:
    this._ast = ast;

    // Rebuild map to consider internal pins.
    this._buildNamesToPinsMap();
  }

  /**
   * Returns internal pins of this gate.
   */
  getInternalPins() {
    return this._internalPins;
  }

  /**
   * Returns implementation parts (gates) of this gate..
   */
  getParts() {
    return this._parts;
  }

  /**
   * Evaluates this gate.
   */
  eval() {
    for (const part of this._parts) {
      part.eval();
    }
  }

  /**
   * Whether this gate is clocked.
   */
  static isClocked() {
    // This default value is overridden in the child classes
    // created from HDL files.
    return false;
  }

  /**
   * Handler for the rising edge of the clock: updates internal state,
   * outputs are not updated ("latched").
   */
  clockUp() {
    if (!this.getClass().isClocked()) {
      throw new TypeError(
        `Gate#clockUp: "${this._name}" is not clocked.`
      );
    }

    for (const part of this._parts) {
      part.tick();
    }
  }

  /**
   * Handler for the falling edge of the clock: commits the internal state,
   * values to the output.
   */
  clockDown() {
    if (!this.getClass().isClocked()) {
      throw new TypeError(
        `Gate#clockDown: "${this._name}" is not clocked.`
      );
    }

    for (const part of this._parts) {
      part.tock();
    }
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
   * Transforms this composite gate instance to the AST format.
   * The AST then can be fed to the code generator, and be
   * exported to an HDL file.
   */
  toAST() {
    // If the composite gate instance is created from AST
    // it directly provides it. Or if we already calculated it,
    // directly return.
    if (this._ast) {
      return this._ast;
    }

    const pinToNode = pin => {
      const nameNode = {
        type: 'Name',
        value: pin.getName()
      };

      if (pin.getSize() !== 1) {
        nameNode.size = pin.getSize();
      }

      return nameNode;
    };

    const inputs = this.getInputPins().map(pinToNode);
    const outputs = this.getOutputPins().map(pinToNode);

    // E.g. And(a=a[0], b=b[0], out=out[0]);
    // The index/range is stored in the `connectInfo`:
    const parts = this.getParts().map(part => {
      const callArguments = [];

      // a, b:
      part.getInputPins().forEach(pin => {
        const connectInfo = pin.getSourcePin()
          .getListeningPinsMap()
          .get(pin);

        const name = Object.assign({
          type: 'Name',
          value: pin.getName(),
        }, connectInfo.destinationSpec);

        const value = Object.assign({
          type: 'Name',
          value: pin.getSourcePin().getName(),
        }, connectInfo.sourceSpec);

        callArguments.push({
          type: 'Argument',
          name,
          value,
        });
      });

      // Several pins can listen to the output pins:
      part.getOutputPins().forEach(pin => {
        for (const [destPin, connectInfo] of pin.getListeningPinsMap()) {
          const name = Object.assign({
            type: 'Name',
            value: pin.getName(),
          }, connectInfo.sourceSpec);

          const value = Object.assign({
            type: 'Name',
            value: destPin.getName(),
          }, connectInfo.destinationSpec);

          callArguments.push({
            type: 'Argument',
            name,
            value,
          });
        }
      });

      return {
        type: 'ChipCall',
        name: part.getName(),
        arguments: callArguments,
      };
    });

    return (this._ast = {
      type: 'Chip',
      name: this.getName(),
      inputs,
      outputs,
      parts,
      builtins: [],
      clocked: [],
    });
  }
}

/**
 * Returns a random integer number in range.
 */
function randomNumberInRange(min, max) {
  return Math.floor(Math.random() * (max - min + 1) + min);
}

module.exports = CompositeGate;