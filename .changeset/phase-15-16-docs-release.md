---
'@lumen/react': patch
---

Phases 15 + 16 — documentation site and release readiness.

No runtime API changes. This bundle groups the docs-site scaffold and
release hardening that Phase 15 + 16 require.

- **Storybook-as-docs-site.** `.storybook/main.ts` now picks up MDX from
  `docs/foundations/**`, `docs/recipes/**`, and every package alongside
  the existing stories, with
  `react-docgen-typescript` tuned to surface literal unions and filter
  `node_modules` from the Controls panel. `.storybook/manager.ts` adds a
  branded manager theme (terminal palette, JetBrains Mono) matching the
  Lumen canvas.
- **Foundations MDX.** `docs/foundations/` now covers introduction,
  installation, quickstart, design principles, design tokens, theming
  overview, dark mode, custom themes, terminal-theme recipe,
  accessibility, and RTL support.
- **Recipes MDX.** Eight priority recipes under `docs/recipes/`: login
  form, dashboard layout, data table with filters, notification center,
  command palette, settings page, multi-step wizard, onboarding modal
  (plus an index + the three form-composition recipes that ship
  alongside `@lumen/react/form`).
- **Guides + reference.** `docs/guides/frameworks.mdx`,
  `docs/guides/tree-shaking.mdx`, `docs/reference/roadmap.mdx`,
  `docs/reference/migration-to-v1.mdx`, and an auto-generated
  `docs/reference/changelog.mdx` produced by
  `scripts/build-changelog-page.mjs`.
- **Cloudflare Pages deploy.** Root `wrangler.toml` declares
  `pages_build_output_dir: ./storybook-static` for the `wrangler pages
  deploy` / `wrangler pages dev` flow. Production deploys use the
  Cloudflare Pages Git integration: Pages builds `pnpm install && pnpm
  build && pnpm docs:changelog && pnpm build-storybook` on its own
  runners and publishes `storybook-static/` on every push to `main`.
  No GitHub Actions workflow required.
- **Release hardening.** `.github/workflows/release.yml` now runs
  `typecheck`, `test`, `publint`, and `attw` before handing off to
  Changesets, so a broken release can't go out.
- **Chromatic bumped to the current major.**
  `.github/workflows/chromatic.yml` now references `chromaui/action@v16`
  (was `@v11`) and runs under Node 24. The `chromatic` CLI is pinned in
  `pnpm-workspace.yaml` at `16.3.0` and exposed via the
  `pnpm chromatic` root script for local runs.
- **Repo docs.** `LICENSE` (MIT), `CONTRIBUTING.md` (phase-based
  workflow), `CODE_OF_CONDUCT.md` (Contributor Covenant 2.1),
  `SECURITY.md` (disclosure policy). `README.md` rewritten to
  consumer-facing content; all build-spec markdown moved into
  `docs/specs/` (`ARCHITECTURE.md`, `PROGRESS.md`, `phases/01…16`).
