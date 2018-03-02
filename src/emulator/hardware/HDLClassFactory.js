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
 * Virtual directory when no access to filesystem
 */
let virtualDirectory = null;
let virtualDirectoryGateClasses = {};

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
    // Check if the built-in version should be used as a backend.
    if (shouldUseBuiltinGate(ast.name, ast)) {
      return loadBuiltinGate(ast.name);
    }

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
          ast,
        }));
      }
    };

    // Override `name` property to reflect class name.
    Object.defineProperty(GateClass, 'name', {value: ast.name});

    const pinsToGateSpec = value => {
      return {name: value.value, size: value.size || 1};
    };

    GateClass.Spec = {
      name: ast.name,
      description: `Compiled from HDL composite Gate class "${ast.name}".`,
      inputPins: ast.inputs.map(pinsToGateSpec),
      outputPins: ast.outputs.map(pinsToGateSpec),
      internalPins: internalPinsSpec,
      truthTable: [],
    };

    return GateClass;
  },

  /**
   * Sets virtual directory.
   *
   * It's a JS object from gate name to source code.
   */
  setVirtualDirectory(directory) {
    virtualDirectory = directory;
    virtualDirectoryGateClasses = {};
    return this;
  },

  /**
   * Loads part gate: custom (in the current working directory),
   * or, if a gate doesn't exist in this directory, loads the built-in.
   */
  loadGate(name, workingDir = __dirname, ast = null) {
    // Explicit override to use a built-in gate for this name.
    if (ast && shouldUseBuiltinGate(name, ast)) {
      return loadBuiltinGate(name);
    }

    // If virtual directory is set, use it:
    if (virtualDirectory) {
      return loadVirtualGate(name, workingDir);
    }

    // Else, check first if we have an HDL-implementation.
    const hdlFile = path.join(workingDir, name + '.hdl');
    if (fs.existsSync(hdlFile)) {
      return HDLClassFactory.fromHDLFile(hdlFile);
    }

    // Otherwise, load a built-in gate.
    return loadBuiltinGate(name);
  },
};

function loadVirtualGate(name, workingDir) {
  if (!virtualDirectory.hasOwnProperty(name)) {
    return loadBuiltinGate(name);
  }

  if (!virtualDirectoryGateClasses.hasOwnProperty(name)) {
    virtualDirectoryGateClasses[name] =
      HDLClassFactory.fromHDL(virtualDirectory[name], workingDir);
  }

  return virtualDirectoryGateClasses[name];
}

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
 * Returns a value corresponding to a constant:
 * false, true, 0, 1.
 */
function getConstantValue(value) {
  let constantValue = null;
  if (value.value === 'true' || value.value === '1') {
    constantValue = 1;
  } else if (value.value === 'false' || value.value === '0') {
    constantValue = 0;
  }
  return constantValue;
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
    partsClasses.push(HDLClassFactory.loadGate(part.name, workingDir, ast));

    part.arguments.forEach(partArg => {
      const {name, value} = partArg;

      const constantValue = getConstantValue(value);

      const isInternalPin = (
        !inputPinsMap.hasOwnProperty(value.value) &&
        !outputPinsMap.hasOwnProperty(value.value) &&
        constantValue === null
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
 * Loads built-in gate by name.
 */
function loadBuiltinGate(name) {
  return require('./builtin-gates/' + name);
}

/**
 * Whether a built-in backend should be used.
 */
function shouldUseBuiltinGate(name, ast) {
  if (ast.builtins.length === 0) {
    return false;
  }
  return ast.builtins.find(({value}) => value === name);
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

  // Constant values: And(a=true, b=false)
  const constantValue = getConstantValue(value);

  // Create new (internal) pin, which is not part of inputs/outputs.
  const isInternalPin = (
    !inputPinsMap.hasOwnProperty(value.value) &&
    !outputPinsMap.hasOwnProperty(value.value) &&
    constantValue === null
  );

  if (isInternalPin && !internalPinsMap.hasOwnProperty(value.value)) {
    const internalPin = new Pin({
      name: value.value,
      size: getInternalPinSize(name),
      value: 0,
    });
    internalPins.push(internalPinsMap[value.value] = internalPin);
  }

  // Set always fixed value.
  if (constantValue !== null) {
    pin.setValue(constantValue);
  } else if (pinInfo.kind === 'input') {
    // When main pins change, update all dependent inputs.
    const sourcePin = (
      inputPinsMap[value.value] ||
      outputPinsMap[value.value] ||
      internalPinsMap[value.value]
    );
    sourcePin.connectTo(pin, {
      sourceSpec: value,
      destinationSpec: name,
    });
  }

  // When the output of the part pin changes,
  // update outer pins: main out or internal pins.
  else if (pinInfo.kind === 'output') {
    const destPin = (
      internalPinsMap[value.value] ||
      outputPinsMap[value.value]
    );
    pin.connectTo(destPin, {
      sourceSpec: name,
      destinationSpec: value,
    });
  }
}

module.exports = HDLClassFactory;