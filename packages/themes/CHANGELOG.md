# @lumen/themes

## 0.1.0

### Minor Changes

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

- Updated dependencies [[`b99bace`](https://github.com/arshad-shah/Lumen/commit/b99bacee83d7fbd4800d3aa0ae327badc078b046), [`e2f45fc`](https://github.com/arshad-shah/Lumen/commit/e2f45fc841e62c35b9f95650a2d4ca7c28c96b12), [`7aca046`](https://github.com/arshad-shah/Lumen/commit/7aca046bafecb270f95fbad792be9d467c5c7e7b)]:
  - @lumen/tokens@0.1.0
