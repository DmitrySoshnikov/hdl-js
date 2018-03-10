/**
 * HDL (Hardware-definition langauge) syntactic grammar.
 *
 * To rebuild the parser run:
 *
 *   npm run build
 *
 * This generates the parser module in:
 *
 *   ./src/parser/generated/hdl-parser.js
 */

%lex

%%

\/\/.*                      /* skip comments */
\/\*(.|\s)*?\*\/            /* skip comments */

\s+                         /* skip whitespace */

\b(?:CHIP|chip)\b           return 'CHIP'
\b(?:IN|in)\b               return 'IN'
\b(?:OUT|out)\b             return 'OUT'
\b(?:PARTS|parts)\b         return 'PARTS'
\b(?:BUILTIN|builtin)\b     return 'BUILTIN'
\b(?:CLOCKED|clocked)\b     return 'CLOCKED'

\d+                         return 'NUMBER'
[a-zA-Z_$]\w*               return 'ID'

/lex

%{

/**
 * List of inputs for this chip.
 */
let inputs = null;

/**
 * List of outputs for this chip.
 */
let outputs = null;

/**
 * Actual definitions.
 */
let parts = null;

/**
 * Builtin parts.
 */
let builtins = null;

/**
 * Clocked parts.
 */
let clocked = null;

yyparse.onParseBegin = (_string) => {
  inputs = [];
  outputs = [];
  parts = [];
  builtins = [];
  clocked = [];
};

/**
 * Converts subscript to `size` for input/ouput:
 * `a[16]`: {value: 'a', size: 16}
 *
 * And to `index` or `range` for references:
 * `a[15]`: {value: 'a', index: 15}
 * `a[0..7]`: {value: 'a', range: {from: 0, to: 7}}
 */
function subscriptToProp(value, prop) {
  const {subscript} = value;

  if (subscript) {
    if (subscript.kind === 'number') {
      value[prop] = subscript.value;
    } else if (subscript.kind === 'range') {
      delete subscript.kind;
      value.range = subscript;
    }
    delete value.subscript;
  }

  return value;
}

function subscriptListToProp(values, prop) {
  values.forEach(value => subscriptToProp(value, prop));
  return values;
}

%}

%%

Chip
  : CHIP ChipName '{' Sections '}' {
      $$ = {
        type: 'Chip',
        name: $2,
        inputs,
        outputs,
        parts,
        builtins,
        clocked,
      };
    }
  ;

Sections
  : Section
  | Sections Section
  ;

Section
  : Inputs
  | Outputs
  | Parts
  | Builtin
  | Clocked
  ;

Inputs
  : IN Names ';' {
      inputs.push(...subscriptListToProp($2, 'size'));
    }
  ;

Outputs
  : OUT Names ';' {
      outputs.push(...subscriptListToProp($2, 'size'));
    }
  ;

Parts
  : PARTS ':' ChipCalls {
      parts.push(...$3);
    }
  ;

Builtin
  : BUILTIN Names ';' {
      builtins.push(...$2);
    }
  ;

Clocked
  : CLOCKED Names ';' {
      clocked.push(...$2);
    }
  ;

Names
  : Name
    { $$ = [$1]; }

  | Names ',' Name
    { $1.push($3); $$ = $1 }
  ;

Name
  : Identifer OptSub {
      $$ = {
        type: 'Name',
        value: $1,
      };

      if ($2) {
        $$.subscript = $2;
      }
    }
  ;

OptSub
  : Subscript
  | /* empty */
  ;

Subscript
  : '[' SubscriptValue ']' {
      $$ = $2;
    }
  ;

SubscriptValue
  : NUMBER {
      $$ = {
        kind: 'number',
        value: Number($1),
      };
    }

  | NUMBER '.' '.' NUMBER {
      $$ = {
        kind: 'range',
        from: Number($1),
        to: Number($4),
      };
    }
  ;

Identifer
  : ID
  | Keyword
  ;

ChipName
  : ID
  ;

Keyword
  : CHIP
  | IN
  | OUT
  | PARTS
  | BUILTIN
  | CLOCKED
  ;

ChipCalls
  : ChipCall
    { $$ = [$1] }

  | ChipCalls ChipCall
    { $1.push($2); $$ = $1 }
  ;

ChipCall
  : ChipName '(' ArgsList ')' ';' {
      $$ = {
        type: 'ChipCall',
        name: $1,
        arguments: $3,
      }
    }
  ;

ArgsList
  : Arg
    { $$ = [$1] }

  | ArgsList ',' Arg
    { $1.push($3); $$ = $1 }
  ;

Arg
  : Name '=' Value {
      $$ = {
        type: 'Argument',
        name: subscriptToProp($1, 'index'),
        value: subscriptToProp($3, 'index'),
      }
    }
  ;

Value
  : Constant
  | Name {
      let constName = null;
      if ($1.value === 'true') {
        constName = 1;
      } else if ($1.value === 'false') {
        constName = 0;
      }

      if (constName !== null) {
        $$ = {
          type: 'Constant',
          value: constName,
          raw: $1.value,
        }
      } else {
        // Other name:
        $$ = $1;
      }
    }
  ;

Constant
  : NUMBER {
      $$ = {
        type: 'Constant',
        value: Number($1),
        raw: $1,
      };
    }
  ;