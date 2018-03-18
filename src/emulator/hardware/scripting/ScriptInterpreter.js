/**
 * The MIT License (MIT)
 * Copyright (c) 2017-present Dmitry Soshnikov <dmitry.soshnikov@gmail.com>
 */

'use strict';

const fs = require('fs');
const HDLClassFactory = require('../HDLClassFactory');
const path = require('path');
const Pin = require('../Pin');
const scriptParser = require('./script-parser');
const {SystemClock} = require('../Clock');

const {toSignedString} = require('../../../util/numbers');
const {centerString} = require('../../../util/string-util');

/**
 * Number format.
 */
const formatRadix = {
  B: 2,
  X: 16,
  D: 10,
};

/**
 * Evaluates a script code, testing gates logic.
 */
class ScriptInterpreter {
  constructor({script, file, workingDirectory}) {
    /**
     * Working directory to load files.
     */
    this._workingDirectory = workingDirectory;
    this._isVirtualDirectory = typeof workingDirectory === 'object';

    /**
     * Script from a file.
     */
    if (file) {
      this._script = fs.readFileSync(file, 'utf-8');
      if (!this._workingDirectory) {
        this._workingDirectory = path.dirname(file);
      }
    }

    if (!this._workingDirectory) {
      this._workingDirectory = __dirname;
    }

    /**
     * Script source.
     */
    if (script) {
      this._script = script;
    }

    if (this._isVirtualDirectory) {
      HDLClassFactory.setVirtualDirectory(this._workingDirectory);
    }

    /**
     * Parsed AST to evaluate.
     */
    this._ast = scriptParser.parse(this._script);

    /**
     * Program counter (current command to eval).
     */
    this._pc = 0;

    /**
     * Loaded gate instance.
     */
    this._gate = null;

    /**
     * Output file. By default to the console.
     */
    this._outputFile = 'console';

    /**
     * Compare file.
     */
    this._compareTo = null;
    this._compareToLines = null;
    this._actualLines = [];

    /**
     * Format of the output columns.
     */
    this._outputListMap = null;

    /**
     * Current container to evaluate commands.
     * Containainers are: Script, bodies of the while, and repeat loops.
     */
    this._container = this._ast;
  }

  /**
   * Returns gate.
   */
  getGate() {
    return this._gate;
  }

  /**
   * Executes the full script.
   */
  exec() {
    this.eval(this._ast);
    return this;
  }

  /**
   * Executes next full step (until the `;` terminator).
   */
  nextStep() {
    let shouldBreak = false;
    while (this._hasMoreCommands(this._container)) {
      this.nextCommand();
      if (shouldBreak) {
        break;
      }
      if (this._isLastCommandInStep()) {
        shouldBreak = true;
      }
    }
    return this;
  }

  /**
   * Executes next command within step (until `,` terminator).
   */
  nextCommand() {
    this.eval(this._container.commands[this._pc++]);
    return this;
  }

  eval(node) {
    return node ? this[node.type](node) : null;
  }

  Script(node) {
    this._container = node;
    this._pc = 0;

    while (this._hasMoreCommands()) {
      this.nextStep();
    }
  }

  _hasMoreCommands() {
    return this._pc < this._container.commands.length;
  }

  _isLastCommandInStep() {
    if (!this._hasMoreCommands()) {
      return true;
    }
    return this._container.commands[this._pc].terminator === ';';
  }

  ControllerCommand(node) {
    switch (node.name) {
      case 'load':
        this._loadGate(node);
        break;
      case 'output-file':
        this._initOutputFile(node);
        break;
      case 'compare-to':
        this._createCompareTo(node);
        break;
      case 'output-list':
        this._createOutputListMap(node.arguments);
        break;
      case 'output':
        this._evalOutput();
        break;
      case 'echo':
        console.info(node.arguments[0]);
        break;
      case 'clear-echo':
        // Unimplemented, ignore.
        break;
      case 'while':
        this._evalWhile(node);
        break;
      case 'repeat':
        this._evalRepeat(node);
        break;
      default:
        throw TypeError(`Unrecognized controller command: "${node.name}".`);
    }
  }

  SimulatorCommand(node) {
    switch (node.name) {
      case 'set':
        this._setPinValue(node.arguments[0], node.arguments[1]);
        break;
      case 'eval':
        this._gate.eval();
        break;
      case 'tick':
        SystemClock.tick();
        break;
      case 'tock':
        SystemClock.tock();
        break;
      case 'ticktock':
        SystemClock.cycle();
        break;
      default:
        throw TypeError(`Unrecognized simulator command: "${node.name}".`);
    }
  }

  _loadGate(node) {
    this._gate = HDLClassFactory.loadGate(
      node.arguments[0].replace('.hdl', ''),
      this._workingDirectory
    ).defaultFromSpec();
  }

  _createCompareTo(node) {
    if (this._isVirtualDirectory) {
      this._compareTo = node.arguments[0];
    } else {
      this._compareTo = this._workingDirectory + '/' + node.arguments[0];
    }
    this._compareToLines = this._readFileContents(this._compareTo).split(
      /\r?\n/
    );
  }

