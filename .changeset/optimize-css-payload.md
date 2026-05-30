---
'@arshad-shah/cynosure-react': minor
---

**Cut CSS payload by ~88% gzip.** `styles.css` shrinks from 267 KB → 31 KB gzip and `all.css` from 270 KB → 33 KB gzip with no public-API changes.

- Vanilla-extract now hashes classnames in `short` mode (`Button_buttonBase__1h9om7i1` → `_1h9om7i1`).
- Strip vanilla-extract's `/* vanilla-extract-css-ns:…?source=#<base64> */` debug markers from every built `.css` chunk (~440 KB raw / 225 KB gzip of dead payload across ~120 chunks). Author doc comments are also dropped from production CSS; license banners (`/*!`) are preserved.
- Extract rules shared across ≥2 component leaves into a new `dist/core.css`. Per-component subpath imports (`@arshad-shah/cynosure-react/button`, …) now ship only that component's specific rules; bundlers dedupe `core.css` across any number of per-component imports.
- Each per-component JS entry auto-imports `./core.css` + its own `./<name>.css` so subpath imports pull styles automatically (still respects `sideEffects: ["**/*.css"]`).
- `all.css` ships only the tokens actually referenced by the React CSS (152 of 280 declared tokens — mostly raw color ramps — were unused). The full palette remains available via `@arshad-shah/cynosure-tokens/css`.

A new `./core.css` subpath export is added to `packages/react/package.json`.
