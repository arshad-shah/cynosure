#!/usr/bin/env bash
# Publishes the version in package.json to npm through trusted publishing (OIDC from GitHub Actions): no token is
# stored anywhere, and npm attaches provenance itself. Then tags the commit `v<version>`, makes the GitHub release
# from that version's changelog entry, and moves the `docs-live` branch here so the live documentation is rebuilt
# from the very commit that is on npm.
#
# Changesets runs this after the version pull request is merged, and also on every other push to `main`, so each step
# first checks whether it is already done: a version already on npm is not published again, an existing tag or
# release is left alone. A run that failed half-way is finished by the next one.
#
# The tag and release are made here, not by the Changesets action (`createGithubReleases: false` in release.yml):
# with the documentation site in the workspace the action expects a tag named `<package>@<version>`, and this
# repository's tags are `v<version>`.
set -euo pipefail
name=$(node -p "require('./package.json').name")
version=$(node -p "require('./package.json').version")
tag="v$version"

published=""
if npm view "$name@$version" version >/dev/null 2>&1; then
  echo "$name@$version is already on npm; nothing to publish."
else
  npm publish --access public --provenance
  published=yes
fi

if git ls-remote --exit-code --tags origin "refs/tags/$tag" >/dev/null 2>&1; then
  echo "Tag $tag already exists."
else
  git tag "$tag"
  git push origin "$tag"
fi

if gh release view "$tag" >/dev/null 2>&1; then
  echo "Release $tag already exists."
else
  # This version's entry in the changelog, without the commit each line came from.
  notes=$(awk -v v="## $version" '$0 == v { on = 1; next } /^## / { on = 0 } on' CHANGELOG.md | sed -E 's/^- [0-9a-f]{7,}: /- /')
  gh release create "$tag" --title "$tag" --notes "$notes" --verify-tag --latest
fi

# The live documentation (https://cynosure.arshadshah.com) is built from `docs-live`, never from `main`: Cloudflare
# Pages rebuilds it on this push. This script only runs when no change is waiting for a release, so this commit is
# exactly the published version (or that version with documentation fixes on top). `main` only ever moves forward,
# so this is a plain fast-forward; if it is ever refused, the release is already out and the next run tries again.
git push origin "HEAD:refs/heads/docs-live"

# Changesets reads this line to know a version went out.
if [ -n "$published" ]; then echo "New tag: $name@$version"; fi
