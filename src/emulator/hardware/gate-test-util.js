/**
 * The MIT License (MIT)
 * Copyright (c) 2017-present Dmitry Soshnikov <dmitry.soshnikov@gmail.com>
 */

'use strict';

const assert = require('assert');
const Pin = require('./Pin');

const {SystemClock} = require('./Clock');

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
  SystemClock.reset();
  const {result} = gate.execOnData(table);
  assert.deepEqual(table, result);
}

/**
 * Automatically tests a gate based on it spec.
 */
function autoTestGate(GateClass) {
  const spec = GateClass.Spec;

  expect(spec.name).toBe(GateClass.name);

  const createPins = pinNames => {
    return pinNames.map(pinName => {
      let name,
        size = 1;
      if (typeof pinName === 'string') {
        name = pinName;
      } else {
        ({name, size} = pinName);
      }
      return new Pin({name, size});
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

module.exports = {
  autoTestGate,
  testTruthTable,
};
