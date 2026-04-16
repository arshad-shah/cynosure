# Lumen UI — Progress Tracker

> **This is the single source of truth for the state of the project.** Update it after every commit. If it disagrees with the code, the code wins and this file is wrong — fix it.

---

## Phase status

| # | Phase                         | Status        | Started    | Completed  | Notes |
|---|-------------------------------|---------------|------------|------------|-------|
| 01 | Foundation & tooling         | 🟢 Complete    | 2026-04-16 | 2026-04-16 | Pinned to Storybook 8.6 and Vitest 2.1 (node env); Playwright browser mode deferred to Phase 14. |
| 02 | Design tokens                | ⬜ Not started |            |            |       |
| 03 | Theming system               | ⬜ Not started |            |            |       |
| 04 | Core utilities               | ⬜ Not started |            |            |       |
| 05 | Layout primitives            | ⬜ Not started |            |            |       |
| 06 | Typography                   | ⬜ Not started |            |            |       |
| 07 | Forms — basic                | ⬜ Not started |            |            |       |
| 08 | Forms — advanced             | ⬜ Not started |            |            |       |
| 09 | Overlays                     | ⬜ Not started |            |            |       |
| 10 | Navigation                   | ⬜ Not started |            |            |       |
| 11 | Data display                 | ⬜ Not started |            |            |       |
| 12 | Feedback                     | ⬜ Not started |            |            |       |
| 13 | Form composition             | ⬜ Not started |            |            |       |
| 14 | Testing & quality hardening  | ⬜ Not started |            |            |       |
| 15 | Documentation site           | ⬜ Not started |            |            |       |
| 16 | v1.0.0 release               | ⬜ Not started |            |            |       |

**Legend:** ⬜ Not started · 🟡 In progress · 🟢 Complete · 🔴 Blocked

---

## Current focus

> **Phase:** 02 — Design tokens
> **Next action:** Read `02-design-tokens.md` and set up the DTCG + Style Dictionary pipeline in `@lumen/tokens`.

---

## Decisions log

Record every meaningful technical decision here, with rationale. When you (or future-you) wonder "why did we do X?", this is the answer.

| Date | Decision | Rationale |
|------|----------|-----------|
| 2026-04-16 | Pinned `packageManager` to `pnpm@10.33.0` instead of the spec's `pnpm@9.15.0` | pnpm 10 is what ships with the toolchain in this environment; 10.x is backwards-compatible with the 9.x config. |
| 2026-04-16 | Set `.npmrc` to `strict-peer-dependencies=false` + `auto-install-peers=true` | Strict peer deps + the current Storybook 8 / React 19 / Vitest 2 matrix produced unresolvable conflicts. Revisit once Storybook 9 is stable (Phase 14). |
| 2026-04-16 | Pinned Storybook to `^8.4.0` (resolved to 8.6.18) | Spec said "10 or latest stable 9.x" — Storybook 10 was not yet released in this env and 9.x had incompatibilities with the `@storybook/addon-*` versions needed. Upgrade in Phase 14. |
| 2026-04-16 | Pinned Vitest to `^2.1.0` (not 3.x) and used `environment: 'node'` for now | Browser mode + Playwright install (~170MB) is unnecessary until Phase 05 has actual components. Phase 14 switches to Vitest browser mode + Playwright Chromium per spec. |
| 2026-04-16 | Omitted `@storybook/addon-vitest` from `.storybook/main.ts` for Phase 01 | Addon is Storybook-9-shaped and wiring it meaningfully requires story play-functions. Phase 14 wires it. |
| 2026-04-16 | Added `--no-open` to the root `storybook` script | The dev sandbox has no `xdg-open`; without the flag Storybook crashes after starting. |
| 2026-04-16 | `.changeset/config.json` repo set to `arshad-shah/lumen` | Matches the GitHub MCP repo scope; spec had a typo. |
| 2026-04-16 | Added `@lumen/config` to Changesets `ignore` list | It's private/internal and must never be published. |
| 2026-04-16 | Used `publint <pkg-dir>` (not `<pkg-dir>/dist`) | publint 0.3.x expects the package root; it packs via `pnpm pack` internally. |

---

## Open questions / risks

Things that aren't blocking yet but need answering before they become blocking.

- [ ] _example: Do we need a Vue port? If so, extract `@lumen/core` further._
- [ ] _example: Chromatic budget — is $149/mo justified, or use Playwright visual comparison locally?_

---

## Change log

Append every commit here. **This is your audit trail.** One line per commit, newest at the top.

Format:
```
<date> · <short-hash> · <scope> · <one-sentence summary> · [changeset: <level>]
```

Example:
```
2026-04-17 · a1b2c3d · @lumen/react · feat(phase-05): add Stack layout primitive with space/direction variants · [changeset: minor]
2026-04-17 · e4f5g6h · @lumen/tokens · chore(phase-02): bump spacing scale to 4-based · [changeset: patch]
```

### Entries

<!-- newest at top; append after every commit -->

<!-- commit hashes appended after `git commit` lands each chunk; see `git log --oneline` for the canonical record -->
- 2026-04-16 · repo · chore(phase-01): complete Phase 01 foundation scaffold (monorepo, tooling, Storybook, Vitest, tsup, CI, playground)

---

## Release history

Populated automatically by Changesets, but mirror major releases here for quick reference.

| Version | Date | Highlights |
|---------|------|------------|
| _none yet_ | | |

---

## Dependencies watch

Monitor these for security advisories and major version bumps.

- React (peer)
- Radix Primitives (direct)
- React Aria Components (direct)
- Vanilla Extract (build-time)
- Storybook (dev)
- Vitest (dev)
- Biome (dev)
