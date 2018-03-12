/**
 * Examle script file. Used for unit testing.
 */

load MyGate.hdl,
output-file MyGate.out,
compare-to MyGate.cmp,
output-list a%B3.1.3 b%X5.2.1 out%D1.1.1 RAM[16]%X5.5.5 z[]%S1.3.1;

echo "Hello world!",
echo 'Single quotes',
clear-echo;

set RAM[16] %XF5F0,
set a -5,
set b %B101,
set out %D15,
eval,
output;

repeat 5 {
  eval, ticktock;
}

while a <> 15 {
  tick, tock;
}

while b > 0 { set b -1, eval; }
while b >= 0 { tick, }
while b <= 0 { tock; }
while b = 15 { set b 10, eval, }