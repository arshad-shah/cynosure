# Phase 14 — Testing & quality hardening

> **Goal:** Go from "it compiles and the tests pass" to "it's ready for production". This phase adds budgets, audits, visual regression, cross-browser checks, and the CI discipline to enforce them forever.

**Depends on:** Phases 01–13 (all components exist).
**Blocks:** Phase 15 (docs) and 16 (release).

---

## Deliverables

1. **Bundle-size budgets** per component, enforced in CI via `size-limit`.
2. **Visual regression testing** — Chromatic integration (paid, recommended) OR Playwright screenshot tests (free, more manual).
3. **Cross-browser testing** — Vitest browser mode tested against Chromium, Firefox, WebKit.
4. **Axe a11y audit** — every story passes; CI fails on regressions.
5. **Colour contrast audit** — scripted check against WCAG AA for every theme.
6. **Keyboard-only audit** — every interactive story has keyboard coverage.
7. **RTL audit** — every layout story has a mirror RTL story.
8. **Package health** — `publint` + `attw` as CI gates.
9. **Coverage thresholds** — minimum 85% line coverage across packages.
10. **Dependency freshness** — Renovate/Dependabot configured.
11. **Release-blocking CI workflow** — can't release unless every gate is green.

---

## 1. Bundle-size budgets

Install:
```bash
pnpm -w add -D size-limit @size-limit/preset-small-lib @size-limit/webpack
```

Add `.size-limit.json` at repo root:

```json
[
  { "name": "Box", "path": "packages/react/dist/box.js", "limit": "3 kB", "ignore": ["react", "react-dom"] },
  { "name": "Stack", "path": "packages/react/dist/stack.js", "limit": "3 kB", "ignore": ["react", "react-dom"] },
  { "name": "Button", "path": "packages/react/dist/button.js", "limit": "5 kB", "ignore": ["react", "react-dom"] },
  { "name": "Input", "path": "packages/react/dist/input.js", "limit": "6 kB", "ignore": ["react", "react-dom"] },
  { "name": "Checkbox", "path": "packages/react/dist/checkbox.js", "limit": "8 kB", "ignore": ["react", "react-dom"] },
  { "name": "Select", "path": "packages/react/dist/select.js", "limit": "20 kB", "ignore": ["react", "react-dom"] },
  { "name": "DatePicker", "path": "packages/react/dist/date-picker.js", "limit": "30 kB", "ignore": ["react", "react-dom"] },
  { "name": "Dialog", "path": "packages/react/dist/dialog.js", "limit": "12 kB", "ignore": ["react", "react-dom"] },
  { "name": "DataTable", "path": "packages/react/dist/data-table.js", "limit": "45 kB", "ignore": ["react", "react-dom"] },
  { "name": "Full barrel (warning-only)", "path": "packages/react/dist/index.js", "limit": "150 kB", "ignore": ["react", "react-dom"] }
]
```

Numbers above are initial ceilings — tighten over time, never loosen without a changeset explaining why.

Add `pnpm size` script; wire into CI `verify` job:

```yaml
- run: pnpm size
```

Failing the budget fails CI.

---

## 2. Visual regression

### Preferred: Chromatic

```bash
pnpm -w add -D chromatic
```

Add workflow:

```yaml
# .github/workflows/chromatic.yml
name: Chromatic
on: { pull_request: {}, push: { branches: [main] } }
jobs:
  chromatic:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
        with: { fetch-depth: 0 }
      - uses: pnpm/action-setup@v4
      - uses: actions/setup-node@v4
        with: { node-version: 20, cache: pnpm }
      - run: pnpm install --frozen-lockfile
      - run: pnpm build
      - uses: chromaui/action@v11
        with:
          projectToken: ${{ secrets.CHROMATIC_PROJECT_TOKEN }}
          exitZeroOnChanges: false
          onlyChanged: true
```

