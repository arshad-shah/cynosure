# Phase 02 — Design tokens

> **Goal:** Author every design decision as W3C DTCG-format JSON tokens, compile them to CSS custom properties + TypeScript constants, and ship them as `@lumen/tokens`.

**Depends on:** Phase 01.
**Blocks:** Phases 03, 05, 06 (everything that styles anything).

---

## Why tokens and why DTCG

Tokens are the atomic design decisions: colour, spacing, typography, radii, shadows, motion. Putting them in the W3C DTCG (Design Tokens Community Group) format means:

- One source of truth that can be exported to CSS, TS, iOS, Android, Figma, etc.
- Tooling compatibility (Style Dictionary v4, Tokens Studio, Figma Variables).
- Composite tokens (typography, shadow) are standardised.
- Aliases (`{color.blue.500}`) are standardised.

We generate CSS custom properties and TS constants. We do **not** ship the JSON at runtime. Consumers see the compiled output only.

---

## What you're building

`@lumen/tokens` package containing:
1. Source JSON in DTCG format (`tokens/*.json`).
2. A Style Dictionary v4 build pipeline.
3. Two output artefacts:
   - `dist/tokens.css` — a `:root { --lumen-*: … }` stylesheet.
   - `dist/index.js` + `dist/index.d.ts` — typed constants for use inside components.
4. A JSON Schema for validating token files on commit.

---

## Token architecture — three layers

This is a critical decision. Follow it exactly.

### Layer 1 — Primitives (raw values)
Unopinionated, un-semantic. The full palette, the full scale.

- `color.gray.{50..950}` — 11 steps
- `color.blue.{50..950}`, `color.green.{…}`, `color.red.{…}`, `color.amber.{…}`, `color.violet.{…}`
- `space.{0, 0.5, 1, 1.5, 2, 3, 4, 5, 6, 8, 10, 12, 16, 20, 24, 32, 40, 48, 64}` (in rem)
- `radius.{none, xs, sm, md, lg, xl, 2xl, full}`
- `font.family.{sans, mono, serif}`
- `font.size.{xs, sm, base, md, lg, xl, 2xl, 3xl, 4xl, 5xl, 6xl}`
- `font.weight.{regular, medium, semibold, bold}`
- `line.height.{tight, snug, normal, relaxed, loose}`
- `letter.spacing.{tight, normal, wide}`
- `shadow.{xs, sm, md, lg, xl, 2xl}`
- `duration.{instant, fast, normal, slow, slower}`
- `easing.{linear, ease-in, ease-out, ease-in-out, spring, bounce}`
- `z.{hide, base, docked, dropdown, sticky, overlay, modal, popover, toast, tooltip}`
- `breakpoint.{sm, md, lg, xl, 2xl}` (exposed as TS only; CSS uses container/media queries)

### Layer 2 — Semantic (intent, references primitives)
Components only ever reference these.

- `color.background.{canvas, surface, subtle, muted, raised, overlay, inverse}`
- `color.foreground.{default, muted, subtle, disabled, inverse, onAccent}`
- `color.border.{default, subtle, strong, focus, disabled}`
- `color.accent.{solid, solidHover, solidActive, soft, softHover, softActive, ring, onSolid}`
- `color.feedback.{success, danger, warning, info}.{solid, soft, foreground, border}`
- `space.component.{xs, sm, md, lg, xl}` — mapped to primitive spaces
- `space.layout.{xs, sm, md, lg, xl, 2xl}`
- `radius.component.{xs, sm, md, lg, pill}`
- `font.heading.{1..6}.{size, weight, lineHeight, letterSpacing}` (composite tokens)
- `font.body.{xs, sm, md, lg}.{size, weight, lineHeight}` (composite)
- `shadow.component.{dropdown, popover, modal, tooltip}`
- `duration.motion.{micro, short, medium, long}`

### Layer 3 — Component-level (optional, per-component overrides)
Not authored upfront. Introduced in a component's phase when that component needs a knob its consumers might override, e.g. `button.primary.background`.

**Rule:** consumer themes override Layer 2 in 99% of cases, Layer 3 only for fine control.

---

## Source files