  _initOutputFile(node) {
    const outputFile = node.arguments[0];

    if (outputFile === 'console') {
      this._outputFile = outputFile;
      return;
    }

    if (this._isVirtualDirectory) {
      this._outputFile = outputFile;
      this._workingDirectory[outputFile] = '';
      return;
    }

    this._outputFile = this._workingDirectory + '/' + outputFile;
    fs.writeFileSync(this._outputFile, '', 'utf-8');
  }

  _createOutputListMap(rawList) {
    this._outputListMap = {};
    rawList.forEach((column, idx) => {
      this._outputListMap[column.column] = column;
      this._outputListMap[column.column].index = idx;
    });
  }

  _evalOutput() {
    this._printHeader();

    const line = ['|'];

    for (let column in this._outputListMap) {
      const {right, middle, left, format} = this._outputListMap[column];
      const radix = formatRadix[format];

      const actualPinColumn = column === 'time' ? Pin.CLOCK : column;

      const pinInfo = this._gate.getClass().getPinInfo(actualPinColumn);
      const value = this._gate.getPin(actualPinColumn).getValue();

      let content;

      // Special case for `time` column, which is an alias
      // for the `$clock`. The `time` uses string representation,
      // e.g. '1' string for negative, and '1+' for positive, while
      // `$clock` uses -1 for negative, and +1 for positive.
      if (column === 'time') {
        content = value >= 0 ? `${value}+` : `${Math.abs(value)}`;
        content = content.padEnd(middle, ' ');
      } else if (column === Pin.CLOCK) {
        content = toSignedString(value).padEnd(middle, ' ');
      } else if (format === 'S') {
        // Explicit string format.
        content = `${value}`.padEnd(middle, ' ');
      } else {
        content = (radix !== 10 ? value >>> 0 : value)
          .toString(radix)
          .padStart(radix !== 10 ? pinInfo.size : 0, '0')
          .padStart(radix === 10 ? middle : 0, ' ')
          .toUpperCase();

        if (content.length > middle) {
          content = content.slice(-middle);
        }
      }

      line.push(' '.repeat(right), content, ' '.repeat(left), '|');
    }

    this._printLine(line.join(''));
  }

  _centerHeaderColumn(columnInfo) {
    const {right, middle, left, column} = columnInfo;
    const totalLength = right + middle + left;
    return centerString(column, totalLength);
  }

  _printHeader() {
    // Header is printed only once.
    if (this._headerPrinted) {
      return;
    }

    const line = ['|'];

    for (let column in this._outputListMap) {
      const centerColumn = this._centerHeaderColumn(
        this._outputListMap[column]
      );
      line.push(centerColumn, '|');
    }

    this._printLine(line.join(''));
    this._headerPrinted = true;
  }

  _printLine(line) {
    if (this._compareTo) {
      this._actualLines.push(line);
      const compareIdx = this._actualLines.length - 1;
      const header = this._compareToLines[0];
      const expected = this._compareToLines[compareIdx];
      const actual = this._actualLines[compareIdx];
      if (expected !== actual) {
        throw new ScriptError({
          header,
          actual,
          expected,
          line: compareIdx + 1,
          compareTo: this._compareTo,
        });
      }
    }

    if (this._outputFile === 'console') {
      console.info(line);
      return;
    }

    if (this._isVirtualDirectory) {
      this._workingDirectory[this._outputFile] += line + '\n';
      return;
    }

    fs.appendFileSync(this._outputFile, line + '\n', 'utf-8');
  }

  _readFileContents(file) {
    if (this._isVirtualDirectory) {
      return this._workingDirectory[file];
    }
    return fs.readFileSync(file, 'utf-8');
  }

  _evalWhile(node) {
    const savedContainer = this._container;
    const savedPC = this._pc;

    this._container = node;
    this._pc = 0;

    while (this.eval(node.condition)) {
      while (this._hasMoreCommands()) {
        this.nextStep();
      }
    }

    this._container = savedContainer;
    this._pc = savedPC;
  }

  RelationalExpression(node) {
    const left = this._getPinValue(node.left);
    const right = this._getConditionValue(node.right);

    switch (node.operator) {
      case '=':
        return left === right;
      case '<>':
        return left !== right;
      case '<=':
        return left <= right;
      case '>=':
        return left >= right;
      case '<':
        return left < right;
      case '>':
        return left > right;
      default:
        throw TypeError(`Unrecognized condition operator: "${node.operator}".`);
    }
  }

  _getPinValue(node) {
    const pin = this._gate.getPin(node.value);

    // a[1]
    if (node.index) {
      return pin.getValueAt(node.index);
    }

    // a
    return pin.getValue();
  }

  _setPinValue(node, value) {
    const pin = this._gate.getPin(node.value);

    // a[1]
    if (node.index) {
      return pin.setValueAt(node.index, value.value);
    }

    // a
    return pin.setValue(value.value);
  }

  _getConditionValue(node) {
    if (node.type === 'Name') {
      return this._getPinValue(node);
    }
    return node.value;
  }

  _evalRepeat(node) {
    const savedContainer = this._container;
    const savedPC = this._pc;

    this._container = node;

    for (let i = 0; i < node.times.value; i++) {
      this._pc = 0;
      while (this._hasMoreCommands()) {
        this.nextStep();
      }
    }

    this._container = savedContainer;
    this._pc = savedPC;
  }
}

class ScriptError extends Error {
  constructor(errorData) {
    super('Script comparison error.');
    this.errorData = errorData;
  }
}

module.exports = ScriptInterpreter;
