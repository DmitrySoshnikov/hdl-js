/**
 * The MIT License (MIT)
 * Copyright (c) 2017-present Dmitry Soshnikov <dmitry.soshnikov@gmail.com>
 */

'use strict';

const colors = require('colors');
const Register = require('./Register');

/**
 * 16-bit D (Data) register.
 */
class DRegister extends Register {}

/**
 * Specification of the `DRegister` gate.
 */
DRegister.Spec = {
  name: 'DRegister',

  description:

`16-bit D (Data) register.

If load[t]=1 then out[t+1] = in[t] else out does not change.

Clock rising edge updates the value from the input,
if the \`load\` is set; otherwise, preserves the state.

  ${colors.bold('↗')} : value = load ? in : value

Clock falling edge propagates the value to the output:

  ${colors.bold('↘')} : out = value
`,

  inputPins: [
    {name: 'in', size: 16},
    {name: 'load', size: 1}
  ],
  outputPins: [
    {name: 'out', size: 16},
  ],

  truthTable: Register.Spec.truthTable,
};

module.exports = DRegister;