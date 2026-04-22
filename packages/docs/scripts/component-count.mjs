// packages/docs/scripts/component-count.mjs
import { existsSync, mkdirSync, readdirSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const srcRoot = join(__dirname, '..', '..', 'react', 'src');
const outFile = join(__dirname, '..', 'src', 'generated', 'component-count.json');

const CATEGORIES = {
  forms: 'Forms',
  overlay: 'Overlay',
  'data-display': 'Data display',
  feedback: 'Feedback',
  navigation: 'Navigation',
  typography: 'Typography',
  'primitives/layout': 'Layout',
};
const SKIP = new Set(['__tests__', 'shared', 'index.ts']);

const categories = {};
let total = 0;
for (const [path, label] of Object.entries(CATEGORIES)) {
  const full = join(srcRoot, path);
  if (!existsSync(full)) continue;
  const names = readdirSync(full, { withFileTypes: true })
    .filter((d) => d.isDirectory() && !SKIP.has(d.name))
    .map((d) => d.name)
    .sort();
  categories[path] = { label, count: names.length, names };
  total += names.length;
}

const out = { total, categories };
mkdirSync(dirname(outFile), { recursive: true });
writeFileSync(outFile, `${JSON.stringify(out, null, 2)}\n`);
process.stdout.write(`[component-count] ${total} components\n`);
