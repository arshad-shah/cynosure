# Lumen UI — Progress Tracker

> **This is the single source of truth for the state of the project.** Update it after every commit. If it disagrees with the code, the code wins and this file is wrong — fix it.

---

## Phase status

| # | Phase                         | Status        | Started    | Completed  | Notes |
|---|-------------------------------|---------------|------------|------------|-------|
| 01 | Foundation & tooling         | ⬜ Not started |            |            |       |
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

> **Phase:** —
> **Next action:** Read `phases/01-foundation.md` and initialise the monorepo.

---

## Decisions log

Record every meaningful technical decision here, with rationale. When you (or future-you) wonder "why did we do X?", this is the answer.

| Date | Decision | Rationale |
|------|----------|-----------|
| YYYY-MM-DD | _example: Chose tsup over Vite library mode for per-component builds_ | _Simpler config, faster builds, preserves module structure for tree-shaking without needing vite-plugin-lib-inject-css gymnastics._ |

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

- _no entries yet_

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
