import { readFileSync } from 'node:fs';

const msg = readFileSync(process.argv[2], 'utf8').trim();
const pattern =
  /^(feat|fix|perf|refactor|docs|test|chore|build|ci|style|revert)(\([^)]+\))?!?: .{1,}/;
if (!pattern.test(msg.split('\n')[0])) {
  console.error('\u2717 Commit message must follow Conventional Commits.');
  console.error('  Example: feat(phase-05): add Stack primitive');
  process.exit(1);
}
