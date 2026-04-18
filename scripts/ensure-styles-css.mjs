#!/usr/bin/env node
/**
 * Cynosure UI — defensive `packages/react/dist/styles.css` aggregator.
 *
 * The tsup config's `onSuccess` hook in `packages/react/tsup.config.ts`
 * already emits this file. This script is a CI-side belt-and-braces that
 * regenerates it from the per-component `dist/*.css` files if it's missing
 * (e.g. because turbo restored a cache predating the onSuccess hook, or
 * the hook raced with vanilla-extract's plugin output). Idempotent and
 * cheap when the file already exists.
 *
 * Exits 0 in all cases (including "no dist directory yet"); CI's `pnpm
 * build` is responsible for the real failure path.
 */

import { existsSync, readFileSync, readdirSync, statSync, writeFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const dist = resolve(__dirname, '..', 'packages/react/dist');
const target = join(dist, 'styles.css');

if (!existsSync(dist) || !statSync(dist).isDirectory()) {
  console.warn(`No ${dist} — skipping (run \`pnpm --filter @arshad-shah/cynosure-react build\` first).`);
  process.exit(0);
}

if (existsSync(target)) {
  console.warn('✓ dist/styles.css already present; nothing to do.');
  process.exit(0);
}

const files = readdirSync(dist)
  .filter((f) => f.endsWith('.css') && f !== 'styles.css')
  .sort();

if (files.length === 0) {
  console.warn(`No per-component CSS files found in ${dist}.`);
  process.exit(0);
}

const chunks = [];
for (const file of files) {
  chunks.push(`/* ${file} */`);
  chunks.push(readFileSync(join(dist, file), 'utf8'));
}
writeFileSync(target, chunks.join('\n'));
console.warn(`✓ wrote dist/styles.css from ${files.length} component CSS file(s).`);
