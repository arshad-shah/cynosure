---
'@lumen/react': patch
---

Phase 14 — testing & quality hardening.

Repo-wide CI gates are now release-blocking; `@lumen/react` itself only changes visually where physical CSS properties on RTL-sensitive components were rewritten to logical equivalents so layouts flip correctly under `<DirectionProvider dir="rtl">`.

- **Logical properties everywhere.** `Callout`, `Tag`, `Divider` (vertical variants), `NavigationMenu` indicator arrow, `Tabs` (vertical list separator), `CodeBlock` line numbers, `overlay/shared/menu` items/shortcuts/indicators, and `feedback/shared/surface` close button all moved from `margin-left` / `padding-right` / `border-left-*` to `margin-inline-start` / `padding-inline-end` / `border-inline-start-*`. Consumer-facing layout props (`<Box paddingLeft="4">` etc.) stay physical by design — they remain a physical-intent escape hatch.
- **RTL audit script** (`scripts/audit-rtl.mjs`) greps every `*.css.ts` in `packages/react/src` for physical directional properties and fails CI on new occurrences. Two files are on the allowlist with documented rationale: the `primitives/layout/shared/layoutStyle.css.ts` prop registry (consumer API) and `overlay/Drawer/Drawer.css.ts` (physical `side="left"` / `"right"` is the prop's intent).
- **Contrast audit script** (`scripts/audit-contrast.mjs`) parses the compiled `@lumen/tokens` CSS + `@lumen/themes` overlays, resolves every `var()` chain, composites alpha-blended pairs, and checks WCAG 2.1 AA against 19 semantic foreground/background pairs across six themes (base light + dark, terminal + terminal-dark, high-contrast + high-contrast-dark). Fails CI on any pair below threshold.
- **Bundle-size budgets.** Root `.size-limit.json` carries 44 per-component budgets (Box through DataTable, Form + RHF adapter, and a warning-only full-barrel ceiling). `pnpm size` runs on every PR.
- **Vitest hardening.** `packages/react/vitest.config.ts` now ships `coverage.thresholds` (lines/functions/statements ≥ 85, branches ≥ 80) and an opt-in cross-browser matrix (`LUMEN_BROWSER_MODE=1` → Chromium + Firefox + WebKit via Playwright; local default stays jsdom-only for speed).
- **Storybook a11y.** `.storybook/preview.ts` locks the axe audit to WCAG 2.1 A + AA tags and keeps `a11y.test = 'error'` so any violation fails Vitest Storybook addon runs.
- **CI verify.** Split into `verify` (lint/typecheck/RTL-audit/build/test/coverage/contrast/size/publint/attw) and an optional `cross-browser` job that runs the three-engine matrix. Nothing merges to `main` without green verify.
- **Dep freshness.** `.github/renovate.json` groups Radix / React-Aria / vanilla-extract / Storybook / Vitest / TanStack / Internationalized and pins Monday-morning scheduling with pr concurrency limits.
- **Chromatic workflow** (`.github/workflows/chromatic.yml`) wired behind `CHROMATIC_PROJECT_TOKEN` for per-PR visual regression; **Lighthouse CI** config (`lighthouserc.json`) asserts ≥ 0.95 accessibility and ≥ 0.85 perf on the built Storybook.

No public API additions; patch-level because the visual output of the nine `.css.ts` files changes in RTL contexts.
