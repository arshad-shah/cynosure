# Release

Cynosure is published to npm by GitHub Actions (`.github/workflows/release.yml`), with Changesets. Arshad approved automatic publishing on 2026-11-10.

## How a release happens

1. **Describe the change.** With each user-facing change, run `pnpm changeset`, pick the bump (patch, minor or major) and write one line for the changelog. Commit the generated file in `.changeset/`.
2. **Merge to `main`.** Work happens on `next`; merging `next` into `main` is Arshad's call. On `main`, the workflow runs the gates, then opens (or updates) a pull request called "chore(release): version packages". That pull request bumps the version and writes `CHANGELOG.md`.
3. **Merge the version pull request.** The workflow runs again and `tools/publish.sh` publishes the new version to npm, tags the commit `v<version>` and makes the GitHub release from that version's changelog entry. Each step is skipped when already done (a version on npm, an existing tag or release), so a run that failed half-way is finished by the next one.
4. **The documentation follows by itself.** The same script moves the `docs-live` branch to the published commit, and Cloudflare Pages rebuilds https://cynosure.arshadshah.com from it. The site uses the library in the repository, so there is nothing to raise or install (see `site/README.md`, "What is live, and what is a preview").

Publishing uses npm **trusted publishing**: npm trusts this repository's `release.yml` through GitHub's OIDC token, so no npm token is stored as a secret, and every version carries provenance (a signed record of the commit and workflow that built it).

Nothing publishes from `next`, and nothing publishes without a merge to `main`.

`main`'s branch rules require two checks: **CI gate** (the last job of `ci.yml`, green only when every other CI job is) and **Require changeset or skip-changeset label** (`changeset-check.yml`). Keep those names; add new jobs to the gate's `needs` (today `verify` and `site`). Every pull request into `main` must add a changeset or carry the `skip-changeset` label: the "Changeset Check" workflow (`changeset-check.yml`) is a required check on `main`. Bot pull requests, the version pull request among them, pass without one.

## One-time setup (Arshad)

- **Trusted publisher:** on npmjs.com, in the settings of `@arshad-shah/cynosure`, the trusted publisher is GitHub Actions, user `arshad-shah`, repository `cynosure`, workflow `release.yml`, no environment, with "Allow npm publish" ticked (set up 2026-11-11). The workflow passes no npm token: every version from 0.2.0 on is published through OIDC alone. `0.1.0` went out with a short-lived `NPM_TOKEN` because npm offers trusted publishing only for a package that already exists; that secret is no longer read and can be deleted, and the token revoked.
- **Actions permissions:** Settings → Actions → General → Workflow permissions: allow GitHub Actions to create pull requests.

## Before a release

`pnpm verify` green, CI green on all engines, visual baselines current, `publint` and `attw` clean, size budgets met. The release workflow runs the fast gates again before publishing.

## Versions

The first release is `0.1.0` (the package sits at `0.0.0` until the first version pull request) and becomes `1.0.0` when Prism ships on it.

## The old packages

Arshad approved deprecating them (2026-11-11), once `@arshad-shah/cynosure` is on npm. Deprecating needs an npm login with write access to each (trusted publishing only covers publishing), so it is run by hand:

```bash
msg="Replaced by @arshad-shah/cynosure: https://github.com/arshad-shah/cynosure"
for p in react core themes tokens icons cli; do npm deprecate "@arshad-shah/cynosure-$p" "$msg"; done
```

Deprecating keeps every version installable; npm only warns. It can be undone with an empty message.

## Why the tag and release are made by the script

The documentation site (`site/`) is a second package in the pnpm workspace. That changes two things Changesets does, and the release is set up around both:

- **The version step** (`pnpm version-packages`) is plain `changeset version`. The site depends on the library as `workspace:*`, which Changesets leaves alone (rehearsed on 2026-11-11: the version becomes 0.3.0 and `site/package.json` is untouched).
- **Tags and releases:** in a workspace the Changesets action expects tags named `<package>@<version>`. This repository's tags are `v<version>`, so the action's own releases are off (`createGithubReleases: false`) and `tools/publish.sh` makes the tag and the release.

The root is listed in `pnpm-workspace.yaml` (`- .`) so Changesets finds the library in the workspace; the site is in `ignore` in `.changeset/config.json`.

## Tags and releases before 0.1.0

On 2026-11-11 the GitHub releases and tags of the six retired packages were removed so the list starts at `v0.1.0` (Arshad's decision). The packages themselves stay on npm, deprecated. The removed tags and the commits they pointed at, should one ever be needed again:

| Tag                                  | Commit                                     |
| ------------------------------------ | ------------------------------------------ |
| `@arshad-shah/cynosure-cli@3.0.0`    | `07f85110e63e729cd1bb68a027f6dd5a6132f018` |
| `@arshad-shah/cynosure-core@3.3.0`   | `ca1dac03d7a326dfe1fed1bfd6cb867030e79612` |
| `@arshad-shah/cynosure-react@3.1.0`  | `0355e614a8900bf2c4c7e40ce9bd474c00823fee` |
| `@arshad-shah/cynosure-react@3.2.0`  | `c8a7bf6c18ea6bc675be0afac0eff3080190cbda` |
| `@arshad-shah/cynosure-react@3.3.0`  | `429362296b48efe32a3cdee2fc2506ce82d959b1` |
| `@arshad-shah/cynosure-react@3.3.1`  | `6fdafcc2b7964ca3951d7ba31992a10e663e3647` |
| `@arshad-shah/cynosure-react@3.4.0`  | `d5328f645ce49acc0c0e7328e6906d75c9813edf` |
| `@arshad-shah/cynosure-react@3.5.0`  | `330b75e1de47a4a561baa13b4465cb69e0ffb8ba` |
| `@arshad-shah/cynosure-themes@3.3.0` | `5888b168490c4f26229d26625ae119485b9cb24c` |
| `@arshad-shah/cynosure-tokens@3.3.0` | `747a5d173578649ac6b0b4bdda3cf19f058c80a7` |
| `v1.0.0`                             | `6bd40169524aae0fee23a98eb5c0763841a01f96` |

## The live documentation and the release are one commit

`main` receives work before it is released, so the live site is not built from `main`. It is built from `docs-live`:

- `tools/publish.sh` ends with `git push origin HEAD:refs/heads/docs-live`. Changesets only runs that script when no changeset is pending, so the commit it pushes is exactly what is on npm (or that plus documentation-only fixes).
- Cloudflare Pages has `docs-live` as its production branch. `main` and pull requests are previews, marked "Unreleased" while a changeset is pending.
- **One-time setup (Arshad, in Cloudflare Pages → Settings → Builds → Branch control):** after the first release that creates `docs-live`, set the production branch to `docs-live` and leave preview deployments on for all other branches. Until then production still builds from `main`.
- Never push to `docs-live` by hand, and never protect it against the workflow's push.
