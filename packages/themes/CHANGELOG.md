# @arshad-shah/cynosure-themes

## 1.0.1

### Patch Changes

- [#23](https://github.com/arshad-shah/cynosure/pull/23) [`2593498`](https://github.com/arshad-shah/cynosure/commit/2593498ec28d6c82007bb6d663d034a0bf030eb3) Thanks [@arshad-shah](https://github.com/arshad-shah)! - Add per-package `README.md` files. Each package now displays
  installation, quick-start usage, and links on its npm package page —
  critical for discovery and adoption. No runtime changes.
- Updated dependencies [[`2593498`](https://github.com/arshad-shah/cynosure/commit/2593498ec28d6c82007bb6d663d034a0bf030eb3)]:
  - @arshad-shah/cynosure-tokens@1.0.1

## 1.0.0

### Major Changes

- First stable release.

  `0.x` was a pre-release development window; v1.0 is the first version
  under Cynosure's semver policy. No code migration is required — if you
  were consuming Cynosure from source or a workspace alias, install the
  npm packages instead. See the
  [Migration guide](https://github.com/arshad-shah/cynosure/blob/main/docs/reference/migration-to-v1.mdx)
  for details.

  ## What v1.0 ships
  - Complete component catalogue across `@arshad-shah/cynosure-react`.
  - W3C DTCG design tokens in `@arshad-shah/cynosure-tokens`, with light
    and dark stylesheets.
  - Prebuilt themes (terminal, high-contrast) in
    `@arshad-shah/cynosure-themes`.
  - Headless primitives in `@arshad-shah/cynosure-core`.
  - Icon set in `@arshad-shah/cynosure-icons`.
  - Foundations docs, eight priority recipes, framework + tree-shaking
    guides.

  ## Semver policy from here
  - **Patch** — bug fixes, no API changes.
  - **Minor** — new components, new props (additive), new variants. No
    breaking changes.
  - **Major** — breaking changes, with a migration guide. Deprecations
    are announced at least one minor cycle before removal.

  All five packages ship at the same semver via linked changesets.

### Patch Changes

- Updated dependencies []:
  - @arshad-shah/cynosure-tokens@1.0.0

## 0.1.0

### Minor Changes

- [#3](https://github.com/arshad-shah/Cynosure/pull/3) [`e2f45fc`](https://github.com/arshad-shah/Cynosure/commit/e2f45fc841e62c35b9f95650a2d4ca7c28c96b12) Thanks [@arshad-shah](https://github.com/arshad-shah)! - Phase 03 — runtime-free theming system.

  `@arshad-shah/cynosure-react` ships `ThemeProvider`, `DirectionProvider`, `getThemeInitScript`,
  and the hooks `useTheme`, `useColorScheme`, `useDirection`, `useReducedMotion`,
  and `useBreakpoint`. Theme state lives entirely on the `<html data-theme>`
  attribute — no React-state cascade of token values, so swapping themes is a
  single repaint. `system` resolves via `prefers-color-scheme`, persistence is
  pluggable (`localStorage` / `sessionStorage` / custom adapter / off), and
  `getThemeInitScript()` returns an inline IIFE that prevents the dark→light
  flash on hydration. `DirectionProvider` wraps Radix's so primitives inherit
  direction automatically.

  `@arshad-shah/cynosure-themes` adds two prebuilt themes shipped as side-effect CSS:
  `@arshad-shah/cynosure-themes/terminal` (Arshad's GitHub Dark Terminal — JetBrains Mono,
  muted blue glow) and `@arshad-shah/cynosure-themes/high-contrast` (WCAG AAA, light + dark
  selectors).

  `@arshad-shah/cynosure-tokens` gains `--cynosure-breakpoint-{sm,md,lg,xl,2xl}`,
  `--cynosure-shadow-component-focus`, and a `prefers-reduced-motion` block that
  zeroes the semantic motion durations so token-driven transitions automatically
  disable.

### Patch Changes

- Updated dependencies [[`b99bace`](https://github.com/arshad-shah/Cynosure/commit/b99bacee83d7fbd4800d3aa0ae327badc078b046), [`e2f45fc`](https://github.com/arshad-shah/Cynosure/commit/e2f45fc841e62c35b9f95650a2d4ca7c28c96b12), [`7aca046`](https://github.com/arshad-shah/Cynosure/commit/7aca046bafecb270f95fbad792be9d467c5c7e7b)]:
  - @arshad-shah/cynosure-tokens@0.1.0
