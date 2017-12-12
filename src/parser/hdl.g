/**
 * HDL (Hardware-definition langauge) syntactic grammar.
 *
 * To rebuild run:
 *
 *   npm run build
 */

%lex

%%

\/\/.*                  /* skip comments */
\/\*(.|\s)*?\*\/        /* skip comments */

\s+                     /* skip whitespace */

\b(?:CHIP|chip)\b       return 'CHIP'
\b(?:IN|in)\b           return 'IN'
\b(?:OUT|out)\b         return 'OUT'
\b(?:PARTS|parts)\b     return 'PARTS'

\d+                     return 'NUMBER'
[a-zA-Z_$]\w*           return 'ID'

/lex

%{

/**
 * List of inputs for this chip.
 */
let inputs = [];

/**
 * List of outputs for this chip.
 */
let outputs = [];

/**
 * Actual definitions.
 */
let parts = [];

yyparse.onParseBegin = (_string) => {
  inputs.length = 0;
  outputs.length = 0;
  parts.length = 0;
};

/**
 * Converts subscript to `size` for input/ouput:
 * `a[16]`: {value: 'a', size: 16}
 *
 * And to `index` for references:
 * `a[15]`: {value: 'a', index: 15}
 */
function subscriptToProp(value, prop) {
  if (value.subscript) {
    value[prop] = value.subscript.value;
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
  : CHIP Identifer '{' Sections '}' {
      $$ = {
        type: 'Chip',
        name: $2,
        inputs,
        outputs,
        parts,
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

Names
  : Name
    { $$ = [$1]; }

  | Names ',' Name
    { $1.push($3); $$ = $1; }
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
  : '[' NUMBER ']' {
      $$ = {
        kind: 'number',
        value: Number($2),
      }
    }
  ;

Identifer
  : ID
  | CHIP
  | IN
  | OUT
  | PARTS
  ;

ChipCalls
  : ChipCall
    { $$ = [$1] }

  | ChipCalls ChipCall
    { $1.push($2); $$ = $1 }
  ;

ChipCall
  : Identifer '(' ArgsList ')' ';' {
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
  : Name '=' Name {
      $$ = {
        type: 'Argument',
        name: subscriptToProp($1, 'index'),
        value: subscriptToProp($3, 'index'),
      }
    }
  ;