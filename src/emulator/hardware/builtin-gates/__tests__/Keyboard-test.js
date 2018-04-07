/**
 * The MIT License (MIT)
 * Copyright (c) 2017-present Dmitry Soshnikov <dmitry.soshnikov@gmail.com>
 */

'use strict';

const Keyboard = require('../Keyboard');

describe('Keyboard', () => {
  it('Keyboard interface', () => {
    const keyboard = Keyboard.defaultFromSpec();

    Keyboard.emit('key', 'A');
    expect(keyboard.getPinValues()).toEqual({out: 65});

    Keyboard.emit('key', 'a');
    expect(keyboard.getPinValues()).toEqual({out: 97});
  });
});
