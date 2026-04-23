# Docs Site Technical Grid Refresh — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Wholesale visual refresh of `packages/docs` — chrome, homepage, and component doc pages — in the approved Technical Grid direction.

**Architecture:** Layer a new surface/line/muted token set over the existing `@cynosure/tokens`. Split CSS from `site.css` into four focused stylesheets. Replace home-as-MDX with a dedicated `src/pages/index.astro` composed of focused Astro components, and skip `/` in the dynamic `[...slug].astro` route. Redesign `DocLayout.astro` + chrome + content components to match mockups.

**Tech Stack:** Astro 5, TypeScript, vanilla CSS with CSS custom properties, vanilla JS for interactivity (no React island unless already present). Visual source of truth: `.superpowers/brainstorm/46889-1776865156/content/home-mockup.html` and `doc-page-mockup.html`.

**Hard rules (from spec):**

- No emoji. No ASCII-art icons. Inline SVG only.
- Preserve `@cynosure/tokens` semantics: use `accent.solid` not `accent.strong`; `radius.full` not `radius.pill`; no `space 2.5`.
- Respect `prefers-reduced-motion`.
- Every new token ships a light-mode value too.

---

## File Structure

### Phase 0 — Foundation

| File | Responsibility |
|---|---|
| Create `packages/docs/src/styles/tokens-surfaces.css` | Semantic surface/line/muted tokens (dark + light) |
| Create `packages/docs/scripts/component-count.mjs` | Generates `src/generated/component-count.json` at build time |
| Create `packages/docs/src/components/icons/*.astro` | Inline SVG icon set (one per file) |
| Modify `packages/docs/package.json` | Wire count generator into prebuild step |
| Modify `packages/docs/src/styles/site.css` | Slim to root + imports |

### Phase 1 — Chrome

| File | Responsibility |
|---|---|
| Create `packages/docs/src/styles/chrome.css` | Topbar, sidebar, TOC, footer styles |
| Create `packages/docs/src/components/Chrome/CommandMenu.astro` | Input-styled trigger; opens `SearchWidget` in dialog |
| Create `packages/docs/src/components/Chrome/SiteFooter.astro` | 4-col footer |
| Modify `packages/docs/src/components/Chrome/TopBar.astro` | Rearrange to mockup; wrap with command menu |
| Modify `packages/docs/src/components/Chrome/ThemeSwitcher.astro` | Replace `<select>` with 3-state segmented control |
| Modify `packages/docs/src/components/Chrome/VersionPill.astro` | Mono type + updated border |
| Modify `packages/docs/src/components/Chrome/GitHubLink.astro` | Icon-button styling |
| Modify `packages/docs/src/components/Sidebar/Sidebar.astro` | Scroll container + counts header |
| Modify `packages/docs/src/components/Sidebar/SidebarSection.astro` | Mono kicker summary, count chip, active accent bar, localStorage persistence |
| Modify `packages/docs/src/config/sidebar.ts` | Add `count` to each section (driven from generated JSON) |
| Modify `packages/docs/src/components/Toc/Toc.astro` | Mono title, accent bar on active, sub-item styling |

### Phase 2 — Homepage

| File | Responsibility |
|---|---|
| Create `packages/docs/src/styles/home.css` | Homepage section styles |
| Create `packages/docs/src/components/Home/MetricStrip.astro` | 4-metric row under hero |
| Create `packages/docs/src/components/Home/ComponentGallery.astro` | 18-tile live gallery |
| Create `packages/docs/src/components/Home/ThemingPlayground.astro` | Interactive accent/radius/density playground |
| Create `packages/docs/src/components/Home/A11yStrip.astro` | 4 accessibility cards |
| Create `packages/docs/src/components/Home/CodeInContext.astro` | Package-manager tabs + code + demo |
| Create `packages/docs/src/components/Home/BigCTA.astro` | Crosshair-framed CTA |
| Modify `packages/docs/src/components/Home/Hero.astro` | Full rewrite to mockup hero |
| Delete `packages/docs/src/components/Home/FeatureGrid.astro` | Replaced by Gallery + A11yStrip |
| Delete `packages/docs/src/components/Home/Footer.astro` | Replaced by `Chrome/SiteFooter.astro` |
| Delete `packages/docs/src/components/Home/BundleSizeTable.astro` | Bundle size moves to doc-page status row |
| Create `packages/docs/src/pages/index.astro` | New homepage composition |
| Modify `packages/docs/src/pages/[...slug].astro` | Skip `/` route |
| Modify `packages/docs/src/content/docs/index.mdx` | Either delete or convert to non-routed marker (see Task 2.10) |

### Phase 3 — Doc page components

| File | Responsibility |
|---|---|
| Create `packages/docs/src/styles/doc-page.css` | Content/live preview/code/props/callout/pager styles |
| Create `packages/docs/src/components/Doc/Breadcrumb.astro` | Mono caps breadcrumb |
| Create `packages/docs/src/components/Doc/StatusRow.astro` | Stability + version + size + a11y + package pills |
| Create `packages/docs/src/components/Doc/Callout.astro` | Info / warn variants |
| Create `packages/docs/src/components/Doc/VariantGrid.astro` | Bordered multi-column grid |
| Create `packages/docs/src/components/Doc/Pager.astro` | Prev / next cards |
| Modify `packages/docs/src/components/PropsTable.astro` | Grid layout, mono types w/ pipes, required marker |
| Modify `packages/docs/src/components/CodeBlock.astro` | New header + copy; larger mono |
| Modify `packages/docs/src/components/LivePreview/*` | Toolbar with RTL + theme toggle + open-in-new; grid stage |
| Modify `packages/docs/src/layouts/DocLayout.astro` | 3-col grid; wire breadcrumb + status row; wrap article |
| Modify `packages/docs/src/pages/[...slug].astro` | Pass frontmatter to layout (status, size, category) |

### Phase 4 — Wiring + verification

| File | Responsibility |
|---|---|
| Modify `packages/docs/src/layouts/BaseLayout.astro` | Mount topbar + site footer site-wide |

---

## Phase 0 — Foundation

### Task 0.1: Component-count generator script

**Files:**
- Create: `packages/docs/scripts/component-count.mjs`
- Create: `packages/docs/src/generated/component-count.json` (generated output)

- [ ] **Step 1: Write the script**

```js
// packages/docs/scripts/component-count.mjs
import { readdirSync, writeFileSync, mkdirSync, existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const srcRoot = join(__dirname, '..', '..', 'react', 'src');
const outFile = join(__dirname, '..', 'src', 'generated', 'component-count.json');

const CATEGORIES = {
  'forms': 'Forms',
  'overlay': 'Overlay',
  'data-display': 'Data display',
  'feedback': 'Feedback',
  'navigation': 'Navigation',
  'typography': 'Typography',
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
writeFileSync(outFile, JSON.stringify(out, null, 2) + '\n');
console.log(`[component-count] ${total} components`);
```

- [ ] **Step 2: Add to package.json prebuild**

Open `packages/docs/package.json` and locate the `scripts` object. Add a `generate:component-count` script and chain it into whatever currently generates props.

```json
"scripts": {
  "generate:component-count": "node scripts/component-count.mjs",
  "generate": "pnpm generate:props && pnpm generate:component-count",
  "prebuild": "pnpm generate",
  "predev": "pnpm generate"
}
```

If `generate`, `prebuild`, or `predev` already exist, keep their other commands and add `&& pnpm generate:component-count` to the generate chain. Do not remove existing generation steps.

- [ ] **Step 3: Run it and verify**

```bash
cd packages/docs && pnpm generate:component-count
cat src/generated/component-count.json | head -5
```

Expected: JSON with `"total": 98` (exact count may drift; the script is authoritative). File exists.

- [ ] **Step 4: Commit**

```bash
git add packages/docs/scripts/component-count.mjs packages/docs/package.json packages/docs/src/generated/component-count.json
git commit -m "feat(docs): generate component count at build time"
```

---

### Task 0.2: Surface tokens stylesheet

**Files:**
- Create: `packages/docs/src/styles/tokens-surfaces.css`

- [ ] **Step 1: Write the stylesheet**