```
packages/tokens/
├── tokens/
│   ├── primitives/
│   │   ├── colors.json
│   │   ├── spacing.json
│   │   ├── typography.json
│   │   ├── radii.json
│   │   ├── shadows.json
│   │   ├── motion.json
│   │   └── z-index.json
│   ├── semantic/
│   │   ├── colors.light.json
│   │   ├── colors.dark.json
│   │   ├── spacing.json
│   │   ├── typography.json
│   │   └── shadows.json
│   └── schema.json
├── scripts/
│   ├── build.mjs
│   └── validate.mjs
├── src/
│   └── index.ts                   # re-exports generated output
├── package.json
├── style-dictionary.config.mjs
├── tsconfig.json
└── tsup.config.ts
```

---

## Example source files

### `tokens/primitives/colors.json` (excerpt)

```json
{
  "$schema": "../schema.json",
  "color": {
    "gray": {
      "50":  { "$type": "color", "$value": "#fafafa" },
      "100": { "$type": "color", "$value": "#f4f4f5" },
      "200": { "$type": "color", "$value": "#e4e4e7" },
      "300": { "$type": "color", "$value": "#d4d4d8" },
      "400": { "$type": "color", "$value": "#a1a1aa" },
      "500": { "$type": "color", "$value": "#71717a" },
      "600": { "$type": "color", "$value": "#52525b" },
      "700": { "$type": "color", "$value": "#3f3f46" },
      "800": { "$type": "color", "$value": "#27272a" },
      "900": { "$type": "color", "$value": "#18181b" },
      "950": { "$type": "color", "$value": "#09090b" }
    },
    "blue": {
      "50":  { "$type": "color", "$value": "#eff6ff" },
      "500": { "$type": "color", "$value": "#3b82f6" },
      "600": { "$type": "color", "$value": "#2563eb" },
      "700": { "$type": "color", "$value": "#1d4ed8" }
    }
  }
}
```

> **Palette rule:** always ship a complete 11-step scale for every hue (50, 100, …, 900, 950). Consumers may use only `500`, but the full scale lets themes do their thing without needing to re-author.
> **Accessibility rule:** every "solid" step (500+) must pass WCAG AA against white; every step ≤200 must pass against black. Add a unit test (Phase 14) that validates this with a CIE-Lab contrast function.

### `tokens/primitives/spacing.json`

```json
{
  "space": {
    "0":   { "$type": "dimension", "$value": "0rem" },
    "0.5": { "$type": "dimension", "$value": "0.125rem" },
    "1":   { "$type": "dimension", "$value": "0.25rem" },
    "1.5": { "$type": "dimension", "$value": "0.375rem" },
    "2":   { "$type": "dimension", "$value": "0.5rem" },
    "3":   { "$type": "dimension", "$value": "0.75rem" },
    "4":   { "$type": "dimension", "$value": "1rem" },
    "5":   { "$type": "dimension", "$value": "1.25rem" },
    "6":   { "$type": "dimension", "$value": "1.5rem" },
    "8":   { "$type": "dimension", "$value": "2rem" },
    "10":  { "$type": "dimension", "$value": "2.5rem" },
    "12":  { "$type": "dimension", "$value": "3rem" },
    "16":  { "$type": "dimension", "$value": "4rem" },
    "20":  { "$type": "dimension", "$value": "5rem" },
    "24":  { "$type": "dimension", "$value": "6rem" },
    "32":  { "$type": "dimension", "$value": "8rem" },
    "40":  { "$type": "dimension", "$value": "10rem" },
    "48":  { "$type": "dimension", "$value": "12rem" },
    "64":  { "$type": "dimension", "$value": "16rem" }
  }
}
```

### `tokens/semantic/colors.light.json`

```json
{
  "color": {
    "background": {
      "canvas":  { "$type": "color", "$value": "{color.gray.50}" },
      "surface": { "$type": "color", "$value": "#ffffff" },
      "subtle":  { "$type": "color", "$value": "{color.gray.100}" },
      "muted":   { "$type": "color", "$value": "{color.gray.200}" },
      "raised":  { "$type": "color", "$value": "#ffffff" },
      "overlay": { "$type": "color", "$value": "rgba(9, 9, 11, 0.5)" },
      "inverse": { "$type": "color", "$value": "{color.gray.900}" }
    },
    "foreground": {
      "default":  { "$type": "color", "$value": "{color.gray.900}" },
      "muted":    { "$type": "color", "$value": "{color.gray.600}" },
      "subtle":   { "$type": "color", "$value": "{color.gray.500}" },
      "disabled": { "$type": "color", "$value": "{color.gray.400}" },
      "inverse":  { "$type": "color", "$value": "{color.gray.50}" },
      "onAccent": { "$type": "color", "$value": "#ffffff" }
    },
    "border": {
      "default":  { "$type": "color", "$value": "{color.gray.200}" },
      "subtle":   { "$type": "color", "$value": "{color.gray.100}" },
      "strong":   { "$type": "color", "$value": "{color.gray.300}" },
      "focus":    { "$type": "color", "$value": "{color.blue.500}" },
      "disabled": { "$type": "color", "$value": "{color.gray.200}" }
    },
    "accent": {
      "solid":       { "$type": "color", "$value": "{color.blue.600}" },
      "solidHover":  { "$type": "color", "$value": "{color.blue.700}" },
      "solidActive": { "$type": "color", "$value": "{color.blue.700}" },
      "soft":        { "$type": "color", "$value": "{color.blue.50}" },
      "softHover":   { "$type": "color", "$value": "{color.blue.100}" },
      "softActive":  { "$type": "color", "$value": "{color.blue.200}" },
      "ring":        { "$type": "color", "$value": "{color.blue.500}" },
      "onSolid":     { "$type": "color", "$value": "#ffffff" }
    }
  }
}
```

