# @arshad-shah/cynosure-cli

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
