# Cynosure progress

## Status

Plan 1 (Foundation) in progress on branch `next`: tokens, theme, Storybook harness, Facet icons, Button/IconButton and the `cy` CLI are done and tested; docs and agent files done; CI and GitHub Pages next.

## Current task

Plan 1, Task 9: CI workflows, visual baselines, GitHub Pages deploy, push `next`.

## Next step

Write Plan 2 (Milestone 1 controls: Link, TextField, SearchField, TextArea, Select, SegmentedControl, Switch, Checkbox, RadioGroup, Tooltip, Badge, Kbd, Spinner, ThemeToggle, plus the real Vite adapter and optional Hanken font).

## Plans

- [ ] Plan 1: Foundation (`docs/superpowers/plans/2026-11-09-cynosure-foundation.md`), Tasks 1–8 done, Task 9 in progress
- [ ] Plan 2: Milestone 1 controls (not written)
- [ ] Plan 3: Milestone 2 structure and overlays (not written)
- [ ] Plan 4: Milestone 3 and product migration issues (not written)

## Blockers

None. Npm publish and deprecating old packages wait for Arshad's authorisation.

## Decision log

- 2026-11-09: Single package `@arshad-shah/cynosure` on branch `next`; Facet icons and Facet look approved; English strings with `labels` overrides.
- 2026-11-09: React components (Preact via compat), plain modern CSS, tokens in TS → CSS; no web components (content-script registry).
- 2026-11-09: Toolchain Vite 8, Vitest 5, Storybook 10.6, TypeScript 5.9 (not 7: tooling uses the TS API); pnpm refuses packages younger than 14 days.
- 2026-11-09: Theme input validated centrally (security review); gamut mapping bounded.
- 2026-11-09: Component roots never carry `.cy-reset` (found by hostile-host and shadow-root tests).
- 2026-11-09: No AI attribution in commits, PRs or issues.

## Verification

- `pnpm test`: unit, CLI and Preact suites green.
- `pnpm test:stories`: all stories green on Chromium, Firefox, WebKit, plus the touch project.
- `pnpm check`, `pnpm lint`, `pnpm typecheck`, `pnpm build`: green. Size: all CSS 3.0 kB gzip, Button 2.1 kB.
- Not yet verified: CI on Linux, visual baselines, GitHub Pages deploy.

## How to resume

```bash
git clone https://github.com/arshad-shah/cynosure.git && cd cynosure && git checkout next
nvm use && corepack enable && pnpm install
pnpm exec playwright install chromium firefox webkit
pnpm cy progress && pnpm verify
pnpm storybook
```
Then continue at "Current task" above, following `AGENTS.md`.
