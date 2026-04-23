# Docs Site: De-React Chrome — Design Spec

Date: 2026-04-22
Status: Approved (brainstorm)
Owner: Arshad Shah
Scope: Replace all uses of `@arshad-shah/cynosure-react` in the docs *site chrome* (top bar, sidebar, ToC, hero, footer, search, theme switcher, copy buttons, badges, props/token tables) with native Astro components that share the same design via `@arshad-shah/cynosure-themes` CSS variables. Live demos (`Playground`, `PreviewFrame`) are preserved by isolating them inside `<iframe>` elements that point at dedicated React-hydrating pages under `/demos/*`.

## Goals

- Static, SSR-only chrome — no React hydration in any docs page outside the live-demo iframes.
- Visual parity with today: chrome looks the same because it consumes the same design tokens.
- Smaller hydration payload on every docs page (chrome React is gone).
- Preserve dogfood value where it matters: live `Playground` and `PreviewFrame` still render real cynosure-react components.

## Non-goals

- Touching `content/docs/components/**` MDX or `_examples/*` — those *demonstrate* the library and stay React.
- Reimplementing vanilla-extract in the docs site — Astro's scoped `<style>` blocks replace it.
- Removing dependencies — `react`, `react-dom`, `@astrojs/react`, `@arshad-shah/cynosure-react` all stay (used by demo iframes and MDX examples).
- Adding E2E tests; the docs package has no E2E suite today and we're not introducing one.

## Architecture

Two distinct execution worlds inside the docs site:

1. **Chrome (static Astro).** Top bar, sidebar, ToC, hero, footer, badges, code/props/token tables, copy buttons, search, theme switcher. All `.astro` files with vanilla CSS using `var(--cynosure-*)` tokens, plus inline `<script>` blocks (TypeScript) for interactivity. Zero React imports.
2. **Live demos (React islands inside iframes).** `Playground` and `PreviewFrame` move behind `<iframe>` boundaries. The iframe `src` points at a dedicated Astro page under `src/pages/demos/*` that DOES hydrate React. The containing docs page renders only a vanilla `<iframe>` element — no hydration cost.

The two worlds talk only via `postMessage` (used for iframe height auto-resize). The chrome never imports from React land.

## Styling and tokens

- **Source of truth:** `@arshad-shah/cynosure-themes` already provides the design tokens as CSS custom properties on `:root` / `[data-theme]`, loaded once in the docs site's root layout.
- **Per-component CSS:** each `.astro` chrome component owns its styles in a scoped `<style>` block, referencing tokens via `var(--cynosure-color-…)`, `var(--cynosure-space-…)`, `var(--cynosure-radius-…)`, etc.
- **No vanilla-extract:** Astro's scoped style isolation replaces the `.css.ts` pattern from cynosure-react.
- **No copying hashed class names** from cynosure-react's compiled output — chrome owns its own classes.
- **Icons:** swap `lucide-react` for `lucide-static` (string SVG paths) or inline SVG markup directly in Astro templates. No React for icons.

## Interactive scripts

Each chrome component with behavior embeds a small typed `<script>` block. Astro hoists, bundles, and tree-shakes these. Shared utilities live in `src/lib/ui/`:

- `theme.ts` — load saved theme from `localStorage`, apply to `document.documentElement`, expose toggle function and `system` mode tracking.
- `clipboard.ts` — copy text via `navigator.clipboard`, fall back to `document.execCommand('copy')`, fire a small toast event for UI feedback.
- `search.ts` — bootstrap Pagefind, manage the dialog (open/close, focus trap, `⌘K` hotkey), render result rows.
- `disclosure.ts` — generic open/close helper for nav disclosures (sidebar sections, mobile menu).
- `iframe-resize.ts` — postMessage receiver in the parent page that updates iframe `height` based on messages from the embedded demo page.

The embedded demo pages (`/demos/*`) include the matching `iframe-resize` *sender* in their layout, posting their `document.documentElement.scrollHeight` after load and on `ResizeObserver` ticks.

## File plan

### Rewrites — `.astro`, no cynosure-react imports

```
src/components/
  CodeBlock.astro
  PropsTable.astro
  StatusBadge.astro
  BundleSizePill.astro
  TokenTable.astro
  CopyButton.astro                 (replaces CopyButton.tsx)
  Chrome/
    TopBar.astro
    BrandLockup.astro
    GitHubLink.astro
    VersionPill.astro
    SearchInput.astro
    SearchWidget.astro             (replaces SearchWidget.tsx)
    ThemeSwitcher.astro            (replaces ThemeSwitcher.tsx)
  Sidebar/
    Sidebar.astro
    SidebarSection.astro
  Toc/
    Toc.astro
  Home/
    Hero.astro
    FeatureGrid.astro
    BundleSizeTable.astro
    Footer.astro
```

