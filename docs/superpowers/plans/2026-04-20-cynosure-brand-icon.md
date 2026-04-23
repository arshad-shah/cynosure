# Cynosure Brand Icon Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Create the Cynosure brand mark, generate every derivative asset (favicon, apple touch icon, OG image, lockup), and wire them into Storybook and the root README so the brand is visible everywhere the library is seen.

**Architecture:** Static SVG authoring for the mark and its variants, plus a Node script (`brand/generate.mjs`) that rasterizes the SVGs into PNG/ICO using `sharp` and `to-ico`. All source SVGs, the generate script, and the produced binaries are committed so contributors never need to run the generator. Rollout is done by editing `.storybook/manager.ts`, adding `.storybook/manager-head.html` + `.storybook/preview-head.html`, updating the root `README.md`, and adding an `icon` field to the relevant `package.json` files.

**Tech Stack:** SVG, Node 22, `sharp` (SVG→PNG rasterization), `to-ico` (PNG→multi-res ICO), Storybook 9.

**Spec:** See [docs/superpowers/specs/2026-04-20-cynosure-brand-icon-design.md](../specs/2026-04-20-cynosure-brand-icon-design.md) for the design rationale and visual rules.

## File map

Created:
- `brand/cynosure-mark.svg` — master full-color mark
- `brand/cynosure-mark-mono.svg` — `currentColor` monochrome variant
- `brand/cynosure-mark-favicon.svg` — 5-token simplified variant
- `brand/cynosure-lockup.svg` — horizontal mark + wordmark
- `brand/generate.mjs` — Node script that produces the binaries
- `brand/favicon.ico` — generated multi-res ICO
- `brand/apple-touch-icon.png` — generated 180×180 PNG
- `brand/og-image.png` — generated 1200×630 PNG
- `brand/README.md` — usage rules
- `.storybook/manager-head.html` — favicon + OG meta in Storybook manager
- `.storybook/preview-head.html` — favicon in Storybook canvas

Modified:
- `.storybook/manager.ts` — add `brandImage`
- `README.md` — add lockup hero at the top
- `package.json` — add `sharp` + `to-ico` devDependencies, `brand:generate` script, `icon` field
- `packages/react/package.json` — add `icon` field

---

### Task 1: Author the master mark SVG

**Files:**
- Create: `brand/cynosure-mark.svg`

- [ ] **Step 1: Create the `brand/` directory and the master mark file**

Write exactly this content to `brand/cynosure-mark.svg`:

```xml
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="100" height="100" fill="none" role="img" aria-label="Cynosure">
  <defs>
    <linearGradient id="cyn-center" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="#f5f6fa"/>
      <stop offset="1" stop-color="#c77dff"/>
    </linearGradient>
  </defs>
  <g fill="#c77dff">
    <rect x="46" y="2" width="8" height="8" rx="2"/>
    <rect x="46" y="90" width="8" height="8" rx="2"/>
    <rect x="2" y="46" width="8" height="8" rx="2"/>
    <rect x="90" y="46" width="8" height="8" rx="2"/>
  </g>
  <g fill="#8b9dff">
    <rect x="18" y="18" width="16" height="16" rx="4"/>
    <rect x="66" y="18" width="16" height="16" rx="4"/>
    <rect x="18" y="66" width="16" height="16" rx="4"/>
    <rect x="66" y="66" width="16" height="16" rx="4"/>
  </g>
  <rect x="36" y="36" width="28" height="28" rx="6" fill="url(#cyn-center)"/>
</svg>
```

- [ ] **Step 2: Verify the SVG is well-formed and renders**

Run: `node -e "const s=require('fs').readFileSync('brand/cynosure-mark.svg','utf8'); if(!s.includes('viewBox=\"0 0 100 100\"')) throw new Error('viewBox missing'); console.log('OK')"`

Expected: `OK`

Open the file in a browser (drag-drop) or IDE preview. Expected: a 9-token radial — 4 small violet tokens on the axes, 4 larger iris-blue tokens on the diagonals, a white-to-violet gradient square in the center.

- [ ] **Step 3: Commit**