```css
/* packages/docs/src/styles/tokens-surfaces.css
 * Semantic surface/line/text tokens layered on top of @cynosure/tokens.
 * Dark is the default; light overrides apply when [data-theme="light"]
 * is set on <html>.
 */
:root {
  --docs-surface-1: #12151a;
  --docs-surface-2: #181c22;
  --docs-surface-3: #1f242c;
  --docs-line: rgba(255, 255, 255, 0.08);
  --docs-line-strong: rgba(255, 255, 255, 0.14);
  --docs-grid-line: rgba(255, 255, 255, 0.045);
  --docs-grid-strong: rgba(255, 255, 255, 0.09);
  --docs-muted: #8b95a5;
  --docs-dim: #5a6472;
  --docs-ok: #86efac;
  --docs-warn: #fbbf24;
  --docs-danger: #fca5a5;
  --docs-type-mono: 'JetBrains Mono Variable', ui-monospace, Menlo, monospace;
  --docs-kicker-size: 11px;
  --docs-kicker-tracking: 0.14em;
}

[data-theme='light'] {
  --docs-surface-1: #f7f7f5;
  --docs-surface-2: #efefec;
  --docs-surface-3: #e6e6e2;
  --docs-line: rgba(0, 0, 0, 0.09);
  --docs-line-strong: rgba(0, 0, 0, 0.15);
  --docs-grid-line: rgba(0, 0, 0, 0.05);
  --docs-grid-strong: rgba(0, 0, 0, 0.1);
  --docs-muted: #626a77;
  --docs-dim: #909aa7;
  --docs-ok: #15803d;
  --docs-warn: #b45309;
  --docs-danger: #b91c1c;
}
```

- [ ] **Step 2: Import from site.css**

Open `packages/docs/src/styles/site.css` and add an import near the top, right after the existing `@import` lines:

```css
@import './tokens-surfaces.css';
```

- [ ] **Step 3: Commit**

```bash
git add packages/docs/src/styles/tokens-surfaces.css packages/docs/src/styles/site.css
git commit -m "feat(docs): add surface + line semantic tokens for dark/light"
```

---

### Task 0.3: Icon component set

**Files:**
- Create: `packages/docs/src/components/icons/Search.astro`
- Create: `packages/docs/src/components/icons/GitHub.astro`
- Create: `packages/docs/src/components/icons/Sun.astro`
- Create: `packages/docs/src/components/icons/Moon.astro`
- Create: `packages/docs/src/components/icons/System.astro`
- Create: `packages/docs/src/components/icons/Copy.astro`
- Create: `packages/docs/src/components/icons/Info.astro`
- Create: `packages/docs/src/components/icons/Warn.astro`
- Create: `packages/docs/src/components/icons/ArrowRight.astro`
- Create: `packages/docs/src/components/icons/ArrowLeft.astro`
- Create: `packages/docs/src/components/icons/Chevron.astro`
- Create: `packages/docs/src/components/icons/External.astro`

- [ ] **Step 1: Write a shared icon shape**

Every icon file takes an optional `size` (default 16) and passes the rest to the `<svg>`. Same template for all; only the inner paths change. Write `Search.astro` as the template:

```astro
---
interface Props { size?: number; class?: string }
const { size = 16, class: className } = Astro.props;
---
<svg
  width={size}
  height={size}
  viewBox="0 0 24 24"
  fill="none"
  stroke="currentColor"
  stroke-width="2"
  stroke-linecap="round"
  stroke-linejoin="round"
  aria-hidden="true"
  class:list={[className]}
>
  <circle cx="11" cy="11" r="7" />
  <path d="m20 20-3-3" />
</svg>
```

- [ ] **Step 2: Paste inner paths for each remaining icon**

Same template; only the children change. Copy verbatim from `.superpowers/brainstorm/46889-1776865156/content/home-mockup.html` and `doc-page-mockup.html`. Paths per icon:

- `GitHub.astro` — use the full GitHub logo `<path>` from the mockup (note: GitHub uses `fill="currentColor"` instead of stroke; write a separate template for it)
- `Sun.astro` — `<circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/>`
- `Moon.astro` — `<path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z"/>`
- `System.astro` — `<rect x="3" y="4" width="18" height="14" rx="2"/><path d="M8 21h8M12 18v3"/>`
- `Copy.astro` — `<rect x="9" y="9" width="12" height="12" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>`
- `Info.astro` — `<circle cx="12" cy="12" r="10"/><path d="M12 8v4M12 16h.01"/>`
- `Warn.astro` — `<path d="M10.3 3.9L1.8 18a2 2 0 0 0 1.7 3h17a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0z"/><path d="M12 9v4M12 17h.01"/>`
- `ArrowRight.astro` — `<path d="M5 12h14M13 5l7 7-7 7"/>`
- `ArrowLeft.astro` — `<path d="M19 12H5M11 5l-7 7 7 7"/>`
- `Chevron.astro` — `<path d="M9 6l6 6-6 6"/>`
- `External.astro` — `<path d="M14 5h5v5"/><path d="M9 15l10-10"/><path d="M19 14v5a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V6a1 1 0 0 1 1-1h5"/>`

For `GitHub.astro` the template differs (fill, no stroke) — write it as:

```astro
---
interface Props { size?: number; class?: string }
const { size = 16, class: className } = Astro.props;
---
<svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" class:list={[className]}>
  <path d="M12 .5A12 12 0 0 0 0 12.5c0 5.3 3.4 9.8 8.2 11.4.6.1.8-.3.8-.6v-2.2c-3.3.7-4-1.4-4-1.4-.5-1.3-1.3-1.7-1.3-1.7-1.1-.7.1-.7.1-.7 1.2.1 1.8 1.2 1.8 1.2 1 1.8 2.8 1.3 3.5 1 .1-.8.4-1.3.7-1.6-2.7-.3-5.5-1.3-5.5-5.9 0-1.3.5-2.4 1.2-3.2-.1-.3-.5-1.5.1-3.2 0 0 1-.3 3.3 1.2a11 11 0 0 1 6 0C17.4 4 18.4 4.3 18.4 4.3c.6 1.7.2 2.9.1 3.2.8.8 1.2 1.9 1.2 3.2 0 4.6-2.8 5.6-5.5 5.9.4.4.8 1.1.8 2.2v3.3c0 .3.2.7.8.6A12 12 0 0 0 24 12.5 12 12 0 0 0 12 .5z"/>
</svg>
```

- [ ] **Step 3: Verify build still passes**

```bash
cd packages/docs && pnpm typecheck
```

Expected: no errors.

- [ ] **Step 4: Commit**

```bash
git add packages/docs/src/components/icons/
git commit -m "feat(docs): add inline SVG icon set for chrome and content"
```

---

## Phase 1 — Chrome

All Phase 1 tasks may be executed in parallel after Phase 0 completes.

### Task 1.1: Chrome stylesheet

**Files:**
- Create: `packages/docs/src/styles/chrome.css`

- [ ] **Step 1: Write chrome.css**

Port the chrome-related CSS from `.superpowers/brainstorm/46889-1776865156/content/home-mockup.html` — sections `/* TOPBAR */` and the footer section — plus the sidebar/TOC sections from `doc-page-mockup.html`. Substitute tokens:

- Replace `var(--bg)` → `var(--color-bg, canvas)`
- Replace `var(--fg)` → `var(--color-fg, canvastext)`
- Replace `var(--surface-1)` → `var(--docs-surface-1)`
- Replace `var(--surface-2)` → `var(--docs-surface-2)`
- Replace `var(--surface-3)` → `var(--docs-surface-3)`
- Replace `var(--line)` → `var(--docs-line)`
- Replace `var(--muted)` → `var(--docs-muted)`
- Replace `var(--dim)` → `var(--docs-dim)`
- Replace `var(--accent)` → `var(--color-accent-solid)`
- Replace `'JetBrains Mono'` → `var(--docs-type-mono)`

Scope selectors to the existing `data-*` attributes already used by the components (`[data-topbar]`, `[data-brand-lockup]`, `[data-version-pill]`, `[data-sidebar]`, `[data-toc]`). Add new scoping attributes as needed: `[data-cmdk]`, `[data-theme-seg]`, `[data-site-footer]`, `[data-sidebar-section]`.

Include the full selector tree for: topbar, brand mark, version pill, cmdk trigger (`[data-cmdk]`), theme segmented control (`[data-theme-seg]`), sidebar (nav-group summary, nav-list, active state with accent bar, count chip), TOC (mono title, accent bar, sub items), and site footer.

- [ ] **Step 2: Import from site.css**

Add to `site.css` after `tokens-surfaces.css` import:

```css
@import './chrome.css';
```

- [ ] **Step 3: Remove now-duplicate rules from site.css**

Delete the existing `[data-topbar]`, `[data-brand-lockup]`, `[data-version-pill]`, `[data-search]`, sidebar, and TOC rule blocks from `site.css` — they're fully replaced by `chrome.css`.

- [ ] **Step 4: Commit**

```bash
git add packages/docs/src/styles/chrome.css packages/docs/src/styles/site.css
git commit -m "feat(docs): extract and redesign chrome stylesheet"
```

---

### Task 1.2: CommandMenu trigger component

**Files:**
- Create: `packages/docs/src/components/Chrome/CommandMenu.astro`

- [ ] **Step 1: Write the trigger**

