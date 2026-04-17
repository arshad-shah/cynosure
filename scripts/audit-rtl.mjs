#!/usr/bin/env node
/**
 * Lumen UI — RTL audit (Phase 14).
 *
 * Greps `packages/react/src` for physical-direction CSS properties that
 * should be logical. Matches both kebab-case (`margin-left`, used in strings
 * and selectors) and camelCase (`marginLeft`, used in vanilla-extract style
 * objects).
 *
 * Two files are on the allowlist by design:
 *
 * 1. `primitives/layout/shared/layoutStyle.css.ts` — the layout-prop registry
 *    maps consumer-facing short props (`pl`, `pr`, `ml`, `mr`) to literal CSS
 *    properties. The short props are a physical-intent API; flipping them to
 *    logical would change consumer behaviour, not CSS.
 *
 * 2. `overlay/Drawer/Drawer.css.ts` — the drawer's `side="left"` / `"right"`
 *    prop is physical-intent by design (the drawer is anchored to a viewport
 *    edge, and `left: 0` / `right: 0` don't flip in RTL). The borders on the
 *    drawer's inner edge follow the same physical axis.
 *
 * Any new physical usage outside these two files fails CI.
 */

import { readFileSync, readdirSync, statSync } from 'node:fs';
import { dirname, join, relative, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dirname, '..', 'packages/react/src');

const ALLOWLIST = new Set([
  'primitives/layout/shared/layoutStyle.css.ts',
  'overlay/Drawer/Drawer.css.ts',
]);

// The audit runs against authored CSS (`*.css.ts`) only. Consumer-facing
// layout-prop names (`paddingLeft`, `marginRight` on `<Box>`) are a
// physical-intent public API and live in `.ts` / `.tsx`; they're not CSS
// authoring and are deliberately out of scope.
const CSS_TS = /\.css\.ts$/;

// Matches:
//   margin-left:, padding-right:, border-left-color:, border-left, etc.
//   marginLeft, paddingRight, borderLeft, borderLeftColor, borderLeftWidth
const PHYSICAL = [
  /\b(margin|padding|border)-(left|right)(?:-[a-z]+)?\b/g,
  /\b(margin|padding|border)(Left|Right)(?:[A-Z][A-Za-z]+)?\b/g,
];

function* walk(dir) {
  for (const name of readdirSync(dir)) {
    const full = join(dir, name);
    const st = statSync(full);
    if (st.isDirectory()) yield* walk(full);
    else if (CSS_TS.test(name)) yield full;
  }
}

const failures = [];

for (const file of walk(root)) {
  const rel = relative(root, file).replaceAll('\\', '/');
  if (ALLOWLIST.has(rel)) continue;
  const source = readFileSync(file, 'utf8');
  const lines = source.split('\n');
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    // Fast path
    if (!/(margin|padding|border).*(Left|Right|left|right)/.test(line)) continue;
    for (const re of PHYSICAL) {
      re.lastIndex = 0;
      let m;
      while ((m = re.exec(line)) !== null) {
        // Skip matches inside comments.
        const before = line.slice(0, m.index);
        if (before.includes('//')) continue;
        failures.push({
          file: rel,
          line: i + 1,
          column: m.index + 1,
          match: m[0],
          source: line.trim(),
        });
      }
    }
  }
}

if (failures.length) {
  console.error('--- RTL audit failures ---');
  for (const f of failures) {
    console.error(`  ✗ ${f.file}:${f.line}:${f.column}  ${f.match}`);
    console.error(`      ${f.source}`);
  }
  console.error(
    `\n${failures.length} physical property usage(s) found. ` +
      'Replace with logical properties (marginInlineStart / paddingInlineEnd / borderInlineStart / etc.) ' +
      'or, if the usage is intentional, add the file to ALLOWLIST in scripts/audit-rtl.mjs with rationale.',
  );
  process.exit(1);
}

console.log('✓ RTL audit passed — no physical directional CSS properties in packages/react/src.');