```bash
git add brand/cynosure-mark.svg
git commit -m "feat(brand): add master Cynosure mark SVG"
```

---

### Task 2: Author the monochrome variant

**Files:**
- Create: `brand/cynosure-mark-mono.svg`

- [ ] **Step 1: Write the mono variant**

Write exactly this content to `brand/cynosure-mark-mono.svg`:

```xml
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="100" height="100" fill="none" role="img" aria-label="Cynosure">
  <g fill="currentColor" opacity="0.45">
    <rect x="46" y="2" width="8" height="8" rx="2"/>
    <rect x="46" y="90" width="8" height="8" rx="2"/>
    <rect x="2" y="46" width="8" height="8" rx="2"/>
    <rect x="90" y="46" width="8" height="8" rx="2"/>
  </g>
  <g fill="currentColor" opacity="0.7">
    <rect x="18" y="18" width="16" height="16" rx="4"/>
    <rect x="66" y="18" width="16" height="16" rx="4"/>
    <rect x="18" y="66" width="16" height="16" rx="4"/>
    <rect x="66" y="66" width="16" height="16" rx="4"/>
  </g>
  <rect x="36" y="36" width="28" height="28" rx="6" fill="currentColor"/>
</svg>
```

- [ ] **Step 2: Verify**

Run: `grep -c "currentColor" brand/cynosure-mark-mono.svg`

Expected: `3` (cardinals group, diagonals group, center rect).

- [ ] **Step 3: Commit**

```bash
git add brand/cynosure-mark-mono.svg
git commit -m "feat(brand): add monochrome mark variant"
```

---

### Task 3: Author the favicon-simplified variant

**Files:**
- Create: `brand/cynosure-mark-favicon.svg`

- [ ] **Step 1: Write the favicon SVG (5 tokens, no cardinals)**

Write exactly this content to `brand/cynosure-mark-favicon.svg`:

```xml
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="100" height="100" fill="none" shape-rendering="crispEdges" role="img" aria-label="Cynosure">
  <g fill="#8b9dff">
    <rect x="14" y="14" width="20" height="20" rx="2"/>
    <rect x="66" y="14" width="20" height="20" rx="2"/>
    <rect x="14" y="66" width="20" height="20" rx="2"/>
    <rect x="66" y="66" width="20" height="20" rx="2"/>
  </g>
  <rect x="34" y="34" width="32" height="32" rx="2" fill="#e8ecff"/>
</svg>
```

- [ ] **Step 2: Verify**

Run: `grep -c "<rect" brand/cynosure-mark-favicon.svg`

Expected: `5` (4 diagonals + 1 center).

- [ ] **Step 3: Commit**

```bash
git add brand/cynosure-mark-favicon.svg
git commit -m "feat(brand): add simplified favicon mark variant"
```

---

### Task 4: Author the horizontal lockup

**Files:**
- Create: `brand/cynosure-lockup.svg`

- [ ] **Step 1: Write the lockup SVG (mark + wordmark)**

Write exactly this content to `brand/cynosure-lockup.svg`. The viewBox is 360×100 so the mark occupies the leftmost 100 units and the wordmark fills the rest at cap-height tuned to the mark.

```xml
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 360 100" width="360" height="100" fill="none" role="img" aria-label="Cynosure">
  <defs>
    <linearGradient id="cyn-lockup-center" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="#f5f6fa"/>
      <stop offset="1" stop-color="#c77dff"/>
    </linearGradient>
  </defs>
  <g>
    <g fill="#c77dff">
      <rect x="46" y="2" width="8" height="8" rx="2"/>
      <rect x="46" y="90" width="8" height="8" rx="2"/>
      <rect x="2" y="46" width="8" height="8" rx="2"/>
      <rect x="90" y="46" width="8" height="8" rx="2"/>
    </g>
    <g fill="#8b9dff">
      <rect x="18" y="18" width="16" height="16" rx="4"/>
      <rect x="66" y="18" width="16" height="16" rx="4"/>
      <rect x="18" y="66" width="16" height="16" rx="4"/>
      <rect x="66" y="66" width="16" height="16" rx="4"/>
    </g>
    <rect x="36" y="36" width="28" height="28" rx="6" fill="url(#cyn-lockup-center)"/>
  </g>
  <text x="130" y="70" font-family="'Inter Tight', Inter, system-ui, -apple-system, sans-serif" font-weight="600" font-size="58" letter-spacing="-1.5" fill="#f5f6fa">cynosure</text>
</svg>
```