```astro
---
import Search from '../icons/Search.astro';
import SearchWidget from './SearchWidget.astro';
---
<button type="button" data-cmdk aria-haspopup="dialog" aria-label="Open search">
  <Search size={14} />
  <span data-cmdk-placeholder>Search components, guides, tokens…</span>
  <span data-cmdk-kbd>
    <kbd>⌘</kbd><kbd>K</kbd>
  </span>
</button>

<dialog data-cmdk-dialog aria-label="Search">
  <SearchWidget />
</dialog>

<script>
  const btn = document.querySelector<HTMLButtonElement>('[data-cmdk]');
  const dlg = document.querySelector<HTMLDialogElement>('[data-cmdk-dialog]');
  btn?.addEventListener('click', () => dlg?.showModal());
  document.addEventListener('keydown', (e) => {
    if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
      e.preventDefault();
      if (dlg?.open) dlg.close();
      else dlg?.showModal();
    }
    if (e.key === 'Escape' && dlg?.open) dlg.close();
  });
  dlg?.addEventListener('click', (e) => {
    if (e.target === dlg) dlg.close();
  });
</script>
```

- [ ] **Step 2: Add dialog styling to chrome.css**

Append to `chrome.css`:

```css
[data-cmdk-dialog] {
  border: 1px solid var(--docs-line);
  border-radius: 12px;
  padding: 0;
  background: var(--docs-surface-1);
  color: var(--color-fg);
  max-width: 640px;
  width: 90vw;
  box-shadow: 0 24px 80px rgba(0,0,0,0.5);
}
[data-cmdk-dialog]::backdrop {
  background: rgba(0,0,0,0.5);
  backdrop-filter: blur(4px);
}
```

- [ ] **Step 3: Typecheck**

```bash
cd packages/docs && pnpm typecheck
```

Expected: pass.

- [ ] **Step 4: Commit**

```bash
git add packages/docs/src/components/Chrome/CommandMenu.astro packages/docs/src/styles/chrome.css
git commit -m "feat(docs): add ⌘K command menu trigger wrapping SearchWidget"
```

---

### Task 1.3: Redesigned TopBar

**Files:**
- Modify: `packages/docs/src/components/Chrome/TopBar.astro`

- [ ] **Step 1: Replace TopBar.astro**

```astro
---
import BrandLockup from './BrandLockup.astro';
import VersionPill from './VersionPill.astro';
import CommandMenu from './CommandMenu.astro';
import ThemeSwitcher from './ThemeSwitcher.astro';
import GitHubLink from './GitHubLink.astro';
---
<header data-topbar>
  <BrandLockup />
  <VersionPill />
  <CommandMenu />
  <span data-topbar-spacer></span>
  <div data-topbar-right>
    <GitHubLink />
    <ThemeSwitcher />
  </div>
</header>
```

- [ ] **Step 2: Commit**

```bash
git add packages/docs/src/components/Chrome/TopBar.astro
git commit -m "feat(docs): rearrange topbar to command-menu layout"
```

---

### Task 1.4: Three-state ThemeSwitcher

**Files:**
- Modify: `packages/docs/src/components/Chrome/ThemeSwitcher.astro`

- [ ] **Step 1: Replace the file**

```astro
---
import Sun from '../icons/Sun.astro';
import Moon from '../icons/Moon.astro';
import System from '../icons/System.astro';
---
<div data-theme-seg role="group" aria-label="Theme">
  <button type="button" data-theme-opt="light" aria-label="Light"><Sun size={14} /></button>
  <button type="button" data-theme-opt="system" aria-label="System"><System size={14} /></button>
  <button type="button" data-theme-opt="dark" aria-label="Dark"><Moon size={14} /></button>
</div>

<script>
  import { applyTheme, getCurrentTheme, type Theme } from '../../lib/ui/theme.js';

  function sync(): void {
    const current = getCurrentTheme();
    document.querySelectorAll<HTMLButtonElement>('[data-theme-opt]').forEach((b) => {
      b.toggleAttribute('data-active', b.dataset.themeOpt === current);
    });
  }

  function init(): void {
    document.querySelectorAll<HTMLButtonElement>('[data-theme-opt]').forEach((b) => {
      if (b.dataset.themeBound === 'true') return;
      b.dataset.themeBound = 'true';
      b.addEventListener('click', () => {
        applyTheme(b.dataset.themeOpt as Theme);
        sync();
      });
    });
    sync();
  }

  init();
  document.addEventListener('astro:page-load', init);
</script>
```

- [ ] **Step 2: Verify `applyTheme` accepts 'light' | 'system' | 'dark'**

```bash
grep -n "type Theme" packages/docs/src/lib/ui/theme.ts
```

If `Theme` doesn't already include `'system'`, check the existing `THEMES` array in `lib/theme-init.ts` — if these three values differ, keep the union consistent with `THEMES` and stop here to flag the mismatch. Do not invent theme values.

- [ ] **Step 3: Typecheck**

```bash
cd packages/docs && pnpm typecheck
```

- [ ] **Step 4: Commit**

```bash
git add packages/docs/src/components/Chrome/ThemeSwitcher.astro
git commit -m "feat(docs): replace theme select with 3-state segmented control"
```

---

### Task 1.5: Sidebar with counts and persistence

**Files:**
- Modify: `packages/docs/src/config/sidebar.ts`
- Modify: `packages/docs/src/components/Sidebar/Sidebar.astro`
- Modify: `packages/docs/src/components/Sidebar/SidebarSection.astro`

- [ ] **Step 1: Extend `SidebarSection` type with `count`**

Edit `packages/docs/src/config/sidebar.ts`:

```ts
export interface SidebarSection {
  title: string;
  links: SidebarLink[];
  count?: number;
}
```

Leave the section data untouched; `count` will be filled at render time from the generated JSON (next step).

- [ ] **Step 2: Rewrite `Sidebar.astro` to merge counts**

```astro
---
import { sidebar } from '../../config/sidebar';
import counts from '../../generated/component-count.json';
import SidebarSection from './SidebarSection.astro';

const titleToKey: Record<string, string> = {
  'Components — Forms': 'forms',
  'Components — Overlay': 'overlay',
  'Components — Data display': 'data-display',
  'Components — Feedback': 'feedback',
  'Components — Navigation': 'navigation',
  'Components — Typography': 'typography',
  'Components — Layout': 'primitives/layout',
};

const withCounts = sidebar.map((s) => {
  const key = titleToKey[s.title];
  const c = key ? (counts as any).categories?.[key]?.count : undefined;
  return { ...s, count: c };
});

const current = Astro.url.pathname.replace(/\/$/, '');
---
<aside data-sidebar>
  {withCounts.map((s) => <SidebarSection section={s} current={current} />)}
</aside>
```

- [ ] **Step 3: Rewrite `SidebarSection.astro`**

```astro
---
import type { SidebarSection } from '../../config/sidebar';
import Chevron from '../icons/Chevron.astro';

interface Props { section: SidebarSection; current: string }
const { section, current } = Astro.props;
const storageKey = `cynosure-nav:${section.title}`;
---
<details data-sidebar-section data-key={storageKey} open>
  <summary>
    <Chevron size={10} />
    <span>{section.title}</span>
    {section.count !== undefined ? <span data-sidebar-count>{section.count}</span> : null}
  </summary>
  <ul>
    {section.links.map((l) => (
      <li data-current={current === l.href ? '' : undefined}>
        <a href={l.href}>{l.title}</a>
        {l.status ? <span data-status={l.status} data-sidebar-status>{l.status}</span> : null}
      </li>
    ))}
  </ul>
</details>

<script>
  function init(): void {
    document.querySelectorAll<HTMLDetailsElement>('[data-sidebar-section]').forEach((d) => {
      const key = d.dataset.key;
      if (!key) return;
      const saved = localStorage.getItem(key);
      if (saved === 'closed') d.open = false;
      if (saved === 'open') d.open = true;
      d.addEventListener('toggle', () => {
        localStorage.setItem(key, d.open ? 'open' : 'closed');
      });
    });
  }
  init();
  document.addEventListener('astro:page-load', init);
</script>
```

- [ ] **Step 4: Verify dev server renders sidebar with counts**

```bash
cd packages/docs && pnpm dev
# in browser: open http://localhost:4321/getting-started/introduction
# confirm the Forms/Overlay/etc. sections show their count numbers
# Ctrl+C when done
```

- [ ] **Step 5: Commit**

```bash
git add packages/docs/src/config/sidebar.ts packages/docs/src/components/Sidebar/
git commit -m "feat(docs): sidebar with live counts and persistent section state"
```

---

### Task 1.6: Redesigned TOC

**Files:**
- Modify: `packages/docs/src/components/Toc/Toc.astro`

- [ ] **Step 1: Update the markup**

Replace the template portion of `Toc.astro` (keep the existing IntersectionObserver script intact):