Chromatic takes a screenshot of every story, compares per-PR, shows a visual diff UI, and lets you accept/reject changes. This is the best way to maintain visual consistency — strongly recommended.

### Alternative: Playwright snapshot tests (free)

If Chromatic budget is blocked, add Playwright tests that:
1. Build Storybook to static.
2. Launch a local server.
3. Visit every story URL.
4. Take a screenshot, compare against a stored baseline.

Add `scripts/visual-test.spec.ts` using `@playwright/test`. Store baselines under `.playwright/snapshots/`. Run per-browser. Slower, less ergonomic, but free.

**Decision:** start with Chromatic. It's worth the money on a design system. If rejected, switch to Playwright.

---

## 3. Cross-browser testing

Extend Vitest browser mode to run against all three engines on CI:

```ts
// packages/react/vitest.config.ts
test: {
  browser: {
    enabled: true,
    provider: 'playwright',
    instances: [
      { browser: 'chromium' },
      { browser: 'firefox' },
      { browser: 'webkit' },
    ],
    headless: true,
  },
}
```

Locally, default to Chromium only (fast); CI runs all three. Gate with an env var:

```ts
const ciBrowsers = process.env.CI ? ['chromium', 'firefox', 'webkit'] : ['chromium'];
```

---

## 4. Axe a11y audit

Phase 01 already installed `@storybook/addon-a11y`. Here we:

- Set `parameters.a11y.test = 'error'` globally in `.storybook/preview.ts` so any violation fails tests.
- Tag stories with `tags: ['a11y-critical']` for components that are particularly sensitive (Dialog, DatePicker, etc.) — we'll use this to filter in CI reports.
- Add exception list in `.storybook/preview.ts` for the rare legitimate axe false positive (document each).

---

## 5. Colour contrast audit

Write a script: `scripts/audit-contrast.mjs`:

```js
import { readFileSync } from 'node:fs';
import postcss from 'postcss';
import Color from 'colorjs.io';

// Parse dist/css/base.css, extract :root {--lumen-*: …}
// Parse dist/css/dark.css similarly.
// For each "foreground × background" pair that we know is paired:
//   check WCAG AA (4.5:1 for normal text, 3:1 for large text)
// Emit failures.

const pairs = [
  { fg: 'foreground-default', bg: 'background-canvas', min: 4.5 },
  { fg: 'foreground-muted', bg: 'background-canvas', min: 4.5 },
  { fg: 'accent-onSolid', bg: 'accent-solid', min: 4.5 },
  { fg: 'foreground-default', bg: 'background-subtle', min: 4.5 },
  // …
];

// For each theme (base, dark, terminal, high-contrast):
//   resolve variables → check pairs → report
```

Run on every PR. Fails CI if any pair drops below the threshold. This catches theme authors who bump a colour without checking contrast.

Install `colorjs.io` for accurate APCA/WCAG calculations.

---

## 6. Keyboard-only audit

A manual-ish process: for every interactive component, have a `*.keyboard.stories.tsx` story that exercises every keyboard interaction (Tab, Shift+Tab, Enter, Space, arrow keys, Escape, Home/End, typeahead). These run as play functions under Vitest addon — if they fail, CI fails.

Write a linting rule (Biome custom rule or a script) that flags any component with `onClick` but no `onKeyDown` handler AND no native interactive element underneath. Too broad? Start with a markdown checklist and enforce via PR review.

---

## 7. RTL audit

For every layout-sensitive component (all of them, really), add an RTL story:

```tsx
export const RTL: Story = {
  decorators: [(Story) => <DirectionProvider dir="rtl"><Story /></DirectionProvider>],
};
```

Make these visible in Chromatic alongside LTR so regressions are caught visually.

**Logical properties everywhere.** Audit all `.css.ts` files for physical properties (`margin-left`, `padding-right`, `border-left`) and replace with logical ones (`margin-inline-start`, `padding-inline-end`, `border-inline-start`). Write a Biome custom rule or a simple grep script enforced in CI:

```bash
! grep -rE '(margin|padding|border)-(left|right)' packages/react/src
```

---

## 8. Package health

Phase 01 added `publint` and `attw` to CI. Harden:

- Both run on every PR.
- `attw` pinned to strict profile.
- Add `@publint/core` rules for `sideEffects` correctness (already covered but worth the explicit check).

---

## 9. Coverage thresholds

In each package's `vitest.config.ts`:

```ts
coverage: {
  provider: 'v8',
  reporter: ['text', 'html', 'lcov'],
  thresholds: {
    lines: 85,
    functions: 85,
    branches: 80,
    statements: 85,
  },
  include: ['src/**/*.{ts,tsx}'],
  exclude: ['src/**/*.stories.tsx', 'src/**/*.test.{ts,tsx}', 'src/**/index.ts'],
}
```

Run with `vitest run --coverage` in CI. Fail if below.

---

## 10. Dependency freshness

Add Renovate config (`.github/renovate.json`):

```json
{
  "$schema": "https://docs.renovatebot.com/renovate-schema.json",
  "extends": ["config:recommended", ":prHourlyLimit2", ":prConcurrentLimit10"],
  "schedule": ["before 6am on monday"],
  "packageRules": [
    { "matchPackageNames": ["react", "react-dom"], "enabled": false },
    { "matchPackagePatterns": ["^@radix-ui/"], "groupName": "radix" },
    { "matchPackagePatterns": ["^react-aria"], "groupName": "react-aria" },
    { "matchPackagePatterns": ["^@vanilla-extract/"], "groupName": "vanilla-extract" },
    { "matchPackagePatterns": ["^@storybook/"], "groupName": "storybook" }
  ],
  "labels": ["dependencies"],
  "rangeStrategy": "bump"
}
```

---

## 11. Release-blocking CI

The release workflow (Phase 01) runs after `verify` passes. Ensure `verify` is the choke point:

```yaml
verify:
  steps:
    - lint
    - typecheck
    - test (cross-browser)
    - test:coverage
    - build
    - size
    - audit:contrast
    - publint
    - attw
```

Nothing merges to `main` without green verify. Nothing publishes without green main.

---

## 12. Lighthouse CI for the Storybook docs site (optional)

Once the Storybook docs are hosted (e.g. on Vercel or Chromatic), add Lighthouse CI to check perf/a11y scores for the docs itself.

```bash
pnpm -w add -D @lhci/cli
```

`lighthouserc.json`:

```json
{
  "ci": {
    "assert": {
      "assertions": {
        "categories:accessibility": ["error", { "minScore": 0.95 }],
        "categories:performance": ["warn", { "minScore": 0.85 }]
      }
    }
  }
}
```

---

## Exit criteria

- [ ] `pnpm size` passes; all budgets met.
- [ ] Chromatic enabled; first baseline captured.
- [ ] Cross-browser Vitest passes on Chromium + Firefox + WebKit.
- [ ] Axe audit clean across all stories.
- [ ] Contrast script passes for all themes (base, dark, terminal, high-contrast).
- [ ] Coverage ≥ 85% across all packages.
- [ ] RTL audit: zero physical CSS properties in `packages/react/src`.
- [ ] `publint` + `attw` clean for every published package.
- [ ] CI pipeline completes in < 10 minutes.
- [ ] Renovate configured and first PRs landing cleanly.
- [ ] Changesets: `@lumen/react` patch "Testing infrastructure hardening".

## Decisions to log

- Chromatic vs Playwright for visual regression. **Decision: Chromatic** — budget-justifiable for a design system that Arshad will use across multiple projects; the review UX saves real time.
- Cross-browser in local dev: Chromium only. CI: all three. Faster local loop, fuller CI.
- Coverage thresholds: 85%/85%/80%/85%. Aggressive but achievable given how test-heavy the phase-by-phase plan has been.
