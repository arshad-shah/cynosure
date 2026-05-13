# @arshad-shah/cynosure-icons

## 3.0.0

### Patch Changes

- [#63](https://github.com/arshad-shah/cynosure/pull/63) [`f972e95`](https://github.com/arshad-shah/cynosure/commit/f972e958a122c68a6f93daaceb3314a3ac208c86) Thanks [@arshad-shah](https://github.com/arshad-shah)! - Add `homepage`, `repository`, `bugs`, and `keywords` to all publishable
  packages so the npm package pages render the GitHub source link, issue
  tracker, and Storybook URL (`https://cynosure.arshadshah.com`) in their
  sidebars. Pure metadata — no runtime or API changes.

## 1.1.0

### Minor Changes

- [#37](https://github.com/arshad-shah/cynosure/pull/37) [`66dd83a`](https://github.com/arshad-shah/cynosure/commit/66dd83a32a1e8f4695eb31e0d9abd30e51c2083b) Thanks [@arshad-shah](https://github.com/arshad-shah)! - Major DX upgrades that close the gap with MUI's zero-config setup.

  **New: `<CynosureProvider>`** — composes `ThemeProvider`, `DirectionProvider`, `LocaleProvider`, and the global `TooltipProvider` in one wrapper. Drop it once at the root and every component "just works". The individual providers are still exported for fine-grained composition.

  ```tsx
  import { CynosureProvider } from "@arshad-shah/cynosure-react";
  <CynosureProvider theme={{ defaultTheme: "system" }}>
    {children}
  </CynosureProvider>;
  ```

  **New: single CSS import** — `@arshad-shah/cynosure-react/all.css` bundles tokens (light + dark) and every component's CSS into one file. The legacy three-import path (`tokens/css`, `tokens/css/dark`, `react/styles.css`) still works.

  ```ts
  import "@arshad-shah/cynosure-react/all.css";
  ```

  **New: `npx cynosure init` CLI** — published as `@arshad-shah/cynosure-cli`. Detects Next.js App Router, Next.js Pages, Vite, CRA, or Remix; writes the CSS import; wires `CynosureProvider`; and for App Router projects scaffolds a `providers.tsx` client boundary. Includes `--dry-run` and is idempotent.

  **React 18 support** — peer dependency widened from `>=19` to `>=18` in `cynosure-react`, `cynosure-core`, and `cynosure-icons`. The library uses no React 19-only APIs, so this is a clean back-port. Now works with Next.js 13 / 14 / 15, Vite, CRA, and Remix on either React 18 or 19.

  **New docs**: `docs/foundations/rsc.mdx` — Server Components compatibility matrix with per-component classification, plus a Next.js App Router recipe (with `getThemeInitScript` for no-FOUC).

  **READMEs polished** — fixed npm badge URLs, added size/types/react/a11y badges, inlined a per-component bundle-size summary table.

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