```astro
---
import type { MarkdownHeading } from 'astro';
interface Props { headings: MarkdownHeading[] }
const { headings } = Astro.props;
const filtered = headings.filter((h) => h.depth >= 2 && h.depth <= 3);
---
<nav data-toc aria-label="On this page">
  <p data-toc-title>On this page</p>
  <ul>
    {filtered.map((h) => (
      <li data-depth={h.depth}>
        <a href={`#${h.slug}`}>{h.text}</a>
      </li>
    ))}
  </ul>
</nav>
```

- [ ] **Step 2: Verify chrome.css covers the new `[data-toc]` styling**

Grep `chrome.css` for `[data-toc]` — it must include: mono uppercase title, left-border rail, active-link accent bar, sub-item indent. If missing, add from `doc-page-mockup.html` CSS (`.toc-title`, `.toc`, `.toc a`, `.toc a.active`, `.toc a.sub` rules — map `.toc-title` → `[data-toc-title]`, `.toc` → `[data-toc] ul`, `.toc a.sub` → `[data-toc] [data-depth="3"] a`, `.toc a.active` → `[data-toc] a[data-active]`).

- [ ] **Step 3: Commit**

```bash
git add packages/docs/src/components/Toc/Toc.astro packages/docs/src/styles/chrome.css
git commit -m "feat(docs): restyle TOC with mono title and accent-bar active state"
```

---

### Task 1.7: Site footer

**Files:**
- Create: `packages/docs/src/components/Chrome/SiteFooter.astro`

- [ ] **Step 1: Write the footer**

```astro
---
import BrandLockup from './BrandLockup.astro';
import { site } from '../../config/site';
---
<footer data-site-footer>
  <div data-site-footer-cols>
    <div>
      <BrandLockup />
      <p data-footer-tagline>{site.description}</p>
    </div>
    <nav>
      <h4>Docs</h4>
      <ul>
        <li><a href="/getting-started/introduction">Getting started</a></li>
        <li><a href="/components/button">Components</a></li>
        <li><a href="/foundations/design-principles">Foundations</a></li>
        <li><a href="/recipes">Recipes</a></li>
      </ul>
    </nav>
    <nav>
      <h4>Project</h4>
      <ul>
        <li><a href={site.github}>GitHub</a></li>
        <li><a href="/changelog">Changelog</a></li>
        <li><a href="/roadmap">Roadmap</a></li>
        <li><a href={`${site.github}/blob/main/CONTRIBUTING.md`}>Contributing</a></li>
      </ul>
    </nav>
    <nav>
      <h4>Community</h4>
      <ul>
        <li><a href={`${site.github}/discussions`}>Discussions</a></li>
        <li><a href={`${site.github}/issues`}>Issues</a></li>
        <li><a href={`${site.github}/blob/main/LICENSE`}>License</a></li>
      </ul>
    </nav>
  </div>
  <div data-site-footer-bottom>
    <span>© {new Date().getFullYear()} · MIT · v{site.version}</span>
    <span>Built with Astro</span>
  </div>
</footer>
```

- [ ] **Step 2: Ensure `chrome.css` has `[data-site-footer]` rules**

Verify Task 1.1 included these selectors; if not, append them now (port from `home-mockup.html` `footer.site` styles, swapping `.foot-cols` → `[data-site-footer-cols]`, `.foot-bottom` → `[data-site-footer-bottom]`).

- [ ] **Step 3: Commit**

```bash
git add packages/docs/src/components/Chrome/SiteFooter.astro packages/docs/src/styles/chrome.css
git commit -m "feat(docs): add site-wide footer component"
```

---

### Task 1.8: Mount topbar + footer in BaseLayout

**Files:**
- Modify: `packages/docs/src/layouts/BaseLayout.astro`

- [ ] **Step 1: Update BaseLayout**

```astro
---
import { getThemeInitScript } from '../lib/theme-init';
import '../styles/site.css';
import { site } from '../config/site';
import TopBar from '../components/Chrome/TopBar.astro';
import SiteFooter from '../components/Chrome/SiteFooter.astro';

interface Props { title: string; description: string; bare?: boolean }
const { title, description, bare = false } = Astro.props;
const initScript = getThemeInitScript();
---
<!doctype html>
<html lang="en" dir="ltr">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>{title} — {site.name}</title>
    <meta name="description" content={description} />
    <link rel="icon" href="/favicon.ico" />
    <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
    <meta property="og:image" content="/og-image.png" />
    <meta property="og:title" content={title} />
    <meta property="og:description" content={description} />
    <script is:inline set:html={initScript}></script>
  </head>
  <body>
    {bare ? <slot /> : (
      <>
        <TopBar />
        <slot />
        <SiteFooter />
      </>
    )}
  </body>
</html>
```

- [ ] **Step 2: Remove `<TopBar />` from DocLayout**

Open `packages/docs/src/layouts/DocLayout.astro` and delete the `<TopBar />` line and the `import TopBar`. BaseLayout renders it now.

- [ ] **Step 3: Typecheck**

```bash
cd packages/docs && pnpm typecheck
```

- [ ] **Step 4: Commit**

```bash
git add packages/docs/src/layouts/BaseLayout.astro packages/docs/src/layouts/DocLayout.astro
git commit -m "feat(docs): mount topbar + site footer in BaseLayout"
```

---

## Phase 2 — Homepage

All Phase 2 tasks may be executed in parallel after Phase 0.

### Task 2.1: Home stylesheet

**Files:**
- Create: `packages/docs/src/styles/home.css`

- [ ] **Step 1: Port all homepage CSS from `home-mockup.html`**

Port these mockup rule groups, each scoped behind a top-level `[data-home]` attribute so home styles do not leak site-wide. Rename class selectors to data attributes per the table below:

| Mockup selector | New selector |
|---|---|
| `.hero` | `[data-home-hero]` |
| `.hero-inner` | `[data-home-hero-inner]` |
| `.crosshair` | `[data-crosshair]` |
| `.metrics` | `[data-metric-strip]` |
| `section.band` | `[data-home-band]` |
| `.section-head` | `[data-home-head]` |
| `.gallery` | `[data-gallery]` |
| `.tile` | `[data-gallery-tile]` |
| `.theming` | `[data-theming]` |
| `.controls` | `[data-theming-controls]` |
| `.seg` | `[data-seg]` |
| `.preview-pane` | `[data-theming-preview]` |
| `.a11y` | `[data-a11y-strip]` |
| `.code-grid` | `[data-code-grid]` |
| `.big-cta` | `[data-big-cta]` |
| `.btn.primary` / `.btn.ghost` | `[data-btn="primary"]` / `[data-btn="ghost"]` |
| `.install` | `[data-install-snippet]` |
| `.kicker` | `[data-kicker]` |

Token substitutions as in Task 1.1 (`--bg` → `--color-bg`, `--surface-*` → `--docs-surface-*`, etc.).

**Additionally wrap the hero grid-pan animation with reduced-motion:**

```css
@media (prefers-reduced-motion: reduce) {
  [data-home-hero]::before { animation: none !important; }
}
```

- [ ] **Step 2: Import from site.css**

Append to `site.css`:

```css
@import './home.css';
```

- [ ] **Step 3: Commit**

```bash
git add packages/docs/src/styles/home.css packages/docs/src/styles/site.css
git commit -m "feat(docs): add home.css with hero, gallery, theming, CTA styles"
```

---

### Task 2.2: MetricStrip

**Files:**
- Create: `packages/docs/src/components/Home/MetricStrip.astro`

- [ ] **Step 1: Write the component**

```astro
---
import counts from '../../generated/component-count.json';
const total = (counts as { total: number }).total;
---
<div data-metric-strip>
  <span><b>{total}</b>Components</span>
  <span><b>0</b>Runtime deps</span>
  <span><b>WCAG 2.2</b>AA</span>
  <span><b>MIT</b>Licensed</span>
</div>
```

- [ ] **Step 2: Commit**

```bash
git add packages/docs/src/components/Home/MetricStrip.astro
git commit -m "feat(docs): add hero metric strip with live component count"
```

---

### Task 2.3: Hero rewrite

**Files:**
- Modify: `packages/docs/src/components/Home/Hero.astro`

- [ ] **Step 1: Rewrite Hero.astro**

```astro
---
import { site } from '../../config/site';
import CopyButton from '../CopyButton.astro';
import MetricStrip from './MetricStrip.astro';
import ArrowRight from '../icons/ArrowRight.astro';
---
<section data-home-hero>
  <span data-crosshair style="top:40px;left:40px"></span>
  <span data-crosshair style="top:40px;right:40px"></span>
  <span data-crosshair style="bottom:24px;left:40px"></span>
  <span data-crosshair style="bottom:24px;right:40px"></span>
  <div data-home-hero-inner>
    <span data-kicker>{site.name} · v{site.version}</span>
    <h1>The component library<br />that gets <em>out of the way</em>.</h1>
    <p data-home-hero-sub>
      Accessible, tree-shakeable React components. Themed with design tokens. Zero runtime dependencies.
    </p>
    <div data-home-hero-cta>
      <a href="/getting-started/introduction" data-btn="primary">
        Get started <ArrowRight size={14} />
      </a>
      <a href="/components/button" data-btn="ghost">Browse components</a>
    </div>
    <div data-install-snippet>
      <code>npx cynosure init</code>
      <CopyButton code="npx cynosure init" />
    </div>
    <MetricStrip />
  </div>
