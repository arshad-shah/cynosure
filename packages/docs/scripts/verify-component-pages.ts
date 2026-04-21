import { existsSync, readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { EXPECTED_COMPONENT_SLUGS } from '../src/lib/components-manifest';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, '..');
const REPO = resolve(ROOT, '../..');

const allowlist: string[] = JSON.parse(
  readFileSync(resolve(__dirname, 'component-page-allowlist.json'), 'utf8'),
);

const missing: string[] = [];
for (const slug of EXPECTED_COMPONENT_SLUGS) {
  const p = resolve(ROOT, `src/content/docs/components/${slug}/index.mdx`);
  if (!existsSync(p)) missing.push(slug);
}

const reactPkg = JSON.parse(readFileSync(resolve(REPO, 'packages/react/package.json'), 'utf8')) as {
  exports: Record<string, unknown>;
};

const NON_COMPONENT_KEYS = new Set([
  '.',
  './package.json',
  './styles.css',
  './all.css',
  './theme',
  './forms',
  './overlay',
  './navigation',
  './data-display',
  './feedback',
  './box',
  './stack',
  './inline',
  './flex',
  './grid',
  './center',
  './spacer',
  './divider',
  './aspect-ratio',
  './container',
  './section',
]);

const undocumented: string[] = [];
for (const key of Object.keys(reactPkg.exports)) {
  if (NON_COMPONENT_KEYS.has(key)) continue;
  const slug = key.replace(/^\.\//, '');
  if ((EXPECTED_COMPONENT_SLUGS as readonly string[]).includes(slug)) continue;
  if (allowlist.includes(slug)) continue;
  const p = resolve(ROOT, `src/content/docs/components/${slug}/index.mdx`);
  if (!existsSync(p)) undocumented.push(slug);
}

if (missing.length > 0 || undocumented.length > 0) {
  if (missing.length) {
    console.error(
      `Missing required component pages:\n${missing.map((s) => ` - components/${s}/index.mdx`).join('\n')}`,
    );
  }
  if (undocumented.length) {
    console.error(
      `Exported components with no docs page and not in allowlist:\n${undocumented.map((s) => ` - ${s}`).join('\n')}`,
    );
  }
  process.exit(1);
}
console.log(`All required component pages present; ${allowlist.length} entries allowlisted.`);
