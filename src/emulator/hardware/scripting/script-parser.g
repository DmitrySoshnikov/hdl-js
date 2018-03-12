/**
 * Testing script syntactic grammar.
 *
 * To rebuild the parser run:
 *
 *   npm run build
 *
 * This generates the parser module in:
 *
 *   ./src/scripting/generated/script-parser-gen.js
 */

%lex

%%

\/\/.*                        /* skip comments */
\/\*(.|\s)*?\*\/              /* skip comments */

\s+                           /* skip whitespace */

\"[^\"]*\"                    { yytext = yytext.slice(1, -1); return 'STRING' }
\'[^\']*\'                    { yytext = yytext.slice(1, -1); return 'STRING' }

(\;|\,|\!)                    return 'COMMAND_TERMINATOR'

'<>'                          return 'NOT_EQUAL'
'<='                          return 'LESS_EQUAL'
'>='                          return 'GREATER_EQUAL'
'<'                           return 'LESS'
'>'                           return 'GREATER'
'='                           return 'EQUAL'

'load'                        return 'LOAD'
'output-file'                 return 'OUTPUT_FILE'
'compare-to'                  return 'COMPARE_TO'
'output-list'                 return 'OUTPUT_LIST'
'echo'                        return 'ECHO'
'clear-echo'                  return 'CLEAR_ECHO'
'breakpoint'                  return 'BREAKPOINT'
'clear-breakpoints'           return 'CLEAR_BREAKPOINTS'
'repeat'                      return 'REPEAT'
'while'                       return 'WHILE'

\b%(B|X|D)\d+                 return 'FORMATTED_NUMBER'
('-'?)\d+                     return 'NUMBER'
[\w\.%\[\]]+                  return 'REF_VAL'

/lex

%{

/**
 * Extracts name, and an optional subscript.
 */
function parseName(rawName) {
  const subIdx = rawName.indexOf('[');

  // Simple name: `a`
  if (subIdx === -1) {
    return {
      type: 'Name',
      value: rawName,
    };
  }

  // Name with an index: `a[1]`
  return {
    type: 'Name',
    value: rawName.slice(0, subIdx),
    index: Number(rawName.match(/\[(\d+)\]/)[1]),
  };
}

const formatRadix = {
  B: 2,
  X: 16,
  D: 10,
};

function parseValue(rawValue) {
  // Simple decimal value: 15
  if (rawValue[0] !== '%') {
    return {
      type: 'Value',
      value: Number(rawValue),
    };
  }

  // Formatted value: %B0101, %XFF, %D15
  const radix = formatRadix[rawValue[1]];
  return {
    type: 'Value',
    value: Number.parseInt(rawValue.slice(2), radix),
    format: rawValue[1],
    raw: rawValue,
  };
}

/**
 * Parses controller command arguments.
 */
function parseControllerCommandArgs(rawArguments) {
  if (!rawArguments) {
    return [];
  }

  return rawArguments.map(arg => {
    if (!arg.includes('%')) {
      return arg;
    }

    // Example: a%B3.1.3
    const [column, parts] = arg.split('%');
    const format = parts[0];

    // Offsets
    const [left, middle, right] = parts
      .slice(1)
      .split('.')
      .map(Number);

    return {
      column,
      format,
      left,
      middle,
      right,
    };
  });
}

%}

%%

Script
  : CommandList {
      $$ = {
        type: 'Script',
        commands: $1,
      };
    }
  ;

CommandList
  : Command
    { $$ = [$1] }

  | CommandList Command
    { $1.push($2); $$ = $1  }
  ;

Command
  : SimulatorCommand
  | ControllerCommand
  ;

SimulatorCommand
  : REF_VAL OptArguments COMMAND_TERMINATOR {
      if ($1 === 'set') {
        $2[0] = parseName($2[0]);
        $2[1] = parseValue($2[1]);
      }
      $$ = {
        type: 'SimulatorCommand',
        name: $1,
        arguments: $2,
        terminator: $3,
      }
    }
  ;

OptArguments
  : Arguments
  | /* empty arguments */
    { $$ = [] }
  ;

Arguments
  : Argument
    { $$ = [$1] }

  | Arguments Argument
    { $1.push($2); $$ = $1 }
  ;

Argument
  : NUMBER
  | FORMATTED_NUMBER
  | REF_VAL
  | LOAD
  | REPEAT
  | WHILE
  | STRING
  ;

ControllerCommand
  : SimpleControllerCommand
  | RepeatCommand
  | WhileCommand
  ;

SimpleControllerCommand
  : ControllerCommandName OptArguments COMMAND_TERMINATOR {
      $$ = {
        type: 'ControllerCommand',
        name: $1,
        arguments: parseControllerCommandArgs($2),
        terminator: $3
      }
    }
  ;

ControllerCommandName
  : LOAD
  | OUTPUT_FILE
  | COMPARE_TO
  | OUTPUT_LIST
  | ECHO
  | CLEAR_ECHO
  | BREAKPOINT
  | CLEAR_BREAKPOINTS
  ;

RepeatCommand
  : REPEAT Argument Block {
      $$ = {
        type: 'ControllerCommand',
        name: parseName($1),
        times: parseValue($2),
        commands: $3,
      }
    }
  ;

WhileCommand
  : WHILE RelationalExpression Block {
      $$ = {
        type: 'ControllerCommand',
        name: $1,
        condition: $2,
        commands: $3,
      }
    }
  ;

RelationalExpression
  : REF_VAL RelOp Argument {
      $$ = {
        type: 'RelationalExpression',
        operator: $2,
        left: parseName($1),
        right: parseValue($3),
      }
    }
  ;

RelOp
  : EQUAL
  | NOT_EQUAL
  | LESS
  | GREATER
  | LESS_EQUAL
  | GREATER_EQUAL
  ;

Block
  : '{' CommandList '}' {
      $$ = $2
    }
  ;

