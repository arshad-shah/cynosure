import { init } from './commands/init.js';
import { c, log } from './utils/logger.js';

const VERSION = '1.0.1';

const HELP = `
${c.bold('cynosure')} ${c.dim('— project scaffolding for Cynosure UI')}

${c.bold('Usage')}
  cynosure <command> [options]

${c.bold('Commands')}
  init                Wire Cynosure into the current project
  help                Show this help message
  version             Print the CLI version

${c.bold('Options for init')}
  --dry-run           Print the changes that would be made without writing files
  --cwd <path>        Target directory (default: current working directory)

${c.bold('Examples')}
  npx @arshad-shah/cynosure-cli init
  npx @arshad-shah/cynosure-cli init --dry-run
`;

function parseArgs(argv: string[]): { command: string; flags: Record<string, string | boolean> } {
  const [command = 'help', ...rest] = argv;
  const flags: Record<string, string | boolean> = {};
  for (let i = 0; i < rest.length; i++) {
    const token = rest[i];
    if (!token?.startsWith('--')) continue;
    const key = token.slice(2);
    const next = rest[i + 1];
    if (next && !next.startsWith('--')) {
      flags[key] = next;
      i++;
    } else {
      flags[key] = true;
    }
  }
  return { command, flags };
}

async function main(): Promise<void> {
  const { command, flags } = parseArgs(process.argv.slice(2));

  switch (command) {
    case 'init': {
      const code = await init({
        cwd: typeof flags.cwd === 'string' ? flags.cwd : undefined,
        dryRun: flags['dry-run'] === true,
      });
      process.exit(code);
      break;
    }
    case 'version':
    case '--version':
    case '-v':
      console.log(VERSION);
      process.exit(0);
      break;
    case 'help':
    case '--help':
    case '-h':
    case undefined:
      console.log(HELP);
      process.exit(0);
      break;
    default:
      log.error(`Unknown command: ${command}`);
      console.log(HELP);
      process.exit(1);
  }
}

main().catch((err: unknown) => {
  const message = err instanceof Error ? err.message : String(err);
  log.error(message);
  process.exit(1);
});
