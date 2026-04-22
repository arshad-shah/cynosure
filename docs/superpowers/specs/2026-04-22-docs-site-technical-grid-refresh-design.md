# Docs Site — Technical Grid Refresh (Design Spec)

**Date:** 2026-04-22
**Status:** Approved, ready for implementation planning
**Scope:** Wholesale visual refresh of `packages/docs` — chrome, homepage, and component/doc pages
**Direction:** Technical Grid — dark-first, grid backdrop, monospace accents, single accent color, precision-instrument feel (Tailwind / Arc territory)

## Reference Mockups

Built and approved during brainstorming; saved under `.superpowers/brainstorm/46889-1776865156/content/`:

- `direction.html` — mood selection (B · Technical Grid chosen)
- `home-mockup.html` — full homepage (topbar, hero, gallery, theming, a11y strip, code example, CTA, footer)
- `doc-page-mockup.html` — component doc page (sidebar, breadcrumb, status row, numbered H2s, live preview, code block, variant grid, props table, callouts, pager, TOC)

All implementation must match those mockups visually. Deviations need a call-out.

## Hard Constraints

- **No emoji, no ASCII-art icons.** Every icon must be inline SVG or from a proper icon library. Applies to UI, content, and committed markdown.
- **Existing design tokens must be respected.** Use `accent.solid` (not `accent.strong`), `radius.full` (not `radius.pill`). Don't introduce space 2.5.
- **Respect `prefers-reduced-motion`.** Hero grid pan, hover lifts, disclosure transitions all honor it.
- **Theme parity.** Dark-first, but light-theme variants must exist for every new token and surface — toggle already exists via `[data-theme]`.
- **Component counts must be real.** `98` today, pulled from the react package tree at build time. Do not hardcode; drive from a generated count.

## 1. Visual Language (Foundation)

### New semantic tokens (CSS vars)

Added to `packages/docs/src/styles/site.css` and layered over existing `@cynosure/tokens`:

| Token | Dark | Light | Purpose |
|---|---|---|---|
| `--surface-1` | `#12151a` | `#f7f7f5` | Cards, code blocks, nav items (hover) |
| `--surface-2` | `#181c22` | `#efefec` | Elevated surface, toolbars, segmented controls |
| `--surface-3` | `#1f242c` | `#e6e6e2` | Deepest chip/button bg |
| `--grid-line` | `rgba(255,255,255,0.045)` | `rgba(0,0,0,0.05)` | Hero + live-preview grid overlay |
| `--grid-strong` | `rgba(255,255,255,0.09)` | `rgba(0,0,0,0.1)` | Crosshair markers |
| `--line` | `rgba(255,255,255,0.08)` | `rgba(0,0,0,0.09)` | Hairline borders between sections |
| `--line-strong` | `rgba(255,255,255,0.14)` | `rgba(0,0,0,0.15)` | Focus-heavy dividers |
| `--muted` | `#8b95a5` | `#626a77` | Secondary text |
| `--dim` | `#5a6472` | `#909aa7` | Tertiary text, captions |

`--color-accent-solid` (existing, `#7dd3fc` dark / `#0ea5e9` light) is the single accent for links, focus rings, primary buttons, active indicators.

### Type

- Display / body: Geist Variable (already loaded) — tight tracking `-0.02em` at display sizes, `400`/`500`/`600` weights
- Mono: JetBrains Mono Variable — used for code, kbd, section kickers, metric callouts, version pills, breadcrumbs, TOC titles
- Section kicker pattern: `font-family: var(--font-mono); font-size: 11px; letter-spacing: 0.14em; text-transform: uppercase; color: var(--muted);` — running voice across the site

### Motion

- Hover lifts: 150ms ease; surface color change
- Disclosure: 200ms ease-out
- Hero grid pan: 60s linear infinite translate of 40px × 40px, paused under `prefers-reduced-motion`

## 2. Chrome

### Topbar (`TopBar.astro`)

- 56px, sticky, `rgba(bg,0.85)` + `backdrop-filter: blur(12px)`, bottom border `--line`
- Brand lockup (existing) + mono version pill (`v1.0.0-beta`, existing `VersionPill.astro`)
- **Command menu trigger** — replaces inline `SearchInput.astro` visually. A button styled like an input, shows placeholder "Search components, guides, tokens…", right-aligned `⌘K` kbd affordance. Clicking opens existing `SearchWidget.astro` inside a Dialog overlay.
- Right: GitHub icon link · three-state segmented theme switcher (Light / System / Dark) using existing `ThemeSwitcher.astro` state but restyled as segmented control.

### Left sidebar (doc pages only, 260px, sticky)

