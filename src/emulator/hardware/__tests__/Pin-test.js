/**
 * The MIT License (MIT)
 * Copyright (c) 2017-present Dmitry Soshnikov <dmitry.soshnikov@gmail.com>
 */

'use strict';

const Pin = require('../Pin');

describe('Pin', () => {

  it('Pin interface', () => {
    const a = new Pin({name: 'a', value: 1});

    expect(a.getName()).toBe('a');
    expect(a.getValue()).toBe(1);

    a.setValue(0);
    expect(a.getValue()).toBe(0);
  });

  it('to full name', () => {
    expect(Pin.toFullName('a')).toBe('a');
    expect(Pin.toFullName({name: 'a'})).toBe('a');
    expect(Pin.toFullName({name: 'a', size: 16})).toBe('a[16]');
  });

  it('string value converted to number', () => {
    let a = new Pin({name: 'a', value: '1'});
    expect(a.getValue()).toBe(1);

    a = new Pin({name: 'a', value: 1});
    a.setValue('1');
    expect(a.getValue()).toBe(1);
  });

});