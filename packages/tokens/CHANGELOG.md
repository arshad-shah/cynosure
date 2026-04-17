# @lumen/tokens

## 0.1.0

### Minor Changes

- [#2](https://github.com/arshad-shah/Lumen/pull/2) [`b99bace`](https://github.com/arshad-shah/Lumen/commit/b99bacee83d7fbd4800d3aa0ae327badc078b046) Thanks [@arshad-shah](https://github.com/arshad-shah)! - Initial token pipeline: DTCG primitives + semantic layers (colors, spacing,
  typography, radii, shadows, motion, z-index), a Style Dictionary v4 build
  that emits `dist/css/base.css`, `dist/css/dark.css`, and typed TS constants,
  plus an Ajv-backed JSON Schema validator. CSS uses `var(--lumen-*)` aliases
  so theming overrides cascade; dark theme carries only the semantic overrides.

- [#3](https://github.com/arshad-shah/Lumen/pull/3) [`e2f45fc`](https://github.com/arshad-shah/Lumen/commit/e2f45fc841e62c35b9f95650a2d4ca7c28c96b12) Thanks [@arshad-shah](https://github.com/arshad-shah)! - Phase 03 — runtime-free theming system.

  `@lumen/react` ships `ThemeProvider`, `DirectionProvider`, `getThemeInitScript`,
  and the hooks `useTheme`, `useColorScheme`, `useDirection`, `useReducedMotion`,
  and `useBreakpoint`. Theme state lives entirely on the `<html data-theme>`
  attribute — no React-state cascade of token values, so swapping themes is a
  single repaint. `system` resolves via `prefers-color-scheme`, persistence is
  pluggable (`localStorage` / `sessionStorage` / custom adapter / off), and
  `getThemeInitScript()` returns an inline IIFE that prevents the dark→light
  flash on hydration. `DirectionProvider` wraps Radix's so primitives inherit
  direction automatically.

  `@lumen/themes` adds two prebuilt themes shipped as side-effect CSS:
  `@lumen/themes/terminal` (Arshad's GitHub Dark Terminal — JetBrains Mono,
  muted blue glow) and `@lumen/themes/high-contrast` (WCAG AAA, light + dark
  selectors).

  `@lumen/tokens` gains `--lumen-breakpoint-{sm,md,lg,xl,2xl}`,
  `--lumen-shadow-component-focus`, and a `prefers-reduced-motion` block that
  zeroes the semantic motion durations so token-driven transitions automatically
  disable.

### Patch Changes

- [#7](https://github.com/arshad-shah/Lumen/pull/7) [`7aca046`](https://github.com/arshad-shah/Lumen/commit/7aca046bafecb270f95fbad792be9d467c5c7e7b) Thanks [@arshad-shah](https://github.com/arshad-shah)! - Phase 06 — typography.

  `@lumen/react` gains the full text-rendering component set. Every one of them composes `Box` under the hood — none contain raw intrinsic JSX — and they all use the semantic `font.heading.*` / `font.body.*` composite tokens rather than re-declaring font sizes.
  - **Components:** `Text`, `Heading` (with decoupled semantic `level` + visual `size`), `Code`, `Kbd`, `Link` (with `external` → safe `rel`/`target` + decorative icon), `Blockquote`, and the list family `List` / `OrderedList` / `ListItem` / `DescriptionList` / `DescriptionTerm` / `DescriptionDetails`. Each lives in its own folder and ships a dedicated per-component entry point (`@lumen/react/text`, `@lumen/react/heading`, …).
  - **Responsive typography:** `size`, `weight`, and `align` accept `Responsive<T>` maps and propagate through cascading CSS custom properties so breakpoint overrides inherit from the nearest lower breakpoint — the same mobile-first pattern the layout primitives use.
  - **Composite tokens in CSS:** `@lumen/tokens` now emits the pre-expanded `font.heading.*` and `font.body.*` composites as CSS custom properties (`--lumen-font-heading-1-size`, `--lumen-font-body-md-line-height`, …), which Phase 02 introduced but whose CSS output had been dropped by a filter bug in the expansion preprocessor (fixed here).
  - **Shared recipe:** `typography/shared/shared.css.ts` centralises the styles every text component reuses — `align`, `italic`, `underline`/`strikethrough`, single-line truncate, multi-line clamp, and the body/heading size → CSS variable maps — so component `.css.ts` files stay tiny.
  - **Build:** each typography component is listed in the package `exports` map, has a Node10-resolution sidecar `package.json`, and is wired as its own tsup entry to keep per-component imports tree-shakable.
