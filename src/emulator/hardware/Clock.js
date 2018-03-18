/**
 * The MIT License (MIT)
 * Copyright (c) 2017-present Dmitry Soshnikov <dmitry.soshnikov@gmail.com>
 */

'use strict';

const EventEmitter = require('events');

const {isNegativeZero} = require('../../util/numbers');

/**
 * The system clock is used to synchronize handling of all
 * the "clocked chips" (such as data storage, etc).
 *
 * The clocked gates update their internal state when clock goes up
 * (aka the "rising edge"), and commit the changes to the output pins,
 * when clock goes down (aka the "falling edge").
 *
 * The low
 *
 * A rising edge followed by a falling edge is a "Clock Cycle".
 *
 * A clock operates with a "Clock Rate" -- a number of clock
 * cycles per second, measured in Hz (default is 1Hz -- 1 cycle per second).
 */
class Clock extends EventEmitter {
  /**
   * Creates a clock instance.
   */
  constructor({rate = 1, value = -0} = {}) {
    super();
    this.setRate(rate);
    this.setValue(value);

    // Tracks the halfs in a cycle, to emit full 'cycle' event
    // from tick, followed by tock.
    this._halfs = 0;

    // There might be more than 11 (default in Node) listeners of the clock.
    this.setMaxListeners(Infinity);
  }

  /**
   * Resets the clock.
   *
   * Initial clock value is -0. Each tick: set positive sign,
   * each tock: increase, set negative sign back.
   */
  reset() {
    this.setValue(-0);
    return this;
  }

  /**
   * Sets clock value.
   */
  setValue(value) {
    this._value = value;

    // Next full 'cycle' event will be relatively
    // this set value, so reset the halfs counter.
    this._halfs = 0;

    this.emit('change', this._value);
    return this;
  }

  /**
   * Returns clock value.
   */
  getValue() {
    return this._value;
  }

  /**
   * Sets the clock rate.
   */
  setRate(rate) {
    this._rate = rate;
    return this;
  }

  /**
   * Returns the clock rate.
   */
  getRate() {
    return this._rate;
  }

  /**
   * Starts the clock, and continues running it,
   * executing number of cycles withing 1 second.
   */
  start() {
    this.cyclesForRate();
    this._timeoutID = setTimeout(() => this.start(), 1000);
    return this;
  }

  /**
   * Stops the clock.
   */
  stop() {
    clearTimeout(this._timeoutID);
    return this;
  }

  /**
   * Rising edge (aka "tick"), half-cycle.
   *
   * Goes from -0 to +0, from -1 to +1, etc;
   * notifies the clocked gates.
   */
  tick() {
    // setValue resets `halfs`, so save it.
    const halfs = this._halfs;

    this.setValue(-this._value);
    this.emit('tick', this._value);

    this._halfs = halfs;
    this._emitHalfsEvent();
    return this;
  }

  /**
   * Falling edge (aka "tock"), half-cycle.
   *
   * Goes from +0 to -1, from +1 to -2, etc;
   * notifies the clocked gates.
   */
  tock() {
    // setValue resets `halfs`, so save it.
    const halfs = this._halfs;

    this.setValue(-(Math.abs(this._value) + 1));
    this.emit('tock', this._value);

    this._halfs = halfs;
    this._emitHalfsEvent();
    return this;
  }

  /**
   * Emits full cycle after tick -> tock.
   */
  _emitHalfsEvent() {
    this._halfs++;

    if (this._halfs > 0) {
      this.emit('next', this._value);
    }

    if (this._halfs === 2) {
      this.emit('cycle', this._value);
      this._halfs = 0;
    }
  }

  /**
   * Next half-cycle (tick or tock).
   */
  next() {
    if (this.isDown()) {
      this.tick();
    } else {
      this.tock();
    }
    return this;
  }

  /**
   * One full cycle.
   */
  cycle() {
    if (this.isDown()) {
      this.tick();
      this.tock();
    } else {
      this.tock();
      this.tick();
    }
    return this;
  }

  /**
   * Runs several cycles.
   */
  cycles(n) {
    for (let i = 0; i < n; i++) {
      this.cycle();
    }
    return this;
  }

  /**
   * Runs several cycles, according to the clock rate.
   */
  cyclesForRate() {
    this.cycles(this._rate);
    return this;
  }

  /**
   * Whether the clock is up.
   */
  isUp() {
    return !this.isDown();
  }

  /**
   * Whether the clock is down.
   */
  isDown() {
    return isNegativeZero(this._value) || this._value < 0;
  }
}

/**
 * Default System clock, so all chips
 * cat subscribe to it.
 */
Clock.SystemClock = new Clock({rate: 1});

module.exports = Clock;
