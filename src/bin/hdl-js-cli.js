/**
 * The MIT License (MIT)
 * Copyright (c) 2017-present Dmitry Soshnikov <dmitry.soshnikov@gmail.com>
 */

'use strict';

const colors = require('colors');
const fs = require('fs');
const hdl = require('../../index');
const path = require('path');
const vm = require('vm');

const {
  BuiltInGate,
  HDLClassFactory,
  Clock: {
    SystemClock,
  },
} = hdl.emulator;

const {int16} = require('../util/numbers');

function enforceUnique(v) {
  return Array.isArray(v) ? v[v.length - 1] : v;
}

const options = require('yargs')
  .usage('Usage: $0 [options]')
  .options({
    gate: {
      alias: 'g',
      describe: 'Name of a built-in gate or path to an HDL file',
      requiresArg: true,
      coerce: enforceUnique,
    },
    parse: {
      alias: 'p',
      describe: 'Parse the HDL file, and print AST',
    },
    list: {
      alias: 'l',
      describe: 'List supported built-in gates',
    },
    describe: {
      alias: 'd',
      describe: 'Prints gate\'s specification',
    },
    'exec-on-data': {
      alias: 'e',
      describe: 'Evaluates gate\'s logic on passed data; ' +
        'validates outputs if passed',
      requiresArg: true,
      coerce: enforceUnique,
    },
    format: {
      alias: 'f',
      describe: 'Values format (binary, hexadecimal, decimal)',
      nargs: 1,
      choices: ['bin', 'hex', 'dec'],
      coerce: enforceUnique,
    },
    run: {
      alias: 'r',
      describe: 'Runs sequentially the rows from --exec-on-data table',
    },
    'clock-rate': {
      describe: 'Rate (number of cycles per second) for the System clock',
      requiresArg: true,
      coerce: enforceUnique,
    },
    'columns': {
      alias: 'c',
      describe: 'Whitelist of columns (comma-separated) to show in the table',
      requiresArg: true,
      coerce: enforceUnique,
    },
  })
  .alias('help', 'h')
  .alias('version', 'v')
  .argv;

/**
 * Directory with all built-in gates.
 */
const BUILTINS_DIR = __dirname + '/../emulator/hardware/builtin-gates';

/**
 * Format to radix.
 */
const FORMAT_VALUES = {
  bin: {radix: 2, pad: 16}, // 0000000000001111
  hex: {radix: 16, pad: 4}, // 000F
  dec: {radix: 10, pad: 0}, // no padding
};

/**
 * Loads data in the "Extended JSON" format.
 *
 * The `data` is either the actual data-string, or a filename.
 */
function loadAndProcessData(data, formatRadix) {
  const fullPath = path.resolve(data);
  if (fs.existsSync(fullPath)) {
    data = fs.readFileSync(fullPath, 'utf-8');
  }
  return parseInputData(data, formatRadix);
}

/**
 * Parse input data.
 */
function parseInputData(data, formatRadix) {
  const parsed = vm.runInNewContext(`(${data})`);
  parsed.forEach(row => {
    for (const prop in row) {
      row[prop] = processInputValue(row[prop], formatRadix);
    }
  });
  return parsed;
}

/**
 * Process input data.
 */
function processInputValue(value, formatRadix) {
  // Strings are converted to numbers according to the `formatRadix`.
  if (typeof value === 'string') {
    value = Number.parseInt(value, formatRadix);
  }

  // Truncate numbers to 16-bits.
  if (typeof value === 'number') {
    return int16(value);
  }

  return value;
}

/**
 * Lists built-in gates.
 */
function listBuiltInGates() {
  const builtinGates = fs.readdirSync(BUILTINS_DIR)
    .filter(file => /^[A-Z]/.test(file))
    .map(file => '  - ' + path.basename(file, '.js'));

  console.info('');
  console.info(colors.bold('Built-in gates:'));
  console.info('');
  console.info(builtinGates.join('\n'), '\n');
}

/**
 * Loads a gate class.
 */