</section>
```

- [ ] **Step 2: Commit**

```bash
git add packages/docs/src/components/Home/Hero.astro
git commit -m "feat(docs): rewrite hero with grid backdrop and metric strip"
```

---

### Task 2.4: Component Gallery

**Files:**
- Create: `packages/docs/src/components/Home/ComponentGallery.astro`

- [ ] **Step 1: Write the gallery**

```astro
---
import counts from '../../generated/component-count.json';
const total = (counts as { total: number }).total;

// 18 photogenic components to feature. Each tile renders a static mini preview
// (inline SVG/HTML) for performance — no React hydration on the homepage.
const tiles: Array<{ name: string; href: string; preview: string }> = [
  { name: 'Button',   href: '/components/button',   preview: 'button' },
  { name: 'Badge',    href: '/components/badge',    preview: 'badge' },
  { name: 'Switch',   href: '/components/switch',   preview: 'switch' },
  { name: 'Avatar',   href: '/components/avatar',   preview: 'avatar' },
  { name: 'Slider',   href: '/components/slider',   preview: 'slider' },
  { name: 'Spinner',  href: '/components/spinner',  preview: 'spinner' },
  { name: 'Tag',      href: '/components/tag',      preview: 'tag' },
  { name: 'Progress', href: '/components/progress', preview: 'progress' },
  { name: 'Input',    href: '/components/input',    preview: 'input' },
  { name: 'Select',   href: '/components/select',   preview: 'select' },
  { name: 'Tabs',     href: '/components/tabs',     preview: 'tabs' },
  { name: 'Checkbox', href: '/components/checkbox', preview: 'checkbox' },
  { name: 'Radio',    href: '/components/radio',    preview: 'radio' },
  { name: 'Alert',    href: '/components/alert',    preview: 'alert' },
  { name: 'Tooltip',  href: '/components/tooltip',  preview: 'tooltip' },
  { name: 'Toast',    href: '/components/toast',    preview: 'toast' },
  { name: 'Card',     href: '/components/card',     preview: 'card' },
  { name: 'Dialog',   href: '/components/dialog',   preview: 'dialog' },
];
---
<section data-home-band>
  <div data-home-container>
    <div data-home-head>
      <div>
        <span data-kicker>On this site / 01</span>
        <h2>{total} components, every one live on this page.</h2>
      </div>
      <a href="/components/button" data-home-more>See all components →</a>
    </div>
    <div data-gallery>
      {tiles.map((t) => (
        <a href={t.href} data-gallery-tile data-preview={t.preview}>
          <div data-gallery-preview></div>
          <span data-gallery-label>{t.name}</span>
        </a>
      ))}
    </div>
  </div>
</section>
```

- [ ] **Step 2: Port the mini-preview CSS into `home.css`**

Port the `.m-btn`, `.m-badge`, `.m-switch`, `.m-avatar`, `.m-slider`, `.m-spinner`, `.m-tag`, `.m-progress`, `.m-input`, `.m-select`, `.m-tabs`, `.m-check`, `.m-radio`, `.m-alert`, `.m-tooltip`, `.m-toast`, `.m-card`, `.m-dialog` styles from `home-mockup.html`, rewritten as attribute selectors:

```css
[data-preview='button'] [data-gallery-preview]::after {
  content: 'Save'; /* … etc. */
}
```

**OR** (simpler): render the actual preview markup inline in the component instead of pure CSS. Replace the empty `<div data-gallery-preview></div>` per tile with a `{t.preview === 'button' ? <span class="m-btn">Save</span> : …}` switch. Use whichever is simpler for the engineer; keep the styles identical to the mockup.

- [ ] **Step 3: Commit**

```bash
git add packages/docs/src/components/Home/ComponentGallery.astro packages/docs/src/styles/home.css
git commit -m "feat(docs): add 18-tile component gallery with live previews"
```

---

### Task 2.5: ThemingPlayground

**Files:**
- Create: `packages/docs/src/components/Home/ThemingPlayground.astro`

- [ ] **Step 1: Write the component**

```astro
---
---
<section data-home-band>
  <div data-home-container>
    <div data-home-head>
      <div>
        <span data-kicker>Tokens / 02</span>
        <h2>Themeable down to the radius.</h2>
      </div>
      <a href="/foundations/design-tokens" data-home-more>Read the token guide →</a>
    </div>
    <div data-theming>
      <div data-theming-controls>
        <div data-control-group>
          <label>Accent</label>
          <div data-swatches>
            <button type="button" data-sw data-accent="#7dd3fc" data-active style="background:#7dd3fc"></button>
            <button type="button" data-sw data-accent="#34d399" style="background:#34d399"></button>
            <button type="button" data-sw data-accent="#fbbf24" style="background:#fbbf24"></button>
            <button type="button" data-sw data-accent="#c084fc" style="background:#c084fc"></button>
            <button type="button" data-sw data-accent="#f87171" style="background:#f87171"></button>
          </div>
        </div>
        <div data-control-group>
          <label>Radius</label>
          <div data-seg>
            <button type="button" data-radius="4px">sharp</button>
            <button type="button" data-radius="8px" data-active>soft</button>
            <button type="button" data-radius="14px">round</button>
          </div>
        </div>
        <div data-control-group>
          <label>Density</label>
          <div data-seg>
            <button type="button" data-density="6px 10px">compact</button>
            <button type="button" data-density="10px 16px" data-active>default</button>
            <button type="button" data-density="14px 22px">cozy</button>
          </div>
        </div>
      </div>
      <div data-theming-preview id="theming-preview">
        <button data-pv-btn style="padding:var(--pv-density);border-radius:var(--pv-radius);background:var(--pv-accent);color:#0b0d10;border:none;font:inherit;font-size:13px;font-weight:500">Primary</button>
        <div data-pv-input style="border-radius:var(--pv-radius);padding:var(--pv-density);border:1px solid var(--docs-line);background:var(--docs-surface-2);font-size:13px">name@domain.com</div>
        <div data-pv-card style="display:flex;align-items:center;gap:10px;padding:12px;background:var(--docs-surface-2);border:1px solid var(--docs-line);border-radius:var(--pv-radius);font-size:13px">
          <span style="width:28px;height:28px;border-radius:50%;background:linear-gradient(135deg,#a78bfa,#ec4899)"></span>
          <span>Avery Chen</span>
          <span style="margin-left:auto;width:32px;height:18px;border-radius:999px;background:var(--pv-accent);position:relative"><span style="position:absolute;top:2px;left:16px;width:14px;height:14px;background:#fff;border-radius:50%"></span></span>
        </div>
        <div style="display:flex;align-items:center;gap:10px;padding:var(--pv-density);background:var(--docs-surface-2);border:1px solid var(--docs-line);border-radius:var(--pv-radius);font-size:13px">
          <span style="width:16px;height:16px;background:var(--pv-accent);border-radius:3px"></span>
          Publish immediately
        </div>
      </div>
    </div>
  </div>
</section>

<script>
  const preview = document.getElementById('theming-preview');
  if (preview) {
    preview.style.setProperty('--pv-accent', '#7dd3fc');
    preview.style.setProperty('--pv-radius', '8px');
    preview.style.setProperty('--pv-density', '10px 16px');
  }

  function bindGroup(attr: string, cssVar: string): void {
    document.querySelectorAll<HTMLButtonElement>(`[data-${attr}]`).forEach((btn) => {
      if (btn.dataset.bound === 'true') return;
      btn.dataset.bound = 'true';
      btn.addEventListener('click', () => {
        const value = btn.getAttribute(`data-${attr}`);
        if (!value || !preview) return;
        preview.style.setProperty(cssVar, value);
        btn.parentElement
          ?.querySelectorAll<HTMLButtonElement>(`[data-${attr}]`)
          .forEach((b) => b.removeAttribute('data-active'));
        btn.setAttribute('data-active', '');
      });
    });
  }

  bindGroup('accent', '--pv-accent');
  bindGroup('radius', '--pv-radius');
  bindGroup('density', '--pv-density');
