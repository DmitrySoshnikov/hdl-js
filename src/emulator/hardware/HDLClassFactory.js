/**
 * The MIT License (MIT)
 * Copyright (c) 2017-present Dmitry Soshnikov <dmitry.soshnikov@gmail.com>
 */

'use strict';

const fs = require('fs');
const CompositeGate = require('./CompositeGate');
const parser = require('../../parser');
const Pin = require('./Pin');

/**
 * This factory creates a gate class from the parsed HDL.
 * The resulting class inherits from the `CompositeGate`.
 */
const HDLClassFactory = {
  /**
   * Creates a gate class from HDL file.
   */
  fromHDLFile(fileName) {
    return this.fromHDL(fs.readFileSync(fileName, 'utf-8'));
  },

  /**
   * Creates a gate class from HDL chip definition.
   */
  fromHDL(hdl) {
    return this.fromAST(parser.parse(hdl));
  },

  /**
   * Creates a gate class from an AST.
   */
  fromAST(ast) {
    const [
      inputPins,
      outputPins,
      internalPins,
      parts,
    ] = compile(ast);

    const GateClass = class extends CompositeGate {
      constructor(options) {
        super(Object.assign(options, {
          name: ast.name,
          inputPins,
          outputPins,
          internalPins,
          parts,
        }));
      }
    };

    const pinsToGateSpec = value => {
      return {name: value.value, size: value.size || 1};
    };

    GateClass.Spec = {
      description: `Compiled from HDL composite Gate class "${ast.name}".`,
      inputPins: ast.inputs.map(pinsToGateSpec),
      outputPins: ast.outputs.map(pinsToGateSpec),
      truthTable: [],
    };

    return GateClass;
  }
};

/**
 * Creates pins, and pins map from AST data.
 */
function createPins(pinsData) {
  const pinsMap = {};
  const pins = pinsData.map(pinSpec => {
    return pinsMap[pinSpec.value] = new Pin({
      name: pinSpec.value,
      size: pinSpec.size || 1,
    });
  });
  return [pins, pinsMap];
}

/**
 * Creates input/output/internal pins, and parts for
 * a composite gate.
 */
function compile(ast) {
  const [inputPins, inputPinsMap] = createPins(ast.inputs);
  const [outputPins, outputPinsMap] = createPins(ast.outputs);

  // Internal pins are collected during traversal
  // of the part arguments section.
  const internalPins = [];
  const internalPinsMap = {};

  const parts = ast.parts.map(part => {
    // Load Gate class (built-ins).
    const PartGateClass = require('./builtin-gates/' + part.name);

    // Instance.
    const partGateInstance = PartGateClass.defaultFromSpec();

    // Handle arguments.
    part.arguments.forEach(partArg => {
      handlePartArg(
        partArg,
        partGateInstance,
        PartGateClass,
        inputPinsMap,
        outputPinsMap,
        internalPins,
        internalPinsMap
      );
    });

    return partGateInstance;
  });

  return [
    inputPins,
    outputPins,
    internalPins,
    parts,
  ];
}

// ----------------------------------------------------------------
// Handle arguments, and connect input/output pins
// to the main inputs, and internal pins.
//
function handlePartArg(
  partArg,
  partGateInstance,
  PartGateClass,
  inputPinsMap,
  outputPinsMap,
  internalPins,
  internalPinsMap
) {
  const {name, value} = partArg;
  const pin = partGateInstance.getPin(name.value);
  const pinInfo = PartGateClass.getPinInfo(name.value);

  // Creat new (internal) pin, which is not part of inputs/outputs.
  const isInternalPin = (
    !inputPinsMap.hasOwnProperty(value.value) &&
    !outputPinsMap.hasOwnProperty(value.value)
  );
  if (isInternalPin && !internalPinsMap.hasOwnProperty(value.value)) {
    let internalPinSize = 1;

    if (name.size) {
      internalPinSize = name.size;
    } else if (name.range) {
      internalPinSize = name.to - name.from + 1;
    }

    const internalPin = new Pin({
      name: value.value,
      size: internalPinSize,
      value: 0,
    });
    internalPins.push(internalPinsMap[value.value] = internalPin);
  }

  let constantValue;

  if (value.value === 'true' || value.value === '1') {
    constantValue = 1;
  } else if (value.value === 'false' || value.value === '0') {
    constantValue = 0;
  }

  // When main pins change, update all dependent inputs.
  if (pinInfo.kind === 'input') {
    const sourcePin = (
      inputPinsMap[value.value] ||
      outputPinsMap[value.value] ||
      internalPinsMap[value.value]
    );
    sourcePin.on(
      'change',
      createInputChangeHandler(pin, sourcePin, name, value)
    );
  }

  // When the output of the part pin changes,
  // update outer pins: main out or internal pins.
  else if (pinInfo.kind === 'output') {
    const destPin = (
      internalPinsMap[value.value] ||
      outputPinsMap[value.value]
    );
    pin.on(
      'change',
      createOutputChangeHandler(destPin, pin, name, value)
    );

  // Set always fixed value.
  } else if (constantValue) {
    pin.setValue(constantValue);
  }
}

// ----------------------------------------------------------------
// Change handler for inputs.
//
function createInputChangeHandler(pin, sourcePin, nameInfo, valueInfo) {
  return () => {
    setPinValue(pin, getPinValue(sourcePin, valueInfo), nameInfo);
  };
}

// ----------------------------------------------------------------
// Change handler for outputs.
//
function createOutputChangeHandler(destPin, pin, nameInfo, valueInfo) {
  return () => {
    setPinValue(destPin, getPinValue(pin, nameInfo), valueInfo);
  };
}

// ----------------------------------------------------------------
// Update pin value according to spec: full, index or slice.
//
function setPinValue(pin, value, spec) {
  if (spec.index) {
    pin.setValueAt(spec.index, value);
  } else if (spec.range) {
    pin.setSlice(spec.range.from, spec.range.to, value);
  } else {
    pin.setValue(value);
  }
}

// ----------------------------------------------------------------
// Extracts pin value according to spec: full, index or slice.
//
function getPinValue(pin, spec) {
  if (spec.index) {
    return pin.getValueAt(spec.index);
  } else if (spec.range) {
    return pin.getSlice(spec.range.from, spec.range.to);
  }
  return pin.getValue();
}

module.exports = HDLClassFactory;