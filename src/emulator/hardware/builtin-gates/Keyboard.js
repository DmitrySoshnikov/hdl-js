/**
 * The MIT License (MIT)
 * Copyright (c) 2017-present Dmitry Soshnikov <dmitry.soshnikov@gmail.com>
 */

'use strict';

const BuiltInGate = require('../BuiltInGate');
const EventEmitter = require('events');

/**
 * Main static emitter used for static methods on `Keyboard`.
 */
const keyboardEmitter = new EventEmitter();

/**
 * A keyboard, implemented as a 16 bit register that stores
 * the currently pressed key code.
 */
class Keyboard extends BuiltInGate {
  constructor(options) {
    super(options);

    Keyboard.on('key', key => {
      // Ctrl-c
      if (key === '\u0003') {
        this._listening = false;
        process.exit();
      }

      this.getOutputPins()[0].setValue(key.charCodeAt(0));
    });
  }

  /**
   * Default blocking listener for CLI.
   *
   * Other clients should call `Keyboard.emit('key', key)`
   * in their listeners.
   */
  listen() {
    if (this._listening) {
      return;
    }

    const {stdin} = process;

    stdin.setRawMode(true);
    stdin.setEncoding('utf8');

    stdin.on('data', key => Keyboard.emit('key', key));
    stdin.resume();

    this._listening = true;
    return this;
  }

  /**
   * Facade method for subscription.
   */
  static emit(eventName, data) {
    keyboardEmitter.emit(eventName, data);
    return this;
  }

  /**
   * Facade method for subscription.
   */
  static on(eventName, listener) {
    keyboardEmitter.on(eventName, listener);
    return this;
  }

  /**
   * Facade method for removing subscription.
   */
  static removeListener(eventName, listener) {
    keyboardEmitter.removeListener(eventName, listener);
    return this;
  }
}

/**
 * Specification of the `Keyboard` gate.
 */
Keyboard.Spec = {
  name: 'Keyboard',

  description: `A keyboard, implemented as a 16 bit register that stores
the currently pressed key code.`,

  inputPins: [],
  outputPins: [{name: 'out', size: 16}],

  truthTable: [],
};

module.exports = Keyboard;
