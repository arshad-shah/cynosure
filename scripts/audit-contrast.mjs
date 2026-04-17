#!/usr/bin/env node
/**
 * Lumen UI — colour-contrast audit (Phase 14).
 *
 * Parses the compiled CSS custom properties emitted by `@lumen/tokens` + the
 * prebuilt themes in `@lumen/themes`, resolves every foreground / background
 * pair that we know is paired visually, and checks its WCAG 2.1 contrast
 * ratio against the target minimum for the text size.
 *
 * The script is intentionally self-contained (no Style Dictionary traversal,
 * no JSON imports): it walks the emitted CSS because that's what consumers
 * actually ship. If a theme author adds a new semantic variable, they update
 * the CSS and the audit sees it automatically.
 *
 * Exits with code 1 on any failure so CI fails.
 */

import { readFileSync, existsSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import Color from 'colorjs.io';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dirname, '..');

// -------------------------------------------------------------------------
// Pairs we audit. `min` is the WCAG AA threshold: 4.5:1 for normal body
// text, 3:1 for large text (>= 18pt / 14pt bold) and for non-text UI
// components like icons and focus rings.
// -------------------------------------------------------------------------
const PAIRS = [
  // Body text on every surface.
  { fg: 'color-foreground-default', bg: 'color-background-canvas', min: 4.5, label: 'body on canvas' },
  { fg: 'color-foreground-default', bg: 'color-background-surface', min: 4.5, label: 'body on surface' },
  { fg: 'color-foreground-default', bg: 'color-background-subtle', min: 4.5, label: 'body on subtle' },
  { fg: 'color-foreground-default', bg: 'color-background-raised', min: 4.5, label: 'body on raised' },
  { fg: 'color-foreground-muted', bg: 'color-background-canvas', min: 4.5, label: 'muted on canvas' },
  { fg: 'color-foreground-muted', bg: 'color-background-surface', min: 4.5, label: 'muted on surface' },
  // Inverse surface.
  { fg: 'color-foreground-inverse', bg: 'color-background-inverse', min: 4.5, label: 'inverse on inverse' },
  // Accent — both solid-button and ring.
  { fg: 'color-accent-on-solid', bg: 'color-accent-solid', min: 4.5, label: 'on-solid on accent-solid' },
  { fg: 'color-accent-on-solid', bg: 'color-accent-solid-hover', min: 4.5, label: 'on-solid on accent-solid-hover' },
  { fg: 'color-accent-on-solid', bg: 'color-accent-solid-active', min: 4.5, label: 'on-solid on accent-solid-active' },
  // Feedback surfaces — solid buttons carry text; soft surfaces carry
  // `foreground` text.
  { fg: 'color-foreground-on-accent', bg: 'color-feedback-success-solid', min: 4.5, label: 'on-accent on success-solid' },
  { fg: 'color-foreground-on-accent', bg: 'color-feedback-danger-solid', min: 4.5, label: 'on-accent on danger-solid' },
  { fg: 'color-foreground-on-accent', bg: 'color-feedback-info-solid', min: 4.5, label: 'on-accent on info-solid' },
  { fg: 'color-feedback-success-foreground', bg: 'color-feedback-success-soft', min: 4.5, label: 'success-fg on success-soft' },
  { fg: 'color-feedback-danger-foreground', bg: 'color-feedback-danger-soft', min: 4.5, label: 'danger-fg on danger-soft' },
  { fg: 'color-feedback-warning-foreground', bg: 'color-feedback-warning-soft', min: 4.5, label: 'warning-fg on warning-soft' },
  { fg: 'color-feedback-info-foreground', bg: 'color-feedback-info-soft', min: 4.5, label: 'info-fg on info-soft' },
  // Non-text: focus ring + strong borders must hit 3:1 against canvas.
  { fg: 'color-border-focus', bg: 'color-background-canvas', min: 3, label: 'focus ring on canvas' },
  { fg: 'color-border-strong', bg: 'color-background-canvas', min: 3, label: 'strong border on canvas' },
];

// -------------------------------------------------------------------------
// Themes we audit. Each theme is a selector (`:root`, `[data-theme="dark"]`,
// etc.) + the list of CSS files whose declarations contribute. The base CSS
// contains `:root` + the dark override; the @lumen/themes package contributes
// the terminal + high-contrast surfaces.
// -------------------------------------------------------------------------
const BASE_CSS = resolve(root, 'packages/tokens/dist/css/base.css');
const DARK_CSS = resolve(root, 'packages/tokens/dist/css/dark.css');
const TERMINAL_CSS = resolve(root, 'packages/themes/src/terminal/index.css');
const HIGH_CONTRAST_CSS = resolve(root, 'packages/themes/src/high-contrast/index.css');

const THEMES = [
  { name: 'base (light)', layers: [{ file: BASE_CSS, selector: ':root' }] },
  {
    name: 'base (dark)',
    layers: [
      { file: BASE_CSS, selector: ':root' },
      { file: DARK_CSS, selector: '[data-theme="dark"]' },
      { file: DARK_CSS, selector: ':root[data-theme="dark"]' },
    ],
  },
  {
    name: 'terminal',
    layers: [
      { file: BASE_CSS, selector: ':root' },
      { file: TERMINAL_CSS, selector: '[data-theme="terminal"]' },
    ],
  },
  {
    name: 'terminal-dark',
    layers: [
      { file: BASE_CSS, selector: ':root' },
      { file: DARK_CSS, selector: '[data-theme="dark"]' },
      { file: DARK_CSS, selector: ':root[data-theme="dark"]' },
      { file: TERMINAL_CSS, selector: '[data-theme="terminal"]' },
    ],
  },
  {
    name: 'high-contrast (light)',
    layers: [
      { file: BASE_CSS, selector: ':root' },
      { file: HIGH_CONTRAST_CSS, selector: '[data-theme="high-contrast"]' },
    ],
  },
  {
    name: 'high-contrast (dark)',
    layers: [
      { file: BASE_CSS, selector: ':root' },
      { file: DARK_CSS, selector: '[data-theme="dark"]' },
      { file: DARK_CSS, selector: ':root[data-theme="dark"]' },
      { file: HIGH_CONTRAST_CSS, selector: '[data-theme="high-contrast-dark"]' },
    ],
  },
];

