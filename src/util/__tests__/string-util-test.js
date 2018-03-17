/**
 * The MIT License (MIT)
 * Copyright (c) 2017-present Dmitry Soshnikov <dmitry.soshnikov@gmail.com>
 */

'use strict';

const {centerString} = require('../string-util');

describe('string-util', () => {
  it('centers', () => {
    expect(centerString('a', 5)).toBe('  a  ');
    expect(centerString('a', 5, '-')).toBe('--a--');

    expect(centerString('a', 6)).toBe('  a   ');
    expect(centerString('ab', 6)).toBe('  ab  ');

    expect(centerString('a', 1)).toBe('a');
    expect(centerString('a', 2)).toBe('a ');
    expect(centerString('a', 3)).toBe(' a ');
  });
});
