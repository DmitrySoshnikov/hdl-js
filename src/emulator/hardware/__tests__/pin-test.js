/**
 * The MIT License (MIT)
 * Copyright (c) 2017-present Dmitry Soshnikov <dmitry.soshnikov@gmail.com>
 */

const Pin = require('../Pin');

describe('Pin', () => {

  it('Pin interface', () => {
    const a = new Pin({name: 'a', value: true});

    expect(a.getName()).toBe('a');
    expect(a.getValue()).toBe(true);

    a.setValue(false);
    expect(a.getValue()).toBe(false);
  });

});