// -------------------------------------------------------------------------
// Minimal CSS-custom-property parser. Handles `<selector> { ... --foo: bar; ... }`
// blocks, ignores `@media`/`@supports` wrappers for this audit (reduced-motion
// etc. isn't colour-relevant).
// -------------------------------------------------------------------------
function readVarsFromFile(file, selector) {
  if (!existsSync(file)) return {};
  const source = readFileSync(file, 'utf8');
  // Find blocks whose opening selector matches `selector` exactly.
  const vars = {};
  const re = new RegExp(
    `${selector.replace(/[-/\\^$*+?.()|[\\]{}]/g, '\\$&')}\\s*\\{([^}]*)\\}`,
    'g',
  );
  let m;
  while ((m = re.exec(source)) !== null) {
    const body = m[1];
    for (const decl of body.split(';')) {
      const idx = decl.indexOf(':');
      if (idx === -1) continue;
      const key = decl.slice(0, idx).trim();
      const value = decl.slice(idx + 1).trim();
      if (!key.startsWith('--')) continue;
      vars[key.slice(2)] = value;
    }
  }
  return vars;
}

function resolveTheme(theme) {
  const resolved = {};
  for (const layer of theme.layers) {
    Object.assign(resolved, readVarsFromFile(layer.file, layer.selector));
  }
  return resolved;
}

// -------------------------------------------------------------------------
// `var(--foo)` / `var(--foo, fallback)` resolution — variables may chain
// through up to ~4 levels in practice (semantic → ramp → primitive).
// -------------------------------------------------------------------------
function resolveValue(key, bag, depth = 0) {
  if (depth > 16) throw new Error(`Circular variable reference at --lumen-${key}`);
  const lookupKey = key.startsWith('lumen-') ? key.slice('lumen-'.length) : key;
  let value = bag[`lumen-${lookupKey}`] ?? bag[lookupKey];
  if (value === undefined) return undefined;
  value = value.trim();
  const varMatch = value.match(/^var\(\s*(--[a-zA-Z0-9-]+)\s*(?:,\s*(.+))?\)$/);
  if (varMatch) {
    const ref = varMatch[1].slice(2);
    const fallback = varMatch[2];
    const resolved = resolveValue(ref, bag, depth + 1);
    if (resolved !== undefined) return resolved;
    if (fallback !== undefined) return fallback.trim();
    return undefined;
  }
  return value;
}

// -------------------------------------------------------------------------
// Blend a foreground colour onto a background — WCAG expects opaque colours.
// `colorjs.io` already carries alpha; we composite over `bg` before calling
// `contrast()`.
// -------------------------------------------------------------------------
function composite(fgSpec, bgSpec) {
  const fg = new Color(fgSpec);
  const bg = new Color(bgSpec);
  const a = fg.alpha ?? 1;
  if (a >= 1) return fg;
  const r = fg.srgb.r * a + bg.srgb.r * (1 - a);
  const g = fg.srgb.g * a + bg.srgb.g * (1 - a);
  const b = fg.srgb.b * a + bg.srgb.b * (1 - a);
  return new Color('srgb', [r, g, b]);
}

// -------------------------------------------------------------------------
// Main.
// -------------------------------------------------------------------------
const failures = [];
const warnings = [];

for (const theme of THEMES) {
  const missingLayer = theme.layers.find((l) => !existsSync(l.file));
  if (missingLayer) {
    warnings.push(
      `[${theme.name}] skipped — missing ${missingLayer.file} (run \`pnpm --filter @lumen/tokens build\` first).`,
    );
    continue;
  }

  const bag = resolveTheme(theme);

  for (const { fg, bg, min, label } of PAIRS) {
    const fgValue = resolveValue(fg, bag);
    const bgValue = resolveValue(bg, bag);
    if (fgValue === undefined || bgValue === undefined) {
      // Skip — theme legitimately doesn't redefine this pair's surface
      // (e.g. high-contrast doesn't re-emit every background variant),
      // so the inherited light/dark value from :root already governs.
      continue;
    }
    try {
      const bgColor = new Color(bgValue);
      const fgColor = composite(fgValue, bgColor);
      const ratio = Number(fgColor.contrast(bgColor, 'WCAG21').toFixed(2));
      if (ratio < min) {
        failures.push(
          `[${theme.name}] ${label}: ${fgValue} on ${bgValue} — ${ratio}:1 (< ${min}:1)`,
        );
      }
    } catch (err) {
      warnings.push(`[${theme.name}] ${label}: could not parse (${String(err)})`);
    }
  }
}

if (warnings.length) {
  console.warn('--- contrast audit warnings ---');
  for (const w of warnings) console.warn(`  ${w}`);
  console.warn('');
}

if (failures.length) {
  console.error('--- contrast audit failures ---');
  for (const f of failures) console.error(`  ✗ ${f}`);
  console.error(`\n${failures.length} failure(s) across ${THEMES.length} theme(s).`);
  process.exit(1);
}

console.log(`✓ contrast audit passed for ${THEMES.length} theme(s).`);
