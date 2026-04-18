# @arshad-shah/cynosure-icons

## 1.0.0

### Major Changes

- First stable release.

  `0.x` was a pre-release development window; v1.0 is the first version
  under Cynosure's semver policy. No code migration is required — if you
  were consuming Cynosure from source or a workspace alias, install the
  npm packages instead. See the
  [Migration guide](https://github.com/arshad-shah/cynosure/blob/main/docs/reference/migration-to-v1.mdx)
  for details.

  ## What v1.0 ships
  - Complete component catalogue across `@arshad-shah/cynosure-react`.
  - W3C DTCG design tokens in `@arshad-shah/cynosure-tokens`, with light
    and dark stylesheets.
  - Prebuilt themes (terminal, high-contrast) in
    `@arshad-shah/cynosure-themes`.
  - Headless primitives in `@arshad-shah/cynosure-core`.
  - Icon set in `@arshad-shah/cynosure-icons`.
  - Foundations docs, eight priority recipes, framework + tree-shaking
    guides.

  ## Semver policy from here
  - **Patch** — bug fixes, no API changes.
  - **Minor** — new components, new props (additive), new variants. No
    breaking changes.
  - **Major** — breaking changes, with a migration guide. Deprecations
    are announced at least one minor cycle before removal.

  All five packages ship at the same semver via linked changesets.