- [ ] **Step 2: Verify**

Open the file in a browser. Expected: mark on the left, lowercase "cynosure" in white on the right, baseline-aligned with the center of the mark.

- [ ] **Step 3: Commit**

```bash
git add brand/cynosure-lockup.svg
git commit -m "feat(brand): add horizontal mark + wordmark lockup"
```

---

### Task 5: Add generator dependencies + npm script

**Files:**
- Modify: `package.json`

- [ ] **Step 1: Install `sharp` and `to-ico` as root devDependencies**

Run:

```bash
pnpm add -Dw sharp to-ico
```

Expected: `sharp` and `to-ico` appear under `devDependencies` in the root `package.json`, `pnpm-lock.yaml` updates.

- [ ] **Step 2: Add the `brand:generate` npm script**

Open `package.json`. In the `"scripts"` object, add this line immediately after `"chromatic": "..."`:

```json
    "brand:generate": "node brand/generate.mjs"
```

Remember to add the comma after the preceding line.

- [ ] **Step 3: Verify**

Run: `node -e "console.log(require('./package.json').scripts['brand:generate'])"`

Expected: `node brand/generate.mjs`

Run: `node -e "console.log(!!require('./package.json').devDependencies.sharp, !!require('./package.json').devDependencies['to-ico'])"`

Expected: `true true`

- [ ] **Step 4: Commit**

```bash
git add package.json pnpm-lock.yaml
git commit -m "chore(brand): add sharp + to-ico for asset generation"
```

---

### Task 6: Write the asset generator script

**Files:**
- Create: `brand/generate.mjs`

- [ ] **Step 1: Write the generator**

Write exactly this content to `brand/generate.mjs`:

```js
// Generates brand/favicon.ico, brand/apple-touch-icon.png, and brand/og-image.png
// from the SVG sources. Idempotent — safe to re-run. Outputs are committed so
// contributors don't need to run this to build.
import { readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';
import toIco from 'to-ico';

const here = dirname(fileURLToPath(import.meta.url));
const read = (name) => readFileSync(join(here, name));

async function buildFavicon() {
  const svg = read('cynosure-mark-favicon.svg');
  const sizes = [16, 32, 48];
  const pngs = await Promise.all(
    sizes.map((s) =>
      sharp(svg, { density: 384 }).resize(s, s, { kernel: 'lanczos3' }).png().toBuffer(),
    ),
  );
  const ico = await toIco(pngs);
  writeFileSync(join(here, 'favicon.ico'), ico);
  console.log('wrote favicon.ico (16 + 32 + 48)');
}

async function buildAppleTouch() {
  // 180×180, dark rounded bg + full mark centered at 60% width.
  const composed = `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 180 180">
      <defs>
        <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stop-color="#1a1d2e"/>
          <stop offset="1" stop-color="#0b0d12"/>
        </linearGradient>
        <linearGradient id="ctr" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stop-color="#f5f6fa"/>
          <stop offset="1" stop-color="#c77dff"/>
        </linearGradient>
      </defs>
      <rect width="180" height="180" fill="url(#bg)"/>
      <g transform="translate(36 36) scale(1.08)">
        <g fill="#c77dff">
          <rect x="46" y="2" width="8" height="8" rx="2"/>
          <rect x="46" y="90" width="8" height="8" rx="2"/>
          <rect x="2" y="46" width="8" height="8" rx="2"/>
          <rect x="90" y="46" width="8" height="8" rx="2"/>
        </g>
        <g fill="#8b9dff">
          <rect x="18" y="18" width="16" height="16" rx="4"/>
          <rect x="66" y="18" width="16" height="16" rx="4"/>
          <rect x="18" y="66" width="16" height="16" rx="4"/>
          <rect x="66" y="66" width="16" height="16" rx="4"/>
        </g>
        <rect x="36" y="36" width="28" height="28" rx="6" fill="url(#ctr)"/>
      </g>
    </svg>`;
  await sharp(Buffer.from(composed), { density: 512 })
    .resize(180, 180)
    .png()
    .toFile(join(here, 'apple-touch-icon.png'));
  console.log('wrote apple-touch-icon.png (180×180)');
}

async function buildOg() {
  // 1200×630 social card: mark + wordmark top-left, tagline bottom, decorative corner mark.
  const og = `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 630">
      <defs>
        <radialGradient id="bg" cx="75%" cy="30%" r="80%">
          <stop offset="0" stop-color="#2a1d4a"/>
          <stop offset="0.65" stop-color="#0b0d12"/>
        </radialGradient>
        <linearGradient id="ctr" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stop-color="#f5f6fa"/>
          <stop offset="1" stop-color="#c77dff"/>
        </linearGradient>
      </defs>
      <rect width="1200" height="630" fill="url(#bg)"/>
      <!-- decorative oversized mark, clipped at corner, low opacity -->
      <g transform="translate(900 -120) scale(5)" opacity="0.1">
        <g fill="#c77dff">
          <rect x="46" y="2" width="8" height="8" rx="2"/>
          <rect x="2" y="46" width="8" height="8" rx="2"/>
        </g>
        <g fill="#8b9dff">
          <rect x="18" y="18" width="16" height="16" rx="4"/>
          <rect x="66" y="18" width="16" height="16" rx="4"/>
          <rect x="18" y="66" width="16" height="16" rx="4"/>
          <rect x="66" y="66" width="16" height="16" rx="4"/>
        </g>
        <rect x="36" y="36" width="28" height="28" rx="6" fill="#f5f6fa"/>
      </g>
      <!-- header: mark + wordmark -->
      <g transform="translate(72 72) scale(0.9)">
        <g fill="#c77dff">
          <rect x="46" y="2" width="8" height="8" rx="2"/>
          <rect x="46" y="90" width="8" height="8" rx="2"/>
          <rect x="2" y="46" width="8" height="8" rx="2"/>
          <rect x="90" y="46" width="8" height="8" rx="2"/>
        </g>
        <g fill="#8b9dff">
          <rect x="18" y="18" width="16" height="16" rx="4"/>
          <rect x="66" y="18" width="16" height="16" rx="4"/>
          <rect x="18" y="66" width="16" height="16" rx="4"/>
          <rect x="66" y="66" width="16" height="16" rx="4"/>
        </g>
        <rect x="36" y="36" width="28" height="28" rx="6" fill="url(#ctr)"/>
      </g>
      <text x="190" y="143" font-family="'Inter Tight', Inter, system-ui, sans-serif" font-weight="600" font-size="54" letter-spacing="-1.5" fill="#f5f6fa">cynosure</text>
      <!-- tagline -->
      <text x="72" y="470" font-family="'Inter Tight', Inter, system-ui, sans-serif" font-weight="700" font-size="64" letter-spacing="-2" fill="#f5f6fa">A gorgeous, tiny, accessible</text>
      <text x="72" y="540" font-family="'Inter Tight', Inter, system-ui, sans-serif" font-weight="700" font-size="64" letter-spacing="-2" fill="#f5f6fa">React UI framework.</text>
      <text x="72" y="582" font-family="Inter, system-ui, sans-serif" font-weight="500" font-size="22" fill="#a1a6bf">90+ components · WCAG 2.2 AA · pay for what you import</text>
    </svg>`;
  await sharp(Buffer.from(og), { density: 384 })
    .resize(1200, 630)
    .png()
    .toFile(join(here, 'og-image.png'));
  console.log('wrote og-image.png (1200×630)');
}

await buildFavicon();
await buildAppleTouch();
await buildOg();
```

- [ ] **Step 2: Commit the script before running it**

```bash
git add brand/generate.mjs
git commit -m "feat(brand): add SVG→PNG/ICO asset generator"
```

---

### Task 7: Run the generator and commit the binaries