</script>
```

- [ ] **Step 2: Commit**

```bash
git add packages/docs/src/components/Home/ThemingPlayground.astro
git commit -m "feat(docs): add interactive accent/radius/density playground"
```

---

### Task 2.6: A11yStrip

**Files:**
- Create: `packages/docs/src/components/Home/A11yStrip.astro`

- [ ] **Step 1: Write it**

```astro
---
import Info from '../icons/Info.astro';
const cards = [
  { title: 'Keyboard-first', body: 'Every interactive component tested under keyboard-only navigation.', meta: 'arrow-keys · focus traps · skip links' },
  { title: 'Focus visible',  body: 'High-contrast focus rings that survive themes, gradients, and glass.', meta: ':focus-visible · 3:1 min contrast' },
  { title: 'Reduced motion', body: 'Every transition honors prefers-reduced-motion. No shaking, no opt-out.', meta: 'honored by default' },
  { title: 'Audited',        body: 'Continuous axe-core and Playwright a11y checks in CI.', meta: 'axe-core · 0 violations' },
];
---
<section data-home-band>
  <div data-home-container>
    <div data-home-head>
      <div>
        <span data-kicker>Accessibility / 03</span>
        <h2>Built on practice, not promise.</h2>
      </div>
    </div>
    <div data-a11y-strip>
      {cards.map((c) => (
        <div data-a11y-card>
          <Info size={22} />
          <h3>{c.title}</h3>
          <p>{c.body}</p>
          <div data-a11y-meta>{c.meta}</div>
        </div>
      ))}
    </div>
  </div>
</section>
```

- [ ] **Step 2: Commit**

```bash
git add packages/docs/src/components/Home/A11yStrip.astro
git commit -m "feat(docs): add accessibility card strip"
```

---

### Task 2.7: CodeInContext

**Files:**
- Create: `packages/docs/src/components/Home/CodeInContext.astro`

- [ ] **Step 1: Write it**

```astro
---
const tabs = ['npm', 'pnpm', 'bun'];
---
<section data-home-band>
  <div data-home-container>
    <div data-home-head>
      <div>
        <span data-kicker>Usage / 04</span>
        <h2>Composition, not configuration.</h2>
      </div>
    </div>
    <div data-code-grid>
      <div data-code-side>
        <div data-code-tabs>
          {tabs.map((t, i) => (
            <button type="button" data-code-tab={t} data-active={i === 0 ? '' : undefined}>{t}</button>
          ))}
        </div>
        <pre data-code-pane><code id="home-install-cmd">npm install @cynosure/react</code>

<span style="color:var(--docs-dim);font-style:italic">// compose</span>
import &#123; Stack, Button, Input &#125; from '@cynosure/react';

export function SignIn() &#123;
  return (
    &lt;Stack gap="4"&gt;
      &lt;Input label="Email" /&gt;
      &lt;Input label="Password" type="password" /&gt;
      &lt;Button variant="primary"&gt;Sign in&lt;/Button&gt;
    &lt;/Stack&gt;
  );
&#125;</pre>
      </div>
      <div data-demo-side>
        <div style="width:100%;max-width:320px;display:flex;flex-direction:column;gap:12px">
          <label style="font-size:11px;color:var(--docs-muted)">Email
            <input type="email" placeholder="name@domain.com" style="display:block;width:100%;margin-top:4px;padding:10px 12px;background:var(--docs-surface-2);border:1px solid var(--docs-line);border-radius:6px;color:var(--color-fg);font:inherit;font-size:13px" />
          </label>
          <label style="font-size:11px;color:var(--docs-muted)">Password
            <input type="password" placeholder="••••••••" style="display:block;width:100%;margin-top:4px;padding:10px 12px;background:var(--docs-surface-2);border:1px solid var(--docs-line);border-radius:6px;color:var(--color-fg);font:inherit;font-size:13px" />
          </label>
          <button type="button" style="padding:11px;border-radius:8px;background:var(--color-fg);color:var(--color-bg);border:none;font:inherit;font-size:13px;font-weight:500">Sign in</button>
        </div>
      </div>
    </div>
  </div>
</section>

<script>
  const cmds = { npm: 'npm install @cynosure/react', pnpm: 'pnpm add @cynosure/react', bun: 'bun add @cynosure/react' };
  document.querySelectorAll<HTMLButtonElement>('[data-code-tab]').forEach((btn) => {
    btn.addEventListener('click', () => {
      const name = btn.dataset.codeTab as keyof typeof cmds;
      const el = document.getElementById('home-install-cmd');
      if (el) el.textContent = cmds[name];
      btn.parentElement?.querySelectorAll<HTMLButtonElement>('[data-code-tab]')
        .forEach((b) => b.removeAttribute('data-active'));
      btn.setAttribute('data-active', '');
    });
  });
</script>
```

- [ ] **Step 2: Commit**

```bash
git add packages/docs/src/components/Home/CodeInContext.astro
git commit -m "feat(docs): add code-in-context section with package-manager tabs"
```

---

### Task 2.8: BigCTA

**Files:**
- Create: `packages/docs/src/components/Home/BigCTA.astro`

- [ ] **Step 1: Write it**

```astro
---
import ArrowRight from '../icons/ArrowRight.astro';
import { site } from '../../config/site';
---
<section data-home-band data-home-band-last>
  <div data-home-container>
    <div data-big-cta>
      <span data-kicker>Start building</span>
      <h2>Ship the interface, not the infrastructure.</h2>
      <p>Grab Cynosure and wire up your first component in under a minute.</p>
      <div>
        <a href="/getting-started/introduction" data-btn="primary">
          Get started <ArrowRight size={14} />
        </a>
        <a href={site.github} data-btn="ghost" style="margin-left:8px">View on GitHub</a>
      </div>
    </div>
  </div>
</section>
```

- [ ] **Step 2: Commit**

```bash
git add packages/docs/src/components/Home/BigCTA.astro
git commit -m "feat(docs): add crosshair-framed homepage CTA"
```

---

### Task 2.9: Home page composition

**Files:**
- Create: `packages/docs/src/pages/index.astro`

- [ ] **Step 1: Write the new entry**

```astro
---
import BaseLayout from '../layouts/BaseLayout.astro';
import Hero from '../components/Home/Hero.astro';
import ComponentGallery from '../components/Home/ComponentGallery.astro';
import ThemingPlayground from '../components/Home/ThemingPlayground.astro';
import A11yStrip from '../components/Home/A11yStrip.astro';
import CodeInContext from '../components/Home/CodeInContext.astro';
import BigCTA from '../components/Home/BigCTA.astro';
import { site } from '../config/site';
---
<BaseLayout title={site.name} description={site.description}>
  <main data-home>
    <Hero />
    <ComponentGallery />
    <ThemingPlayground />
    <A11yStrip />
    <CodeInContext />
    <BigCTA />
  </main>
</BaseLayout>
```

- [ ] **Step 2: Remove existing delete-targeted Home components**

```bash
git rm packages/docs/src/components/Home/FeatureGrid.astro \
       packages/docs/src/components/Home/Footer.astro \
       packages/docs/src/components/Home/BundleSizeTable.astro
```

If any of these are still imported anywhere (`grep -r 'FeatureGrid\|Home/Footer\|BundleSizeTable' packages/docs/src`), remove those imports before committing.

- [ ] **Step 3: Commit**

```bash
git add packages/docs/src/pages/index.astro
git commit -m "feat(docs): wire new homepage composition"
```

---

### Task 2.10: Skip `/` in the dynamic route

**Files:**
- Modify: `packages/docs/src/pages/[...slug].astro`
- Delete or relocate: `packages/docs/src/content/docs/index.mdx`

- [ ] **Step 1: Filter the collection**

```astro
---
import { getCollection, type CollectionEntry } from 'astro:content';
import DocLayout from '../layouts/DocLayout.astro';

export async function getStaticPaths() {
  const entries = await getCollection('docs');
  return entries
    .filter((entry: CollectionEntry<'docs'>) => entry.slug !== 'index')
    .map((entry: CollectionEntry<'docs'>) => ({
      params: { slug: entry.slug },
      props: { entry },
    }));
}

interface Props { entry: CollectionEntry<'docs'> }
const { entry } = Astro.props;
const { Content, headings } = await entry.render();
---
<DocLayout
  title={entry.data.title}
  description={entry.data.description}
  headings={headings}
  frontmatter={entry.data}
  slug={entry.slug}
>
  <Content />
