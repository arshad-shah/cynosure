# Lumen UI — Progress Tracker

> **This is the single source of truth for the state of the project.** Update it after every commit. If it disagrees with the code, the code wins and this file is wrong — fix it.

---

## Phase status

| # | Phase                         | Status        | Started    | Completed  | Notes |
|---|-------------------------------|---------------|------------|------------|-------|
| 01 | Foundation & tooling         | 🟢 Complete    | 2026-04-16 | 2026-04-16 | Pinned to Storybook 8.6 and Vitest 2.1 (node env); Playwright browser mode deferred to Phase 14. |
| 02 | Design tokens                | 🟢 Complete    | 2026-04-16 | 2026-04-16 | DTCG primitives + semantic (light/dark) → Style Dictionary → per-theme CSS + typed TS. Combined base+dark gzipped ≈ 2.3 KB. Typography composites are pre-expanded to flat CSS custom properties. |
| 03 | Theming system               | 🟢 Complete    | 2026-04-16 | 2026-04-16 | `@lumen/react` ThemeProvider/DirectionProvider + hooks; `@lumen/themes` ships terminal + high-contrast as side-effect CSS; tokens gain breakpoints, focus shadow, and a reduced-motion override. |
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

> **Phase:** 04 — Core utilities
> **Next action:** Read `04-core-utilities.md` and start filling out `@lumen/core` (cn, polymorphic helpers, focus-ring utilities, Slot, etc.) on top of the now-complete theming layer.

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
| 2026-04-16 | Pre-expand DTCG `typography` composites into flat sub-tokens (`family`, `size`, `weight`, `line-height`, `letter-spacing`) via a preprocessor | CSS has no single property that captures the full composite portably, and the `css/variables` format can't emit a nested shorthand on its own. Consumers compose via separate custom properties, matching the spec's "shorthand or individual" guidance. |
| 2026-04-16 | Generated TS tokens land in `src/generated/` (gitignored) | Keeps tsup's `rootDir: src` assumption intact and lets tsup bundle the re-exports. CSS goes to `dist/css/` directly; tsup runs with `clean: false` after Style Dictionary so the CSS survives. |
| 2026-04-16 | Dark theme stylesheet emits only semantic overrides (uses SD `include` + file-path filter) | Primitives live in base.css. Keeps dark.css small (gzipped ≈ 0.5 KB) and guarantees one canonical primitive definition. |
| 2026-04-16 | `@lumen/tokens` tsconfig sets `composite: false` | tsup's DTS worker (rollup-plugin-dts) refused to include the generated files under the inherited `composite: true`. Disabling composite on the package tsconfig fixes the build; root references don't use `tsc --build` anyway. |
| 2026-04-16 | Roll our own `ThemeProvider` instead of `next-themes` | The whole module is < 200 LOC, has no peer-dep, and lets us couple cleanly with our `@lumen/tokens` CSS layer (no need to map theme names through `next-themes`'s `value` prop). |
| 2026-04-16 | `@lumen/themes` is CSS-only — dropped tsup, tsconfig, src/index.ts | The package's only artefacts are `terminal/index.css` and `high-contrast/index.css`, exposed via `exports`. Adding a TS entrypoint would emit an empty bundle and pollute `attw`/`publint` runs. |
| 2026-04-16 | `@lumen/themes` distributes CSS straight from `src/` | Avoids a meaningless build step and keeps consumers reading the same file authors edit. The `files` whitelist publishes only `src/`. |
| 2026-04-16 | Wrap our `DirectionProvider` around Radix's `DirectionProvider` | Radix primitives in Phases 09+ read direction from Radix's context. Mirroring it now means `<DirectionProvider dir="rtl">` flips Lumen + Radix in one place. |
| 2026-04-16 | `@lumen/react/theme` subpath ships a sidecar `theme/package.json` for Node10 resolution | `attw` flags `no-resolution` under node10 because that profile predates `exports`. The `theme/` shim re-points node10 to `dist/theme/index.{js,d.ts}` without changing modern resolution. |
| 2026-04-16 | `@lumen/react` tsconfig sets `composite: false` | Same reason as `@lumen/tokens`: `rollup-plugin-dts` refuses subpath entries under composite. Root tsconfig dropped the `packages/react` reference along with it. |
| 2026-04-16 | Reduced-motion CSS appended to `dist/css/base.css` by the Style Dictionary build | Style Dictionary's `css/variables` format can't emit an `@media` block; appending after the build keeps the snippet inside the same file consumers already import via `@lumen/tokens/css`. |
| 2026-04-16 | Custom theme names default `colorScheme` to dark when the name matches `/dark|terminal|midnight|night/i`, otherwise light | Provides a useful default so `colorScheme` is meaningful for prebuilt themes; consumers can still override by setting `color-scheme` in their own CSS. |
| 2026-04-16 | CI publint path corrected (`packages/react`, not `packages/react/dist`) and `@lumen/themes` added to publint+attw runs | The Phase 01 wiring pointed at `dist/`, which publint can't read directly (it expects the package root). Phase 02's decision log already flagged the right pattern; this commit updates CI to match and extends both checks to themes. |
| 2026-04-16 | Promoted `build:tokens` to a turbo task and made `@lumen/tokens#typecheck`/`#build` depend on it | Turbo runs typecheck and build in parallel within a package. The tokens build script's `pnpm clean` step deletes `src/generated/` mid-typecheck, so CI's clean run failed `tsc` with `Cannot find module './generated/base.js'`. Modelling Style Dictionary as its own task forces typecheck to wait until the generated files exist. |
| 2026-04-16 | Bumped CI / `engines.node` from Node 20 → Node 22 | `@lumen/config` exports `tsup.config.base.ts` as a `.ts` file. tsup transpiles `tsup.config.ts` to JS but the runtime `import` of `@lumen/config/tsup.config.base` then hits Node's ESM loader, which only natively understands `.ts` from Node 22 (`--experimental-strip-types` is on by default in 22.6+). Reproduced the failure under Node 20 locally; bumping CI fixes it without forcing a tsx/jiti runtime loader into every config import. |

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
- 2026-04-16 · @lumen/react,@lumen/themes,@lumen/tokens · feat(phase-03): runtime-free theming system — ThemeProvider, DirectionProvider, hooks, getThemeInitScript; prebuilt terminal + high-contrast themes; breakpoint tokens, focus shadow, reduced-motion CSS [changeset: minor × 3]
- 2026-04-16 · @lumen/tokens · feat(phase-02): DTCG token pipeline (primitives + semantic light/dark, Style Dictionary v4 CSS+TS output, Ajv schema validator) [changeset: minor]
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
