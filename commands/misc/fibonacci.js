export const name = 'fibonacci';
export const description = 'Gives the value of the fibonacci sequence at the given location.';
export const args = true;
export function execute(message, args) {
  let n = args[0];
  if (n === 0 || n === 1) {
    return n;
  }

  let fib1 = 0;
  let fib2 = 1;
  for (var i = 2; i <= n; i++) {
    fib2 = fib2 + fib1;
    fib1 = fib2 - fib1;
  }

  message.channel.send('The ' + n + 'th position in the fibonacci sequence is ' + fib2);
  if (n > 79) message.channel.send('Note: For positions 80 and above, the number will be rounded, and/or converted to scientific notation.');
}