</DocLayout>
```

The home slug is now served by `src/pages/index.astro`; `[...slug]` no longer emits a route for the empty slug, preventing a collision.

- [ ] **Step 2: Retire the home MDX**

```bash
git rm packages/docs/src/content/docs/index.mdx
```

- [ ] **Step 3: Build and verify no route collision**

```bash
cd packages/docs && pnpm build
```

Expected: build succeeds; no "duplicate route" warning. If it fails with `Cannot find module './generated/component-count.json'`, re-run `pnpm generate` (Task 0.1 must land first).

- [ ] **Step 4: Commit**

```bash
git add packages/docs/src/pages/[...slug].astro
git commit -m "feat(docs): serve homepage via pages/index.astro and skip collision"
```

---

## Phase 3 — Doc page components

All Phase 3 tasks may be executed in parallel after Phase 0.

### Task 3.1: Doc-page stylesheet

**Files:**
- Create: `packages/docs/src/styles/doc-page.css`

- [ ] **Step 1: Port CSS from `doc-page-mockup.html`**

Port these rule groups with the attribute-selector mapping:

| Mockup selector | New selector |
|---|---|
| `.doc` (3-col grid) | `[data-doc-layout]` |
| `.breadcrumb` | `[data-breadcrumb]` |
| `.status-row` / `.status-pill` | `[data-status-row]` / `[data-status-pill]` |
| `h1` (content heading) | `[data-doc-content] h1` |
| `.page-sub` | `[data-page-sub]` |
| `h2 .num` | `[data-doc-content] h2 [data-num]` |
| `.live` / `.live-toolbar` / `.live-stage` | `[data-live]` / `[data-live-toolbar]` / `[data-live-stage]` |
| `.code-block` / `.code-head` / `pre` | `[data-code-block]` / `[data-code-head]` / `[data-code-block] pre` |
| `.callout` / `.callout.info` / `.callout.warn` | `[data-callout]` / `[data-callout="info"]` / `[data-callout="warn"]` |
| `.props` / `.props .head` / `.props .row` | `[data-props]` / `[data-props-head]` / `[data-props-row]` |
| `.variant-grid` / `.variant-cell` | `[data-variant-grid]` / `[data-variant-cell]` |
| `.edit-row` | `[data-doc-edit-row]` |
| `.pager` / `.pager a` | `[data-pager]` / `[data-pager-card]` |

Same token substitutions as Task 1.1.

- [ ] **Step 2: Import from site.css**

```css
@import './doc-page.css';
```

- [ ] **Step 3: Commit**

```bash
git add packages/docs/src/styles/doc-page.css packages/docs/src/styles/site.css
git commit -m "feat(docs): add doc-page stylesheet for content and components"
```

---

### Task 3.2: Breadcrumb

**Files:**
- Create: `packages/docs/src/components/Doc/Breadcrumb.astro`

- [ ] **Step 1: Write it**

```astro
---
interface Crumb { label: string; href?: string }
interface Props { items: Crumb[] }
const { items } = Astro.props;
---
<nav data-breadcrumb aria-label="Breadcrumb">
  {items.map((c, i) => (
    <>
      {i > 0 && <span data-breadcrumb-sep>/</span>}
      {c.href ? <a href={c.href}>{c.label}</a> : <span data-breadcrumb-here>{c.label}</span>}
    </>
  ))}
</nav>
```

- [ ] **Step 2: Commit**

```bash
git add packages/docs/src/components/Doc/Breadcrumb.astro
git commit -m "feat(docs): add mono-caps breadcrumb"
```

---

### Task 3.3: StatusRow

**Files:**
- Create: `packages/docs/src/components/Doc/StatusRow.astro`

- [ ] **Step 1: Write it**

```astro
---
interface Props {
  status?: 'stable' | 'beta' | 'alpha' | 'experimental' | 'deprecated';
  since?: string;
  bundleSize?: string;
  a11y?: string;
  pkg?: string;
}
const { status, since, bundleSize, a11y, pkg = '@cynosure/react' } = Astro.props;
---
<div data-status-row>
  {status && (
    <span data-status-pill data-status-variant={status}>
      <span data-status-dot></span>{status}
    </span>
  )}
  {since && <span data-status-pill>v{since}</span>}
  {bundleSize && <span data-status-pill>{bundleSize}</span>}
  {a11y && <span data-status-pill>{a11y}</span>}
  <span data-status-pill>{pkg}</span>
</div>
```

- [ ] **Step 2: Commit**

```bash
git add packages/docs/src/components/Doc/StatusRow.astro
git commit -m "feat(docs): add component status pill row"
```

---

### Task 3.4: Callout

**Files:**
- Create: `packages/docs/src/components/Doc/Callout.astro`

- [ ] **Step 1: Write it**

```astro
---
import Info from '../icons/Info.astro';
import Warn from '../icons/Warn.astro';
interface Props { variant?: 'info' | 'warn'; title?: string }
const { variant = 'info', title } = Astro.props;
---
<div data-callout={variant}>
  {variant === 'warn' ? <Warn size={18} /> : <Info size={18} />}
  <div data-callout-body>
    {title && <strong>{title}</strong>}
    <slot />
  </div>
</div>
```

- [ ] **Step 2: Commit**

```bash
git add packages/docs/src/components/Doc/Callout.astro
git commit -m "feat(docs): add info/warn callout with left-edge accent"
```

---

### Task 3.5: VariantGrid

**Files:**
- Create: `packages/docs/src/components/Doc/VariantGrid.astro`

- [ ] **Step 1: Write it**

```astro
---
interface Props { columns?: number }
const { columns = 3 } = Astro.props;
---
<div data-variant-grid style={`grid-template-columns: repeat(${columns}, 1fr)`}>
  <slot />
</div>

<style>
  [data-variant-grid] > [data-variant-cell],
  [data-variant-grid] > :global(*) {
    /* consumers should wrap each cell in [data-variant-cell]; see doc-page.css */
  }
</style>
```

- [ ] **Step 2: Commit**

```bash
git add packages/docs/src/components/Doc/VariantGrid.astro
git commit -m "feat(docs): add bordered variant grid"
```

---

### Task 3.6: Pager

**Files:**
- Create: `packages/docs/src/components/Doc/Pager.astro`

- [ ] **Step 1: Write it**

```astro
---
interface PagerLink { title: string; href: string }
interface Props { prev?: PagerLink; next?: PagerLink }
const { prev, next } = Astro.props;
---
<nav data-pager aria-label="Pagination">
  {prev ? (
    <a href={prev.href} data-pager-card data-pager-dir="prev">
      <span data-pager-direction>← Previous</span>
      <span data-pager-title>{prev.title}</span>
    </a>
  ) : <span></span>}
  {next ? (
    <a href={next.href} data-pager-card data-pager-dir="next">
      <span data-pager-direction>Next →</span>
      <span data-pager-title>{next.title}</span>
    </a>
  ) : <span></span>}
</nav>
```

- [ ] **Step 2: Commit**

```bash
git add packages/docs/src/components/Doc/Pager.astro
git commit -m "feat(docs): add prev/next pager"
```

---

### Task 3.7: Restyle PropsTable as grid

**Files:**
- Modify: `packages/docs/src/components/PropsTable.astro`

- [ ] **Step 1: Replace the template**

```astro
---
import props from '../generated/props.json';

interface Props { component: string }
const { component } = Astro.props;

interface PropEntry { name: string; type: string; description: string; required: boolean; defaultValue: string | null }
interface Record { props: PropEntry[] }

const record = (props as globalThis.Record<string, Record>)[component];
if (!record) {
  throw new Error(`PropsTable: component "${component}" not found in props.json. Run 'pnpm generate:props'.`);
}

function formatType(t: string): string {
  return t.replace(/\s*\|\s*/g, '|');
}
---
<div data-props>
  <div data-props-head>
    <span>Prop</span><span>Type</span><span>Default</span><span>Description</span>
  </div>
  {record.props.map((p) => (
    <div data-props-row>
      <div data-props-name>
        {p.name}{p.required ? <span data-props-req>*</span> : null}
      </div>
      <div data-props-type>{formatType(p.type)}</div>
      <div data-props-default>{p.defaultValue ?? '—'}</div>
      <div data-props-desc>{p.description}</div>
    </div>
  ))}
</div>
```

- [ ] **Step 2: Delete the old `<style>` block**

Remove any remaining table-specific CSS at the bottom of `PropsTable.astro` — `doc-page.css` now owns these styles.

- [ ] **Step 3: Commit**

```bash
git add packages/docs/src/components/PropsTable.astro
git commit -m "feat(docs): restyle props table as grid with mono types"
```

---

### Task 3.8: Restyle CodeBlock

**Files:**
- Modify: `packages/docs/src/components/CodeBlock.astro`

- [ ] **Step 1: Read current CodeBlock**

```bash
cat packages/docs/src/components/CodeBlock.astro
```

- [ ] **Step 2: Wrap output in `[data-code-block]` with header**

Keep the existing props surface (filename, language, code). Only change the outer markup to match the mockup:

```astro
<!-- sketch: preserve existing frontmatter and props; rewrite the template portion -->
<div data-code-block>
  <div data-code-head>
    {filename && <span data-code-filename>{filename}</span>}
    {lang && <span data-code-lang>{lang}</span>}
    <CopyButton code={code} />
  </div>
  <pre><code>{code}</code></pre>