- Collapsible `<details>` groups per category with mono uppercase summary
- Group summary format: `CATEGORY ▸` with real count right-aligned (`(31)`, `(10)`, …)
- Item rows: 28px, 13.5px text. Active row gets 2px accent bar on left + `--surface-1` fill. Hover gets `--surface-1` only.
- Expanded state persisted to `localStorage` key `cynosure-docs-nav`.
- Scroll shadows at top/bottom when overflowing.

### Right TOC (doc pages only, 240px, sticky)

- Mono kicker `ON THIS PAGE`
- Uses numbered H2s as entries (`01 · Preview`, `02 · Variants`, …) + H3s as sub-entries for prop names
- Active heading gets accent color + 2px left accent bar. Reuses existing scroll-spy.
- Collapses below `lg` breakpoint.

### Footer (site-wide)

- 4-column grid: Brand+tagline · Docs · Project · Community
- Column headers in mono uppercase
- Bottom strip with mono caps: copyright · version · license · built-with

## 3. Homepage

Replaces current `src/pages/index.astro` + `Home/*` components.

### 3.1 Hero

- Viewport-tall (min-height 620px), grid+crosshair backdrop, slow pan
- Mono kicker `CYNOSURE · v{VERSION}`
- Display headline (3-line, tight, accent-colored span): placeholder copy — needs wordsmithing but structure locked.
- Sub: one sentence
- CTA row: filled primary (`Get started →`) + ghost (`Browse components`)
- Install snippet (`npx cynosure init`) in a mono chip with copy button (reuse existing `CopyButton.astro`)
- Metric strip, mono caps, 4 items: `{count} COMPONENTS · 0 RUNTIME DEPS · WCAG 2.2 AA · MIT` — `{count}` is the real component count pulled at build time.

### 3.2 Component gallery

- Mono kicker `ON THIS SITE / 01`
- 6-column responsive grid (2-col mobile, 3-col tablet) of **18 live tiles**, each rendering a real mini instance of the component (Button, Badge, Switch, Avatar, Slider, Spinner, Tag, Progress, Input, Select, Tabs, Checkbox, Radio, Alert, Tooltip, Toast, Card, Dialog)
- Tile shows preview + mono name label. Hover: `--surface-2` bg, name colored accent.
- Footer link: `See all {count} components →`

### 3.3 Theming playground

- Mono kicker `TOKENS / 02`
- Left controls: accent swatches (5), radius seg (sharp / soft / round), density seg (compact / default / cozy)
- Right preview pane: 2×2 of live components (button, input, user card with switch, checkbox row) rerenders using CSS vars on control change
- All variable changes scope to the preview pane only

### 3.4 Accessibility strip

- Mono kicker `ACCESSIBILITY / 03`
- 4 cards, each: SVG icon, title, 1-line blurb, mono test-name footnote
- Cards: Keyboard-first · Focus visible · Reduced motion · Audited (axe-core · 0 violations)

### 3.5 Code in context

- Mono kicker `USAGE / 04`
- Split 50/50: code on left with package-manager tabs (npm / pnpm / bun), rendered composition on right
- Code uses existing `CodeBlock.astro` restyled

### 3.6 Big CTA

- Crosshair-framed card with radial accent glow
- "Ship the interface, not the infrastructure." + primary + ghost CTAs

### 3.7 Footer (site-wide, 2.4)

Omitted: "who uses it / logos" strip — no real users to showcase yet.

## 4. Doc Page Layout

Applies to all content under `packages/docs/src/content/docs/*`, rendered via `DocLayout.astro`.

### Page structure

1. **Breadcrumb** — mono caps: `COMPONENTS / FORMS / BUTTON` with thin-line separators
2. **Title + page-sub** — 42px title, 18px muted subtitle
3. **Status row** — pills: stability (with color dot: green=stable, amber=beta, red=deprecated), version, bundle size (from `.size-limit.json`), `WCAG 2.2 AA`, package name
4. **Numbered H2 sections** — each H2 prefixed with mono number like `01 `, `02 `, auto-generated from order in the doc
5. **Live preview frames** — border-radius 10, toolbar with: section label + right-aligned controls (RTL toggle, theme toggle pair, open-in-new-window). Stage has subtle 20px grid background.
6. **Code blocks** — existing `CodeBlock.astro` restyled: filename header, language badge, copy button, 13px mono, line-height 1.7
7. **Callouts** — `info` (accent left-border) and `warn` (amber left-border). Icon + strong title + body. Replace current callout components.
8. **Variant grid** — bordered multi-column grid showing each variant with mono label underneath
9. **Props table** — existing `PropsTable.astro` restyled: mono types with `|` separators (accent color), required marker (red asterisk), default column, description column. Driven by `generated/props.json` (existing).
10. **Edit-on-GitHub + last-updated row**
11. **Prev/Next pager** — two bordered cards, 50/50, with mono direction label + next page title

