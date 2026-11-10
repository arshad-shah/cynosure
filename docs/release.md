# Release

Cynosure is published to npm by GitHub Actions (`.github/workflows/release.yml`), with Changesets. Arshad approved automatic publishing on 2026-11-10.

## How a release happens

1. **Describe the change.** With each user-facing change, run `pnpm changeset`, pick the bump (patch, minor or major) and write one line for the changelog. Commit the generated file in `.changeset/`.
2. **Merge to `main`.** Work happens on `next`; merging `next` into `main` is Arshad's call. On `main`, the workflow runs the gates, then opens (or updates) a pull request called "chore(release): version packages". That pull request bumps the version and writes `CHANGELOG.md`.
3. **Merge the version pull request.** The workflow runs again and publishes the new version to npm, with provenance.

Nothing publishes from `next`, and nothing publishes without a merge to `main`.

## One-time setup (Arshad)

- **npm access:** add an `NPM_TOKEN` repository secret (an npm automation token for `@arshad-shah`), or set up npm trusted publishing for the package, linked to this repository and `release.yml`.
- **Actions permissions:** Settings → Actions → General → Workflow permissions: allow GitHub Actions to create pull requests.

## Before a release

`pnpm verify` green, CI green on all engines, visual baselines current, `publint` and `attw` clean, size budgets met. The release workflow runs the fast gates again before publishing.

## Versions

The package starts at `0.1.0` and becomes `1.0.0` when Prism ships on it. Deprecating the old `@arshad-shah/cynosure-*` packages still needs Arshad's explicit go-ahead.