</div>
```

If the current component uses a Shiki-rendered HTML string, wrap that string in the header markup above instead of re-emitting `<pre>`.

- [ ] **Step 3: Delete any style block now covered by `doc-page.css`**

- [ ] **Step 4: Commit**

```bash
git add packages/docs/src/components/CodeBlock.astro
git commit -m "feat(docs): restyle code block with filename header and copy"
```

---

### Task 3.9: Restyle LivePreview

**Files:**
- Modify: `packages/docs/src/components/LivePreview/*`

- [ ] **Step 1: Read the existing component(s)**

```bash
ls packages/docs/src/components/LivePreview
cat packages/docs/src/components/LivePreview/*.astro
```

- [ ] **Step 2: Wrap the iframe/demo in the new toolbar layout**

Keep the existing iframe src / demo-loading behavior. Only change the outer markup:

```astro
<div data-live>
  <div data-live-toolbar>
    <span data-live-label>Preview</span>
    <span data-live-spacer></span>
    <button type="button" data-live-tool data-live-rtl>RTL</button>
    <button type="button" data-live-tool data-live-theme="light">Light</button>
    <button type="button" data-live-tool data-live-theme="dark">Dark</button>
    <a data-live-tool href={iframeSrc} target="_blank" rel="noopener">Open ↗</a>
  </div>
  <div data-live-stage>
    <!-- existing iframe / slot goes here -->
  </div>
</div>
```

Wire the RTL and theme toggles to pass `?rtl=1`, `?theme=light|dark` to the iframe source by mutating `iframe.src`. Keep scope small; it's fine if toggles only work when an iframe is present.

- [ ] **Step 3: Commit**

```bash
git add packages/docs/src/components/LivePreview/
git commit -m "feat(docs): add toolbar to live preview frame"
```

---

### Task 3.10: DocLayout 3-col grid + breadcrumb + status row

**Files:**
- Modify: `packages/docs/src/layouts/DocLayout.astro`

- [ ] **Step 1: Rewrite the layout**

```astro
---
import BaseLayout from './BaseLayout.astro';
import Sidebar from '../components/Sidebar/Sidebar.astro';
import Toc from '../components/Toc/Toc.astro';
import Breadcrumb from '../components/Doc/Breadcrumb.astro';
import StatusRow from '../components/Doc/StatusRow.astro';
import type { MarkdownHeading } from 'astro';

interface Frontmatter {
  title: string;
  description: string;
  category: 'home' | 'getting-started' | 'foundations' | 'components' | 'recipes' | 'changelog';
  status?: 'stable' | 'beta' | 'alpha' | 'experimental' | 'deprecated';
  since?: string;
  a11y?: string;
  bundleSize?: string;
}

interface Props {
  title: string;
  description: string;
  headings: MarkdownHeading[];
  frontmatter?: Frontmatter;
  slug?: string;
}
const { title, description, headings, frontmatter, slug } = Astro.props;

function crumbsFor(slug: string | undefined, title: string) {
  if (!slug) return [{ label: title }];
  const parts = slug.split('/').filter(Boolean);
  const out: Array<{ label: string; href?: string }> = [];
  let acc = '';
  for (let i = 0; i < parts.length - 1; i++) {
    acc += '/' + parts[i];
    out.push({ label: parts[i].replace(/-/g, ' '), href: acc });
  }
  out.push({ label: title });
  return out;
}
const crumbs = crumbsFor(slug, title);
---
<BaseLayout title={title} description={description}>
  <div data-doc-layout>
    <Sidebar />
    <main data-doc-content>
      <article>
        <Breadcrumb items={crumbs} />
        <h1>{title}</h1>
        <p data-page-sub>{description}</p>
        {frontmatter && (frontmatter.status || frontmatter.since || frontmatter.bundleSize || frontmatter.a11y) ? (
          <StatusRow
            status={frontmatter.status}
            since={frontmatter.since}
            bundleSize={frontmatter.bundleSize}
            a11y={frontmatter.a11y}
          />
        ) : null}
        <slot />
      </article>
    </main>
    <Toc headings={headings} />
  </div>
</BaseLayout>
```

- [ ] **Step 2: Remove the `<h1>` + description from `[...slug].astro`**

The old `[...slug].astro` rendered title + description itself. The layout now owns that. Remove those lines from `[...slug].astro`; only `<Content />` should remain as the layout slot.

(Task 2.10 already rewrote `[...slug].astro` — verify it matches; if not, fix now.)

- [ ] **Step 3: Commit**

```bash
git add packages/docs/src/layouts/DocLayout.astro packages/docs/src/pages/[...slug].astro
git commit -m "feat(docs): 3-col DocLayout with breadcrumb + status row"
```

---

### Task 3.11: Auto-number H2 sections

**Files:**
- Modify: `packages/docs/src/styles/doc-page.css`

- [ ] **Step 1: Use a CSS counter**

Append to `doc-page.css`:

```css
[data-doc-content] article { counter-reset: docH2; }
[data-doc-content] article h2 { counter-increment: docH2; }
[data-doc-content] article h2::before {
  content: counter(docH2, decimal-leading-zero) '  ';
  font-family: var(--docs-type-mono);
  font-size: 12px;
  color: var(--docs-dim);
  letter-spacing: 0.1em;
  font-weight: 500;
  margin-right: 12px;
  vertical-align: 2px;
}
```

This preserves the numbered H2 look without mutating MDX content. No author changes required.

- [ ] **Step 2: Commit**

```bash
git add packages/docs/src/styles/doc-page.css
git commit -m "feat(docs): auto-number H2 sections with CSS counter"
```

---

## Phase 4 — Verification

### Task 4.1: Build and smoke-test

- [ ] **Step 1: Full build**

```bash
cd packages/docs && pnpm build 2>&1 | tail -40
```

Expected: build succeeds with no unhandled errors. Warnings about unused imports are fine to fix inline.

- [ ] **Step 2: Typecheck + lint**

```bash
cd packages/docs && pnpm typecheck && pnpm lint
```

Expected: both pass clean.

- [ ] **Step 3: Vitest suite**

```bash
cd packages/docs && pnpm test
```

Expected: existing tests pass. No test changes were required by this plan.

- [ ] **Step 4: Dev server visual compare**

```bash
cd packages/docs && pnpm dev
```

Open in browser and compare against the mockup HTMLs:

1. `http://localhost:4321/` vs `.superpowers/brainstorm/46889-1776865156/content/home-mockup.html`
   - Topbar: command menu + segmented theme switch present
   - Hero: kicker, headline with accent `out of the way`, CTAs, install chip, 4-item metric strip showing real component count
   - Gallery: 18 tiles with mini previews, hover lifts to `--docs-surface-2`
   - Theming playground: clicking accent swatches / radius / density updates preview
   - A11y strip, code-in-context, big CTA, footer all render

2. `http://localhost:4321/components/button` vs `.superpowers/brainstorm/46889-1776865156/content/doc-page-mockup.html`
   - Sidebar: section counts show, active item has left accent bar
   - Breadcrumb: mono caps `COMPONENTS / FORMS / BUTTON`
   - Status row: stability pill, version, bundle size, a11y, package
   - H2s auto-numbered `01`, `02`, …
   - Props table renders as grid with mono types
   - TOC: mono title, accent bar on active item
   - Footer present

3. Toggle theme: light mode readable; dark mode matches mockup
4. Toggle `prefers-reduced-motion` in devtools: hero grid pan stops

- [ ] **Step 5: Keyboard sweep**

Tab from document start through: brand → version → ⌘K → GitHub → theme → sidebar sections → TOC → content links → footer links. Every focused element must have a visible focus ring.

- [ ] **Step 6: Accessibility audit**

In Chrome devtools, run Lighthouse (a11y only) on `/` and `/components/button`. Expected: 95+ on both; no violations of color contrast or ARIA.

- [ ] **Step 7: Final commit (if any cleanup required)**

```bash
git add -A
git commit -m "chore(docs): post-refresh cleanup"
```

- [ ] **Step 8: Push branch**

Do not push without explicit user approval. Stop here and report.

---

## Rollback

If verification fails and a rollback is required, revert the commits in reverse order. The plan commits in small units intentionally so this is safe.

```bash
git log --oneline -n 40
git revert <bad-commit-hash>
```

---

## Notes for the executor

- **Mockups are source of truth.** When the plan and the mockup disagree on a visual detail, follow the mockup.
- **Don't expand scope.** If you spot unrelated issues (e.g., a pre-existing bug in SearchWidget), note them but don't fix them in this plan.
- **Commit often.** Each task produces at least one commit. Don't batch.
- **Never use git stash.** (Recorded user rule.) If you hit dirty-tree conflicts, commit work-in-progress to the branch and rebase.
- **No emoji, no ASCII-art icons.** Inline SVG only.
