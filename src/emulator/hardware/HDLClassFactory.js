/**
 * The MIT License (MIT)
 * Copyright (c) 2017-present Dmitry Soshnikov <dmitry.soshnikov@gmail.com>
 */

'use strict';

const CompositeGate = require('./CompositeGate');
const fs = require('fs');
const parser = require('../../parser');
const path = require('path');
const Pin = require('./Pin');

/**
 * Cache map from file names to gates class.
 */
const fileNamesToGateClasses = {};

/**
 * Cache map from HDL code to gate classes.
 */
const hdlCodeToGateClasses = {};

/**
 * This factory creates a gate class from the parsed HDL.
 * The resulting class inherits from the `CompositeGate`.
 */
const HDLClassFactory = {
  /**
   * Creates a gate class from HDL file.
   *
   * The directory of the file is used further as a working
   * directory to load other gates from it.
   */
  fromHDLFile(fileName) {
    const cacheKey = path.resolve(fileName);
    if (!fileNamesToGateClasses.hasOwnProperty(cacheKey)) {
      fileNamesToGateClasses[cacheKey] = this.fromHDL(
        fs.readFileSync(fileName, 'utf-8'),
        path.dirname(fileName)
      );
    }
    return fileNamesToGateClasses[cacheKey];
  },

  /**
   * Creates a gate class from HDL chip definition.
   *
   * If working directory is passed, it's used to load
   * other gates from it.
   */
  fromHDL(hdl, workingDir = __dirname) {
    const cacheKey = `${hdl}:${workingDir}`;
    if (!hdlCodeToGateClasses.hasOwnProperty(cacheKey)) {
      hdlCodeToGateClasses[cacheKey] = this.fromAST(
        parser.parse(hdl),
        workingDir
      );
    }
    return hdlCodeToGateClasses[cacheKey];
  },

  /**
   * Creates a gate class from an AST.
   *
   * If working directory is passed, it's used to load
   * other gates from it.
   */
  fromAST(ast, workingDir = __dirname) {
    const [
      internalPinsSpec,
      partsClasses,
    ] = analyzeParts(ast, workingDir);

    // Gate class, corresponding to the HDL file.
    const GateClass = class extends CompositeGate {
      constructor(options = {}) {
        if (!options.inputPins) {
          options.inputPins = createPins(ast.inputs);
        }

        options.inputPins = CompositeGate.toPins(options.inputPins);

        if (!options.outputPins) {
          options.outputPins = createPins(ast.outputs);
        }

        options.outputPins = CompositeGate.toPins(options.outputPins);

        // Internal pins used in PARTS.
        options.internalPins = [];

        // Create instances used in PARTS implementation.
        const parts = instantiateParts(ast, options, partsClasses);

        super(Object.assign(options, {
          name: ast.name,
          parts,
        }));
      }
    };

    // Override `name` property to reflect class name.
    Object.defineProperty(GateClass, 'name', {value: ast.name});

    const pinsToGateSpec = value => {
      return {name: value.value, size: value.size || 1};
    };

    GateClass.Spec = {
      description: `Compiled from HDL composite Gate class "${ast.name}".`,
      inputPins: ast.inputs.map(pinsToGateSpec),
      outputPins: ast.outputs.map(pinsToGateSpec),
      internalPins: internalPinsSpec,
      truthTable: [],
    };

    return GateClass;
  }
};

/**
 * Creates pins from AST data.
 */
function createPins(pinsData) {
  const pins = pinsData.map(pinSpec => new Pin({
    name: pinSpec.value,
    size: pinSpec.size || 1,
  }));
  return pins;
}

/**
 * Creates pins map from actual Pins instances,
 * or from AST data.
 */
function createPinsMap(pins) {
  const pinsMap = {};
  pins.forEach(pin => {
    const name = pin instanceof Pin
      ? pin.getName()
      : pin.value;
    pinsMap[name] = pin;
  });
  return pinsMap;
}

/**
 * Extracts spec info for internal pins,
 * and also create gate classes for parts.
 */
function analyzeParts(ast, workingDir) {
  const internalPinsSpec = [];
  const partsClasses = [];

  const inputPinsMap = createPinsMap(ast.inputs);
  const outputPinsMap = createPinsMap(ast.outputs);
  const internalPinsMap = {};

  ast.parts.forEach(part => {
    partsClasses.push(loadGate(part.name, workingDir));

    part.arguments.forEach(partArg => {
      const {name, value} = partArg;

      const isInternalPin = (
        !inputPinsMap.hasOwnProperty(value.value) &&
        !outputPinsMap.hasOwnProperty(value.value)
      );

      if (isInternalPin && !internalPinsMap.hasOwnProperty(value.value)) {
        const pinSpec = {
          name: value.value,
          size: getInternalPinSize(name),
        };
        internalPinsSpec.push(internalPinsMap[value.value] = pinSpec);
      }
    });
  });

  return [
    internalPinsSpec,
    partsClasses,
  ];
}

/**
 * Loads part gate: custom (in the current working directory),
 * or, if a gate doesn't existing in this directory, loads the built-in.
 */
function loadGate(name, workingDir) {
  const hdlFile = path.join(workingDir, name + '.hdl');
  if (fs.existsSync(hdlFile)) {
    return HDLClassFactory.fromHDLFile(hdlFile);
  }
  return require('./builtin-gates/' + name);
}

/**
 * Loads gate classes used in the `PARTS` implementation.
 * These may include built-in, and custom classes from HDL.
 */
function instantiateParts(ast, options, partsClasses) {
  const {
    inputPins,
    outputPins,
    internalPins,
  } = options;

  const inputPinsMap = createPinsMap(inputPins);
  const outputPinsMap = createPinsMap(outputPins);
  const internalPinsMap = {};

  const parts = ast.parts.map((part, idx) => {
    // Gate class (built-ins, or custom from HDL).
    const PartGateClass = partsClasses[idx];

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

  return parts;
}

/**
 * Returns a size of an internal pin based on
 * the output value which is connected to this pin.
 */
function getInternalPinSize(outputArg) {
  let internalPinSize = 1;

  if (outputArg.size) {
    internalPinSize = outputArg.size;
  } else if (outputArg.range) {
    internalPinSize = outputArg.to - outputArg.from + 1;
  }

  return internalPinSize;
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

  // Create new (internal) pin, which is not part of inputs/outputs.
  const isInternalPin = (
    !inputPinsMap.hasOwnProperty(value.value) &&
    !outputPinsMap.hasOwnProperty(value.value)
  );
  if (isInternalPin && !internalPinsMap.hasOwnProperty(value.value)) {
    const internalPin = new Pin({
      name: value.value,
      size: getInternalPinSize(name),
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