# Release

Cynosure is published to npm by GitHub Actions (`.github/workflows/release.yml`), with Changesets. Arshad approved automatic publishing on 2026-11-10.

## How a release happens

1. **Describe the change.** With each user-facing change, run `pnpm changeset`, pick the bump (patch, minor or major) and write one line for the changelog. Commit the generated file in `.changeset/`.
2. **Merge to `main`.** Work happens on `next`; merging `next` into `main` is Arshad's call. On `main`, the workflow runs the gates, then opens (or updates) a pull request called "chore(release): version packages". That pull request bumps the version and writes `CHANGELOG.md`.
3. **Merge the version pull request.** The workflow runs again and publishes the new version to npm (`tools/publish.sh`). A version already on npm is skipped.

Publishing uses npm **trusted publishing**: npm trusts this repository's `release.yml` through GitHub's OIDC token, so no npm token is stored as a secret, and every version carries provenance (a signed record of the commit and workflow that built it).

Nothing publishes from `next`, and nothing publishes without a merge to `main`.

## One-time setup (Arshad)

- **Trusted publisher:** on npmjs.com, in the settings of `@arshad-shah/cynosure`, add a trusted publisher: GitHub Actions, repository `arshad-shah/cynosure`, workflow `release.yml`. npm offers this only for a package that exists, so the very first version goes out differently (Arshad's choice, 2026-11-11): add a short-lived, granular `NPM_TOKEN` repository secret that can publish `@arshad-shah/cynosure`, merge the first version pull request, and the workflow publishes `0.1.0` with provenance using that token. Then delete the secret and the token, and add the trusted publisher. Every later version is published through OIDC alone.
- **Actions permissions:** Settings → Actions → General → Workflow permissions: allow GitHub Actions to create pull requests.

## Before a release

`pnpm verify` green, CI green on all engines, visual baselines current, `publint` and `attw` clean, size budgets met. The release workflow runs the fast gates again before publishing.

## Versions

The package starts at `0.1.0` and becomes `1.0.0` when Prism ships on it.

## The old packages

Arshad approved deprecating them (2026-11-11), once `@arshad-shah/cynosure` is on npm. Deprecating needs an npm login with write access to each (trusted publishing only covers publishing), so it is run by hand:

```bash
msg="Replaced by @arshad-shah/cynosure: https://github.com/arshad-shah/cynosure"
for p in react core themes tokens icons cli; do npm deprecate "@arshad-shah/cynosure-$p" "$msg"; done
```

Deprecating keeps every version installable; npm only warns. It can be undone with an empty message.
