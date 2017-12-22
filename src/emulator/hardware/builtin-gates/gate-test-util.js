/**
 * The MIT License (MIT)
 * Copyright (c) 2017-present Dmitry Soshnikov <dmitry.soshnikov@gmail.com>
 */

'use strict';

const Pin = require('../Pin');
const PinBus = require('../PinBus');

/**
 * Evaluates the gate logic on the truth table input.
 *
 * Example for `And` gate:
 *
 * [
 *    {a: 0, b: 0, out: 0},
 *    {a: 0, b: 1, out: 0},
 *    {a: 1, b: 0, out: 0},
 *    {a: 1, b: 1, out: 1},
 * ]
 *
 * Throws if some `out` is not evaluate to the expected value.
 */
function testTruthTable(table, gate) {
  table.forEach(row => {

    // ---------------------------------------------------
    // Set inputs.

    const inputPins = gate.getInputPins();

    inputPins.forEach((input, index) => {
      checkPin(input, row, index, 'input');
      input.setValue(row[input.getName()]);
    });

    // Evaluate the row.
    gate.eval();

    // ---------------------------------------------------
    // Check outputs.

    const outputPins = gate.getOutputPins();

    outputPins.forEach((output, index) => {
      checkPin(output, row, index, 'output');

      const expected = row[output.getName()];
      const actual = gate.getPin(output.getName()).getValue();

      if (expected !== actual) {
        throw new Error(
          `"${gate.getName()}" gate: actual value ${actual} of the ` +
          `"${output.getName()}" out doesn't equal to the expected value ` +
          `of ${expected} in row ${JSON.stringify(row)} at index ${index}.`
        );
      }
    });
  });
}

/**
 * Automatically tests a gate based on it spec.
 */
function autoTestGate(GateClass) {
  const spec = GateClass.Spec;

  const createPins = pinNames => {
    return pinNames.map(pinName => {
      let name, size = null;
      if (typeof pinName === 'string') {
        name = pinName;
      } else {
        ({name, size} = pinName);
      }
      return size
        ? new PinBus({name, size})
        : new Pin({name});
    });
  };

  const inputPins = createPins(spec.inputPins);
  const outputPins = createPins(spec.outputPins);

  const gate = new GateClass({
    inputPins,
    outputPins,
  });

  expect(gate.getName()).toBe(GateClass.name);
  expect(gate.getInputPins()).toEqual(inputPins);
  expect(gate.getOutputPins()).toEqual(outputPins);

  testTruthTable(spec.truthTable, gate);
}

function checkPin(pin, row, index, kind) {
  if (!row.hasOwnProperty(pin.getName())) {
    throw new Error(
      `Table row ${JSON.stringify(row)} at index ${index} ` +
      `doesn't provide ${kind} pin "${pin.getName()}".`
    );
  }
}

module.exports = {
  autoTestGate,
  testTruthTable,
};