function loadGate(gate) {
  try {
    // Custom gate from HDL.
    if (fs.existsSync(gate)) {
      return HDLClassFactory.fromHDLFile(gate);
    }
    // Built-in gate.
    return require(BUILTINS_DIR + '/' + gate);
  } catch (_e) {
    console.error(colors.red(`\nUnknown gate: "${gate}".`));
    listBuiltInGates();
    process.exit(1);
  }
}

/**
 * Prints specification and truth table of a gate.
 */
function describeGate(gate, formatRadix, formatStringLengh, columns) {
  const {
    run,
  } = options;

  const GateClass = loadGate(gate);
  const isBuiltIn = Object.getPrototypeOf(GateClass) === BuiltInGate;
  const spec = GateClass.Spec;

  console.info('');
  console.info(
    (isBuiltIn ? 'BuiltIn ' : 'Custom ') +
    colors.bold(`"${GateClass.name}"`) + ' gate:'
  );

  const toFullName = (name) => {
    const isSimple = (
      typeof name === 'string' ||
      name.size === 1
    );
    return name = isSimple
      ? `  - ${name.name || name}`
      : `  - ${name.name}[${name.size}]`;
  };

  // Description:

  const description = spec.description.split('\n')
    .map(line => '  ' + line)
    .join('\n');

  console.info('\n' + colors.bold('Description:\n\n') + description);

  // Input pins:

  const inputPins = spec.inputPins
    .map(input => toFullName(input))
    .join('\n');

  console.info('\n' + colors.bold('Inputs:\n\n') + inputPins);

  // Internal pins:

  if (spec.internalPins && spec.internalPins.length > 0) {
    const internalPins = spec.internalPins
      .map(internal => toFullName(internal))
      .join('\n');

    console.info('\n' + colors.bold('Internal pins:\n\n') + internalPins);
  }

  // Output pins:

  const outputPins = spec.outputPins
    .map(output => toFullName(output))
    .join('\n');

  console.info('\n' + colors.bold('Outputs:\n\n') + outputPins);
  console.info('');

  let {truthTable} = spec;
  let isCustomTable = truthTable.length === 0;

  // Compiled gates from HDL don't provide static canonical
  // truth table, so we calculate it for 5 rows on random data.
  if (isCustomTable) {
    truthTable = generateTruthTable(GateClass);
  } else {
    console.info(colors.bold('Truth table:'), '\n');
  }

  const printTable = table => {
    GateClass.printTruthTable({
      table,
      columns,
      formatRadix,
      formatStringLengh,
    });
  };

  // Sequential table run.
  if (run) {
    console.info(colors.bold('\nCurrent results for pins:'), '\n');
    runSlice(truthTable, 0, printTable);
    return;
  }

  // Truth table:

  if (isCustomTable) {
    let isSimple = spec.inputPins.every(input => {
      return typeof input === 'string' || input.size === 1;
    });
    if (isSimple) {
      console.info(colors.bold('Truth table:'), '\n');
    } else {
      console.info(colors.bold('Truth table:'), '(generated, random 5 rows)\n');
    }
  }

  printTable(truthTable);
}

/**
 * Generates a truth table on random data, according
 * to the gate logic.
 */
