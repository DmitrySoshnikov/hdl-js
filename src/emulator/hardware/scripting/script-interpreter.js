/**
 * The MIT License (MIT)
 * Copyright (c) 2017-present Dmitry Soshnikov <dmitry.soshnikov@gmail.com>
 */

'use strict';

const fs = require('fs');
const HDLClassFactory = require('../HDLClassFactory');
const path = require('path');
const scriptParser = require('./script-parser');
const {SystemClock} = require('../Clock');

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
  constructor({script, file, workingDirectory = __dirname}) {
    /**
     * Script from a file.
     */
    if (file) {
      this._script = fs.readFileSync(file, 'utf-8');
      this._workingDirectory = path.dirname(file);
    }

    /**
     * Script source.
     */
    if (script) {
      this._script = script;
    }

    /**
     * Working directory to load files.
     */
    if (workingDirectory) {
      this._workingDirectory = workingDirectory;
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

    /**
     * Format of the output columns.
     */
    this._outputListMap = null;
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
  nextStep(container = this._ast) {
    let shouldBreak = false;
    while (this._hasMoreCommands(container)) {
      this.nextCommand(container);
      if (shouldBreak) {
        break;
      }
      if (this._isLastCommandInStep(container)) {
        shouldBreak = true;
      }
    }
    return this;
  }

  /**
   * Executes next command within step (until `,` terminator).
   */
  nextCommand(container = this._ast) {
    this.eval(container.commands[this._pc++]);
    return this;
  }

  eval(node) {
    return node ? this[node.type](node) : null;
  }

  Script(node) {
    while (this._hasMoreCommands(node)) {
      this.nextCommand(node);
    }
  }

  _hasMoreCommands(container = this._ast) {
    return this._pc < container.commands.length;
  }

  _isLastCommandInStep(container = this._ast) {
    return container.commands[this._pc].terminator === ';';
  }

  ControllerCommand(node) {
    switch (node.name) {
      case 'load':
        this._gate = HDLClassFactory.loadGate(
          node.arguments[0].replace('.hdl', '')
        ).defaultFromSpec();
        break;
      case 'output-file':
        this._initOutputFile(node);
        break;
      case 'compare-to':
        this._compareTo = node.arguments[0];
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
        this._evalSet(node);
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

  _initOutputFile(node) {
    if (node.arguments[0] === 'console') {
      this._outputFile = node.arguments[0];
      return;
    }

    this._outputFile = this._workingDirectory + '/' + node.arguments[0];
    fs.writeFileSync(this._outputFile, '', 'utf-8');
  }

  _createOutputListMap(rawList) {
    this._outputListMap = {};
    rawList.forEach((column, idx) => {
      this._outputListMap[column.column] = column;
      this._outputListMap[column.column].index = idx;
    });
  }

  _evalSet(node) {
    const pinName = node.arguments[0].value;
    const value = node.arguments[1].value;
    this._gate.getPin(pinName).setValue(value);
  }

  _evalOutput() {
    this._printHeader();

    const line = ['|'];

    for (let column in this._outputListMap) {
      const {right, left, format} = this._outputListMap[column];
      const radix = formatRadix[format];

      const pinInfo = this._gate.getClass().getPinInfo(column);
      const value = this._gate.getPin(column).getValue();

      const content = (radix !== 10 ? value >>> 0 : value)
        .toString(radix)
        .padStart(radix !== 10 ? pinInfo.size : 0, '0')
        .toUpperCase();

      line.push(' '.repeat(right), content, ' '.repeat(left), '|');
    }

    this._printLine(line.join(''));
  }

  _printHeader() {
    // Header is printed only once.
    if (this._headerPrinted) {
      return;
    }

    const line = ['|'];

    for (let column in this._outputListMap) {
      const {right, middle, left} = this._outputListMap[column];
      const totalLength = right + middle + left;
      const pad = Math.floor((totalLength - column.length) / 2);
      line.push(' '.repeat(pad), column, ' '.repeat(pad), '|');
    }

    this._printLine(line.join(''));
    this._headerPrinted = true;
  }

  _printLine(line) {
    if (this._outputFile === 'console') {
      console.info(line);
      return;
    }
    fs.appendFileSync(this._outputFile, line + '\n', 'utf-8');
  }

  _evalWhile(node) {
    while (this.eval(node.condition)) {
      node.commands.forEach(command => this.eval(command));
    }
  }

  _evalRepeat(node) {
    for (let i = 0; i < node.times.value; i++) {
      node.commands.forEach(command => this.eval(command));
    }
  }
}

module.exports = ScriptInterpreter;
