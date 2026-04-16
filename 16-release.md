# Phase 16 — v1.0.0 Release

> **Goal:** Flip Lumen from `0.x` private development to public `1.0.0` on npm. Adopt it in one of Arshad's real projects as the proof point.

**Depends on:** Phases 01–15.
**Blocks:** Nothing — this is the finish line.

---

## Pre-release checklist

### Code
- [ ] All phase exit criteria met (re-verify by checking `PROGRESS.md`).
- [ ] No TODO/FIXME comments in published source (`rg 'TODO|FIXME' packages/*/src`).
- [ ] No `console.log` or `debugger` statements (Biome already catches these, but verify).
- [ ] Every deprecation used in code is either removed or noted in CHANGELOG.
- [ ] Every exported name is final — breaking changes here mean major bumps later.

### Tests
- [ ] `pnpm test` green on Chromium, Firefox, WebKit.
- [ ] Coverage ≥ 85% across all published packages.
- [ ] Chromatic baselines captured and approved.
- [ ] No flaky tests (run the test suite 3x; any flake fails release).

### Package health
- [ ] `publint` clean on every published package.
- [ ] `attw` clean on every published package (strict profile).
- [ ] `pnpm pack` and install into a fresh test project; verify `import { Button } from '@lumen/react'` resolves types and runtime works.
- [ ] Per-component entries work: `import { Button } from '@lumen/react/button'`.
- [ ] `peerDependencies` correct; no accidentally-bundled React.
- [ ] `sideEffects` array points only to `**/*.css` files.

### Bundle
- [ ] `pnpm size` passes; every component within budget.
- [ ] Gzipped barrel bundle documented in README with a date-stamped size.
- [ ] No duplicated deps in the workspace (`pnpm why <pkg>` for react, radix, react-aria).

### Docs
- [ ] Every component has an MDX page.
- [ ] README at repo root and in `@lumen/react` are consumer-facing and accurate.
- [ ] CHANGELOG populated from all changesets.
- [ ] Migration guide from "nothing" to v1 published (even if trivial — say so).
- [ ] LICENSE file (MIT).
- [ ] CONTRIBUTING.md with the full phase-based workflow.
- [ ] CODE_OF_CONDUCT.md (contributor covenant).
- [ ] SECURITY.md with disclosure email.

---

## The bump to 1.0.0

Changesets defaults to "pre.0" style pre-releases. For the 1.0.0 cut:

```bash
# Consume every outstanding changeset into final versions
pnpm changeset version

# Manually edit package.json in each @lumen/* package to set "version": "1.0.0"
# (Changesets will have moved them to something like 0.1.0 by default)

# Regenerate the lockfile
pnpm install

# Commit
git add -A
git commit -m "chore(release): v1.0.0"
```

Then:

```bash
# Tag and publish
git tag v1.0.0
git push --follow-tags

# Publish
pnpm changeset publish
```

Or let the release workflow handle it:
- Push to `main` → changesets/action opens a "Release: v1.0.0" PR → merge → workflow publishes.

### Pin strategy for linked packages

Because `@lumen/*` are linked in the Changesets config, they all move to 1.0.0 together. This is the behaviour we want — a cohesive design system releases as a unit.

---

## npm publishing

### Scope
Reserve the `@lumen` scope on npm (or `@arshadshah/lumen` if `@lumen` is taken — check availability in advance).

### Provenance
Publishing workflow uses `--provenance` (already wired in Phase 01 via `NPM_CONFIG_PROVENANCE: 'true'`). This cryptographically signs packages with GitHub Actions attestation metadata — installable with `npm audit signatures`.

### 2FA
Enable npm 2FA on publish. Configure automation token with `--auth-type=web`. Protect the `NPM_TOKEN` secret in GitHub.

### Access
All packages are `"access": "public"` in `publishConfig`.

---

## Release announcement

### Blog post
Write an announcement post. Outline:

1. What Lumen is (one-paragraph pitch from the README).
2. Why another UI framework (tiny, tree-shakable, composable primitives, no CSS to write).
3. Installation + first component.
4. Theming walkthrough (show dark mode + terminal theme).
5. The primitive → composition philosophy.
6. Testing + quality story.
7. What's next (roadmap teaser).
8. Thanks + links.