**Files:**
- Create: `brand/favicon.ico`, `brand/apple-touch-icon.png`, `brand/og-image.png`

- [ ] **Step 1: Run the generator**

Run: `pnpm brand:generate`

Expected output (three lines):

```
wrote favicon.ico (16 + 32 + 48)
wrote apple-touch-icon.png (180×180)
wrote og-image.png (1200×630)
```

- [ ] **Step 2: Verify dimensions**

Run:

```bash
node -e "const s=require('sharp'); Promise.all([s('brand/apple-touch-icon.png').metadata(), s('brand/og-image.png').metadata()]).then(([a,o])=>console.log(a.width+'x'+a.height, o.width+'x'+o.height))"
```

Expected: `180x180 1200x630`

Run: `file brand/favicon.ico`

Expected: output contains `MS Windows icon resource`.

- [ ] **Step 3: Visually inspect**

Open each PNG in an image viewer. Expected:
- `apple-touch-icon.png`: dark-gradient rounded tile with the full mark centered
- `og-image.png`: dark radial background, mark + "cynosure" top-left, white tagline, muted caption, decorative faded mark in the top-right corner

- [ ] **Step 4: Commit**

```bash
git add brand/favicon.ico brand/apple-touch-icon.png brand/og-image.png
git commit -m "feat(brand): generate favicon + apple-touch + og binaries"
```

---

### Task 8: Write brand usage rules

**Files:**
- Create: `brand/README.md`

- [ ] **Step 1: Write the usage doc**

Write exactly this content to `brand/README.md`:

````markdown
# Cynosure brand assets

This directory contains the Cynosure UI brand mark and every derivative surface. All source files are authored as SVG; PNG/ICO binaries are generated from those sources.

## Files

| File | Use |
|---|---|
| `cynosure-mark.svg` | Master full-color mark. Default choice. |
| `cynosure-mark-mono.svg` | `currentColor` monochrome — use on themed / colored / photographic backgrounds. |
| `cynosure-mark-favicon.svg` | 5-token simplified variant for sizes < 32px. |
| `cynosure-lockup.svg` | Horizontal mark + wordmark. Use wherever the mark appears next to other logos. |
| `favicon.ico` | Multi-res ICO (16 + 32 + 48). |
| `apple-touch-icon.png` | 180×180. iOS home-screen icon. |
| `og-image.png` | 1200×630. Open Graph / Twitter share card. |

## Regenerating the binaries

```bash
pnpm brand:generate
```

`favicon.ico`, `apple-touch-icon.png`, and `og-image.png` are rebuilt from the SVG sources via `brand/generate.mjs`. The generator is idempotent.

## Usage rules

**Clear space.** Keep 1 cardinal-token unit (≈10% of mark width) of empty space on every side of the mark.

**Minimum sizes.**
- Full mark: 24px
- Favicon variant: 16px

**Do.**
- Use `cynosure-mark-mono.svg` on non-standard backgrounds — the browser inherits `currentColor`.
- Use the lockup (`cynosure-lockup.svg`) whenever the mark appears alongside other logos.
- Use the favicon variant in browser-tab and 16px contexts.

**Don't.**
- Recolor individual tokens.
- Rotate, skew, outline, or apply drop shadows to the mark.
- Place the full-color mark on busy photography — use the monochrome variant.
- Change the center token's gradient direction or colors.

## Palette

- Iris blue (diagonal tokens): `#8b9dff`
- Violet (cardinal tokens): `#c77dff`
- Center: gradient `#f5f6fa → #c77dff` at ≥64px; flat `#e8ecff` below.
- Monochrome opacity steps: cardinals `0.45`, diagonals `0.7`, center `1`.
````

- [ ] **Step 2: Commit**

```bash
git add brand/README.md
git commit -m "docs(brand): add brand usage rules"
```

---

### Task 9: Wire the mark into Storybook manager

**Files:**
- Modify: `.storybook/manager.ts`

- [ ] **Step 1: Add `brandImage` to the theme**

Open `.storybook/manager.ts`. In the `create({ ... })` call, locate the lines:

