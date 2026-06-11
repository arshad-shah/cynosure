---
"@arshad-shah/cynosure-react": minor
---

DX & architecture: typed theming, zero-config CSS, RSC support, smaller tarball.

- **`defineTheme` — type-safe custom themes.** Author a theme from a typed token
  object (autocomplete on every slot; a typo is a compile error) instead of
  hand-written CSS. Pass it to the provider via `customThemes` and it's injected
  as an SSR-safe `<style>` and registered automatically, so `setTheme(name)` just
  works. You override only what differs; everything else cascades from the base
  tokens. The theme also carries its `colorScheme`, which drives the root
  `color-scheme`. `defineTheme` returns `{ name, colorScheme, css }`, so the CSS
  can also be written to a file at build time.
- **No stylesheet import required.** `CynosureProvider`/`ThemeProvider` now load
  the design tokens themselves (static side-effect imports of
  `@arshad-shah/cynosure-tokens/css` + `/css/dark`), so mounting the provider is
  the whole setup. It's a build-time import (no FOUC, SSR-safe), and only the
  ~3 KB token layer — per-component CSS still auto-loads on import. The standalone
  `all.css` / tokens CSS exports remain for provider-less usage, with a dev-only
  warning when tokens aren't detected.
- **RSC ready.** Every component entry now ships the `'use client'` directive, so
  you can import any component directly into a Next.js App Router Server Component
  with no hand-rolled client boundary.
- **Smaller install.** Source maps are no longer published (they were ~half the
  tarball).
