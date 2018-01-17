/**
 * The MIT License (MIT)
 * Copyright (c) 2017-present Dmitry Soshnikov <dmitry.soshnikov@gmail.com>
 */

'use strict';

const Clock = require('../Clock');
const {SystemClock} = require('../Clock');

describe('Clock', () => {

  it('default values', () => {
    const clock = new Clock();
    expect(clock.getRate()).toBe(1);
    expect(clock.getValue()).toBe(-0);
  });

  it('passed values', () => {
    const clock = new Clock({
      rate: 10,
      value: -5,
    });
    expect(clock.getRate()).toBe(10);
    expect(clock.getValue()).toBe(-5);
  });

  it('passed values', () => {
    const clock = new Clock({
      rate: 10,
      value: -5,
    });
    expect(clock.getRate()).toBe(10);
    expect(clock.getValue()).toBe(-5);
  });

  it('value', () => {
    let data;

    const clock = new Clock({rate: 1, value: -5})
      .on('value', value => data = value);

    clock.setValue(-10);
    expect(data).toBe(-10);
  });

  it('tick', () => {
    let data;

    const clock = new Clock({rate: 1, value: -5})
      .on('tick', value => data = value);

    clock.tick();
    expect(data).toBe(+5);
  });

  it('tock', () => {
    let data;

    const clock = new Clock({rate: 1, value: +5})
      .on('tock', value => data = value);

    clock.tock();
    expect(data).toBe(-6);
  });

  it('next', () => {
    let data;

    const clock = new Clock({rate: 1, value: +5})
      .on('next', value => data = value);

    clock.next();
    expect(data).toBe(-6);

    // tick, tock also emit 'next'
    clock.tick();
    expect(data).toBe(+6);
    // clock.tock();
    // expect(data).toBe(+7);
  });

  it('cycle', () => {
    let data;

    const clock = new Clock({rate: 1, value: -5})
      .on('cycle', value => data = value);

    clock.cycle();
    expect(data).toBe(-6);

    // tick -> tock also emit 'cycle'
    clock.tick();
    clock.tock();
    expect(data).toBe(-7);
  });

  it('cycles', () => {
    let data = [];

    const clock = new Clock({rate: 1})
      .on('cycle', value => data.push(value));

    clock.cycles(5);
    expect(data).toEqual([-1, -2, -3, -4, -5]);
  });

  it('cycles for rate', () => {
    let data = [];

    const clock = new Clock({rate: 5})
      .on('cycle', value => data.push(value));

    clock.cyclesForRate();
    expect(data).toEqual([-1, -2, -3, -4, -5]);
  });

  it('System clock', () => {
    let data = [];

    SystemClock.on('cycle', value => data.push(value));

    SystemClock.cycle();
    SystemClock.cycle();
    SystemClock.cycle();
    expect(data).toEqual([-1, -2, -3]);
  });

});
