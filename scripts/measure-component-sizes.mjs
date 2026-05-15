#!/usr/bin/env node
/**
 * Measure brotli-compressed per-component JS size for every component in
 * `components.config.mjs`. The number we want is what a consumer's
 * bundler will inline into their main chunk when they `import { X } from
 * '@arshad-shah/cynosure-react/x'` — minus the shared `core.css`
 * baseline (loaded once across an app and budgeted separately) and
 * minus third-party peers (`react`, `react-aria-components`,
 * `lucide-react`, …).
 *
 * We follow tsup's chunk graph manually instead of pulling esbuild as
 * a dev dep here: each `dist/<entry>.js` is a small shim that does
 * `import './<entry>.css'; export { X } from './chunk-XXX.js'; import
 * './chunk-YYY.js'; …`. Recursively pull every `./chunk-*.js` peer,
 * concatenate, drop the CSS imports + sourceMappingURL comments, then
 * brotli. This matches what a consumer's tree-shaking bundler inlines
 * to within a few hundred bytes — well inside the 0.1 kB precision
 * we display in the docs.
 *
 * Outputs JSON to stdout.
 */
import { existsSync, readFileSync, readdirSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { brotliCompressSync, constants } from 'node:zlib';

import { COMPONENTS } from '../components.config.mjs';

const here = dirname(fileURLToPath(import.meta.url));
const root = resolve(here, '..');
const distRoot = resolve(root, 'packages/react/dist');

// Build a quick lookup for all chunk files so the graph walker doesn't
// resolve a missing import quietly.
const chunkFiles = new Set(
  readdirSync(distRoot).filter((f) => f.startsWith('chunk-') && f.endsWith('.js')),
);

const IMPORT_RE = /(?:^|\n)\s*(?:import|export\s+\{[^}]*\}\s+from)\s+['"]\.\/(chunk-[A-Z0-9]+\.js)['"];?/g;

/** Walk a component's chunk graph; return the deduped JS payload. */
function gatherChunkPayload(entryFile) {
  const seen = new Set();
  const parts = [];

  function visit(path) {
    if (seen.has(path)) return;
    seen.add(path);
    if (!existsSync(path)) return;
    let src = readFileSync(path, 'utf8');
    // Strip sourceMappingURL annotations (a few bytes each, no consumer ships them).
    src = src.replace(/\/\/# sourceMappingURL=.*$/gm, '');
    // Capture and remove any `./chunk-XXX.js` imports for recursion.
    const nested = [];
    for (const m of src.matchAll(IMPORT_RE)) {
      nested.push(m[1]);
    }
    // Drop CSS imports — those bytes ship in the separate .css chunks.
    src = src.replace(/\nimport ['"]\.\/[^'"]+\.css['"];?/g, '');
    parts.push(src);
    for (const name of nested) {
      if (chunkFiles.has(name)) visit(resolve(distRoot, name));
    }
  }

  visit(entryFile);
  return parts.join('\n');
}

function brotli(buffer) {
  return brotliCompressSync(buffer, {
    params: { [constants.BROTLI_PARAM_QUALITY]: 11 },
  });
}

function fmt(bytes) {
  if (bytes < 1024) return `${bytes} B`;
  const kb = bytes / 1024;
  if (kb < 10) return `${kb.toFixed(2)} kB`;
  return `${kb.toFixed(1)} kB`;
}

const out = {};
for (const c of COMPONENTS) {
  const entry = c.entry ?? c.slug;
  const file = resolve(distRoot, `${entry}.js`);
  if (!existsSync(file)) {
    out[c.name] = { slug: c.slug, entry, status: 'missing', size: null, display: null };
    continue;
  }
  const payload = gatherChunkPayload(file);
  const bytes = brotli(Buffer.from(payload, 'utf8')).length;
  out[c.name] = { slug: c.slug, entry, status: 'ok', size: bytes, display: fmt(bytes) };
}

for (const name of ['core.css', 'styles.css', 'all.css']) {
  const file = resolve(distRoot, name);
  if (existsSync(file)) {
    const bytes = brotli(readFileSync(file)).length;
    out[`__${name}`] = { slug: name, entry: name, status: 'ok', size: bytes, display: fmt(bytes) };
  }
}

console.log(JSON.stringify(out, null, 2));
