# Cynosure progress

## Status

Plan 1 (Foundation) complete on `next` and green in CI (all engines, touch, coverage ≥ 95%, visual regression). Storybook live at https://arshad-shah.github.io/cynosure/.

## Current task

None in progress. Plan 1 finished and reviewed.

## Next step

Write Plan 2 (Milestone 1 controls: Link, TextField, SearchField, TextArea, Select, SegmentedControl, Switch, Checkbox, RadioGroup, Tooltip, Badge, Kbd, Spinner, ThemeToggle; the real Vite adapter; optional Hanken font; dark and contrast visual baselines). Fold in the deferred review minors listed under Decision log.

## Plans

- [x] Plan 1: Foundation (`docs/superpowers/plans/2026-11-09-cynosure-foundation.md`)
- [ ] Plan 2: Milestone 1 controls (not written)
- [ ] Plan 3: Milestone 2 structure and overlays (not written)
- [ ] Plan 4: Milestone 3 and product migration issues (not written)

## Feedback round (2026-11-09, after Plan 1)

- LoadingDots component (three pulsing dots; size, tone, colour, speed; visible under reduced motion); Button reuses it.
- Button API is `variant` (solid, soft, outline, ghost) × `tone` (accent, neutral, danger, success, warning, info); every pair tested distinct and ≥ 4.5:1.
- Ember brand accent `#c2410c` with white text; crimson danger (`#b4235a` / `#ff6b8f`); per-tone text roles.
- Logo and lockup recoloured to ember; wordmark readable on light backgrounds; PNG and ICO regenerated.
- Facet icons are stroke only (accent dot removed); 136 icons in 15 categories with a categorised gallery.
- Shared prop vocabulary (`size`, `tone`, `variant`, `color`) in `docs/conventions.md` and the `cy new component` template; Storybook controls for every prop.

## Blockers

None. Npm publish and deprecating old packages wait for Arshad's authorisation.

## Decision log

- 2026-11-09: Single package `@arshad-shah/cynosure` on branch `next`; Facet icons and Facet look approved; English strings with `labels` overrides.
- 2026-11-09: Arshad: remove the accent dot from icons (stroke only); one prop vocabulary across components; loading indicator is its own component (three pulsing dots).
- 2026-11-09: React components (Preact via compat), plain modern CSS, tokens in TS → CSS; no web components (content-script registry).
- 2026-11-09: Toolchain Vite 8, Vitest 5, Storybook 10.6, TypeScript 5.9 (not 7: tooling uses the TS API); pnpm refuses packages younger than 14 days.
- 2026-11-09: Theme input validated centrally (security review); gamut mapping bounded.
- 2026-11-09: Component roots never carry `.cy-reset` (found by hostile-host and shadow-root tests).
- 2026-11-09: No AI attribution in commits, PRs or issues.
- 2026-11-09: Final review fixes: component roots use doubled selectors (Tailwind v3 `[type=button]`), tokens only on `:root`/`:host` (nested themes inherit), no `color-scheme` on host `<html>`, hover/active move away from on-accent text, transparent focus outline for forced colors, coverage floor 95%.
- 2026-11-09: Visual baselines: Chromium on Linux; refresh by pushing a commit to `next` containing `[baselines]` (dispatch needs the workflow on `main`).
- Deferred review minors for Plan 2: colour error messages for garbage input, alpha handling, scale validation, radius re-derivation on height overrides, selector lists in themeToCss, async storage race, cy check gaps (named colours, foundations CSS, createElement, glyph strings, budgets/exports rules, title prop false positive), danger tokens, "use client" and React 18 smoke test, budgets for Icon and createTheme, stronger shadow-root tests, OS reduced motion on component roots, document-target unmount restoring host attributes, SSR CSP for inline styles, clif --help with required positionals.

## Verification

- CI (GitHub Actions, Linux) green: conventions, lint, types, unit, stories on Chromium/Firefox/WebKit + touch, coverage (97% branches, 100% lines), visual regression, build, publint, attw, size.
- Size: all CSS 3.1 kB gzip, Button 2.1 kB.
- Not verified: real extension contexts (Prism/Aperture shadow roots under MV3 CSP), Safari/Edge outside Playwright engines.

## How to resume

```bash
git clone https://github.com/arshad-shah/cynosure.git && cd cynosure && git checkout next
nvm use && corepack enable && pnpm install
pnpm exec playwright install chromium firefox webkit
pnpm cy progress && pnpm verify
pnpm storybook
```
Then continue at "Current task" above, following `AGENTS.md`.