function generateTruthTable(GateClass) {
  const gateInstance = GateClass.defaultFromSpec();
  const {inputPins} = GateClass.Spec;

  let isSimple = inputPins.every(input => {
    return typeof input === 'string' || input.size === 1;
  });

  const inputData = [];

  // For simple tables generate all permutations.
  if (isSimple) {
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

  const {result} = gateInstance.execOnData(inputData);
  return result;
}

/**
 * Returns a random integer number in range.
 */
function randomNumberInRange(min, max) {
  return Math.floor(Math.random() * (max - min + 1) + min);
}

/**
 * Runs a slice of calculation, printing a table
 * one row at a time.
 */
function runSlice(data, index, action) {
  const slice = data.slice(index, index + 1);
  action(slice);

  if (index === data.length - 1) {
    // Reset and run forever in a loop.
    index = -1;
  }

  setTimeout(() => {
    // Clear 6 previous lines, which take a previous table row.
    process.stdout.write('\r\x1B[K\r\x1B[1A'.repeat(6));
    runSlice(data, index + 1, action);
  }, 1000 / SystemClock.getRate());
}

function main() {
  const {
    clockRate,
    describe,
    execOnData,
    format = 'bin',
    gate,
    list,
    parse,
    run,
  } = options;

  // Whitelist of columns, empty list -- all columns.
  const columns = options.columns
    ? options.columns.split(',')
    : [];

  if (clockRate) {
    SystemClock.setRate(clockRate);
  }

  const formatRadix = FORMAT_VALUES[format].radix;
  const formatStringLengh = FORMAT_VALUES[format].pad;

  if (gate && !describe && !execOnData) {
    console.info(
      `\nHint: pass ${colors.bold('--describe')} option to see ` +
      `${colors.bold('"' + gate + '"')} gate specification.\n`
    );
  }

  if (describe && !gate) {
    console.info(
      `\nHint: pass ${colors.bold('--gate')} option to see ` +
      `the specification of a built-in or custom gate.\n`
    );
  }

  // HDL file to be parsed.
  let hdlFile;

  // ------------------------------------------------------
  // Handle gate (built-in or custom).

  if (gate && fs.existsSync(gate)) {
    hdlFile = fs.readFileSync(gate, 'utf-8');
  }

  // ------------------------------------------------------
  // List built-in gates.

  if (list) {
    listBuiltInGates();
  }

  // ------------------------------------------------------
  // Describes a gate (built-in or composite).

  if (gate && describe) {
    describeGate(gate, formatRadix, formatStringLengh, columns);
  }

  // ------------------------------------------------------
  // Exec on data.

  if (execOnData) {
    if (!gate) {
      console.info(
        `\nHint: pass ${colors.bold('--gate')} option to execute ` +
        `gate logic on the passed data.\n`
      );
      return;
    }
    const GateClass = loadGate(gate);
    const gateInstance = GateClass.defaultFromSpec();

    const data = loadAndProcessData(execOnData, formatRadix);
    const conflictingRows = {};

    /**
     * Prints truth table from the result.
     */
    const printTable = table => {
      GateClass.printTruthTable({
        table,
        columns,
        formatRadix,
        formatStringLengh,
        transformValue(value, row, column) {
          if (
            conflictingRows[row] &&
            conflictingRows[row].hasOwnProperty(column)
          ) {
            const pinInfo = GateClass.getPinInfo(column);

            let expected = (data[row][column] >>> 0)
              .toString(formatRadix)
              .padStart(formatRadix !== 10 ? pinInfo.size : 0, '0')
              .toUpperCase();

            if (expected.length > formatStringLengh) {
              expected = expected.slice(-formatStringLengh);
            }

            return colors.red(expected) + ' / ' + colors.green(value);
          }
          return value;
        }
      });
    };

    if (run) {
      console.info(colors.bold('\nCurrent results for pins:'), '\n');
      runSlice(data, 0, printTable);
      return;
    }

    const {result, conflicts} = gateInstance.execOnData(data);

    if (conflicts.length) {
      console.info(
        colors.red(colors.bold(
          `\nFound ${conflicts.length} conflicts in:\n`
        ))
      );

      conflicts.forEach(conflict => {
        const {row, pins} = conflict;
        const pinNames = Object.keys(pins);

        conflictingRows[row] = pins;

        console.info(`  - row: ${row}, pins: ${pinNames.join(', ')}`);
      });
      console.info('');
    } else {
      // No conflicts.
      console.info(colors.bold('\nTruth table for data:'), '\n');
    }

    // Always print correct table eventually,
    // showing conflicting values in red.
    printTable(result);
  }

  // ------------------------------------------------------
  // Parser.

  if (parse && hdlFile) {
    const parsed = hdl.parse(hdlFile);
    console.info('');
    console.info(colors.bold('Parsed:'));
    console.info('');
    console.info(JSON.stringify(parsed, null, 2), '\n');
    return;
  }
}

module.exports = main;

if (require.main === module) {
  main();
}
