/**
 * The MIT License (MIT)
 * Copyright (c) 2017-present Dmitry Soshnikov <dmitry.soshnikov@gmail.com>
 */

const shell = require('shelljs');

// Rebuild parser.
shell.exec(`node node_modules/syntax-cli/bin/syntax -g src/parser/hdl.g -o src/parser/generated/hld-parser.js -m lalr1 --loc`);
