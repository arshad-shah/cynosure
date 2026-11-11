#!/usr/bin/env bash
# Publishes the version in package.json to npm through trusted publishing (OIDC from GitHub Actions): no token is
# stored anywhere, and npm attaches provenance itself. Changesets runs this after merging the version pull request, and
# also on every other push to `main`, so an already-published version is skipped rather than failing the run.
set -euo pipefail
name=$(node -p "require('./package.json').name")
version=$(node -p "require('./package.json').version")
if npm view "$name@$version" version >/dev/null 2>&1; then
  echo "$name@$version is already on npm; nothing to publish."
  exit 0
fi
npm publish --access public --provenance
# Changesets reads the "New tag" line, then pushes v<version> and makes the GitHub release from it; the tag has to exist
# locally first (its own publish command creates it, this script replaces that command). Run 52 published 0.1.0 and then
# failed at exactly this push.
git tag "v$version"
echo "New tag: $name@$version"