## 5. File-Level Changes

### New files

- `packages/docs/src/styles/tokens-surfaces.css` — the new semantic surface/line/muted tokens (dark + light)
- `packages/docs/src/styles/chrome.css` — topbar, sidebar, TOC, footer styles (moved out of `site.css`)
- `packages/docs/src/styles/home.css` — homepage section styles
- `packages/docs/src/styles/doc-page.css` — content, live preview, code block, props table, callout, pager styles
- `packages/docs/src/components/Chrome/CommandMenu.astro` — styled-as-input trigger wrapping existing `SearchWidget` in a Dialog
- `packages/docs/src/components/Home/MetricStrip.astro` — hero metric strip, takes real counts
- `packages/docs/src/components/Home/ComponentGallery.astro` — 18-tile live gallery
- `packages/docs/src/components/Home/ThemingPlayground.astro` — interactive token playground (client-side via vanilla JS)
- `packages/docs/src/components/Home/A11yStrip.astro` — accessibility cards
- `packages/docs/src/components/Home/CodeInContext.astro` — package-manager tabs + code + demo
- `packages/docs/src/components/Home/BigCTA.astro` — crosshair-framed CTA
- `packages/docs/src/components/Home/SiteFooter.astro` — replaces `Footer.astro`
- `packages/docs/src/components/Doc/Breadcrumb.astro`
- `packages/docs/src/components/Doc/StatusRow.astro` — stability pill + version + size + a11y + package
- `packages/docs/src/components/Doc/LivePreview.astro` — restyled preview frame (supersedes / wraps existing `LivePreview`)
- `packages/docs/src/components/Doc/Callout.astro` — info / warn variants
- `packages/docs/src/components/Doc/VariantGrid.astro`
- `packages/docs/src/components/Doc/Pager.astro`
- `packages/docs/src/components/icons/*.astro` — small set of inline SVG icons (Search, GitHub, Sun, Moon, System, Copy, Info, Warn, ArrowRight, ArrowLeft, Chevron, ExternalLink)
- `packages/docs/scripts/component-count.mjs` — build-time script producing a JSON with real counts per category; consumed by hero, gallery, sidebar

### Modified files

- `packages/docs/src/styles/site.css` — slimmed to root tokens + imports the new CSS files
- `packages/docs/src/layouts/BaseLayout.astro` — wraps in topbar + site footer (currently just renders `<slot />`)
- `packages/docs/src/layouts/DocLayout.astro` — adopts 3-col grid (sidebar + content + TOC)
- `packages/docs/src/pages/index.astro` — rewritten using new home components
- `packages/docs/src/components/Chrome/TopBar.astro` — redesigned
- `packages/docs/src/components/Chrome/ThemeSwitcher.astro` — three-state segmented control
- `packages/docs/src/components/Sidebar/*` — active-bar + mono kickers + counts + localStorage persistence
- `packages/docs/src/components/Toc/*` — restyle for accent bar, sub-items
- `packages/docs/src/components/CodeBlock.astro` — new header + copy button style
- `packages/docs/src/components/PropsTable.astro` — mono types, required marker, new grid layout

### Deleted files

- `packages/docs/src/components/Home/Hero.astro` — replaced
- `packages/docs/src/components/Home/FeatureGrid.astro` — replaced by ComponentGallery + A11yStrip
- `packages/docs/src/components/Home/Footer.astro` — replaced by SiteFooter
- `packages/docs/src/components/Home/BundleSizeTable.astro` — retired from home; bundle size appears in doc-page status row instead

## 6. Out of Scope

- Search indexing changes (using existing Pagefind / whatever is wired)
- New content authoring — this is a visual refresh; existing MDX content renders unchanged
- Mobile nav (hamburger) — keep existing behavior, just restyle
- `docs-site` wrangler / deploy config
- Framework migration work from the Astro de-React chrome spec (already shipped per recent commits)

## 7. Testing / Verification

- Visual regression: manually compare `localhost:4321` against the two mockup HTMLs. Key pages: `/`, `/components/button`, `/foundations/tokens`, `/getting-started/introduction`.
- Run existing Vitest suite under `packages/docs/tests/` — no test changes expected to pass.
- `pnpm lint` + `pnpm typecheck` clean.
- Axe-core pass on homepage + one doc page.
- `prefers-reduced-motion` check: hero pan stops, hover lifts instant.
- Theme toggle: every new surface reads correctly in light mode.
- Keyboard: tab order through topbar → sidebar → content → TOC → footer with visible focus at every step.
