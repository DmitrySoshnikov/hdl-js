/**
 * The MIT License (MIT)
 * Copyright (c) 2017-present Dmitry Soshnikov <dmitry.soshnikov@gmail.com>
 */

'use strict';

const colors = require('colors');
const RAM = require('./RAM');

const {int16Table} = require('../../../util/numbers');

/**
 * Canonical truth table for the `RAM512` gate.
 */
const TRUTH_TABLE = int16Table([
  {$clock: -0, in: 0b0000000000000000, load: 0, address:   0, out: 0b0000000000000000},
  {$clock: +0, in: 0b0000000000010101, load: 1, address:   0, out: 0b0000000000000000},
  {$clock: -1, in: 0b0000000000000001, load: 0, address:   0, out: 0b0000000000010101},
  {$clock: +1, in: 0b0000000000010101, load: 0, address:   0, out: 0b0000000000010101},
  {$clock: -2, in: 0b0000000000010101, load: 0, address:   0, out: 0b0000000000010101},
  {$clock: +2, in: 0b1101001000010101, load: 1, address:   2, out: 0b0000000000010101},
  {$clock: -3, in: 0b1101001000010101, load: 0, address:   2, out: 0b1101001000010101},
  {$clock: +3, in: 0b1111111111111111, load: 1, address: 511, out: 0b1101001000010101},
  {$clock: -4, in: 0b0000000000000000, load: 1, address: 511, out: 0b1111111111111111},
  {$clock: +4, in: 0b0000000000000000, load: 1, address: 511, out: 0b1111111111111111},
  {$clock: -5, in: 0b0000000000000000, load: 0, address: 511, out: 0b0000000000000000},
]);

/**
 * RAM chip of 512 16-bit registers.
 *
 * The output is the value stored at the memory location specified by address.
 * If load=1, loads the input into the memory location specified by address.
 *
 * Abstract:
 *
 *  IN in[16], load, address[9];
 *  OUT out[16];
 *
 *  DMux8Way(in=load, sel=address, ...);
 *  RAM64(in=in, load=l1, address=address[0..5], out=r1);
    RAM64(in=in, load=l2, address=address[0..5], out=r2);
 *  ...
 *  Mux8Way16(...);
 */
class RAM512 extends RAM {
  constructor(options) {
    super(Object.assign({size: 512}, options));
  }
}

/**
 * Specification of the `RAM512` gate.
 */
RAM512.Spec = {
  name: 'RAM512',

  description: [
    'Memory chip consisting of 512 16-bit registers.',
    '',
    'If load[t]=1 then out[t+1] = in[t] else out does not change.',
    '',
    'Clock rising edge updates the value from the input by the address,',
    'if the `load` is set; otherwise, preserves the state.',
    '',
    `  ${colors.bold('↗')} : value[address] = load ? in : value[address]`,
    '',
    'Clock falling edge propagates the value at the address to the output:',
    '',
    `  ${colors.bold('↘')} : out = value[address]`,
  ].join('\n'),

  inputPins: [
    {name: 'in', size: 16},
    {name: 'load', size: 1},
    {name: 'address', size: 9},
  ],

  outputPins: [
    {name: 'out', size: 16},
  ],

  truthTable: TRUTH_TABLE,
};

module.exports = RAM512;