```ts
  brandTitle: 'Cynosure UI',
  brandUrl: 'https://cynosure.arshadshah.com',
  brandTarget: '_self',
```

Replace them with:

```ts
  brandTitle: 'Cynosure UI',
  brandUrl: 'https://cynosure.arshadshah.com',
  brandTarget: '_self',
  brandImage: './brand/cynosure-lockup.svg',
```

The path is relative to Storybook's static-served root; Task 10 will make the `brand/` directory reachable.

- [ ] **Step 2: Verify the file still parses**

Run: `pnpm typecheck --filter=cynosure 2>/dev/null || pnpm exec tsc --noEmit -p .storybook/tsconfig.json 2>/dev/null || true`

(No errors expected from `.storybook/manager.ts` — the added field is already present on the Storybook theme type.)

- [ ] **Step 3: Commit**

```bash
git add .storybook/manager.ts
git commit -m "feat(storybook): use Cynosure lockup as brand image"
```

---

### Task 10: Serve `brand/` from Storybook + add manager/preview head

**Files:**
- Modify: `.storybook/main.ts`
- Create: `.storybook/manager-head.html`
- Create: `.storybook/preview-head.html`

- [ ] **Step 1: Add `brand/` to Storybook's `staticDirs`**

Open `.storybook/main.ts`. Locate:

```ts
  docs: { autodocs: 'tag' },
};
```

Replace with:

```ts
  docs: { autodocs: 'tag' },
  staticDirs: [{ from: '../brand', to: '/brand' }],
};
```

- [ ] **Step 2: Create `.storybook/manager-head.html`**

Write exactly this content:

```html
<!-- Favicon chain for the Storybook manager UI -->
<link rel="icon" type="image/svg+xml" href="/brand/cynosure-mark-favicon.svg" />
<link rel="alternate icon" href="/brand/favicon.ico" />
<link rel="apple-touch-icon" sizes="180x180" href="/brand/apple-touch-icon.png" />

<!-- Open Graph / Twitter share -->
<meta property="og:title" content="Cynosure UI" />
<meta property="og:description" content="A gorgeous, tiny, accessible React UI framework." />
<meta property="og:image" content="/brand/og-image.png" />
<meta property="og:type" content="website" />
<meta name="twitter:card" content="summary_large_image" />
<meta name="twitter:image" content="/brand/og-image.png" />
<meta name="twitter:title" content="Cynosure UI" />
<meta name="twitter:description" content="A gorgeous, tiny, accessible React UI framework." />
```

- [ ] **Step 3: Create `.storybook/preview-head.html`**

Write exactly this content:

```html
<!-- Favicon chain for the Storybook canvas iframe (same as manager) -->
<link rel="icon" type="image/svg+xml" href="/brand/cynosure-mark-favicon.svg" />
<link rel="alternate icon" href="/brand/favicon.ico" />
<link rel="apple-touch-icon" sizes="180x180" href="/brand/apple-touch-icon.png" />
```

- [ ] **Step 4: Verify — build Storybook and inspect output**

Run: `pnpm build-storybook`

Expected: build completes successfully.

Run: `ls storybook-static/brand/`

Expected: lists all 8 brand files (4 SVGs, ICO, 2 PNGs, README.md).

Run: `grep -l "cynosure-lockup.svg\|cynosure-mark-favicon.svg" storybook-static/*.html | head -3`

Expected: at least `storybook-static/index.html` and `storybook-static/iframe.html`.

- [ ] **Step 5: Smoke-test in the dev server**

Run (in another terminal): `pnpm storybook`

Open `http://localhost:6006`. Expected:
- Browser tab shows the mark favicon.
- Storybook sidebar header shows the lockup (mark + "cynosure" wordmark) instead of the plain `Cynosure UI` text.
- Right-click → View page source → `<head>` contains the OG meta tags.

Stop the dev server with Ctrl-C.

- [ ] **Step 6: Commit**

```bash
git add .storybook/main.ts .storybook/manager-head.html .storybook/preview-head.html
git commit -m "feat(storybook): serve brand dir and wire favicon + OG meta"
```

---

### Task 11: Add the lockup hero to the root README

**Files:**
- Modify: `README.md`

