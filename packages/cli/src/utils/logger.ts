const isTTY = Boolean(process.stdout.isTTY);

const codes = {
  reset: '\x1b[0m',
  bold: '\x1b[1m',
  dim: '\x1b[2m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
} as const;

type Code = keyof typeof codes;

const wrap = (c: Code, s: string): string => (isTTY ? `${codes[c]}${s}${codes.reset}` : s);

export const c = {
  bold: (s: string) => wrap('bold', s),
  dim: (s: string) => wrap('dim', s),
  red: (s: string) => wrap('red', s),
  green: (s: string) => wrap('green', s),
  yellow: (s: string) => wrap('yellow', s),
  blue: (s: string) => wrap('blue', s),
  magenta: (s: string) => wrap('magenta', s),
  cyan: (s: string) => wrap('cyan', s),
};

export const log = {
  info: (msg: string) => console.log(`${c.cyan('›')} ${msg}`),
  success: (msg: string) => console.log(`${c.green('✔')} ${msg}`),
  warn: (msg: string) => console.warn(`${c.yellow('!')} ${msg}`),
  error: (msg: string) => console.error(`${c.red('✖')} ${msg}`),
  step: (msg: string) => console.log(`\n${c.bold(msg)}`),
  plain: (msg: string) => console.log(msg),
  hint: (msg: string) => console.log(c.dim(`  ${msg}`)),
};
