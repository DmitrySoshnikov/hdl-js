/**
 * The MIT License (MIT)
 * Copyright (c) 2017-present Dmitry Soshnikov <dmitry.soshnikov@gmail.com>
 */

'use strict';

/**
 * A map from gate name to gate class.
 */
const BuiltInGates = {};

/**
 * A list of exposed built-in gates.
 */
[
  'ALU',
  'ARegister',
  'Add16',
  'And',
  'And16',
  'Bit',
  'DFF',
  'DMux',
  'DMux4Way',
  'DMux8Way',
  'DRegister',
  'FullAdder',
  'HalfAdder',
  'Inc16',
  'Keyboard',
  'MipsAlu',
  'Mux',
  'Mux16',
  'Mux4Way16',
  'Mux8Way16',
  'Nand',
  'Nor',
  'Nor16Way',
  'Not',
  'Not16',
  'Or',
  'Or16',
  'Or8Way',
  'PC',
  'RAM',
  'RAM16K',
  'RAM4K',
  'RAM512',
  'RAM64',
  'RAM8',
  'Register',
  'Screen',
  'Xor',
].forEach(gate => (BuiltInGates[gate] = require('./' + gate)));

module.exports = BuiltInGates;
