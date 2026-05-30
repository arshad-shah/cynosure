import { existsSync, readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { COMPONENTS, COMPONENT_SLUGS } from '../../../components.config.mjs';
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
  exports: Record<string, { types?: string; import?: string } | string>;
};

// Manifest is the source of truth — anything in `react.package.json` that
// isn't a manifest subpath is either a static aggregate (e.g. `./theme`,
// `./forms`) or stale. The static aggregates are spelled out below.
const STATIC_EXPORT_KEYS = new Set([
  '.',
  './package.json',
  './styles.css',
  './core.css',
  './all.css',
  './fonts.css',
  './theme',
  './forms',
  './overlay',
  './navigation',
  './data-display',
  './feedback',
]);

// 1. Every doc-eligible slug needs an .mdx page.
const undocumented: string[] = [];
for (const slug of COMPONENT_SLUGS as readonly string[]) {
  if (!EXPECTED_COMPONENT_SLUGS.includes(slug)) continue; // layout primitives have no docs page
  if (allowlist.includes(slug)) continue;
  const p = resolve(ROOT, `src/content/docs/components/${slug}/index.mdx`);
  if (!existsSync(p)) undocumented.push(slug);
}

// 2. Drift check — every manifest entry must be reflected in package.json
//    exports. Catches the case where someone edits the manifest but forgets
//    to run `pnpm sync:components`.
const driftMissing: string[] = [];
const driftMismatched: string[] = [];
for (const c of COMPONENTS as Array<{ name: string; slug: string; entry: string }>) {
  const exp = reactPkg.exports[`./${c.slug}`];
  if (!exp || typeof exp === 'string') {
    driftMissing.push(c.slug);
    continue;
  }
  if (exp.import !== `./dist/${c.entry}.js` || exp.types !== `./dist/${c.entry}.d.ts`) {
    driftMismatched.push(c.slug);
  }
}

// 3. Stray exports that aren't in the manifest and aren't static.
const stray: string[] = [];
const manifestKeys = new Set(COMPONENTS.map((c: { slug: string }) => `./${c.slug}`));
for (const key of Object.keys(reactPkg.exports)) {
  if (STATIC_EXPORT_KEYS.has(key) || manifestKeys.has(key)) continue;
  stray.push(key);
}

if (
  missing.length > 0 ||
  undocumented.length > 0 ||
  driftMissing.length > 0 ||
  driftMismatched.length > 0 ||
  stray.length > 0
) {
  if (missing.length) {
    console.error(
      `Missing required component pages:\n${missing.map((s) => ` - components/${s}/index.mdx`).join('\n')}`,
    );
  }
  if (undocumented.length) {
    console.error(
      `Manifest entries without a docs page (and not in allowlist):\n${undocumented.map((s) => ` - ${s}`).join('\n')}`,
    );
  }
  if (driftMissing.length || driftMismatched.length) {
    console.error(
      'Drift between components.config.mjs and packages/react/package.json — run `pnpm --filter @arshad-shah/cynosure-react sync:components`:',
    );
    for (const s of driftMissing) console.error(`  - ${s}: missing from exports`);
    for (const s of driftMismatched)
      console.error(`  - ${s}: export paths don't match manifest entry`);
  }
  if (stray.length) {
    console.error(
      `Unknown exports in packages/react/package.json (not in manifest, not static):\n${stray.map((s) => ` - ${s}`).join('\n')}`,
    );
  }
  process.exit(1);
}
console.log(
  `All ${COMPONENTS.length} components consistent across manifest, package.json, and docs.`,
);
