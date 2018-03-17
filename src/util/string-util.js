/**
 * The MIT License (MIT)
 * Copyright (c) 2017-present Dmitry Soshnikov <dmitry.soshnikov@gmail.com>
 */

'use strict';

function centerString(string, maxLength, padCh = ' ') {
  if (string.length < maxLength) {
    const len = maxLength - string.length;
    const remain = len % 2 == 0 ? '' : padCh;
    const pads = padCh.repeat(parseInt(len / 2));
    return pads + string + pads + remain;
  }
  return string;
}

module.exports = {
  centerString,
};
