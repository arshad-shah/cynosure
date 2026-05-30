# @arshad-shah/cynosure-tokens

## 3.3.0

### Minor Changes

- [#95](https://github.com/arshad-shah/cynosure/pull/95) [`1ef49c0`](https://github.com/arshad-shah/cynosure/commit/1ef49c0e6bc238570e3fc3cecf9ea12f913bfa34) Thanks [@arshad-shah](https://github.com/arshad-shah)! - Replace the Radix menu packages with a first-party menu engine, modernize the
  visual foundation, and route all component styling through tokens.
  - **Menus:** drop `@radix-ui/react-{dropdown-menu,context-menu,menubar,navigation-menu}`
    in favour of an in-tree, headless menu engine (roving focus, type-ahead,
    submenus, checkbox/radio items, dismissal, focus return). Public component API
    is unchanged. The package is now Radix-free.
  - **Foundation:** rounder radius scale, softer multi-layer shadows, and refined
    motion easings/durations. `easing` is now exposed on the token contract and
    every component's motion + focus rings flow from the token foundation (no
    hardcoded curves, durations, or focus-ring geometry).
  - **Fixes:** Blockquote left rule now spans wrapped lines; Slider tick marks
    position correctly; FileUpload remove button sits at the row's end; PinInput
    mask renders a filled dot; Accordion chevron rotates when open; Tooltip no
    longer flashes at the top-left before positioning.

## 3.0.0

### Patch Changes

- [#63](https://github.com/arshad-shah/cynosure/pull/63) [`f972e95`](https://github.com/arshad-shah/cynosure/commit/f972e958a122c68a6f93daaceb3314a3ac208c86) Thanks [@arshad-shah](https://github.com/arshad-shah)! - Add `homepage`, `repository`, `bugs`, and `keywords` to all publishable
  packages so the npm package pages render the GitHub source link, issue
  tracker, and Storybook URL (`https://cynosure.arshadshah.com`) in their
  sidebars. Pure metadata — no runtime or API changes.

## 1.0.1

### Patch Changes

- [#23](https://github.com/arshad-shah/cynosure/pull/23) [`2593498`](https://github.com/arshad-shah/cynosure/commit/2593498ec28d6c82007bb6d663d034a0bf030eb3) Thanks [@arshad-shah](https://github.com/arshad-shah)! - Add per-package `README.md` files. Each package now displays
  installation, quick-start usage, and links on its npm package page —
  critical for discovery and adoption. No runtime changes.

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

## 0.1.0

### Minor Changes

- [#2](https://github.com/arshad-shah/Cynosure/pull/2) [`b99bace`](https://github.com/arshad-shah/Cynosure/commit/b99bacee83d7fbd4800d3aa0ae327badc078b046) Thanks [@arshad-shah](https://github.com/arshad-shah)! - Initial token pipeline: DTCG primitives + semantic layers (colors, spacing,
  typography, radii, shadows, motion, z-index), a Style Dictionary v4 build
  that emits `dist/css/base.css`, `dist/css/dark.css`, and typed TS constants,
  plus an Ajv-backed JSON Schema validator. CSS uses `var(--cynosure-*)` aliases
  so theming overrides cascade; dark theme carries only the semantic overrides.

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

- [#7](https://github.com/arshad-shah/Cynosure/pull/7) [`7aca046`](https://github.com/arshad-shah/Cynosure/commit/7aca046bafecb270f95fbad792be9d467c5c7e7b) Thanks [@arshad-shah](https://github.com/arshad-shah)! - Phase 06 — typography.

  `@arshad-shah/cynosure-react` gains the full text-rendering component set. Every one of them composes `Box` under the hood — none contain raw intrinsic JSX — and they all use the semantic `font.heading.*` / `font.body.*` composite tokens rather than re-declaring font sizes.
  - **Components:** `Text`, `Heading` (with decoupled semantic `level` + visual `size`), `Code`, `Kbd`, `Link` (with `external` → safe `rel`/`target` + decorative icon), `Blockquote`, and the list family `List` / `OrderedList` / `ListItem` / `DescriptionList` / `DescriptionTerm` / `DescriptionDetails`. Each lives in its own folder and ships a dedicated per-component entry point (`@arshad-shah/cynosure-react/text`, `@arshad-shah/cynosure-react/heading`, …).
  - **Responsive typography:** `size`, `weight`, and `align` accept `Responsive<T>` maps and propagate through cascading CSS custom properties so breakpoint overrides inherit from the nearest lower breakpoint — the same mobile-first pattern the layout primitives use.
  - **Composite tokens in CSS:** `@arshad-shah/cynosure-tokens` now emits the pre-expanded `font.heading.*` and `font.body.*` composites as CSS custom properties (`--cynosure-font-heading-1-size`, `--cynosure-font-body-md-line-height`, …), which Phase 02 introduced but whose CSS output had been dropped by a filter bug in the expansion preprocessor (fixed here).
  - **Shared recipe:** `typography/shared/shared.css.ts` centralises the styles every text component reuses — `align`, `italic`, `underline`/`strikethrough`, single-line truncate, multi-line clamp, and the body/heading size → CSS variable maps — so component `.css.ts` files stay tiny.
  - **Build:** each typography component is listed in the package `exports` map, has a Node10-resolution sidecar `package.json`, and is wired as its own tsup entry to keep per-component imports tree-shakable.