- [ ] **Step 1: Replace the top heading with a centered lockup**

Open `README.md`. Replace the first two lines:

```markdown
# Cynosure UI

> A gorgeous, tiny, customisable, accessible React UI framework — designed for production.
```

With:

```markdown
<p align="center">
  <img src="./brand/cynosure-lockup.svg" alt="Cynosure UI" width="360" />
</p>

<p align="center">
  <em>A gorgeous, tiny, customisable, accessible React UI framework — designed for production.</em>
</p>
```

Leave everything below untouched (the badges and install instructions stay as-is).

- [ ] **Step 2: Verify the markdown parses**

Run: `node -e "const s=require('fs').readFileSync('README.md','utf8'); if(!s.startsWith('<p align=\"center\">')) throw new Error('header not applied'); console.log('OK')"`

Expected: `OK`

Preview the README in your editor or on a local markdown viewer. GitHub renders the `<p align="center">` + `<img>` correctly; on npm the image falls back to alt text.

- [ ] **Step 3: Commit**

```bash
git add README.md
git commit -m "docs: add Cynosure lockup hero to README"
```

---

### Task 12: Add `icon` field to published package manifests

**Files:**
- Modify: `package.json`
- Modify: `packages/react/package.json`

- [ ] **Step 1: Add `icon` to the root manifest**

Open `package.json`. Locate the `"version": "0.0.0",` line. Add immediately after it:

```json
  "icon": "brand/cynosure-mark.svg",
```

- [ ] **Step 2: Add `icon` to the React package manifest**

Open `packages/react/package.json`. Locate the top-level `"version"` field. Add a sibling field:

```json
  "icon": "../../brand/cynosure-mark.svg",
```

(Relative path — the published tarball won't include it, but tooling that inspects the workspace will find it.)

- [ ] **Step 3: Verify both manifests parse**

Run:

```bash
node -e "console.log(require('./package.json').icon, require('./packages/react/package.json').icon)"
```

Expected: `brand/cynosure-mark.svg ../../brand/cynosure-mark.svg`

- [ ] **Step 4: Commit**

```bash
git add package.json packages/react/package.json
git commit -m "chore: add icon field to package manifests"
```

---

### Task 13: Final end-to-end verification

- [ ] **Step 1: Clean Storybook build from scratch**

Run: `rm -rf storybook-static && pnpm build-storybook`

Expected: build succeeds.

- [ ] **Step 2: Confirm every asset is served**

Run:

```bash
for f in cynosure-mark.svg cynosure-mark-mono.svg cynosure-mark-favicon.svg cynosure-lockup.svg favicon.ico apple-touch-icon.png og-image.png README.md; do
  test -f "storybook-static/brand/$f" && echo "OK $f" || echo "MISSING $f"
done
```

Expected: 8 `OK` lines, no `MISSING`.

- [ ] **Step 3: Confirm favicon + OG meta are referenced**

Run:

```bash
grep -c "cynosure-mark-favicon.svg" storybook-static/index.html storybook-static/iframe.html
grep -c "og:image" storybook-static/index.html
```

Expected: both iframe.html and index.html contain the favicon link (count ≥ 1 each); `og:image` appears in `index.html` (count ≥ 1).

- [ ] **Step 4: Verify root README renders**

Open `README.md` in a preview. Expected: lockup SVG appears centered at the top, tagline below.

- [ ] **Step 5: Final commit (if any formatting/lint drift)**

Run: `pnpm lint:fix`

If any files changed, commit:

```bash
git add -A
git commit -m "chore(brand): apply lint fixups"
```

If nothing changed, this step is a no-op.

---

## Self-review notes

- **Spec coverage:** All 8 deliverables in the spec's file table are created (Tasks 1–8). Rollout surfaces in the spec's §Rollout map one-to-one onto Tasks 9–12. Success criteria are verified in Task 13.
- **Types:** Only touch point is `.storybook/manager.ts` — `brandImage` is a standard field on `ThemeVars`.
- **YAGNI check:** No animated variant, no vertical lockup, no per-theme recolorings — matches the spec's out-of-scope list.
