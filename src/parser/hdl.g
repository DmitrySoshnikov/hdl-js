/**
 * HDL (Hardware-definition langauge) syntactic grammar.
 *
 * To rebuild run:
 *
 *   npm run build
 */

%lex

%%

\/\/.*              /* skip comments */
\/\*(.|\s)*?\*\/    /* skip comments */

\s+                 /* skip whitespace */

(?:CHIP|chip)       return 'CHIP'
(?:IN|in)           return 'IN'
(?:OUT|out)         return 'OUT'
(?:PARTS|parts)     return 'PARTS'

\w+                 return 'ID'

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

%}

%%

Chip
  : CHIP Name '{' Sections '}' {
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
      inputs.push(...$2);
    }
  ;

Outputs
  : OUT Names ';' {
      outputs.push(...$2);
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
  : ID '(' ArgsList ')' ';' {
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
        name: $1,
        value: $3,
      }
    }
  ;