Publish on Arshad's own blog / personal site (consistent with the rest of his writing).

### Social
- Twitter/X thread with screenshots + code snippets.
- Bluesky post for the design-system community.
- Dev.to cross-post of the blog.
- r/reactjs post (after 24h to not be too self-promotional).

### Communities
- Post in Storybook Discord.
- Post in Radix Primitives Discussions.
- Cross-post relevant recipes to CodeSandbox / StackBlitz.

---

## Dogfood: adopt in a real project

Pick **one** of Arshad's active projects and port it to Lumen:

Candidates:
- **CCTUI** — terminal for Claude Code. Already uses the GitHub Dark Terminal aesthetic; natural fit.
- **OpsPilot** — devops CLI/UI. Benefits from DataTable, Command palette recipe, Form composition.
- **Nimaz web companion** (if any web surface exists) — natural fit for RTL support testing.
- **arshadshah.com** itself — smallest surface, quickest wins.

**Recommendation:** start with **arshadshah.com** — small, visible, proves the install/consume flow end-to-end. Then migrate CCTUI next (bigger surface, exercises more components).

### Dogfood checklist
- [ ] `pnpm add @lumen/react` works in a real project.
- [ ] Tree-shaking confirmed: production bundle only contains imported components (inspect with `@next/bundle-analyzer` or Rollup visualiser).
- [ ] Theme switching works in production build.
- [ ] No hydration mismatch on SSR frameworks.
- [ ] Lighthouse scores maintained/improved post-migration.

Log findings back into `PROGRESS.md` — anything surprising becomes a patch release or a note for v1.1.

---

## Post-release cadence

### Semver discipline
- **Patch** (1.0.x): bug fixes, no API changes, no visual changes beyond fixes.
- **Minor** (1.x.0): new components, new props (additive), new variants. No breaking changes.
- **Major** (2.0.0): breaking changes. Requires migration guide, codemod where possible, deprecation period.

### Deprecation policy
Deprecations stay for one minor cycle before removal in the next major. Mark with JSDoc `@deprecated` and a console warning in dev mode.

### Release cadence
- Patch releases: as-needed, could be daily.
- Minor releases: monthly cadence is healthy. Batch new components / non-breaking features.
- Major releases: rare. Plan publicly via GitHub Discussions.

### Support window
- Current major: full support.
- Previous major: security/bugfix only, for 6 months.
- Older: best effort.

---

## Roadmap teaser (v1.1 and beyond)

Good things to signal even if unscheduled:

- **Command palette component** (recipe → first-class component).
- **Toast collaborative API** (queue controls, grouped toasts).
- **Charts** (thin wrappers over Recharts/Visx with Lumen theming).
- **RichText / Markdown editor primitives**.
- **@lumen/forms** — a higher-level form package with built-in validation adapters.
- **@lumen/vue** — framework port (not promised, but the clean `@lumen/core` separation means it's feasible).

---

## Exit criteria

- [ ] `@lumen/react` v1.0.0 published to npm.
- [ ] `@lumen/tokens`, `@lumen/themes`, `@lumen/core`, `@lumen/icons` all v1.0.0 on npm.
- [ ] Provenance attached (verify with `npm audit signatures`).
- [ ] Docs site live at `lumen.arshadshah.com`.
- [ ] Dogfood project shipped with Lumen.
- [ ] Announcement post published.
- [ ] GitHub repo public; stars, issues, discussions enabled.
- [ ] `PROGRESS.md` updated with release info and archived as v1.0.0 state.
- [ ] Changesets: final snapshot "Release v1.0.0".

## Decisions to log

- npm scope: `@lumen` (or fallback to `@arshadshah/lumen`).
- Dogfood project order: arshadshah.com → CCTUI → OpsPilot.
- Semver policy: documented in CONTRIBUTING.md.

---

## Closing note

When the final release goes out, remember:

**The hard work wasn't building any one component.** It was:
1. The token pipeline.
2. The per-component ESM build.
3. The primitives → composition discipline.
4. The accessibility rigour.
5. The testing infrastructure.
6. The docs.

That's what made every component boringly correct to build. The components are the easy part if the foundation is right.

Congratulations. Move on to v1.1.