### New iframe boundaries

```
src/pages/demos/
  playground.astro                  (mounts Home/Playground React island; client:load)
  preview/[slug].astro              (dynamic route mounting individual preview components)

src/components/
  Home/PlaygroundFrame.astro        (renders <iframe src="/demos/playground">)
  LivePreview/PreviewFrame.astro    (rewrite to plain <iframe src="/demos/preview/...">)
```

### Shared vanilla utilities

```
src/lib/ui/
  theme.ts
  clipboard.ts
  search.ts
  disclosure.ts
  iframe-resize.ts
```

### Untouched

- `src/content/docs/**` (MDX + `_examples/*.tsx`).
- `src/layouts/**` (continue using the rewritten chrome components).
- `src/styles/**` (resets, fonts, dark mode).
- `package.json` dependencies (no removals; `cynosure-react` etc. still used by `/demos/*` and MDX examples).

## Migration order

Each phase is a self-contained commit/PR. The site stays buildable and visually consistent at every step.

1. **Foundations.** Add `src/lib/ui/{theme,clipboard,search,disclosure,iframe-resize}.ts`. Type-check, no UI consumers yet.
2. **Static chrome.** Rewrite zero-behavior components: `BrandLockup`, `GitHubLink`, `VersionPill`, `BundleSizePill`, `StatusBadge`, `Footer`, `Hero`, `FeatureGrid`, `BundleSizeTable`, `TokenTable`, `PropsTable`, `Sidebar`, `SidebarSection`, `Toc`, `TopBar`. Drop cynosure-react imports.
3. **Interactive chrome.** Rewrite `ThemeSwitcher`, `CopyButton`, `SearchInput`, `SearchWidget`. Wire to `src/lib/ui/*` utilities.
4. **Demo iframes.** Create `src/pages/demos/playground.astro` and `src/pages/demos/preview/[slug].astro`; rewrite `Home/Playground` consumption and `LivePreview/PreviewFrame` to vanilla `<iframe>` wrappers. Wire `iframe-resize` postMessage on both ends.
5. **Sweep + audit.** Run `grep -r "@arshad-shah/cynosure-react" src/components src/layouts src/pages` — expected matches only inside `src/pages/demos/*`. Fix any stragglers. Update `CHANGELOG`/release notes if applicable.

## Success criteria

- `pnpm --filter @arshad-shah/cynosure-docs build` succeeds.
- `pnpm --filter @arshad-shah/cynosure-docs check` (`astro check && tsc --noEmit`) is clean.
- `view-source:` on the docs landing page contains zero `<astro-island>` elements outside iframe boundaries.
- Visual diff on `/` and a representative component page (e.g. `/components/tabs`) shows pixel-equivalent chrome.
- Theme toggle, search (`⌘K` open, type-to-filter, click result, escape close), copy buttons, sidebar disclosures, and demo iframes all behave correctly in manual smoke.
- Lighthouse "Reduce unused JavaScript" line item improves on `/` versus baseline.

## Testing

- Existing `packages/docs/tests/` (vitest) — extend with unit tests where a util warrants it: `theme.ts` (resolution from localStorage / system), `clipboard.ts` (fallback path), `disclosure.ts` (open/close + aria-expanded toggling).
- Manual smoke per phase: `pnpm dev`, walk through home → component page → theme toggle → search → copy → mobile sidebar → live demo iframes.
- No new E2E suite.

## Rollback

Each phase ships as its own commit. If a phase breaks something subtle, `git revert <phase-sha>` restores the previous (React) version of just that surface without disturbing the others.

## Open risks

- **Pagefind init in `search.ts`:** today's `SearchWidget.tsx` likely calls Pagefind asynchronously; the vanilla rewrite must preserve that lazy load so the bundle doesn't grow. Mitigation: dynamic `import()` inside the `⌘K` open handler.
- **Iframe height sync flicker:** if `postMessage` from the embedded demo arrives after first paint, users see a brief jump. Mitigation: emit an initial estimated height server-side based on demo metadata, then reconcile via postMessage after hydration.
- **Pre-existing scoped class collisions:** Astro scopes `<style>` per component, but globals defined in `src/styles/` may clash with new chrome class names. Mitigation: use BEM-ish prefixes (`.docs-topbar__brand`) inside chrome components to be safe.
- **Theme switcher hydration order:** flash-of-unthemed-content during early load. Mitigation: a tiny inline `<script is:inline>` in the root layout reads `localStorage` and applies `data-theme` BEFORE the first paint, identical to the pattern already used in many SSR sites.
