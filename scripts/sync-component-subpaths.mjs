#!/usr/bin/env node
// Regenerates the component-driven artefacts in `packages/react/`:
//   1. The per-component subpath exports in `packages/react/package.json`
//      (the `exports` map + the `files` array — non-component entries are
//      preserved verbatim).
//   2. The proxy dirs `packages/react/<slug>/package.json` that let bundlers
//      resolve `@arshad-shah/cynosure-react/<slug>` to `dist/<entry>.js`
//      before the package is published.
//
// Drives off `components.config.mjs` at the repo root. Re-run whenever that
// file changes — `packages/react`'s `prebuild` invokes it automatically.

import { existsSync, mkdirSync, readFileSync, readdirSync, rmSync, writeFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

import { COMPONENTS } from '../components.config.mjs';

const REPO_ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const REACT_PKG_DIR = resolve(REPO_ROOT, 'packages/react');

/** Subpath keys that are NOT per-component (and therefore preserved as-is). */
const NON_COMPONENT_EXPORT_KEYS = new Set([
  '.',
  './styles.css',
  './all.css',
  './fonts.css',
  './theme',
  './forms',
  './overlay',
  './navigation',
  './data-display',
  './feedback',
  './package.json',
]);

/** Directory names at the package root that are NOT proxy dirs. */
const NON_PROXY_DIRS = new Set([
  'src',
  'dist',
  'node_modules',
  'theme',
  'forms',
  'overlay',
  'navigation',
  'data-display',
  'feedback',
]);

/* ── 1. Update package.json ───────────────────────────────────────── */

const pkgPath = join(REACT_PKG_DIR, 'package.json');
/** @type {Record<string, unknown> & { exports: Record<string, unknown>, files: string[] }} */
const pkg = JSON.parse(readFileSync(pkgPath, 'utf8'));

// Build the new exports map: preserve non-component keys in their existing
// order; append one entry per component slug (manifest order). The
// `./package.json` self-reference always trails.
const oldExports = /** @type {Record<string, unknown>} */ (pkg.exports);
const componentSlugs = new Set(COMPONENTS.map((c) => `./${c.slug}`));

const newExports = /** @type {Record<string, unknown>} */ ({});
for (const [key, value] of Object.entries(oldExports)) {
  if (NON_COMPONENT_EXPORT_KEYS.has(key) && key !== './package.json') {
    newExports[key] = value;
  } else if (!componentSlugs.has(key) && key !== './package.json') {
    // Stray/legacy export — keep it; surface a warning so it doesn't rot.
    console.warn(`sync-components: keeping unknown export "${key}" (not in manifest).`);
    newExports[key] = value;
  }
}
for (const c of COMPONENTS) {
  newExports[`./${c.slug}`] = {
    types: `./dist/${c.entry}.d.ts`,
    import: `./dist/${c.entry}.js`,
  };
}
newExports['./package.json'] = './package.json';

pkg.exports = newExports;

// Rebuild `files`: head = static dirs (dist, theme), then the category
// barrels (forms, overlay, …) in manifest order, then per-component proxy
// dirs in manifest order, then the trailing static files. Anything else in
// the existing array we don't recognise is preserved verbatim before the
// trailing block — surfaces stray entries instead of silently dropping them.
const oldFiles = /** @type {string[]} */ (pkg.files);
const TRAILING_FILES = [
  'styles.css.d.ts',
  'all.css.d.ts',
  'fonts.css.d.ts',
  'README.md',
  'CHANGELOG.md',
];
const STATIC_HEAD_DIRS = ['dist', 'theme'];
const CATEGORY_BARREL_DIRS = ['forms', 'overlay', 'navigation', 'data-display', 'feedback'];
const componentDirs = new Set(COMPONENTS.map((c) => c.slug));
const known = new Set([
  ...STATIC_HEAD_DIRS,
  ...CATEGORY_BARREL_DIRS,
  ...TRAILING_FILES,
  ...componentDirs,
]);
const stray = oldFiles.filter((f) => !known.has(f));
if (stray.length) {
  console.warn(`sync-components: keeping unknown files entries: ${stray.join(', ')}`);
}
pkg.files = [
  ...STATIC_HEAD_DIRS,
  ...CATEGORY_BARREL_DIRS,
  ...COMPONENTS.map((c) => c.slug),
  ...stray,
  ...TRAILING_FILES,
];

// Match biome's array formatter — short single-element string arrays stay on
// one line (e.g. `"sideEffects": ["**/*.css"]`). Without this the next biome
// run would reformat the file and thrash diffs on every sync.
const pkgJson = JSON.stringify(pkg, null, 2).replace(/\[\n\s+("[^"\n]+")\n\s+\]/g, '[$1]');
writeFileSync(pkgPath, `${pkgJson}\n`);

/* ── 2. Regenerate proxy dirs ─────────────────────────────────────── */

// Drop stale proxy dirs first so renames don't leave orphans behind.
const existingDirs = readdirSync(REACT_PKG_DIR, { withFileTypes: true })
  .filter((d) => d.isDirectory() && !NON_PROXY_DIRS.has(d.name) && !d.name.startsWith('.'))
  .map((d) => d.name);
const expectedDirs = new Set(COMPONENTS.map((c) => c.slug));
for (const name of existingDirs) {
  if (!expectedDirs.has(name)) {
    rmSync(join(REACT_PKG_DIR, name), { recursive: true, force: true });
    console.log(`sync-components: removed stale proxy dir ${name}/`);
  }
}

// Hand-written template — biome collapses short single-element arrays like
// `sideEffects` onto one line, so JSON.stringify(…, 2) would round-trip and
// thrash on every lint pass. Stay biome-compatible from the start.
for (const c of COMPONENTS) {
  const dir = join(REACT_PKG_DIR, c.slug);
  mkdirSync(dir, { recursive: true });
  const next = [
    '{',
    `  "name": "@arshad-shah/cynosure-react/${c.slug}",`,
    '  "private": true,',
    '  "type": "module",',
    `  "main": "../dist/${c.entry}.js",`,
    `  "module": "../dist/${c.entry}.js",`,
    `  "types": "../dist/${c.entry}.d.ts",`,
    '  "sideEffects": ["*.css"]',
    '}',
    '',
  ].join('\n');
  const target = join(dir, 'package.json');
  if (!existsSync(target) || readFileSync(target, 'utf8') !== next) {
    writeFileSync(target, next);
  }
}

console.log(`sync-components: ${COMPONENTS.length} components synced (package.json + proxy dirs).`);
