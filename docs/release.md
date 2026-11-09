# Release

Versioning with changesets (`pnpm changeset`). The package starts at `0.1.0` and becomes `1.0.0` when Prism ships on it.

**Publishing to npm requires Arshad's explicit authorisation each time.** The publish workflow is intentionally absent until then. Deprecating the old `@arshad-shah/cynosure-*` packages also requires explicit authorisation.

Before any release: `pnpm verify` green, CI green on all engines, visual baselines current, `publint` and `attw` clean, size budgets met.