`tokens/semantic/colors.dark.json` is the same shape with different referenced values.

### `tokens/semantic/typography.json` (composite)

```json
{
  "font": {
    "heading": {
      "1": {
        "$type": "typography",
        "$value": {
          "fontFamily": "{font.family.sans}",
          "fontSize": "{font.size.5xl}",
          "fontWeight": "{font.weight.bold}",
          "lineHeight": "{line.height.tight}",
          "letterSpacing": "{letter.spacing.tight}"
        }
      },
      "2": {
        "$type": "typography",
        "$value": {
          "fontFamily": "{font.family.sans}",
          "fontSize": "{font.size.4xl}",
          "fontWeight": "{font.weight.semibold}",
          "lineHeight": "{line.height.tight}"
        }
      }
    },
    "body": {
      "md": {
        "$type": "typography",
        "$value": {
          "fontFamily": "{font.family.sans}",
          "fontSize": "{font.size.base}",
          "fontWeight": "{font.weight.regular}",
          "lineHeight": "{line.height.normal}"
        }
      }
    }
  }
}
```

---

## Style Dictionary pipeline

### `style-dictionary.config.mjs`

```js
import StyleDictionary from 'style-dictionary';

StyleDictionary.registerFormat({
  name: 'typescript/tokens',
  format: ({ dictionary }) => {
    const toObject = (tokens) => {
      const out = {};
      for (const t of tokens) {
        const path = t.path;
        let node = out;
        for (let i = 0; i < path.length - 1; i++) {
          node[path[i]] = node[path[i]] ?? {};
          node = node[path[i]];
        }
        node[path[path.length - 1]] = t.value;
      }
      return out;
    };
    const obj = toObject(dictionary.allTokens);
    return `export const tokens = ${JSON.stringify(obj, null, 2)} as const;\nexport type Tokens = typeof tokens;\n`;
  },
});

const commonTransforms = ['attribute/cti', 'name/kebab', 'color/css', 'size/rem'];

const build = async (themeName, sources) => {
  const sd = new StyleDictionary({
    source: sources,
    platforms: {
      css: {
        transformGroup: 'css',
        transforms: commonTransforms,
        buildPath: `dist/css/`,
        prefix: 'lumen',
        files: [{
          destination: `${themeName}.css`,
          format: 'css/variables',
          options: {
            selector: themeName === 'base' ? ':root' : `[data-theme='${themeName}']`,
            outputReferences: true,
          },
        }],
      },
      ts: {
        transformGroup: 'js',
        transforms: [...commonTransforms, 'name/camel'],
        buildPath: 'dist/ts/',
        files: [{ destination: `${themeName}.ts`, format: 'typescript/tokens' }],
      },
    },
  });
  await sd.buildAllPlatforms();
};

await build('base',  ['tokens/primitives/**/*.json', 'tokens/semantic/colors.light.json', 'tokens/semantic/spacing.json', 'tokens/semantic/typography.json', 'tokens/semantic/shadows.json']);
await build('dark',  ['tokens/primitives/**/*.json', 'tokens/semantic/colors.dark.json']);
```

> **Key choice: `outputReferences: true`** means generated CSS uses `var(--lumen-color-gray-900)` instead of inlining `#18181b`. This is what lets consumers override one primitive and have every semantic token cascade. **Do not turn this off.**

### Output shape

`dist/css/base.css`:

```css
:root {
  --lumen-color-gray-50: #fafafa;
  /* ... */
  --lumen-color-gray-900: #18181b;
  /* ... */
  --lumen-color-background-canvas: var(--lumen-color-gray-50);
  --lumen-color-foreground-default: var(--lumen-color-gray-900);
  /* ... */
}
```

`dist/css/dark.css`:

```css
[data-theme='dark'] {
  --lumen-color-background-canvas: var(--lumen-color-gray-950);
  --lumen-color-foreground-default: var(--lumen-color-gray-50);
  /* ... */
}
```

### Composite token handling

Typography composites need special handling. Extend the Style Dictionary config with a custom transformer that emits:

```css
--lumen-font-heading-1-family: var(--lumen-font-family-sans);
--lumen-font-heading-1-size: var(--lumen-font-size-5xl);
--lumen-font-heading-1-weight: var(--lumen-font-weight-bold);
--lumen-font-heading-1-line-height: var(--lumen-line-height-tight);
```

Components then use a shorthand like `font: var(--lumen-font-heading-1-weight) var(--lumen-font-heading-1-size)/var(--lumen-font-heading-1-line-height) var(--lumen-font-heading-1-family);` when they need the composite.

---

## The `@lumen/tokens` public API

`packages/tokens/src/index.ts`:

```ts
export { tokens as baseTokens } from '../dist/ts/base.js';
export { tokens as darkTokens } from '../dist/ts/dark.js';
export type { Tokens } from '../dist/ts/base.js';

// Re-export CSS as a side-effect import path:
//   import '@lumen/tokens/css';
// The actual file is resolved via exports map.
```

`packages/tokens/package.json` exports:

```json
{
  "exports": {
    ".": { "types": "./dist/index.d.ts", "import": "./dist/index.js" },
    "./css": "./dist/css/base.css",
    "./css/dark": "./dist/css/dark.css",
    "./package.json": "./package.json"
  }
}
```

Build order: `pnpm build` runs `node style-dictionary.config.mjs` first (via `prebuild` script), then tsup for the JS entry.

`packages/tokens/package.json` scripts:

```json
{
  "scripts": {
    "build:tokens": "node style-dictionary.config.mjs",
    "build": "pnpm build:tokens && tsup",
    "validate": "node scripts/validate.mjs"
  }
}
```

---

## Validation

`tokens/schema.json` — a JSON Schema that enforces the DTCG shape. Use Ajv in `scripts/validate.mjs`:

```js
import Ajv from 'ajv';
import { readFileSync } from 'node:fs';
import { glob } from 'glob';

const ajv = new Ajv({ allErrors: true });
const schema = JSON.parse(readFileSync('tokens/schema.json', 'utf8'));
const validate = ajv.compile(schema);

const files = await glob('tokens/**/*.json', { ignore: 'tokens/schema.json' });
let failed = false;
for (const f of files) {
  const data = JSON.parse(readFileSync(f, 'utf8'));
  if (!validate(data)) {
    console.error(`✗ ${f}`);
    for (const e of validate.errors) console.error(`  ${e.instancePath} ${e.message}`);
    failed = true;
  }
}
process.exit(failed ? 1 : 0);
```

Wire `validate` into the `prebuild` hook so invalid tokens fail the build, not runtime.

---

## Exit criteria

- [ ] `tokens/primitives/` and `tokens/semantic/` are populated per the inventory above.
- [ ] `pnpm --filter @lumen/tokens build` produces:
  - `dist/css/base.css` containing all semantic tokens as `var(--lumen-…)` references.
  - `dist/css/dark.css` overriding only what changes for dark.
  - `dist/ts/base.ts` and `dist/ts/dark.ts` exporting typed constants.
  - `dist/index.js` + `dist/index.d.ts` re-exporting them.
- [ ] `pnpm --filter @lumen/tokens validate` passes.
- [ ] Importing `@lumen/tokens/css` in the playground and switching `data-theme` on `<html>` visibly changes colours (use a throwaway `style={{background: 'var(--lumen-color-background-canvas)'}}` div to verify).
- [ ] `@lumen/tokens` gzipped CSS is under **8 KB** for base + dark combined. If larger, audit for redundant tokens.
- [ ] Write a changeset: `@lumen/tokens` minor, "Initial token pipeline".

## Decisions to log

- The naming convention: `--lumen-<domain>-<subdomain>-<step>` (kebab, dash-separated). **Do not change this later** — components encode it.
- No `!important`, ever. If a consumer needs to override, they change the token, not overload selectors.
